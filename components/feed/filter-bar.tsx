"use client";

import type { Category, FeedEventType } from "@/lib/types";
import type { SupportedLocale } from "@/lib/constants";
import { CATEGORY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type EventFilter = FeedEventType | "ALL";
export type CategoryFilter = Category | "ALL";
export type RegionFilter = string; // "ALL" or a region label like "Yogyakarta"

interface FilterBarProps {
  locale: SupportedLocale;
  eventFilter: EventFilter;
  onEventFilterChange: (next: EventFilter) => void;
  categoryFilter: CategoryFilter;
  onCategoryFilterChange: (next: CategoryFilter) => void;
  regionFilter: RegionFilter;
  onRegionFilterChange: (next: RegionFilter) => void;
  /** Visible-region options. Always prepend "ALL". */
  regions: string[];
}

const COPY = {
  allEvents: { id: "semua aktivitas", en: "all events" },
  confirmed: { id: "✓ dikonfirmasi", en: "✓ confirmed" },
  distributed: { id: "→ didistribusikan", en: "→ distributed" },
  donated: { id: "+ donasi masuk", en: "+ donated" },
  categories: { id: "kategori:", en: "categories:" },
  regions: { id: "wilayah:", en: "regions:" },
  all: { id: "semua", en: "all" },
} as const;

const EVENT_ORDER: { value: EventFilter; key: keyof typeof COPY }[] = [
  { value: "ALL", key: "allEvents" },
  { value: "RECEIPT_CONFIRMED", key: "confirmed" },
  { value: "DISTRIBUTION_CREATED", key: "distributed" },
  { value: "DONATION_CREATED", key: "donated" },
];

const CATEGORY_ORDER: CategoryFilter[] = [
  "ALL",
  "PENDIDIKAN",
  "KESEHATAN",
  "MODAL_USAHA",
  "SANDANG_PANGAN",
  "BENCANA",
];

function pillClass(active: boolean, large: boolean): string {
  return cn(
    large
      ? "rounded-[18px] px-3 py-1.5 text-xs leading-4"
      : "rounded-[14px] px-2.5 py-1 font-mono text-[10px] leading-3 lowercase",
    "cursor-pointer border border-solid transition-colors duration-150 select-none",
    active
      ? "border-transparent bg-[#14F195] text-[#181818] font-medium"
      : "border-[#FFFFFF12] bg-[#FFFFFF0A] text-[#EFEFE48C] hover:text-[#EFEFE4] hover:border-[#FFFFFF1F]",
  );
}

/**
 * Three pill-group filters for the live feed:
 *  - event type (large pills)
 *  - category (small mono pills)
 *  - region (small mono pills)
 *
 * Active pills use the green accent. Wraps gracefully on narrow viewports.
 */
export function FilterBar({
  locale,
  eventFilter,
  onEventFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  regionFilter,
  onRegionFilterChange,
  regions,
}: FilterBarProps) {
  const allRegions = ["ALL", ...regions];

  return (
    <div className="flex flex-col gap-y-3 gap-x-3.5 px-5 pb-5 sm:px-8 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-y-3 md:px-12 md:pb-6 lg:px-20">
      {/* Event type — large pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        {EVENT_ORDER.map((opt) => {
          const active = eventFilter === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onEventFilterChange(opt.value)}
              aria-pressed={active}
              className={pillClass(active, true)}
            >
              {COPY[opt.key][locale]}
            </button>
          );
        })}
      </div>

      {/* Category + region — small mono pills */}
      <div className="flex flex-wrap items-center gap-y-2 gap-x-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-[11px] leading-[14px] text-[#EFEFE46B]">
            {COPY.categories[locale]}
          </span>
          {CATEGORY_ORDER.map((cat) => {
            const active = categoryFilter === cat;
            const label =
              cat === "ALL"
                ? COPY.all[locale]
                : CATEGORY_LABELS[cat][locale].toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryFilterChange(cat)}
                aria-pressed={active}
                className={pillClass(active, false)}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-[11px] leading-[14px] text-[#EFEFE46B]">
            {COPY.regions[locale]}
          </span>
          {allRegions.map((region) => {
            const active = regionFilter === region;
            const label =
              region === "ALL" ? COPY.all[locale] : region.toLowerCase();
            return (
              <button
                key={region}
                type="button"
                onClick={() => onRegionFilterChange(region)}
                aria-pressed={active}
                className={pillClass(active, false)}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
