import type { NextRequest } from "next/server";
import { fail, isSupabaseConfigured, ok } from "@/lib/api/responses";
import { MOCK_LAZ } from "@/lib/api/mock-laz";

/**
 * GET /api/laz — list active LAZ partners.
 *
 * Falls back to in-memory `MOCK_LAZ` when Supabase isn't yet provisioned so
 * the donor flow still demos cleanly. Once env vars are set, the same
 * endpoint queries the real `laz` table.
 */
export async function GET(_req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return ok(MOCK_LAZ);
  }

  // Lazy-import so missing @supabase/* deps don't break the mock path.
  try {
    const { listActiveLaz } = await import("@/lib/db/laz");
    const result = await listActiveLaz();
    if (result.error) {
      return fail(result.error.code, result.error.message, 500);
    }
    return ok(result.data);
  } catch (err) {
    return fail(
      "INTERNAL",
      err instanceof Error ? err.message : "unexpected error",
      500,
    );
  }
}
