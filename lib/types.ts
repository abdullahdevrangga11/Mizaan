/**
 * Core Mizaan types. Mirrors SAS schemas in §6 of SRS.
 * All monetary values use `bigint` to preserve Rupiah precision.
 */

// ---------- Donation ----------

export type DonationType =
  | "ZAKAT_MAL"
  | "ZAKAT_FITRAH"
  | "SEDEKAH"
  | "INFAQ";

// ---------- Distribution category (donor preference + LAZ tagging) ----------

export type Category =
  | "PENDIDIKAN"
  | "KESEHATAN"
  | "MODAL_USAHA"
  | "SANDANG_PANGAN"
  | "BIAYA_HIDUP"
  | "BENCANA"
  | "FAKIR_MISKIN"
  | "MUALLAF"
  | "RIQAB"
  | "GHARIMIN"
  | "FISABILILLAH"
  | "IBNU_SABIL";

export type CategoryPreference = Category | "ANY";

// ---------- Asnaf (8 quranic categories of zakat recipients) ----------

export type AsnafCategory =
  | "FAKIR"
  | "MISKIN"
  | "AMIL"
  | "MUALLAF"
  | "RIQAB"
  | "GHARIMIN"
  | "FISABILILLAH"
  | "IBNU_SABIL";

// ---------- LAZ ----------

export type LazJurisdictionLevel =
  | "NATIONAL"
  | "PROVINCIAL"
  | "REGENCY"
  | "MOSQUE";

export type LazStatus = "ACTIVE" | "PAUSED" | "SUSPENDED";

export interface Laz {
  id: string;
  walletAddress: string;
  identityPda: string | null;
  slug: string;
  name: string;
  registrationNumber: string;
  region: string;
  jurisdictionLevel: LazJurisdictionLevel;
  websiteUrl: string | null;
  contactEmail: string | null;
  logoUrl: string | null;
  status: LazStatus;
  totalReceivedIdrz: bigint;
  totalDistributedIdrz: bigint;
  mustahikCount: number;
  donorCount: number;
  registeredAt: string;
  updatedAt: string;
}

// ---------- Mustahik ----------

export type MustahikAgeRange = "CHILD" | "TEEN" | "ADULT" | "ELDER";
export type MustahikStatus = "ACTIVE" | "GRADUATED" | "INACTIVE";

export interface Mustahik {
  id: string;
  lazId: string;
  walletAddress: string;
  identityPda: string | null;
  internalId: string;
  internalIdHash: string;
  initials: string;
  asnafCategory: AsnafCategory;
  region: string;
  ageRange: MustahikAgeRange;
  status: MustahikStatus;
  registeredAt: string;
  /** PII fields. Server-only — never include in client-facing payloads. */
  fullName?: string;
  phone?: string | null;
  email?: string | null;
}

// ---------- Donation (off-chain meta) ----------

export type DonationStatus =
  | "PENDING_DISTRIBUTION"
  | "PARTIALLY_DISTRIBUTED"
  | "FULLY_DISTRIBUTED"
  | "FULLY_CONFIRMED";

export interface DonationMeta {
  id: string;
  donationCommitmentPda: string;
  donorWallet: string;
  lazId: string;
  donorEmail: string | null;
  donorDisplayName: string | null;
  encryptedMessage: string | null;
  donationType: DonationType;
  amountIdrz: bigint;
  categoryPreference: Category[];
  tokenTransferSignature: string;
  blockHeight: number | null;
  status: DonationStatus;
  totalDistributedIdrz: bigint;
  distributionCount: number;
  confirmationCount: number;
  createdAt: string;
  fullyDistributedAt: string | null;
  fullyConfirmedAt: string | null;
}

// ---------- Distribution (off-chain meta) ----------

export interface DistributionMeta {
  id: string;
  distributionDecisionPda: string;
  donationCommitmentPda: string;
  lazId: string;
  mustahikId: string;
  amilUserId: string;
  amountIdrz: bigint;
  category: Category;
  asnaf: AsnafCategory;
  purposeDescription: string;
  internalNotes: string | null;
  tokenTransferSignature: string;
  blockHeight: number | null;
  receiptPda: string | null;
  receiptConfirmedAt: string | null;
  thankYouMessageEncrypted: string | null;
  magicLinkSentAt: string | null;
  magicLinkClickedAt: string | null;
  createdAt: string;
}

// ---------- Audit log / live feed ----------

export type FeedEventType =
  | "DONATION_CREATED"
  | "DISTRIBUTION_CREATED"
  | "RECEIPT_CONFIRMED"
  | "LAZ_REGISTERED"
  | "MUSTAHIK_REGISTERED";

export interface FeedItem {
  id: string;
  eventType: FeedEventType;
  amountIdrz: bigint | null;
  category: Category | null;
  region: string | null;
  mustahikInitials: string | null;
  lazSlug: string | null;
  purposeShort: string | null;
  occurredAt: string;
}

// ---------- API envelope ----------

export type ApiResult<T> =
  | { data: T; error: null }
  | { data: null; error: { code: string; message: string } };
