import "server-only";

import { randomBytes } from "node:crypto";
import bs58 from "bs58";
import {
  appendTransactionMessageInstruction,
  assertIsTransactionWithinSizeLimit,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  pipe,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  type Address,
} from "@solana/kit";
import {
  createKeyPairSignerFromBytes,
  signTransactionMessageWithSigners,
  type KeyPairSigner,
} from "@solana/signers";
import {
  deriveAttestationPda,
  deriveSchemaPda,
  fetchSchema,
  getCreateAttestationInstruction,
  serializeAttestationData,
} from "sas-lib";

import type {
  MizaanDistributionV1,
  MizaanDonationV1,
  MizaanReceiptV1,
  SasSchemaName,
} from "./schemas";

const SCHEMA_NAMES: Record<SasSchemaName, string> = {
  MIZAAN_DONATION_V1: "MIZAAN_DONATION_V1",
  MIZAAN_DISTRIBUTION_V1: "MIZAAN_DISTRIBUTION_V1",
  MIZAAN_RECEIPT_V1: "MIZAAN_RECEIPT_V1",
  MIZAAN_LAZ_IDENTITY_V1: "MIZAAN_LAZ_IDENTITY_V1",
  MIZAAN_MUSTAHIK_V1: "MIZAAN_MUSTAHIK_V1",
};

let cachedSigner: KeyPairSigner | null = null;

/**
 * Load the LAZ authority keypair (the SAS credential signer) from env.
 * The env value is the 64-byte web3.js-style JSON array, same as on disk
 * under `keypairs/laz-authority.json`.
 */
async function getLazAuthoritySigner(): Promise<KeyPairSigner> {
  if (cachedSigner) return cachedSigner;

  const raw = process.env.LAZ_AUTHORITY_KEYPAIR;
  if (!raw) {
    throw new Error(
      "LAZ_AUTHORITY_KEYPAIR is required to sign SAS attestations.",
    );
  }
  let arr: unknown;
  try {
    arr = JSON.parse(raw);
  } catch {
    throw new Error("LAZ_AUTHORITY_KEYPAIR must be a JSON array of 64 bytes.");
  }
  if (!Array.isArray(arr) || arr.length !== 64) {
    throw new Error("LAZ_AUTHORITY_KEYPAIR must be a JSON array of 64 bytes.");
  }
  const signer = await createKeyPairSignerFromBytes(new Uint8Array(arr));
  cachedSigner = signer;
  return signer;
}

interface KitContext {
  rpc: ReturnType<typeof createSolanaRpc>;
  sendAndConfirm: ReturnType<typeof sendAndConfirmTransactionFactory>;
}

function getKitContext(): KitContext {
  const httpsUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
  if (!httpsUrl) {
    throw new Error("NEXT_PUBLIC_SOLANA_RPC_URL is required.");
  }
  const wssUrl = httpsUrl.replace(/^https:\/\//, "wss://");
  const rpc = createSolanaRpc(httpsUrl);
  const rpcSubscriptions = createSolanaRpcSubscriptions(wssUrl);
  const sendAndConfirm = sendAndConfirmTransactionFactory({
    rpc,
    rpcSubscriptions,
  });
  return { rpc, sendAndConfirm };
}

function getCredentialPda(): Address {
  const pda = process.env.NEXT_PUBLIC_SAS_CREDENTIAL_PDA;
  if (!pda) {
    throw new Error("NEXT_PUBLIC_SAS_CREDENTIAL_PDA is required.");
  }
  return pda as Address;
}

/**
 * Generate a fresh nonce address for an attestation. Using a random keypair
 * pubkey guarantees PDA uniqueness even when (credential, schema, donor)
 * recur — we never need to sign with it, only reference the pubkey.
 */
function randomNonceAddress(): Address {
  const bytes = randomBytes(32);
  return bs58.encode(bytes) as Address;
}

export interface AttestationResult {
  pda: string;
  signature: string;
}

interface CreateAttestationArgs {
  schema: SasSchemaName;
  data: Record<string, unknown>;
  // Optional fixed nonce — only used when caller wants determinism
  // (e.g. receipts keyed off mustahik wallet). Default = random.
  nonce?: Address;
  // Days until the attestation expires. Mizaan attestations are permanent
  // historical records, so default = ~10 years (3650 days).
  expiryDays?: number;
}

async function createAttestation(
  args: CreateAttestationArgs,
): Promise<AttestationResult> {
  const { schema, data, nonce: providedNonce, expiryDays = 3650 } = args;

  const signer = await getLazAuthoritySigner();
  const { rpc, sendAndConfirm } = getKitContext();
  const credentialPda = getCredentialPda();

  const [schemaPda] = await deriveSchemaPda({
    credential: credentialPda,
    name: SCHEMA_NAMES[schema],
    version: 1,
  });

  const nonce = providedNonce ?? randomNonceAddress();
  const [attestationPda] = await deriveAttestationPda({
    credential: credentialPda,
    schema: schemaPda,
    nonce,
  });

  // Fetch the on-chain schema (gives us the field types) then serialize the
  // attestation payload against it. sas-lib handles the borsh encoding.
  const schemaAccount = await fetchSchema(rpc, schemaPda);
  const serialized = serializeAttestationData(schemaAccount.data, data);

  const expiry = Math.floor(Date.now() / 1000) + expiryDays * 24 * 60 * 60;

  const ix = getCreateAttestationInstruction({
    payer: signer,
    authority: signer,
    credential: credentialPda,
    schema: schemaPda,
    attestation: attestationPda,
    nonce,
    data: serialized,
    expiry,
  });

  const { value: blockhash } = await rpc.getLatestBlockhash().send();
  const message = pipe(
    createTransactionMessage({ version: 0 }),
    (m) => setTransactionMessageFeePayer(signer.address, m),
    (m) => setTransactionMessageLifetimeUsingBlockhash(blockhash, m),
    (m) => appendTransactionMessageInstruction(ix, m),
  );
  const signed = await signTransactionMessageWithSigners(message);
  assertIsTransactionWithinSizeLimit(signed);
  const result = await sendAndConfirm(signed, { commitment: "confirmed" });

  // sendAndConfirm doesn't return a signature directly; pull from signed tx.
  void result;
  const sigBytes = Object.values(signed.signatures)[0];
  if (!sigBytes) {
    throw new Error("No signature found on signed transaction");
  }
  const signature = bs58.encode(sigBytes);

  return { pda: attestationPda, signature };
}

// ─── Per-schema convenience wrappers ────────────────────────────────────

/**
 * Build attestation payload from typed schema interface. Converts bigint
 * to string for borsh u64 / i64 encoding (borsher expects bigint OR string).
 */
function normalizePayload(
  payload: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(payload)) {
    if (typeof v === "bigint") {
      out[k] = v;
    } else if (v === undefined) {
      out[k] = "";
    } else {
      out[k] = v;
    }
  }
  return out;
}

