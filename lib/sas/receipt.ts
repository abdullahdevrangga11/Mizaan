/**
 * LAZ-on-mustahik's-behalf wrapper: writes a `MIZAAN_RECEIPT_V1` attestation
 * after the mustahik clicks the magic link issued by Supabase Auth.
 *
 * Authority is the LAZ wallet (SRS §6.1) — the mustahik's intent is captured
 * via the `magicLinkConsentHash` rather than a direct on-chain signature, so
 * non-crypto mustahik users never need a wallet.
 */

import type { PublicKey } from "@solana/web3.js";
import type { ConfirmationMethod, MizaanReceiptV1 } from "./schemas";
import { encodeSchema } from "./schemas";
import { getCredentialPda, getSchemaPda } from "./client";

export interface CreateReceiptConfirmationInput {
  distributionDecisionPda: PublicKey;
  mustahikWallet: PublicKey;
  lazWallet: PublicKey;
  confirmationMethod: ConfirmationMethod;
  magicLinkConsentHash: string;
  thankYouMessage?: string;
}

export interface CreateReceiptConfirmationResult {
  pda: string;
  signature: string;
}

export async function createReceiptConfirmation(
  input: CreateReceiptConfirmationInput,
): Promise<CreateReceiptConfirmationResult> {
  const credential = getCredentialPda();
  const schema = getSchemaPda("MIZAAN_RECEIPT_V1");

  const payload: MizaanReceiptV1 = {
    distributionDecisionPDA: input.distributionDecisionPda.toBase58(),
    mustahikWallet: input.mustahikWallet.toBase58(),
    lazWallet: input.lazWallet.toBase58(),
    confirmedAt: BigInt(Math.floor(Date.now() / 1000)),
    confirmationMethod: input.confirmationMethod,
    thankYouMessageHash: input.thankYouMessage
      ? await hashMessage(input.thankYouMessage)
      : undefined,
    magicLinkConsentHash: input.magicLinkConsentHash,
  };

  // TODO: install `sas-lib` and call createAttestation with the LAZ signer.
  // Receipt attestations are written server-side (Next.js route handler)
  // because the LAZ keypair must never leave the server.
  const _encoded = encodeSchema("MIZAAN_RECEIPT_V1", payload);
  void credential;
  void schema;
  void _encoded;

  throw new Error(
    "createReceiptConfirmation: not implemented — install sas-lib and wire " +
      "its createAttestation call.",
  );
}

async function hashMessage(message: string): Promise<string> {
  const data = new TextEncoder().encode(message);
  const buf = await crypto.subtle.digest(
    "SHA-256",
    data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer,
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
