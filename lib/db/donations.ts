import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

export interface OtherDistributionItem {
  donationCommitmentPda: string;
  donationCreatedAt: string;
  distributionDecisionPda: string;
  distributionDecidedAt: string;
  receiptPda: string | null;
  receiptConfirmedAt: string | null;
  mustahikName: string;
  mustahikRegion: string;
  amountIdrz: bigint;
  purpose: string;
  category: Category;
  lazAmilName: string;
}

export interface DonorTrailAggregates {
  totalIdrz: bigint;
  mustahikCount: number;
  distributionCount: number;
  confirmedCount: number;
  avgConfirmHours: number;
}

export interface DonorTrailFull {
  featured: FeaturedTrailView | null;
  others: OtherDistributionItem[];
  aggregates: DonorTrailAggregates;
}

/**
 * Fetch the most recent fully-confirmed donation chain for a donor wallet,
 * joined with the mustahik on the chosen distribution. Returns `null` when
 * the wallet has no seeded data yet — caller falls back to mock.
 *
 * Uses the admin client because the public trail page is intentionally
 * readable by anyone with the wallet address — RLS on donations_meta blocks
 * anon reads, but the data exposed here (PDAs, amount, mustahik display name,
 * region, timestamps) is the same information published on /verify and /feed.
 */
export async function getFeaturedTrailForWallet(
  walletAddress: string
): Promise<ApiResult<FeaturedTrailView | null>> {
  const supabase = createAdminClient();

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

/**
 * Full donor trail: all donations + their distributions for a wallet,
 * joined with mustahik display info and LAZ name, plus a "featured"
 * pick (most-recent confirmed) and pre-computed aggregates for the
 * /track header strip.
 *
 * Falls back to `{ featured: null, others: [], aggregates: zero }`
 * when the wallet has no seeded data — caller decides whether to
 * surface mock filler or render an honest empty state.
 *
 * Uses the admin client because /track is intentionally public for
 * any wallet, and the data we surface (PDAs, amounts, anonymised
 * mustahik names + region) is the same information /verify and
 * /feed already publish.
 */
export async function getDonorTrailFull(
  walletAddress: string,
): Promise<ApiResult<DonorTrailFull>> {
  const supabase = createAdminClient();

  const { data: donations, error: donationsErr } = await supabase
    .from("donations_meta")
    .select("donation_commitment_pda, created_at")
    .eq("donor_wallet", walletAddress)
    .order("created_at", { ascending: false });

  if (donationsErr) {
    return {
      data: null,
      error: { code: "DB_ERROR", message: donationsErr.message },
    };
  }

  const empty: DonorTrailFull = {
    featured: null,
    others: [],
    aggregates: {
      totalIdrz: 0n,
      mustahikCount: 0,
      distributionCount: 0,
      confirmedCount: 0,
      avgConfirmHours: 0,
    },
  };
  if (!donations || donations.length === 0) {
    return { data: empty, error: null };
  }

  const commitmentPdas = donations.map((d) => d.donation_commitment_pda);
  const donationCreatedAtByPda = new Map(
    donations.map((d) => [d.donation_commitment_pda, d.created_at]),
  );

  const { data: dists, error: distsErr } = await supabase
    .from("distributions_meta")
    .select(
      "donation_commitment_pda, distribution_decision_pda, created_at, receipt_pda, receipt_confirmed_at, amount_idrz, purpose_description, category, thank_you_message_encrypted, mustahik:mustahik_id(full_name, region), laz:laz_id(name)",
    )
    .in("donation_commitment_pda", commitmentPdas)
    .order("created_at", { ascending: false });

  if (distsErr) {
    return {
      data: null,
      error: { code: "DB_ERROR", message: distsErr.message },
    };
  }

  if (!dists || dists.length === 0) {
    return { data: empty, error: null };
  }

  const mustahikIds = new Set<string>();
  let totalIdrz = 0n;
  let confirmedCount = 0;
  const confirmDurationsHours: number[] = [];

  type DistRow = (typeof dists)[number];
  const mapToItem = (d: DistRow): OtherDistributionItem => {
    const mustahik = Array.isArray(d.mustahik) ? d.mustahik[0] : d.mustahik;
    const laz = Array.isArray(d.laz) ? d.laz[0] : d.laz;
    return {
      donationCommitmentPda: d.donation_commitment_pda,
      donationCreatedAt:
        donationCreatedAtByPda.get(d.donation_commitment_pda) ?? d.created_at,
      distributionDecisionPda: d.distribution_decision_pda,
      distributionDecidedAt: d.created_at,
      receiptPda: d.receipt_pda,
      receiptConfirmedAt: d.receipt_confirmed_at,
      mustahikName: mustahik?.full_name ?? "Anonymous mustahik",
      mustahikRegion: mustahik?.region ?? "Indonesia",
      amountIdrz: BigInt(d.amount_idrz),
      purpose: d.purpose_description,
      category: d.category as Category,
      lazAmilName: laz?.name ? `${laz.name} (LAZ amil)` : "LAZ amil",
    };
  };

  const items = dists.map(mapToItem);

  for (const d of dists) {
    const mustahikId = Array.isArray(d.mustahik) ? d.mustahik[0] : d.mustahik;
    if (mustahikId) mustahikIds.add(JSON.stringify(mustahikId));
    totalIdrz += BigInt(d.amount_idrz);
    if (d.receipt_pda && d.receipt_confirmed_at) {
      confirmedCount += 1;
      const hours =
        (new Date(d.receipt_confirmed_at).getTime() -
          new Date(d.created_at).getTime()) /
        1000 /
        3600;
      if (hours > 0) confirmDurationsHours.push(hours);
    }
  }

  const avgConfirmHours = confirmDurationsHours.length
    ? confirmDurationsHours.reduce((s, h) => s + h, 0) /
      confirmDurationsHours.length
    : 0;

  // Pick the featured: most-recent confirmed distribution.
  const featuredRow = dists.find(
    (d) => d.receipt_pda && d.receipt_confirmed_at,
  );
  let featured: FeaturedTrailView | null = null;
  if (featuredRow && featuredRow.receipt_pda && featuredRow.receipt_confirmed_at) {
    const mustahik = Array.isArray(featuredRow.mustahik)
      ? featuredRow.mustahik[0]
      : featuredRow.mustahik;
    featured = {
      donationCommitmentPda: featuredRow.donation_commitment_pda,
      donationCreatedAt:
        donationCreatedAtByPda.get(featuredRow.donation_commitment_pda) ??
        featuredRow.created_at,
      distributionDecisionPda: featuredRow.distribution_decision_pda,
      distributionDecidedAt: featuredRow.created_at,
      receiptPda: featuredRow.receipt_pda,
      receiptConfirmedAt: featuredRow.receipt_confirmed_at,
      mustahikName: mustahik?.full_name ?? "Anonymous mustahik",
      mustahikRegion: mustahik?.region ?? "Indonesia",
      amountIdrz: BigInt(featuredRow.amount_idrz),
      purpose: featuredRow.purpose_description,
      category: featuredRow.category as Category,
      thankYouMessage: featuredRow.thank_you_message_encrypted,
    };
  }

  // "Others" = every distribution except the featured one.
  const others = featuredRow
    ? items.filter(
        (i) => i.distributionDecisionPda !== featuredRow.distribution_decision_pda,
      )
    : items;

  return {
    data: {
      featured,
      others,
      aggregates: {
        totalIdrz,
        mustahikCount: mustahikIds.size,
        distributionCount: dists.length,
        confirmedCount,
        avgConfirmHours,
      },
    },
    error: null,
  };
}
