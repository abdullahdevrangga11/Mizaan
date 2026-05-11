import "./_lib/load-env";

import { resolve } from "node:path";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import {
  appendTransactionMessageInstruction,
  assertIsTransactionWithinSizeLimit,
  createTransactionMessage,
  pipe,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  type Address,
} from "@solana/kit";
import { signTransactionMessageWithSigners } from "@solana/signers";
import {
  deriveCredentialPda,
  deriveSchemaPda,
  getCreateCredentialInstruction,
  getCreateSchemaInstruction,
} from "sas-lib";

import { isEnvSet, optionalEnv, requireEnv } from "./_lib/env";
import {
  keypairToSecretJson,
  loadOrCreateKeypair,
} from "./_lib/keypair";
import {
  createKitClient,
  loadKeypairAsSigner,
  SAS_TYPE,
} from "./_lib/sas-client";

const LOG = "[mizaan/setup]";
const KEYPAIR_DIR = resolve(process.cwd(), "keypairs");
const PAYER_PATH = resolve(KEYPAIR_DIR, "payer.json");
const MINT_AUTHORITY_PATH = resolve(KEYPAIR_DIR, "idrz-mint-authority.json");
const LAZ_AUTHORITY_PATH = resolve(KEYPAIR_DIR, "laz-authority.json");
const SAS_PLATFORM_AUTHORITY_PATH = resolve(
  KEYPAIR_DIR,
  "sas-platform-authority.json",
);

const IDRZ_INITIAL_SUPPLY: bigint = 1_000_000_000_000n;
const IDRZ_DECIMALS = 0;
const MIN_PAYER_BALANCE_SOL = 2;

interface OutputEnv {
  NEXT_PUBLIC_IDRZ_MINT?: string;
  IDRZ_MINT_AUTHORITY_KEYPAIR?: string;
  NEXT_PUBLIC_SAS_CREDENTIAL_PDA?: string;
  NEXT_PUBLIC_SAS_DONATION_SCHEMA?: string;
  NEXT_PUBLIC_SAS_DISTRIBUTION_SCHEMA?: string;
  NEXT_PUBLIC_SAS_RECEIPT_SCHEMA?: string;
  NEXT_PUBLIC_SAS_LAZ_IDENTITY_SCHEMA?: string;
  NEXT_PUBLIC_SAS_MUSTAHIK_SCHEMA?: string;
  LAZ_AUTHORITY_KEYPAIR?: string;
}

const out: OutputEnv = {};

interface SchemaField {
  name: string;
  type: number; // SAS compact layout byte (see SAS_TYPE)
}

interface SchemaDef {
  envKey: keyof OutputEnv;
  name: string;
  description: string;
  fields: ReadonlyArray<SchemaField>;
}

