import { createClient } from "@/lib/supabase/server";
import type {
  ApiResult,
  Category,
  DonationMeta,
  DonationStatus,
  DonationType,
} from "@/lib/types";
import type { DonationsMetaRow } from "@/lib/supabase/types";

function rowToDonation(row: DonationsMetaRow): DonationMeta {
  return {
    id: row.id,
    donationCommitmentPda: row.donation_commitment_pda,
    donorWallet: row.donor_wallet,
    lazId: row.laz_id,
    donorEmail: row.donor_email,
    donorDisplayName: row.donor_display_name,
    encryptedMessage: row.encrypted_message,
    donationType: row.donation_type as DonationType,
    amountIdrz: BigInt(row.amount_idrz),
    categoryPreference: (row.category_preference ?? []) as Category[],
    tokenTransferSignature: row.token_transfer_signature,
    blockHeight: row.block_height,
    status: row.status as DonationStatus,
    totalDistributedIdrz: BigInt(row.total_distributed_idrz),
    distributionCount: row.distribution_count,
    confirmationCount: row.confirmation_count,
    createdAt: row.created_at,
    fullyDistributedAt: row.fully_distributed_at,
    fullyConfirmedAt: row.fully_confirmed_at,
  };
}

export async function listDonationsForLaz(
  lazId: string,
  status: DonationStatus = "PENDING_DISTRIBUTION",
  limit = 50
): Promise<ApiResult<DonationMeta[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("donations_meta")
    .select("*")
    .eq("laz_id", lazId)
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { data: null, error: { code: "DB_ERROR", message: error.message } };
  }
  return {
    data: (data as DonationsMetaRow[]).map(rowToDonation),
    error: null,
  };
}

export async function getDonationByPda(
  pda: string
): Promise<ApiResult<DonationMeta>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("donations_meta")
    .select("*")
    .eq("donation_commitment_pda", pda)
    .maybeSingle();

  if (error) {
    return { data: null, error: { code: "DB_ERROR", message: error.message } };
  }
  if (!data) {
    return {
      data: null,
      error: { code: "NOT_FOUND", message: "Donation not found" },
    };
  }
  return { data: rowToDonation(data as DonationsMetaRow), error: null };
}

export async function listDonationsByDonorWallet(
  walletAddress: string,
  limit = 50
): Promise<ApiResult<DonationMeta[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("donations_meta")
    .select("*")
    .eq("donor_wallet", walletAddress)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { data: null, error: { code: "DB_ERROR", message: error.message } };
  }
  return {
    data: (data as DonationsMetaRow[]).map(rowToDonation),
    error: null,
  };
}

export interface FeaturedTrailView {
  donationCommitmentPda: string;
  donationCreatedAt: string;
  distributionDecisionPda: string;
  distributionDecidedAt: string;
  receiptPda: string;
  receiptConfirmedAt: string;
  mustahikName: string;
  mustahikRegion: string;
  amountIdrz: bigint;
  purpose: string;
  category: Category;
  thankYouMessage: string | null;
}

/**
 * Fetch the most recent fully-confirmed donation chain for a donor wallet,
 * joined with the mustahik on the chosen distribution. Returns `null` when
 * the wallet has no seeded data yet — caller falls back to mock.
 */
export async function getFeaturedTrailForWallet(
  walletAddress: string
): Promise<ApiResult<FeaturedTrailView | null>> {
  const supabase = await createClient();

  const { data: donation, error: donationErr } = await supabase
    .from("donations_meta")
    .select("*")
    .eq("donor_wallet", walletAddress)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (donationErr) {
    return {
      data: null,
      error: { code: "DB_ERROR", message: donationErr.message },
    };
  }
  if (!donation) return { data: null, error: null };

  const { data: dist, error: distErr } = await supabase
    .from("distributions_meta")
    .select(
      "distribution_decision_pda, created_at, receipt_pda, receipt_confirmed_at, amount_idrz, purpose_description, category, thank_you_message_encrypted, mustahik:mustahik_id(full_name, region)"
    )
    .eq("donation_commitment_pda", donation.donation_commitment_pda)
    .not("receipt_pda", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (distErr) {
    return {
      data: null,
      error: { code: "DB_ERROR", message: distErr.message },
    };
  }
  if (!dist || !dist.receipt_pda || !dist.receipt_confirmed_at) {
    return { data: null, error: null };
  }

  const mustahik = Array.isArray(dist.mustahik) ? dist.mustahik[0] : dist.mustahik;

  return {
    data: {
      donationCommitmentPda: donation.donation_commitment_pda,
      donationCreatedAt: donation.created_at,
      distributionDecisionPda: dist.distribution_decision_pda,
      distributionDecidedAt: dist.created_at,
      receiptPda: dist.receipt_pda,
      receiptConfirmedAt: dist.receipt_confirmed_at,
      mustahikName: mustahik?.full_name ?? "Anonymous mustahik",
      mustahikRegion: mustahik?.region ?? "Indonesia",
      amountIdrz: BigInt(dist.amount_idrz),
      purpose: dist.purpose_description,
      category: dist.category as Category,
      thankYouMessage: dist.thank_you_message_encrypted,
    },
    error: null,
  };
}
