"use client";

import { useMemo, useState } from "react";
import {
  DistributionCard,
  DistributionRow,
  type DistributionView,
} from "@/components/track/distribution-card";
import { CategoryBreakdown } from "@/components/track/category-breakdown";
import { ShareButton } from "@/components/track/share-button";
import { shortenAddress } from "@/lib/utils";
import type { SupportedLocale } from "@/lib/constants";
import { trackCopy } from "./track-copy";

interface Props {
  locale: SupportedLocale;
  featured: DistributionView;
  others: DistributionView[];
  wallet: string;
  totalRupiahDisplay: string;
  mustahikCount: number;
}

const PAGE_SIZE = 4;

export function TrackBody({
  locale,
  featured,
  others,
  wallet,
  totalRupiahDisplay,
  mustahikCount,
}: Props) {
  const t = trackCopy[locale];
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showAll, setShowAll] = useState<boolean>(false);

  const filteredOthers = useMemo(() => {
    if (activeCategory === "all") return others;
    return others.filter((d) => d.category === activeCategory);
  }, [others, activeCategory]);

  const featuredVisible =
    activeCategory === "all" || featured.category === activeCategory;

  const visibleOthers = showAll
    ? filteredOthers
    : filteredOthers.slice(0, PAGE_SIZE);

  const visibleCategoryTotals = useMemo(() => {
    if (activeCategory === "all") return t.categoryTotals;
    return t.categoryTotals.filter((c) => c.key === activeCategory);
  }, [t.categoryTotals, activeCategory]);

  const headingCount =
    activeCategory === "all" ? others.length : filteredOthers.length;

  return (
    <>
      {/* Filter pills + sort + share */}
      <section className="flex flex-col items-stretch gap-3 px-5 pb-6 sm:px-8 md:flex-row md:flex-wrap md:items-center md:justify-between md:px-12 lg:px-20">
        <div className="flex flex-wrap items-center gap-1.5">
          {t.categories.map((c) => {
            const isActive = c.key === activeCategory;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => {
                  setActiveCategory(c.key);
                  setShowAll(false);
                }}
                aria-pressed={isActive}
                className={
                  isActive
                    ? "rounded-[20px] bg-[#14F195] px-3.5 py-1.5 text-[13px] font-medium leading-4 tracking-[-0.005em] text-[#181818] transition-opacity hover:opacity-90"
                    : "rounded-[20px] border border-[#FFFFFF12] bg-[#FFFFFF0A] px-3.5 py-1.5 text-[13px] leading-4 text-[#EFEFE48C] transition-colors hover:border-[#FFFFFF1F] hover:bg-[#FFFFFF14] hover:text-[#EFEFE4]"
                }
              >
                {c.label}
                {c.count > 0 ? ` · ${c.count}` : ""}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3.5">
          <span className="font-mono text-[11px] leading-[14px] text-[#EFEFE46B]">
            {t.breakdown.sortBy}
          </span>
          <span className="flex items-center gap-1.5 rounded-lg border border-[#FFFFFF12] bg-[#FFFFFF0A] px-3 py-1.25">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
              <path d="M2 3h9M3 6h7M5 9h3" stroke="#EFEFE4A6" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <span className="text-xs leading-4 text-[#EFEFE4A6]">{t.breakdown.filter}</span>
          </span>
          <ShareButton
            label={t.share.label}
            copiedLabel={t.share.copied}
            shareText={t.share.payload(totalRupiahDisplay, mustahikCount)}
          />
        </div>
      </section>

      <CategoryBreakdown heading={t.breakdownHeading} totals={visibleCategoryTotals} />

      {featuredVisible && (
        <DistributionCard distribution={featured} copy={t.distributionCardCopy} />
      )}

      <section className="flex flex-col gap-2.5 px-5 pb-12 sm:px-8 sm:pb-16 md:px-12 lg:px-20">
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <span className="font-mono text-[11px] leading-[14px] tracking-[0.05em] text-[#EFEFE46B]">
            {t.otherList.heading(headingCount)}
          </span>
          {filteredOthers.length > PAGE_SIZE && (
            <button
              type="button"
              onClick={() => setShowAll((s) => !s)}
              className="shrink-0 text-[13px] leading-4 text-[#14F195] transition-opacity hover:opacity-80"
            >
              {showAll ? t.otherList.collapse : t.otherList.viewAll}
            </button>
          )}
        </div>

        {visibleOthers.length === 0 && !featuredVisible ? (
          <p className="m-0 rounded-[14px] border border-[#FFFFFF0F] bg-[#1A1A1A] px-5 py-6 text-center text-[13px] text-[#EFEFE48C] sm:px-6 sm:py-8">
            {t.otherList.noResults}
          </p>
        ) : (
          visibleOthers.map((d) => <DistributionRow key={d.id} distribution={d} />)
        )}

        <div className="mt-4 flex flex-col items-start gap-2 border-t border-[#FFFFFF0F] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-mono text-[11px] leading-[14px] text-[#EFEFE46B]">
            {t.otherList.walletAttribution(shortenAddress(wallet, 6, 6))}
          </span>
          <span className="font-mono text-[10px] leading-3 tracking-[0.04em] text-[#EFEFE452]">
            {t.otherList.onChain}
          </span>
        </div>
      </section>
    </>
  );
}
