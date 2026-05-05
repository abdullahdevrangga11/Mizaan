"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import type { SupportedLocale } from "@/lib/constants";

/**
 * Two-pill locale toggle. Stays compact in the navbar; preserves the active
 * pathname when switching (next-intl router handles the prefix rewrite).
 */
export function LocaleSwitcher() {
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchTo = (next: SupportedLocale) => {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

  return (
    <div
      role="group"
      aria-label="language"
      className="flex items-center gap-px rounded-[7px] border border-[#FFFFFF12] bg-[#FFFFFF0A] p-0.5"
      data-pending={isPending || undefined}
    >
      <button
        type="button"
        onClick={() => switchTo("id")}
        aria-pressed={locale === "id"}
        className={`rounded-[5px] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors ${
          locale === "id"
            ? "bg-[#14F1951A] text-[#14F195]"
            : "text-[#EFEFE48C] hover:text-[#EFEFE4]"
        }`}
      >
        id
      </button>
      <button
        type="button"
        onClick={() => switchTo("en")}
        aria-pressed={locale === "en"}
        className={`rounded-[5px] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors ${
          locale === "en"
            ? "bg-[#14F1951A] text-[#14F195]"
            : "text-[#EFEFE48C] hover:text-[#EFEFE4]"
        }`}
      >
        en
      </button>
    </div>
  );
}