export async function createDonationAttestation(
  payload: MizaanDonationV1,
): Promise<AttestationResult> {
  return createAttestation({
    schema: "MIZAAN_DONATION_V1",
    data: normalizePayload({
      donorWallet: payload.donorWallet,
      lazWallet: payload.lazWallet,
      amountIDRZ: payload.amountIDRZ,
      donationType: donationTypeCode(payload.donationType),
      categoryPreference: categoryPrefCode(payload.categoryPreference),
      donorMessageHash: payload.donorMessageHash ?? "",
      createdAt: payload.createdAt,
      tokenTransferSignature: payload.tokenTransferSignature,
    }),
  });
}

export async function createDistributionAttestation(
  payload: MizaanDistributionV1,
): Promise<AttestationResult> {
  return createAttestation({
    schema: "MIZAAN_DISTRIBUTION_V1",
    data: normalizePayload({
      donationCommitmentPDA: payload.donationCommitmentPDA,
      lazWallet: payload.lazWallet,
      mustahikWallet: payload.mustahikWallet,
      amountIDRZ: payload.amountIDRZ,
      category: categoryCode(payload.category),
      asnaf: asnafCode(payload.asnaf),
      mustahikIdHash: payload.mustahikIdHash,
      purposeDescription: payload.purposeDescription,
      createdAt: payload.createdAt,
      tokenTransferSignature: payload.tokenTransferSignature,
    }),
  });
}

export async function createReceiptAttestation(
  payload: MizaanReceiptV1,
): Promise<AttestationResult> {
  return createAttestation({
    schema: "MIZAAN_RECEIPT_V1",
    data: normalizePayload({
      distributionDecisionPDA: payload.distributionDecisionPDA,
      mustahikWallet: payload.mustahikWallet,
      lazWallet: payload.lazWallet,
      confirmedAt: payload.confirmedAt,
      confirmationMethod: confirmationMethodCode(payload.confirmationMethod),
      thankYouMessageHash: payload.thankYouMessageHash ?? "",
      magicLinkConsentHash: payload.magicLinkConsentHash,
    }),
  });
}

// ─── Enum → u8 encoders (kept in sync with lib/types.ts) ────────────────
// The on-chain payload uses single-byte enum codes for compact storage.
// These mirror the ordinal positions of the corresponding TypeScript unions.

function donationTypeCode(t: MizaanDonationV1["donationType"]): number {
  switch (t) {
    case "ZAKAT_MAL":
      return 0;
    case "ZAKAT_FITRAH":
      return 1;
    case "SEDEKAH":
      return 2;
    case "INFAQ":
      return 3;
  }
}

function categoryPrefCode(
  c: MizaanDonationV1["categoryPreference"],
): number {
  return c === "ANY" ? 255 : categoryCode(c);
}

function categoryCode(c: MizaanDistributionV1["category"]): number {
  const order: Array<MizaanDistributionV1["category"]> = [
    "PENDIDIKAN",
    "KESEHATAN",
    "MODAL_USAHA",
    "SANDANG_PANGAN",
    "BIAYA_HIDUP",
    "BENCANA",
    "FAKIR_MISKIN",
    "MUALLAF",
    "RIQAB",
    "GHARIMIN",
    "FISABILILLAH",
    "IBNU_SABIL",
  ];
  const idx = order.indexOf(c);
  if (idx < 0) throw new Error(`Unknown category: ${c}`);
  return idx;
}

function asnafCode(a: MizaanDistributionV1["asnaf"]): number {
  const order: Array<MizaanDistributionV1["asnaf"]> = [
    "FAKIR",
    "MISKIN",
    "AMIL",
    "MUALLAF",
    "RIQAB",
    "GHARIMIN",
    "FISABILILLAH",
    "IBNU_SABIL",
  ];
  const idx = order.indexOf(a);
  if (idx < 0) throw new Error(`Unknown asnaf: ${a}`);
  return idx;
}

function confirmationMethodCode(m: MizaanReceiptV1["confirmationMethod"]): number {
  switch (m) {
    case "WEB":
      return 0;
    case "SMS":
      return 1;
    case "QR":
      return 2;
  }
}
