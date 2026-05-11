import { createClient } from "@/lib/supabase/server";
import type {
  ApiResult,
  AsnafCategory,
  Mustahik,
  MustahikAgeRange,
  MustahikStatus,
} from "@/lib/types";
import type { MustahikRow } from "@/lib/supabase/types";

function rowToMustahik(row: MustahikRow): Mustahik {
  return {
    id: row.id,
    lazId: row.laz_id,
    walletAddress: row.wallet_address,
    identityPda: row.identity_pda,
    internalId: row.internal_id,
    internalIdHash: row.internal_id_hash,
    initials: row.initials,
    asnafCategory: row.asnaf_category as AsnafCategory,
    region: row.region,
    ageRange: row.age_range as MustahikAgeRange,
    status: row.status as MustahikStatus,
    registeredAt: row.registered_at,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
  };
}

export interface ListMustahikParams {
  status?: MustahikStatus;
  asnaf?: AsnafCategory;
  region?: string;
  ageRange?: MustahikAgeRange;
  limit?: number;
  offset?: number;
}

export async function listMustahik(
  params: ListMustahikParams = {}
): Promise<ApiResult<Mustahik[]>> {
  const supabase = await createClient();
  const {
    status = "ACTIVE",
    asnaf,
    region,
    ageRange,
    limit = 50,
    offset = 0,
  } = params;

  let query = supabase
    .from("mustahik")
    .select("*")
    .eq("status", status)
    .order("registered_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (asnaf) query = query.eq("asnaf_category", asnaf);
  if (region) query = query.eq("region", region);
  if (ageRange) query = query.eq("age_range", ageRange);

  const { data, error } = await query;

  if (error) {
    return { data: null, error: { code: "DB_ERROR", message: error.message } };
  }
  return { data: (data as MustahikRow[]).map(rowToMustahik), error: null };
}

export async function searchMustahik(
  q: string,
  limit = 20
): Promise<ApiResult<Mustahik[]>> {
  const supabase = await createClient();
  const term = q.trim();
  if (!term) return { data: [], error: null };

  const pattern = `%${term}%`;
  const { data, error } = await supabase
    .from("mustahik")
    .select("*")
    .or(
      `full_name.ilike.${pattern},internal_id.ilike.${pattern},initials.ilike.${pattern}`
    )
    .order("registered_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { data: null, error: { code: "DB_ERROR", message: error.message } };
  }
  return { data: (data as MustahikRow[]).map(rowToMustahik), error: null };
}

export async function getMustahikById(
  id: string
): Promise<ApiResult<Mustahik>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mustahik")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return { data: null, error: { code: "DB_ERROR", message: error.message } };
  }
  if (!data) {
    return {
      data: null,
      error: { code: "NOT_FOUND", message: "Mustahik not found" },
    };
  }
  return { data: rowToMustahik(data as MustahikRow), error: null };
}

export interface CreateMustahikInput {
  lazId: string;
  walletAddress: string;
  identityPda?: string | null;
  internalId: string;
  internalIdHash: string;
  fullName: string;
  phone?: string | null;
  email?: string | null;
  initials: string;
  asnafCategory: AsnafCategory;
  region: string;
  ageRange: MustahikAgeRange;
  registeredBy?: string | null;
}

export async function createMustahik(
  input: CreateMustahikInput
): Promise<ApiResult<Mustahik>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mustahik")
    .insert({
      laz_id: input.lazId,
      wallet_address: input.walletAddress,
      identity_pda: input.identityPda ?? null,
      internal_id: input.internalId,
      internal_id_hash: input.internalIdHash,
      full_name: input.fullName,
      phone: input.phone ?? null,
      email: input.email ?? null,
      initials: input.initials,
      asnaf_category: input.asnafCategory,
      region: input.region,
      age_range: input.ageRange,
      registered_by: input.registeredBy ?? null,
    })
    .select("*")
    .single();

  if (error) {
    return { data: null, error: { code: "DB_ERROR", message: error.message } };
  }
  return { data: rowToMustahik(data as MustahikRow), error: null };
}
