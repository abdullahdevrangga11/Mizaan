import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware navigation primitives — drop-in replacements for next/link
 * + next/navigation that automatically prepend the active locale prefix
 * (when needed per `localePrefix: "as-needed"`).
 *
 * Use these everywhere instead of `next/link` and `next/navigation` so the
 * locale switcher stays consistent.
 */
export const { Link, redirect, useRouter, usePathname, getPathname } =
  createNavigation(routing);
