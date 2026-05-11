import { createClient as createBrowserSupabase } from "@/lib/supabase/client";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import type {
  ApiResult,
  Category,
  FeedEventType,
  FeedItem,
} from "@/lib/types";
import type { AuditLogRow, FeedCacheRow } from "@/lib/supabase/types";

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

export interface FeedSubscription {
  unsubscribe: () => void;
}

/**
 * Subscribe to live feed events. Browser-only — uses the realtime channel.
 * The callback fires once per matching INSERT into `audit_log`.
 */
export function subscribeToFeed(
  callback: (item: FeedItem) => void
): FeedSubscription {
  const supabase = createBrowserSupabase();
  const channel = supabase
    .channel("public:audit_log:feed")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "audit_log",
      },
      (payload) => {
        const row = payload.new as AuditLogRow;
        if (!FEED_EVENTS.includes(row.event_type as FeedEventType)) return;
        callback(auditRowToFeedItem(row));
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      void supabase.removeChannel(channel);
    },
  };
}
