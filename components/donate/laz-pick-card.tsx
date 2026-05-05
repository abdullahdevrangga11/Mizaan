"use client";

import { useTranslations } from "next-intl";
import { LAZ_JURISDICTION_LABELS, type SupportedLocale } from "@/lib/constants";
import { cn, formatRupiah } from "@/lib/utils";
import type { Laz } from "@/lib/types";

interface LazPickCardProps {
  laz: Pick<
    Laz,
    | "id"
    | "slug"
    | "name"
    | "region"
    | "jurisdictionLevel"
    | "logoUrl"
    | "totalReceivedIdrz"
    | "mustahikCount"
  >;
  selected: boolean;
  onSelect: () => void;
  locale: SupportedLocale;
}

function lazInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

export function LazPickCard({
  laz,
  selected,
  onSelect,
  locale,
}: LazPickCardProps) {
  const t = useTranslations("donate.step3");
  const jurisdiction = LAZ_JURISDICTION_LABELS[laz.jurisdictionLevel][locale];

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "lift group relative flex w-full items-center gap-3 rounded-[16px] border p-4 text-left transition-colors sm:gap-4 sm:p-5",
        selected
          ? "border-[var(--color-border-accent)] bg-[rgba(20,241,149,0.04)]"
          : "card-neutral",
      )}
    >
      {/* Logo */}
      <div
        aria-hidden
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border font-mono text-[12px] font-medium sm:h-12 sm:w-12 sm:text-[13px]",
          selected
            ? "border-[var(--color-border-accent)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
            : "border-white/10 bg-white/[0.04] text-text-secondary",
        )}
      >
        {lazInitials(laz.name)}
      </div>

      {/* Body */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[14px] font-medium leading-tight tracking-tight text-text lowercase sm:text-[15px]">
            {laz.name.toLowerCase()}
          </span>
          <span className="chip">{jurisdiction.toLowerCase()}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-text-muted sm:gap-x-4 sm:text-[11px]">
          <span className="lowercase">{laz.region.toLowerCase()}</span>
          <span aria-hidden className="hidden sm:inline">·</span>
          <span>
            {t("totalReceived")}:{" "}
            <span className="text-text-secondary">
              {formatRupiah(laz.totalReceivedIdrz)}
            </span>
          </span>
          <span aria-hidden className="hidden sm:inline">·</span>
          <span>
            {laz.mustahikCount} {t("mustahikCount")}
          </span>
        </div>
      </div>

      {/* Selected indicator */}
      <div
        aria-hidden
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
          selected
            ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
            : "border-white/15",
        )}
      >
        {selected ? (
          <svg
            viewBox="0 0 12 12"
            className="h-3 w-3 text-black"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M2 6.5l2.5 2.5L10 3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </div>
    </button>
  );
}
