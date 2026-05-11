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
