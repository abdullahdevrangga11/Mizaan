import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  ApiResult,
  Category,
  FeedEventType,
  FeedItem,
  FeedItemEnriched,
} from "@/lib/types";
import type { AuditLogRow, FeedCacheRow } from "@/lib/supabase/types";

// Re-export the type for back-compat with existing importers.
export type { FeedItemEnriched } from "@/lib/types";

function cacheRowToFeedItem(row: FeedCacheRow): FeedItem {
  // feed_cache columns are nullable in the generated types (because Postgres
  // views can't enforce NOT NULL), but `id` and `occurred_at` are guaranteed
  // present because the view is built directly from audit_log.
  return {
    id: row.id ?? "",
    eventType: row.event_type as FeedEventType,
    amountIdrz: row.amount_idrz === null ? null : BigInt(row.amount_idrz),
    category: (row.category ?? null) as Category | null,
    region: row.region,
    mustahikInitials: row.mustahik_initials,
    lazSlug: row.laz_slug,
    purposeShort: row.purpose_short,
    occurredAt: row.occurred_at ?? "",
  };
}

function auditRowToFeedItem(row: AuditLogRow): FeedItem {
  return {
    id: row.id,
    eventType: row.event_type as FeedEventType,
    amountIdrz: row.amount_idrz === null ? null : BigInt(row.amount_idrz),
    category: (row.category ?? null) as Category | null,
    region: row.region,
    mustahikInitials: row.mustahik_initials,
    lazSlug: row.laz_slug,
    purposeShort: row.purpose_short,
    occurredAt: row.occurred_at,
  };
}

/**
 * Public, enriched feed read for the /feed page and home ticker. Uses the
 * admin client so RLS on audit_log can't silently swallow rows, and resolves
 * the LAZ name so the view layer doesn't have to look up by slug separately.
 * Picks the right on-chain PDA per event_type.
 */
export async function getFeedPublic(
  limit = 50,
): Promise<ApiResult<FeedItemEnriched[]>> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("audit_log")
    .select(
      "id, event_type, amount_idrz, category, region, mustahik_initials, laz_slug, laz_id, purpose_short, occurred_at, donation_pda, distribution_pda, receipt_pda",
    )
    .in("event_type", [
      "DONATION_CREATED",
      "DISTRIBUTION_CREATED",
      "RECEIPT_CONFIRMED",
    ])
    .order("occurred_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { data: null, error: { code: "DB_ERROR", message: error.message } };
  }

  // Resolve LAZ names in one batch so each row gets a real label.
  const lazIds = Array.from(
    new Set((data ?? []).map((r) => r.laz_id).filter((id): id is string => !!id)),
  );
  const lazNameById = new Map<string, string>();
  if (lazIds.length > 0) {
    const { data: lazRows } = await supabase
      .from("laz")
      .select("id, name")
      .in("id", lazIds);
    for (const row of lazRows ?? []) {
      lazNameById.set(row.id, row.name);
    }
  }

  const items: FeedItemEnriched[] = (data ?? []).map((r) => {
    const eventType = r.event_type as FeedEventType;
    let attestationPda: string | null = null;
    if (eventType === "DONATION_CREATED") attestationPda = r.donation_pda;
    else if (eventType === "DISTRIBUTION_CREATED")
      attestationPda = r.distribution_pda;
    else if (eventType === "RECEIPT_CONFIRMED") attestationPda = r.receipt_pda;
    return {
      id: r.id ?? "",
      eventType,
      amountIdrz: r.amount_idrz === null ? null : BigInt(r.amount_idrz),
      category: (r.category ?? null) as Category | null,
      region: r.region,
      mustahikInitials: r.mustahik_initials,
      lazSlug: r.laz_slug,
      purposeShort: r.purpose_short,
      occurredAt: r.occurred_at ?? "",
      attestationPda,
      lazName: r.laz_id ? lazNameById.get(r.laz_id) ?? null : null,
    };
  });

  return { data: items, error: null };
}

export async function getFeed(limit = 50): Promise<ApiResult<FeedItem[]>> {
  const supabase = await createServerSupabase();
  // Read directly from audit_log so newly-inserted events surface
  // immediately. The materialized feed_cache view exists in the schema
  // for future scaling, but its REFRESH cadence introduces lag that
  // breaks the "live feed" promise during demo.
  const { data, error } = await supabase
    .from("audit_log")
    .select(
      "id, event_type, amount_idrz, category, region, mustahik_initials, laz_slug, purpose_short, occurred_at",
    )
    .in("event_type", [
      "DONATION_CREATED",
      "DISTRIBUTION_CREATED",
      "RECEIPT_CONFIRMED",
    ])
    .order("occurred_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { data: null, error: { code: "DB_ERROR", message: error.message } };
  }
  return {
    data: (data as AuditLogRow[]).map(auditRowToFeedItem),
    error: null,
  };
}

const FEED_EVENTS: ReadonlyArray<FeedEventType> = [
  "DONATION_CREATED",
  "DISTRIBUTION_CREATED",
  "RECEIPT_CONFIRMED",
];

// Browser-only feed helpers (subscribeToFeed, subscribeToFeedEnriched,
// FeedSubscription) now live in ./feed-client.ts so server-side import
// graphs never pull `@supabase/ssr` cookie-reading code into the client
// bundle. Re-export the FeedSubscription type for back-compat.
export type { FeedSubscription } from "./feed-client";
