/**
 * Read-side helpers for SAS attestations.
 *
 * For listing-by-wallet we prefer Helius DAS (`getAssetsByOwner` /
 * `searchAssets`) because it indexes attestations and avoids the per-account
 * RPC round-trips that vanilla `getProgramAccounts` would incur.
 */

import type { PublicKey } from "@solana/web3.js";
import type {
  MizaanDistributionV1,
  MizaanDonationV1,
  MizaanReceiptV1,
  SasSchemaName,
  SasSchemaShape,
} from "./schemas";

export interface AttestationRecord<T extends SasSchemaShape = SasSchemaShape> {
  pda: string;
  schema: SasSchemaName;
  authority: string;
  data: T;
  slot: number;
  blockTime: number | null;
}

export interface DonationChain {
  donation: AttestationRecord<MizaanDonationV1>;
  distributions: AttestationRecord<MizaanDistributionV1>[];
  receipts: AttestationRecord<MizaanReceiptV1>[];
}

/**
 * List every attestation where `wallet` is the authority, donor, LAZ, or
 * mustahik. Backed by Helius DAS API in production.
 */
export async function fetchAttestationsByWallet(
  wallet: PublicKey | string,
): Promise<AttestationRecord[]> {
  void wallet;
  // TODO: install `sas-lib` to deserialize, then call Helius DAS
  // `searchAssets` with `ownerAddress = wallet` filtered by the SAS program.
  // For wallet-as-subject (donor / LAZ / mustahik fields inside the data
  // payload), use `getProgramAccounts` against the SAS program scoped to the
  // Mizaan credential PDA + memcmp on the relevant offset, then deserialize
  // via `decodeSchema`.
  return [];
}

export async function fetchAttestationByPda(
  pda: PublicKey | string,
): Promise<AttestationRecord | null> {
  void pda;
  // TODO: getAccountInfo(pda) → run `decodeSchema` against the right schema
  // (schema PDA is encoded in the SAS account header — `sas-lib` exposes a
  // helper for this).
  return null;
}

/**
 * Walk donation → distributions → receipts. Used by `/track/[wallet]` and
 * `/verify` to render the full audit chain for a single donation.
 */
export async function fetchDonationChain(
  donationPda: PublicKey | string,
): Promise<DonationChain | null> {
  void donationPda;
  // TODO:
  //   1. fetchAttestationByPda(donationPda) — must be MIZAAN_DONATION_V1
  //   2. getProgramAccounts(SAS program) with memcmp on
  //      `donationCommitmentPDA` offset → MIZAAN_DISTRIBUTION_V1 records
  //   3. for each distribution PDA, getProgramAccounts with memcmp on
  //      `distributionDecisionPDA` offset → MIZAAN_RECEIPT_V1 records
  //
  // Helius DAS doesn't (yet) index the SAS program, so we fall back to RPC
  // `getProgramAccounts` with memcmp filters here.
  return null;
}
