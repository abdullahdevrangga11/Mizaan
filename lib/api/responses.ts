import { NextResponse } from "next/server";
import type { ApiResult } from "@/lib/types";

/**
 * Standard JSON envelope for all `/api/*` routes:
 *   200/201 → { data, error: null }
 *   4xx/5xx → { data: null, error: { code, message } }
 *
 * BigInt values are auto-stringified — JSON.stringify can't handle them.
 */
export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(
    { data: serializeBigInt(data), error: null },
    { status },
  );
}

export function fail(
  code: string,
  message: string,
  status = 400,
): NextResponse {
  const body: ApiResult<never> = { data: null, error: { code, message } };
  return NextResponse.json(body, { status });
}

function serializeBigInt<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_k, v) =>
      typeof v === "bigint" ? v.toString() : v,
    ),
  ) as T;
}

/** Detect whether Supabase env vars are wired. Used by API routes to decide
 *  whether to query the DB or fall back to in-memory demo data. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
