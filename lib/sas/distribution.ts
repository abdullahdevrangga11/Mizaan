/**
 * LAZ-side wrapper: writes a `MIZAAN_DISTRIBUTION_V1` attestation after the
 * LAZ has transferred IDRZ to a mustahik wallet.
 *
 * Authority is the LAZ wallet (SRS §6.1).
 */

import type { PublicKey } from "@solana/web3.js";
import type { AsnafCategory, Category } from "@/lib/types";
import type { MizaanDistributionV1 } from "./schemas";
import { encodeSchema } from "./schemas";
import { getCredentialPda, getSchemaPda } from "./client";

export interface CreateDistributionDecisionInput {
  donationCommitmentPda: PublicKey;
  lazWallet: PublicKey;
  mustahikWallet: PublicKey;
  amountIDRZ: bigint;
  category: Category;
  asnaf: AsnafCategory;
  mustahikIdHash: string;
  purposeDescription: string;
  tokenTransferSignature: string;
}

export interface CreateDistributionDecisionResult {
  pda: string;
  signature: string;
}

export async function createDistributionDecision(
  input: CreateDistributionDecisionInput,
): Promise<CreateDistributionDecisionResult> {
  const credential = getCredentialPda();
  const schema = getSchemaPda("MIZAAN_DISTRIBUTION_V1");

  const payload: MizaanDistributionV1 = {
    donationCommitmentPDA: input.donationCommitmentPda.toBase58(),
    lazWallet: input.lazWallet.toBase58(),
    mustahikWallet: input.mustahikWallet.toBase58(),
    amountIDRZ: input.amountIDRZ,
    category: input.category,
    asnaf: input.asnaf,
    mustahikIdHash: input.mustahikIdHash,
    purposeDescription: input.purposeDescription,
    createdAt: BigInt(Math.floor(Date.now() / 1000)),
    tokenTransferSignature: input.tokenTransferSignature,
  };

  // TODO: install `sas-lib` then call its createAttestation with
  // credential = Mizaan platform credential, schema = MIZAAN_DISTRIBUTION_V1,
  // and `authority` = the LAZ admin's signer (server-side keypair loaded from
  // Supabase Vault). See https://attest.solana.com.
  const _encoded = encodeSchema("MIZAAN_DISTRIBUTION_V1", payload);
  void credential;
  void schema;
  void _encoded;

  throw new Error(
    "createDistributionDecision: not implemented — install sas-lib and wire " +
      "its createAttestation call.",
  );
}