// SAS doesn't have a native Pubkey type — wallet addresses are stored as
// base58 strings (SAS_TYPE.STRING). Pubkey serialization on-chain would save
// bytes but isn't supported by sas-lib's borsh schema.
const SAS_SCHEMAS: ReadonlyArray<SchemaDef> = [
  {
    envKey: "NEXT_PUBLIC_SAS_DONATION_SCHEMA",
    name: "MIZAAN_DONATION_V1",
    description: "Mizaan donor commitment attestation",
    fields: [
      { name: "donorWallet", type: SAS_TYPE.STRING },
      { name: "lazWallet", type: SAS_TYPE.STRING },
      { name: "amountIDRZ", type: SAS_TYPE.U64 },
      { name: "donationType", type: SAS_TYPE.U8 },
      { name: "categoryPreference", type: SAS_TYPE.U8 },
      { name: "donorMessageHash", type: SAS_TYPE.STRING },
      { name: "createdAt", type: SAS_TYPE.I64 },
      { name: "tokenTransferSignature", type: SAS_TYPE.STRING },
    ],
  },
  {
    envKey: "NEXT_PUBLIC_SAS_DISTRIBUTION_SCHEMA",
    name: "MIZAAN_DISTRIBUTION_V1",
    description: "Mizaan LAZ distribution decision attestation",
    fields: [
      { name: "donationCommitmentPDA", type: SAS_TYPE.STRING },
      { name: "lazWallet", type: SAS_TYPE.STRING },
      { name: "mustahikWallet", type: SAS_TYPE.STRING },
      { name: "amountIDRZ", type: SAS_TYPE.U64 },
      { name: "category", type: SAS_TYPE.U8 },
      { name: "asnaf", type: SAS_TYPE.U8 },
      { name: "mustahikIdHash", type: SAS_TYPE.STRING },
      { name: "purposeDescription", type: SAS_TYPE.STRING },
      { name: "createdAt", type: SAS_TYPE.I64 },
      { name: "tokenTransferSignature", type: SAS_TYPE.STRING },
    ],
  },
  {
    envKey: "NEXT_PUBLIC_SAS_RECEIPT_SCHEMA",
    name: "MIZAAN_RECEIPT_V1",
    description: "Mizaan mustahik receipt confirmation attestation",
    fields: [
      { name: "distributionDecisionPDA", type: SAS_TYPE.STRING },
      { name: "mustahikWallet", type: SAS_TYPE.STRING },
      { name: "lazWallet", type: SAS_TYPE.STRING },
      { name: "confirmedAt", type: SAS_TYPE.I64 },
      { name: "confirmationMethod", type: SAS_TYPE.U8 },
      { name: "thankYouMessageHash", type: SAS_TYPE.STRING },
      { name: "magicLinkConsentHash", type: SAS_TYPE.STRING },
    ],
  },
  {
    envKey: "NEXT_PUBLIC_SAS_LAZ_IDENTITY_SCHEMA",
    name: "MIZAAN_LAZ_IDENTITY_V1",
    description: "Mizaan LAZ partner identity attestation",
    fields: [
      { name: "lazWallet", type: SAS_TYPE.STRING },
      { name: "lazNameHash", type: SAS_TYPE.STRING },
      { name: "lazSlug", type: SAS_TYPE.STRING },
      { name: "lazRegistrationNumber", type: SAS_TYPE.STRING },
      { name: "websiteURL", type: SAS_TYPE.STRING },
      { name: "contactEmail", type: SAS_TYPE.STRING },
      { name: "region", type: SAS_TYPE.STRING },
      { name: "jurisdictionLevel", type: SAS_TYPE.U8 },
      { name: "status", type: SAS_TYPE.U8 },
      { name: "registeredAt", type: SAS_TYPE.I64 },
      { name: "mizaanAuthority", type: SAS_TYPE.STRING },
    ],
  },
  {
    envKey: "NEXT_PUBLIC_SAS_MUSTAHIK_SCHEMA",
    name: "MIZAAN_MUSTAHIK_V1",
    description: "Mizaan mustahik (recipient) identity attestation",
    fields: [
      { name: "mustahikWallet", type: SAS_TYPE.STRING },
      { name: "lazWallet", type: SAS_TYPE.STRING },
      { name: "mustahikIdHash", type: SAS_TYPE.STRING },
      { name: "asnafCategory", type: SAS_TYPE.U8 },
      { name: "region", type: SAS_TYPE.STRING },
      { name: "initials", type: SAS_TYPE.STRING },
      { name: "ageRange", type: SAS_TYPE.U8 },
      { name: "status", type: SAS_TYPE.U8 },
      { name: "registeredAt", type: SAS_TYPE.I64 },
    ],
  },
];

const SAS_CREDENTIAL_NAME = "Mizaan Platform";

async function step<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
  console.log(`\n${LOG} >>> ${label}`);
  try {
    const result = await fn();
    console.log(`${LOG} <<< ${label} OK`);
    return result;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`${LOG} <<< ${label} FAILED: ${msg}`);
    return null;
  }
}

async function checkConnection(connection: Connection): Promise<void> {
  const slot = await connection.getSlot();
  const version = await connection.getVersion();
  console.log(
    `${LOG} connected — slot=${slot} solana-core=${version["solana-core"]}`,
  );
}

