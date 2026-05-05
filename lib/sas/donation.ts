/**
 * Donor-side wrapper: writes a `MIZAAN_DONATION_V1` attestation after the
 * IDRZ token transfer has already been confirmed.
 *
 * Returns the new attestation PDA + the transaction signature. Callers
 * persist these to Supabase via `lib/db/donations.ts` (out of scope).
 */

import type { PublicKey } from "@solana/web3.js";
import type { CategoryPreference, MizaanDonationV1 } from "./schemas";
import { encodeSchema } from "./schemas";
import { getCredentialPda, getSchemaPda } from "./client";
import type { DonationType } from "@/lib/types";

export interface CreateDonationCommitmentInput {
  donor: PublicKey;
  lazWallet: PublicKey;
  amountIDRZ: bigint;
  donationType: DonationType;
  categoryPreference: CategoryPreference;
  donorMessage?: string;
  tokenTransferSignature: string;
}

export interface CreateDonationCommitmentResult {
  pda: string;
  signature: string;
}

export async function createDonationCommitment(
  input: CreateDonationCommitmentInput,
): Promise<CreateDonationCommitmentResult> {
  const credential = getCredentialPda();
  const schema = getSchemaPda("MIZAAN_DONATION_V1");

  const payload: MizaanDonationV1 = {
    donorWallet: input.donor.toBase58(),
    lazWallet: input.lazWallet.toBase58(),
    amountIDRZ: input.amountIDRZ,
    donationType: input.donationType,
    categoryPreference: input.categoryPreference,
    donorMessageHash: input.donorMessage
      ? await hashMessage(input.donorMessage)
      : undefined,
    createdAt: BigInt(Math.floor(Date.now() / 1000)),
    tokenTransferSignature: input.tokenTransferSignature,
  };

  // TODO: install `sas-lib` then call:
  //   const { pda, signature } = await sas.createAttestation({
  //     credential, schema, data: payload, authority: donorSigner,
  //   });
  // The donor signs because §6.1 marks the donor wallet as authority for
  // MIZAAN_DONATION_V1. Browser wallets sign via `wallet-adapter`; Privy
  // embedded wallets sign via `usePrivy().signTransaction`.
  const _encoded = encodeSchema("MIZAAN_DONATION_V1", payload);
  void credential;
  void schema;
  void _encoded;

  throw new Error(
    "createDonationCommitment: not implemented — install sas-lib and " +
      "wire its createAttestation call (https://attest.solana.com).",
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
