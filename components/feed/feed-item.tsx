"use client";

import { useState } from "react";
import type { FeedEventType, Category } from "@/lib/types";
import type { SupportedLocale } from "@/lib/constants";
import { CATEGORY_LABELS } from "@/lib/constants";
import { cn, formatRupiah, shortenAddress, timeAgo } from "@/lib/utils";

/**
 * Plain-data shape passed down to client components. `amountIdrz` is the
 * stringified bigint to avoid serialization issues across the boundary.
 */
export interface FeedItemView {
  id: string;
  eventType: FeedEventType;
  amountIdrz: string | null;
  category: Category | null;
  region: string | null;
  mustahikInitials: string | null;
  lazSlug: string | null;
  lazName: string | null;
  purposeShort: string | null;
  occurredAt: string;
  attestationPda: string;
  /** When true, render the "just confirmed" hot variant. */
  fresh?: boolean;
}

interface FeedItemProps {
  item: FeedItemView;
  locale: SupportedLocale;
  /** Tick timestamp from parent — re-renders timeAgo when the parent ticks. */
  nowTick: number;
}

const EVENT_COPY: Record<
  FeedEventType,
  { id: string; en: string; tone: "live" | "warning" | "neutral" }
> = {
  RECEIPT_CONFIRMED: {
    id: "✓ dikonfirmasi",
    en: "✓ confirmed",
    tone: "live",
  },
  DISTRIBUTION_CREATED: {
    id: "→ didistribusikan",
    en: "→ distributed",
    tone: "warning",
  },
  DONATION_CREATED: {
    id: "+ donasi masuk",
    en: "+ donated",
    tone: "live",
  },
  LAZ_REGISTERED: {
    id: "laz baru",
    en: "laz registered",
    tone: "neutral",
  },
  MUSTAHIK_REGISTERED: {
    id: "mustahik baru",
    en: "mustahik registered",
    tone: "neutral",
  },
};

const COPY = {
  via: { id: "via", en: "via" },
  attestation: { id: "ATTESTATION PDA", en: "ATTESTATION PDA" },
  copy: { id: "klik untuk salin", en: "click to copy" },
  copied: { id: "tersalin", en: "copied" },
  view: { id: "lihat di explorer", en: "view in explorer" },
} as const;

