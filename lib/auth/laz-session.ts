import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface LazAdminSession {
  userId: string;
  email: string;
  displayName: string | null;
}

/**
 * Server-side gate for /laz/admin/* routes. Returns the active session
 * or redirects to /laz/login with the original URL preserved.
 *
 * Intentionally scoped — does NOT touch the global proxy, so public
 * routes (donate, verify, feed, laz, track) are not affected.
 */
export async function requireLazAdminSession(
  locale: string,
  redirectAfterLogin: string,
): Promise<LazAdminSession> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const localeSafe = locale === "en" ? "en" : "id";
    const target = encodeURIComponent(redirectAfterLogin);
    redirect(`/${localeSafe}/laz/login?next=${target}`);
  }

  return {
    userId: user.id,
    email: user.email ?? "",
    displayName:
      (user.user_metadata?.display_name as string | undefined) ?? null,
  };
}

/**
 * Soft read — returns null if no session. Used by /laz/login to redirect
 * already-authenticated users straight into the admin surface.
 */
export async function getLazAdminSession(): Promise<LazAdminSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return {
    userId: user.id,
    email: user.email ?? "",
    displayName:
      (user.user_metadata?.display_name as string | undefined) ?? null,
  };
}
