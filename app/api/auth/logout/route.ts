import type { NextRequest } from "next/server";
import { ok } from "@/lib/api/responses";
import { createClient } from "@/lib/supabase/server";

export async function POST(_req: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return ok({ signedOut: true });
}
