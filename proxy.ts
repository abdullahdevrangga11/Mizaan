import createIntlProxy from "next-intl/middleware";
import { routing } from "./i18n/routing";

// next-intl ships its proxy under the legacy "middleware" name.
// Next.js 16 renames the file convention to `proxy.ts` — but the helper
// signature is unchanged.
export default createIntlProxy(routing);

export const config = {
  // Match everything except API routes, Next.js internals, and static assets.
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
