/**
 * TypeScript mirrors of the 5 SAS schemas defined in SRS §6.
 *
 * Wallet addresses are typed as `string` (base58) at the TS boundary so these
 * interfaces survive serialization across server/client. Conversion to
 * `PublicKey` happens inside `lib/sas/*.ts` helpers.
 *
 * All token amounts are `bigint` to keep parity with `lib/types.ts` and avoid
 * float drift on Rupiah-precision values.
 */

import type { AsnafCategory, Category, DonationType, LazJurisdictionLevel } from "@/lib/types";

export type CategoryPreference = Category | "ANY";

export type ConfirmationMethod = "WEB" | "SMS" | "QR";

// ---------- MIZAAN_DONATION_V1 ----------

export interface MizaanDonationV1 {
  donorWallet: string;
  lazWallet: string;
  amountIDRZ: bigint;
  donationType: DonationType;
  categoryPreference: CategoryPreference;
  donorMessageHash?: string;
  donorMessageCID?: string;
  createdAt: bigint;
  tokenTransferSignature: string;
}

// ---------- MIZAAN_DISTRIBUTION_V1 ----------

export interface MizaanDistributionV1 {
  donationCommitmentPDA: string;
  lazWallet: string;
  mustahikWallet: string;
  amountIDRZ: bigint;
  category: Category;
  asnaf: AsnafCategory;
  mustahikIdHash: string;
  purposeDescription: string;
  createdAt: bigint;
  tokenTransferSignature: string;
}

// ---------- MIZAAN_RECEIPT_V1 ----------

export interface MizaanReceiptV1 {
  distributionDecisionPDA: string;
  mustahikWallet: string;
  lazWallet: string;
  confirmedAt: bigint;
  confirmationMethod: ConfirmationMethod;
  thankYouMessageHash?: string;
  thankYouMessageCID?: string;
  magicLinkConsentHash: string;
}

// ---------- MIZAAN_LAZ_IDENTITY_V1 ----------

export interface MizaanLazIdentityV1 {
  lazWallet: string;
  lazNameHash: string;
  lazSlug: string;
  lazRegistrationNumber: string;
  websiteURL?: string;
  contactEmail?: string;
  region: string;
  jurisdictionLevel: LazJurisdictionLevel;
  status: "ACTIVE" | "PAUSED" | "SUSPENDED";
  registeredAt: bigint;
  mizaanAuthority: string;
}

// ---------- MIZAAN_MUSTAHIK_V1 ----------

export interface MizaanMustahikV1 {
  mustahikWallet: string;
  lazWallet: string;
  mustahikIdHash: string;
  asnafCategory: AsnafCategory;
  region: string;
  initials: string;
  ageRange: "CHILD" | "TEEN" | "ADULT" | "ELDER";
  status: "ACTIVE" | "GRADUATED" | "INACTIVE";
  registeredAt: bigint;
}

// ---------- Encode / decode helpers ----------

// SAS schema layouts use a positional mix of `Pubkey | u64 | i64 | u8 | String`.
// `sas-lib` exposes a serializer keyed off the schema PDA, so the production
// path is to call its built-in (de)serializer. The stubs below establish the
// call signature so consumer code can be written against a stable interface
// while we wait for `sas-lib` install + final API confirmation.
//
// TODO: replace these with `sas-lib`'s `serialize(schema, data)` /
// `deserialize(schema, bytes)` once the package is installed
// (see https://attest.solana.com).

export type SasSchemaName =
  | "MIZAAN_DONATION_V1"
  | "MIZAAN_DISTRIBUTION_V1"
  | "MIZAAN_RECEIPT_V1"
  | "MIZAAN_LAZ_IDENTITY_V1"
  | "MIZAAN_MUSTAHIK_V1";

export type SasSchemaShape =
  | MizaanDonationV1
  | MizaanDistributionV1
  | MizaanReceiptV1
  | MizaanLazIdentityV1
  | MizaanMustahikV1;

export function encodeSchema<T extends SasSchemaShape>(
  _schema: SasSchemaName,
  _data: T,
): Uint8Array {
  // TODO: delegate to sas-lib serializer once installed.
  throw new Error(
    "encodeSchema: not implemented — install sas-lib and wire its serializer",
  );
}

export function decodeSchema<T extends SasSchemaShape>(
  _schema: SasSchemaName,
  _bytes: Uint8Array,
): T {
  // TODO: delegate to sas-lib deserializer once installed.
  throw new Error(
    "decodeSchema: not implemented — install sas-lib and wire its deserializer",
  );
}