function eventGlyph(type: FeedEventType, fresh: boolean): React.ReactNode {
  const stroke = fresh ? "#14F195" : "#14F195";
  const dimStroke = "#EFEFE4A6";
  switch (type) {
    case "RECEIPT_CONFIRMED":
      return (
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden
          style={{ flexShrink: 0 }}
        >
          <path
            d="M3 7l3 3 5-6"
            stroke={stroke}
            strokeWidth={fresh ? 1.6 : 1.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "DISTRIBUTION_CREATED":
      return (
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden
          style={{ flexShrink: 0 }}
        >
          <path
            d="M2 7h10M8 3l4 4-4 4"
            stroke={dimStroke}
            strokeWidth={1.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "DONATION_CREATED":
      return (
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden
          style={{ flexShrink: 0 }}
        >
          <path
            d="M7 3v8M3 7h8"
            stroke={stroke}
            strokeWidth={1.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return (
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden
          style={{ flexShrink: 0 }}
        >
          <circle cx="7" cy="7" r="3" stroke={dimStroke} strokeWidth={1.4} />
        </svg>
      );
  }
}

function statusChip(
  type: FeedEventType,
  fresh: boolean,
  locale: SupportedLocale,
): React.ReactNode {
  const meta = EVENT_COPY[type];
  const label = meta[locale];

  if (fresh && type === "RECEIPT_CONFIRMED") {
    return (
      <span className="inline-block rounded-[10px] border border-solid border-[#14F19538] bg-[#14F1951A] px-2 py-0.5 font-mono text-[10px] font-medium leading-3 uppercase text-[#14F195] tracking-wider">
        {locale === "id" ? "✓ baru saja" : "✓ just now"}
      </span>
    );
  }

  if (type === "DISTRIBUTION_CREATED") {
    return (
      <span className="inline-block rounded-[10px] bg-[#FFC1070F] px-2 py-0.5 font-mono text-[10px] leading-3 text-[#FFC107D9]">
        {label.replace(/^→\s*/, "")}
      </span>
    );
  }

  return (
    <span className="inline-block rounded-[10px] bg-[#14F1950F] px-2 py-0.5 font-mono text-[10px] leading-3 text-[#14F195A6]">
      {label.replace(/^[✓+→]\s*/, "")}
    </span>
  );
}

function describe(item: FeedItemView, locale: SupportedLocale): string {
  const parts: string[] = [];
  if (item.mustahikInitials && item.region) {
    parts.push(`${item.mustahikInitials} (${item.region})`);
  } else if (item.region) {
    parts.push(item.region);
  } else if (item.eventType === "DONATION_CREATED") {
    parts.push(locale === "id" ? "muzakki anonim" : "anonymous muzakki");
  }

  if (item.purposeShort) {
    parts.push(item.purposeShort);
  } else if (item.category) {
    parts.push(CATEGORY_LABELS[item.category][locale].toLowerCase());
  }

  if (item.lazName) {
    parts.push(`${COPY.via[locale]} ${item.lazName}`);
  } else if (item.lazSlug) {
    parts.push(`${COPY.via[locale]} ${item.lazSlug}`);
  }

  return parts.join(" · ");
}

/**
 * One row in the live feed. Hover reveals the attestation PDA panel.
 * Items flagged `fresh` get the highlighted "just confirmed" treatment
 * and a fade/slide-in transition driven by the data-fresh attribute.
 */
export function FeedItem({ item, locale, nowTick }: FeedItemProps) {
  void nowTick; // re-render trigger for timeAgo, no read needed
  const [copied, setCopied] = useState(false);
  const fresh = item.fresh === true;
  const meta = EVENT_COPY[item.eventType];
  const time = timeAgo(item.occurredAt, locale);

  const amountLabel = item.amountIdrz
    ? formatRupiah(BigInt(item.amountIdrz))
    : null;

  function handleCopy() {
    if (!navigator?.clipboard) return;
    void navigator.clipboard.writeText(item.attestationPda).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  }

  return (
    <div
      data-fresh={fresh ? "true" : "false"}
      className={cn(
        "group/feed feed-item-enter relative flex flex-col gap-3 rounded-[11px] border border-solid px-3 py-3 transition-colors duration-200 sm:px-4.5 sm:py-3.5",
        fresh
          ? "border-[#14F1952E] bg-[#14F1950A]"
          : "border-[#FFFFFF0F] bg-[#1A1A1A] hover:border-[#FFFFFF1F]",
      )}
      style={
        fresh
          ? { boxShadow: "#14F19529 0px 1px 0px inset" }
          : undefined
      }
    >
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Glyph circle */}
        <div
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full border border-solid sm:size-8",
            fresh
              ? "border-[#14F1954D] bg-[#14F1951F]"
              : "border-[#FFFFFF14] bg-[#FFFFFF0A]",
          )}
          style={
            fresh
              ? { boxShadow: "#14F19540 0px 0px 12px" }
              : undefined
          }
        >
          {eventGlyph(item.eventType, fresh)}
        </div>

        {/* Body */}
        <div className="flex grow shrink basis-0 flex-col gap-0.5 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {amountLabel ? (
              <span className="font-medium text-[13px] leading-[18px] text-[#EFEFE4] sm:text-sm">
                {amountLabel}
              </span>
            ) : (
              <span className="font-medium text-[13px] leading-[18px] text-[#EFEFE4] sm:text-sm">
                {meta[locale]}
              </span>
            )}
            {item.category ? (
              <span className="inline-block rounded-[10px] border border-solid border-[#FFFFFF12] bg-[#FFFFFF0A] px-1.5 py-0.5 font-mono text-[9px] leading-3 text-[#EFEFE48C] lowercase sm:px-2 sm:text-[10px]">
                {CATEGORY_LABELS[item.category][locale].toLowerCase()}
              </span>
            ) : null}
            {statusChip(item.eventType, fresh, locale)}
          </div>
          <p className="m-0 truncate text-[11px] leading-4 text-[#EFEFE48C] sm:text-xs">
            {describe(item, locale)}
          </p>
        </div>

        {/* Trailing meta */}
        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <span
            className={cn(
              "font-mono text-[10px] leading-[14px] font-medium sm:text-[11px]",
              fresh ? "text-[#14F195]" : "text-[#EFEFE48C]",
            )}
          >
            {time}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="font-mono text-[9px] leading-3 text-[#EFEFE46B] underline decoration-1 underline-offset-2 transition-colors hover:text-[#EFEFE4] sm:text-[10px]"
            aria-label={COPY.copy[locale]}
          >
            {shortenAddress(item.attestationPda, 6, 4)} ↗
          </button>
        </div>
      </div>

      {/* Hover-reveal: full attestation PDA */}
      <div
        className="grid grid-rows-[0fr] overflow-hidden transition-[grid-template-rows] duration-200 ease-out group-hover/feed:grid-rows-[1fr]"
        aria-hidden
      >
        <div className="min-h-0">
          <div className="flex items-center justify-between gap-2 rounded-md border border-solid border-[#FFFFFF12] bg-[#141414] px-2.5 py-2 sm:gap-3 sm:px-3">
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="font-mono text-[9px] leading-3 tracking-[0.08em] text-[#EFEFE452] uppercase">
                {COPY.attestation[locale]}
              </span>
              <span className="truncate font-mono text-[10px] leading-[14px] text-[#EFEFE4BF] sm:text-[11px]">
                {item.attestationPda}
              </span>
            </div>
            <span className="shrink-0 font-mono text-[9px] leading-3 text-[#14F195A6] sm:text-[10px]">
              {copied ? COPY.copied[locale] : COPY.copy[locale]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
