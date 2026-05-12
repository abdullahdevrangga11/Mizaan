/**
 * Browser-only feed helpers. Kept in their own module so the import graph
 * never pulls server-only modules (e.g. lib/supabase/server.ts which depends
 * on next/headers) into the client bundle.
 */
import { createClient as createBrowserSupabase } from "@/lib/supabase/client";
import type {
  Category,
  FeedEventType,
  FeedItem,
  FeedItemEnriched,
} from "@/lib/types";
import type { AuditLogRow } from "@/lib/supabase/types";

export type { FeedItemEnriched } from "@/lib/types";

export interface FeedSubscription {
  unsubscribe: () => void;
}

const FEED_EVENTS: ReadonlyArray<FeedEventType> = [
  "DONATION_CREATED",
  "DISTRIBUTION_CREATED",
  "RECEIPT_CONFIRMED",
];

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
 * Subscribe to live feed events. Browser-only — uses the realtime channel.
 * The callback fires once per matching INSERT into `audit_log`.
 */
export function subscribeToFeed(
  callback: (item: FeedItem) => void,
): FeedSubscription {
  const supabase = createBrowserSupabase();
  const channel = supabase
    .channel("public:audit_log:feed")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "audit_log" },
      (payload) => {
        const row = payload.new as AuditLogRow;
        if (!FEED_EVENTS.includes(row.event_type as FeedEventType)) return;
        callback(auditRowToFeedItem(row));
      },
    )
    .subscribe();

  return {
    unsubscribe: () => {
      void supabase.removeChannel(channel);
    },
  };
}

/**
 * Enriched variant of subscribeToFeed. Surfaces the per-event PDA
 * (donation/distribution/receipt) and resolves the LAZ name from
 * /api/laz on first need.
 *
 * onStatus fires with the channel's lifecycle status — callers may use it
 * to drive a fallback path when the channel never transitions to
 * "SUBSCRIBED".
 */
export function subscribeToFeedEnriched(opts: {
  onItem: (item: FeedItemEnriched) => void;
  onStatus?: (status: string) => void;
}): FeedSubscription {
  const supabase = createBrowserSupabase();
  const lazNameCache = new Map<string, string>();

  async function lookupLazName(lazId: string | null): Promise<string | null> {
    if (!lazId) return null;
    if (lazNameCache.has(lazId)) return lazNameCache.get(lazId) ?? null;
    try {
      const res = await fetch("/api/laz", { cache: "force-cache" });
      const json = (await res.json()) as
        | { data: Array<{ id: string; name: string }>; error: null }
        | { data: null; error: { code: string; message: string } };
      if (json && "data" in json && Array.isArray(json.data)) {
        for (const row of json.data) lazNameCache.set(row.id, row.name);
      }
    } catch {
      // Feed survives without LAZ names — leave cache empty.
    }
    return lazNameCache.get(lazId) ?? null;
  }

  const channel = supabase
    .channel("public:audit_log:feed-enriched")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "audit_log" },
      async (payload) => {
        const row = payload.new as AuditLogRow;
        const eventType = row.event_type as FeedEventType;
        if (!FEED_EVENTS.includes(eventType)) return;

        let attestationPda: string | null = null;
        if (eventType === "DONATION_CREATED") attestationPda = row.donation_pda;
        else if (eventType === "DISTRIBUTION_CREATED")
          attestationPda = row.distribution_pda;
        else if (eventType === "RECEIPT_CONFIRMED")
          attestationPda = row.receipt_pda;

        const lazName = await lookupLazName(row.laz_id);

        opts.onItem({
          id: row.id,
          eventType,
          amountIdrz: row.amount_idrz === null ? null : BigInt(row.amount_idrz),
          category: (row.category ?? null) as Category | null,
          region: row.region,
          mustahikInitials: row.mustahik_initials,
          lazSlug: row.laz_slug,
          purposeShort: row.purpose_short,
          occurredAt: row.occurred_at,
          attestationPda,
          lazName,
        });
      },
    )
    .subscribe((status) => {
      if (opts.onStatus) opts.onStatus(status);
    });

  return {
    unsubscribe: () => {
      void supabase.removeChannel(channel);
    },
  };
}
