import type { NextRequest } from "next/server";
import { fail, isSupabaseConfigured, ok } from "@/lib/api/responses";
import { getFeed } from "@/lib/db/feed";

/**
 * GET /api/feed?limit=50
 *
 * Returns the most recent feed items (DONATION_CREATED, DISTRIBUTION_CREATED,
 * RECEIPT_CONFIRMED) from the audit_log materialized view. Used by the public
 * /feed page and the home page live ticker. The browser also opens a
 * Supabase realtime channel for live appends — this endpoint just provides
 * the initial paint.
 */
export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return fail("NOT_CONFIGURED", "feed requires Supabase configuration", 503);
  }

  const url = new URL(req.url);
  const limitRaw = url.searchParams.get("limit");
  const limit = Math.min(Math.max(parseInt(limitRaw ?? "50", 10) || 50, 1), 200);

  const result = await getFeed(limit);
  if (result.error) {
    return fail(result.error.code, result.error.message, 500);
  }
  return ok(result.data);
}
