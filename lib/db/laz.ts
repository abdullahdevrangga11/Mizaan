import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  ApiResult,
  Laz,
  LazJurisdictionLevel,
  LazStatus,
} from "@/lib/types";
import type { LazRow } from "@/lib/supabase/types";

function rowToLaz(row: LazRow): Laz {
  return {
    id: row.id,
    walletAddress: row.wallet_address,
    identityPda: row.identity_pda,
    slug: row.slug,
    name: row.name,
    registrationNumber: row.registration_number,
    region: row.region,
    jurisdictionLevel: row.jurisdiction_level as LazJurisdictionLevel,
    websiteUrl: row.website_url,
    contactEmail: row.contact_email,
    logoUrl: row.logo_url,
    status: row.status as LazStatus,
    totalReceivedIdrz: BigInt(row.total_received_idrz),
    totalDistributedIdrz: BigInt(row.total_distributed_idrz),
    mustahikCount: row.mustahik_count,
    donorCount: row.donor_count,
    registeredAt: row.registered_at,
    updatedAt: row.updated_at,
  };
}

export async function listActiveLaz(): Promise<ApiResult<Laz[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("laz")
    .select("*")
    .eq("status", "ACTIVE")
    .order("name", { ascending: true });

  if (error) {
    return { data: null, error: { code: "DB_ERROR", message: error.message } };
  }
  return { data: (data as LazRow[]).map(rowToLaz), error: null };
}

/**
 * Admin-client variant of listActiveLaz for surfaces that are
 * intentionally public (/laz directory, /donate step 3 LAZ picker,
 * /verify LAZ resolution). Bypasses RLS — the data exposed here is
 * a published directory, not PII.
 */
export async function listActiveLazPublic(): Promise<ApiResult<Laz[]>> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("laz")
    .select("*")
    .eq("status", "ACTIVE")
    .order("name", { ascending: true });

  if (error) {
    return { data: null, error: { code: "DB_ERROR", message: error.message } };
  }
  return { data: (data as LazRow[]).map(rowToLaz), error: null };
}

/**
 * Resolve a single LAZ for the public profile page by either UUID id or
 * slug. Bypasses RLS for the same reason as listActiveLazPublic.
 */
export async function getLazByIdOrSlugPublic(
  identifier: string,
): Promise<ApiResult<Laz | null>> {
  const supabase = createAdminClient();
  const looksLikeUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      identifier,
    );
  const { data, error } = await supabase
    .from("laz")
    .select("*")
    .eq(looksLikeUuid ? "id" : "slug", identifier)
    .maybeSingle();

  if (error) {
    return { data: null, error: { code: "DB_ERROR", message: error.message } };
  }
  return {
    data: data ? rowToLaz(data as LazRow) : null,
    error: null,
  };
}

export interface RecentLazDistribution {
  distributionDecisionPda: string;
  receiptPda: string | null;
  mustahikInitials: string;
  mustahikRegion: string;
  amountIdrz: bigint;
  purpose: string;
  category: string;
  occurredAt: string;
}

/**
 * Fetch the most recent distributions for a LAZ profile page, joined
 * with the mustahik's initials + region. Bypasses RLS because this
 * surface is meant to be public — distributions are anonymised (initials
 * only) and mirror what /verify already publishes.
 */
export async function listRecentDistributionsForLazPublic(
  lazId: string,
  limit = 10,
): Promise<ApiResult<RecentLazDistribution[]>> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("distributions_meta")
    .select(
      "distribution_decision_pda, receipt_pda, amount_idrz, purpose_description, category, created_at, receipt_confirmed_at, mustahik:mustahik_id(initials, region)",
    )
    .eq("laz_id", lazId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { data: null, error: { code: "DB_ERROR", message: error.message } };
  }

  const items: RecentLazDistribution[] = (data ?? []).map((d) => {
    const mustahik = Array.isArray(d.mustahik) ? d.mustahik[0] : d.mustahik;
    return {
      distributionDecisionPda: d.distribution_decision_pda,
      receiptPda: d.receipt_pda,
      mustahikInitials: mustahik?.initials ?? "—",
      mustahikRegion: mustahik?.region ?? "Indonesia",
      amountIdrz: BigInt(d.amount_idrz),
      purpose: d.purpose_description,
      category: d.category,
      occurredAt: d.receipt_confirmed_at ?? d.created_at,
    };
  });

  return { data: items, error: null };
}

export async function getLazBySlug(slug: string): Promise<ApiResult<Laz>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("laz")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    return { data: null, error: { code: "DB_ERROR", message: error.message } };
  }
  if (!data) {
    return { data: null, error: { code: "NOT_FOUND", message: "LAZ not found" } };
  }
  return { data: rowToLaz(data as LazRow), error: null };
}

export async function getLazById(id: string): Promise<ApiResult<Laz>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("laz")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return { data: null, error: { code: "DB_ERROR", message: error.message } };
  }
  if (!data) {
    return { data: null, error: { code: "NOT_FOUND", message: "LAZ not found" } };
  }
  return { data: rowToLaz(data as LazRow), error: null };
}

export interface LazStats {
  totalReceivedIdrz: bigint;
  totalDistributedIdrz: bigint;
  mustahikCount: number;
  donorCount: number;
  pendingDonationCount: number;
}

export async function getLazStats(lazId: string): Promise<ApiResult<LazStats>> {
  const supabase = await createClient();

  const [{ data: lazData, error: lazError }, { count: pendingCount, error: pendingError }] =
    await Promise.all([
      supabase
        .from("laz")
        .select(
          "total_received_idrz, total_distributed_idrz, mustahik_count, donor_count"
        )
        .eq("id", lazId)
        .maybeSingle(),
      supabase
        .from("donations_meta")
        .select("id", { count: "exact", head: true })
        .eq("laz_id", lazId)
        .eq("status", "PENDING_DISTRIBUTION"),
    ]);

  if (lazError || pendingError) {
    return {
      data: null,
      error: {
        code: "DB_ERROR",
        message: (lazError ?? pendingError)?.message ?? "unknown",
      },
    };
  }
  if (!lazData) {
    return { data: null, error: { code: "NOT_FOUND", message: "LAZ not found" } };
  }

  return {
    data: {
      totalReceivedIdrz: BigInt(lazData.total_received_idrz),
      totalDistributedIdrz: BigInt(lazData.total_distributed_idrz),
      mustahikCount: lazData.mustahik_count,
      donorCount: lazData.donor_count,
      pendingDonationCount: pendingCount ?? 0,
    },
    error: null,
  };
}
