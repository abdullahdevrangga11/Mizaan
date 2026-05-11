import { createClient } from "@/lib/supabase/server";
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
