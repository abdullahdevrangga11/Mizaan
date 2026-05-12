import type { NextRequest } from "next/server";
import { z } from "zod";
import { fail, ok } from "@/lib/api/responses";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("INVALID_JSON", "body must be valid JSON", 400);
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return fail("INVALID_INPUT", parsed.error.message, 400);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return fail(
      "AUTH_FAILED",
      error?.message ?? "invalid credentials",
      401,
    );
  }

  return ok({
    userId: data.user.id,
    email: data.user.email,
    displayName: data.user.user_metadata?.display_name ?? null,
  });
}