async function ensurePayerFunded(
  connection: Connection,
  payer: Keypair,
): Promise<void> {
  const balance = await connection.getBalance(payer.publicKey);
  const balSol = balance / LAMPORTS_PER_SOL;
  console.log(
    `${LOG} payer ${payer.publicKey.toBase58()} balance=${balSol.toFixed(4)} SOL`,
  );

  if (balSol >= MIN_PAYER_BALANCE_SOL) {
    return;
  }

  console.log(`${LOG} balance below ${MIN_PAYER_BALANCE_SOL} SOL — airdropping`);

  const heliusOk = await tryHeliusAirdrop(connection, payer.publicKey);
  if (heliusOk) {
    return;
  }

  try {
    const sig = await connection.requestAirdrop(
      payer.publicKey,
      2 * LAMPORTS_PER_SOL,
    );
    const latest = await connection.getLatestBlockhash();
    await connection.confirmTransaction(
      { signature: sig, ...latest },
      "confirmed",
    );
    console.log(`${LOG} requestAirdrop confirmed: ${sig}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(
      `${LOG} airdrop failed (${msg}). If devnet is rate-limiting, fund manually:`,
    );
    console.warn(
      `${LOG}   solana airdrop 2 ${payer.publicKey.toBase58()} --url devnet`,
    );
  }
}

async function tryHeliusAirdrop(
  connection: Connection,
  pubkey: PublicKey,
): Promise<boolean> {
  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "";
  if (!rpcUrl.includes("helius")) return false;

  try {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "mizaan-airdrop",
        method: "requestAirdrop",
        params: [pubkey.toBase58(), 2 * LAMPORTS_PER_SOL],
      }),
    });
    if (!res.ok) return false;
    const json = (await res.json()) as { result?: string; error?: unknown };
    if (typeof json.result === "string") {
      const latest = await connection.getLatestBlockhash();
      await connection.confirmTransaction(
        { signature: json.result, ...latest },
        "confirmed",
      );
      console.log(`${LOG} Helius airdrop confirmed: ${json.result}`);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

async function setupIdrzMint(
  connection: Connection,
  payer: Keypair,
): Promise<void> {
  if (isEnvSet("NEXT_PUBLIC_IDRZ_MINT")) {
    const existing = optionalEnv("NEXT_PUBLIC_IDRZ_MINT");
    console.warn(
      `${LOG} NEXT_PUBLIC_IDRZ_MINT already set (${existing}). Skipping mint creation.`,
    );
    out.NEXT_PUBLIC_IDRZ_MINT = existing;
    return;
  }

  const { keypair: mintAuthority } = loadOrCreateKeypair(MINT_AUTHORITY_PATH);
  console.log(
    `${LOG} mint authority ${mintAuthority.publicKey.toBase58()}`,
  );

  const mint = await createMint(
    connection,
    payer,
    mintAuthority.publicKey,
    null,
    IDRZ_DECIMALS,
  );
  console.log(`${LOG} created IDRZ mint ${mint.toBase58()}`);

  const ata = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    mintAuthority.publicKey,
  );
  console.log(`${LOG} mint authority ATA ${ata.address.toBase58()}`);

  const sig = await mintTo(
    connection,
    payer,
    mint,
    ata.address,
    mintAuthority,
    IDRZ_INITIAL_SUPPLY,
  );
  console.log(
    `${LOG} minted ${IDRZ_INITIAL_SUPPLY.toString()} IDRZ to authority ATA — sig=${sig}`,
  );

  out.NEXT_PUBLIC_IDRZ_MINT = mint.toBase58();
  out.IDRZ_MINT_AUTHORITY_KEYPAIR = keypairToSecretJson(mintAuthority);
}

interface SasContext {
  credentialPda: Address;
}

async function setupSasCredential(): Promise<SasContext | null> {
  // Ensure both keypair files exist on disk — they're consumed by sas-lib
  // via the kit signer loader, but loadOrCreateKeypair also stamps the
  // companion `.json` and updates the env output block.
  loadOrCreateKeypair(SAS_PLATFORM_AUTHORITY_PATH);
  loadOrCreateKeypair(LAZ_AUTHORITY_PATH);

  const payer = await loadKeypairAsSigner(PAYER_PATH);
  const platformAuthority = await loadKeypairAsSigner(
    SAS_PLATFORM_AUTHORITY_PATH,
  );
  const lazAuthority = await loadKeypairAsSigner(LAZ_AUTHORITY_PATH);

  console.log(`${LOG} platform authority ${platformAuthority.address}`);
  console.log(`${LOG} LAZ authority signer ${lazAuthority.address}`);

  const [credentialPda] = await deriveCredentialPda({
    authority: platformAuthority.address,
    name: SAS_CREDENTIAL_NAME,
  });
  console.log(`${LOG} credential PDA ${credentialPda}`);

  if (isEnvSet("NEXT_PUBLIC_SAS_CREDENTIAL_PDA")) {
    const existing = optionalEnv("NEXT_PUBLIC_SAS_CREDENTIAL_PDA")!;
    console.warn(
      `${LOG} NEXT_PUBLIC_SAS_CREDENTIAL_PDA already set (${existing}); reusing.`,
    );
    out.NEXT_PUBLIC_SAS_CREDENTIAL_PDA = existing;
    return { credentialPda: existing as Address };
  }

  // Build + send the createCredential transaction.
  // The credential is owned by `platformAuthority`; LAZ authority is listed as
  // an allowed signer (it'll sign individual attestations later).
  const { rpc, sendAndConfirm } = createKitClient();
  const ix = getCreateCredentialInstruction({
    payer,
    credential: credentialPda,
    authority: platformAuthority,
    name: SAS_CREDENTIAL_NAME,
    signers: [lazAuthority.address],
  });
  const { value: blockhash } = await rpc.getLatestBlockhash().send();
  const message = pipe(
    createTransactionMessage({ version: 0 }),
    (m) => setTransactionMessageFeePayer(payer.address, m),
    (m) => setTransactionMessageLifetimeUsingBlockhash(blockhash, m),
    (m) => appendTransactionMessageInstruction(ix, m),
  );
  const signed = await signTransactionMessageWithSigners(message);
  assertIsTransactionWithinSizeLimit(signed);
  await sendAndConfirm(signed, { commitment: "confirmed" });

  console.log(`${LOG} credential created at ${credentialPda}`);
  out.NEXT_PUBLIC_SAS_CREDENTIAL_PDA = credentialPda;
  return { credentialPda };
}

async function setupSasSchemas(ctx: SasContext | null): Promise<void> {
  if (!ctx) {
    console.warn(`${LOG} no credential context — cannot create schemas`);
    return;
  }
  const { credentialPda } = ctx;

  const payer = await loadKeypairAsSigner(PAYER_PATH);
  const platformAuthority = await loadKeypairAsSigner(
    SAS_PLATFORM_AUTHORITY_PATH,
  );
  const { rpc, sendAndConfirm } = createKitClient();

  for (const schema of SAS_SCHEMAS) {
    if (isEnvSet(schema.envKey)) {
      const existing = optionalEnv(schema.envKey);
      console.warn(
        `${LOG} ${schema.envKey} already set (${existing}). Skipping ${schema.name}.`,
      );
      out[schema.envKey] = existing;
      continue;
    }

    const [schemaPda] = await deriveSchemaPda({
      credential: credentialPda,
      name: schema.name,
      version: 1,
    });

    const layout = new Uint8Array(schema.fields.map((f) => f.type));
    const fieldNames = schema.fields.map((f) => f.name);

    const ix = getCreateSchemaInstruction({
      payer,
      authority: platformAuthority,
      credential: credentialPda,
      schema: schemaPda,
      name: schema.name,
      description: schema.description,
      layout,
      fieldNames,
    });
    const { value: blockhash } = await rpc.getLatestBlockhash().send();
    const message = pipe(
      createTransactionMessage({ version: 0 }),
      (m) => setTransactionMessageFeePayer(payer.address, m),
      (m) => setTransactionMessageLifetimeUsingBlockhash(blockhash, m),
      (m) => appendTransactionMessageInstruction(ix, m),
    );
    const signed = await signTransactionMessageWithSigners(message);
    assertIsTransactionWithinSizeLimit(signed);
    await sendAndConfirm(signed, { commitment: "confirmed" });

    console.log(`${LOG} ${schema.name} → ${schemaPda}`);
    out[schema.envKey] = schemaPda;
  }
}

async function setupLazAuthority(): Promise<void> {
  if (isEnvSet("LAZ_AUTHORITY_KEYPAIR")) {
    console.warn(
      `${LOG} LAZ_AUTHORITY_KEYPAIR already set in env. Skipping generation.`,
    );
    return;
  }

  const { keypair: lazAuthority, created } = loadOrCreateKeypair(
    LAZ_AUTHORITY_PATH,
  );
  console.log(
    `${LOG} LAZ authority ${lazAuthority.publicKey.toBase58()} (${created ? "new" : "loaded"})`,
  );
  out.LAZ_AUTHORITY_KEYPAIR = keypairToSecretJson(lazAuthority);
}

function printEnvBlock(): void {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(out)) {
    if (value === undefined) continue;
    lines.push(`${key}=${value}`);
  }
  console.log("\n=====================================================");
  console.log("# Add to .env.local:");
  console.log("=====================================================");
  if (lines.length === 0) {
    console.log("# (no values produced — check errors above)");
  } else {
    for (const l of lines) console.log(l);
  }
  console.log("=====================================================\n");
}

async function main(): Promise<void> {
  console.log(`${LOG} starting Mizaan devnet bootstrap`);

  const rpcUrl = requireEnv("NEXT_PUBLIC_SOLANA_RPC_URL");
  const connection = new Connection(rpcUrl, "confirmed");

  await step("connection check", () => checkConnection(connection));

  const { keypair: payer, created: payerCreated } = loadOrCreateKeypair(
    PAYER_PATH,
  );
  console.log(
    `${LOG} payer ${payer.publicKey.toBase58()} (${payerCreated ? "new" : "loaded"})`,
  );

  await step("airdrop / fund payer", () =>
    ensurePayerFunded(connection, payer),
  );

  await step("create IDRZ SPL token mint", () =>
    setupIdrzMint(connection, payer),
  );

  const sasCtx = await step("create SAS Mizaan credential", () =>
    setupSasCredential(),
  );

  await step("create SAS schemas", () => setupSasSchemas(sasCtx));

  await step("generate LAZ authority keypair", () => setupLazAuthority());

  printEnvBlock();
  console.log(`${LOG} done.`);
}

main().catch((err) => {
  const msg = err instanceof Error ? err.stack ?? err.message : String(err);
  console.error(`${LOG} fatal: ${msg}`);
  process.exit(1);
});
