import Link from "next/link";
import { LAZ_JURISDICTION_LABELS, type SupportedLocale } from "@/lib/constants";
import { formatRupiah } from "@/lib/utils";
import type { Laz } from "@/lib/types";

interface LazCardCopy {
  /** Stat labels (already lowercased / uppercase as required by the design). */
  mustahik: string;
  donor: string;
  received: string;
  distributed: string;
  verifiedOnChain: string;
  detailCta: string;
}

interface LazCardProps {
  laz: Laz;
  locale: SupportedLocale;
  copy: LazCardCopy;
  /** Marks the card with a subtle "FEATURED" chip when true (highest received). */
  featured?: boolean;
}

function lazInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Format an IDRZ bigint as a compact Rp string suitable for tight card rows. */
function formatCompact(amount: bigint): string {
  if (amount >= 1_000_000_000n) {
    return `Rp ${(Number(amount / 1_000_000n) / 1000).toFixed(1)}M`;
  }
  if (amount >= 1_000_000n) {
    return `Rp ${(Number(amount / 1_000n) / 1000).toFixed(1)}Jt`;
  }
  return formatRupiah(amount);
}

export function LazCard({ laz, locale, copy, featured = false }: LazCardProps) {
  const jurisdiction =
    LAZ_JURISDICTION_LABELS[laz.jurisdictionLevel][locale].toLowerCase();
  const initials = lazInitials(laz.name);

  return (
    <Link
      href={`/laz/${laz.slug}`}
      className="lift group flex flex-col gap-3 rounded-xl border border-[#FFFFFF0F] bg-[#1A1A1A] p-4 transition-colors hover:border-[#14F1952E] sm:gap-3.5 sm:p-5"
      style={{
        backgroundImage: featured
          ? "linear-gradient(180deg, rgba(20,241,149,0.05) 0%, transparent 50%)"
          : undefined,
        boxShadow: featured ? "inset 0 1px 0 #14F1952E" : undefined,
      }}
    >
      {/* Top row: logo + verified/featured chip */}
      <div className="flex items-start justify-between">
        <div
          aria-hidden
          className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-[#FFFFFF12] bg-[#222222]"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(20,241,149,0.18) 0%, rgba(34,34,34,0) 70%)",
          }}
        >
          <span className="font-bold text-sm leading-[18px] tracking-[-0.01em] text-[#EFEFE4D9]">
            {initials}
          </span>
        </div>

        <span
          className="flex items-center gap-1.5 rounded-[14px] border border-[#14F1952E] bg-[#14F1951A] px-2 py-0.5 font-mono text-[10px] leading-3 font-medium text-[#14F195]"
          aria-label={copy.verifiedOnChain}
        >
          <span
            aria-hidden
            className="size-1 shrink-0 rounded-full bg-[#14F195]"
            style={{ boxShadow: "0 0 6px rgba(20,241,149,0.7)" }}
          />
          {featured ? "FEATURED" : copy.verifiedOnChain.toUpperCase()}
        </span>
      </div>

      {/* Name + region/jurisdiction */}
      <div>
        <div className="text-base font-semibold leading-5 tracking-[-0.015em] text-[#EFEFE4] lowercase">
          {laz.name.toLowerCase()}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs leading-4 text-[#EFEFE48C]">
          <span className="lowercase">{laz.region.toLowerCase()}</span>
          <span aria-hidden className="text-[#EFEFE452]">·</span>
          <span className="lowercase">{jurisdiction}</span>
        </div>
      </div>

      {/* Stats strip */}
      <div className="flex items-center gap-2 border-y border-[#FFFFFF0F] py-2.5 sm:gap-3.5">
        <Stat
          label={copy.received}
          value={formatCompact(laz.totalReceivedIdrz)}
        />
        <Stat
          label={copy.distributed}
          value={formatCompact(laz.totalDistributedIdrz)}
          emphasis
        />
        <Stat label={copy.mustahik} value={String(laz.mustahikCount)} />
        <Stat label={copy.donor} value={String(laz.donorCount)} />
      </div>

      {/* Footer: registration number + view link */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] leading-3 tracking-[0.04em] text-[#EFEFE46B]">
          {laz.registrationNumber}
        </span>
        <span className="font-medium text-xs leading-4 text-[#14F195] transition-transform group-hover:translate-x-0.5">
          {copy.detailCta} →
        </span>
      </div>
    </Link>
  );
}

function Stat({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="min-w-0 flex-1">
      <div
        className={
          emphasis
            ? "truncate text-[13px] font-medium leading-5 tracking-[-0.01em] text-[#14F195] sm:text-[15px]"
            : "truncate text-[13px] font-medium leading-5 tracking-[-0.01em] text-[#EFEFE4] sm:text-[15px]"
        }
      >
        {value}
      </div>
      <div className="mt-0.5 truncate font-mono text-[9px] leading-3 tracking-[0.05em] text-[#EFEFE46B]">
        {label}
      </div>
    </div>
  );
}
