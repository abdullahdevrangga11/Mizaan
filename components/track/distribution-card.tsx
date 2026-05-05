import { formatRupiah, shortenAddress } from "@/lib/utils";
import type { Category } from "@/lib/types";

export interface DistributionView {
  id: string;
  mustahikDisplayName: string;
  purpose: string;
  region: string;
  category: Category;
  amountIdrz: bigint;
  confirmedAgo: string;
  donationCommitmentPda: string;
  donationSignedAt: string;
  distributionDecisionPda: string;
  distributionByName: string;
  distributionDecidedAt: string;
  receiptPda: string;
  receiptConfirmedBy: string;
  receiptConfirmedAt: string;
  thankYouMessage: string | null;
  iconKind: "school" | "medical" | "shop" | "basket";
  fresh?: boolean;
}

interface DistributionCardCopy {
  step1: string;
  step1Donor: string;
  step2: string;
  step3: string;
  fresh: string;
  pdaLabel: string;
  confirmed: (timeAgo: string) => string;
  encryptedMessage: string;
  signature: string;
}

const ICONS: Record<DistributionView["iconKind"], React.ReactNode> = {
  school: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M3 6h14M5 6v8a2 2 0 002 2h6a2 2 0 002-2V6M8 6V4a2 2 0 014 0v2"
        stroke="#EFEFE4"
        strokeWidth="1.2"
      />
    </svg>
  ),
  medical: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M10 4v12M4 10h12"
        stroke="#EFEFE4"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <rect x="3" y="3" width="14" height="14" rx="2" stroke="#EFEFE4" strokeWidth="1.2" />
    </svg>
  ),
  shop: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect x="3" y="6" width="14" height="10" rx="1.5" stroke="#EFEFE4" strokeWidth="1.2" />
      <path d="M3 9h14M7 6V4h6v2" stroke="#EFEFE4" strokeWidth="1.2" />
    </svg>
  ),
  basket: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M3 7h14l-1.5 9a2 2 0 01-2 1.7H6.5A2 2 0 014.5 16L3 7z"
        stroke="#EFEFE4"
        strokeWidth="1.2"
      />
      <path d="M7 7l3-3 3 3" stroke="#EFEFE4" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ),
};

function ChainStep({
  n,
  label,
  emphasis,
  primary,
  meta,
  pda,
  pdaLabel,
}: {
  n: 1 | 2 | 3;
  label: string;
  emphasis?: boolean;
  primary: string;
  meta: string;
  pda: string;
  pdaLabel: string;
}) {
  return (
    <div
      className={
        emphasis
          ? "flex grow basis-0 flex-col gap-3.5 rounded-[11px] border border-[#14F1952E] bg-[#14F1950A] px-4.5 py-4.5"
          : "flex grow basis-0 flex-col gap-3.5 rounded-[11px] border border-[#FFFFFF0D] bg-[#FFFFFF06] px-4.5 py-4.5"
      }
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="flex size-5.5 shrink-0 items-center justify-center rounded-full bg-[#14F195]"
            style={{
              boxShadow: emphasis
                ? "0 0 12px rgba(20,241,149,0.6)"
                : "0 0 8px rgba(20,241,149,0.4)",
            }}
          >
            <span className="font-mono text-[10px] leading-3 font-semibold text-[#181818]">
              {n}
            </span>
          </span>
          <span
            className={
              emphasis
                ? "font-mono text-[10px] leading-3 font-medium tracking-[0.05em] text-[#14F195]"
                : "font-mono text-[10px] leading-3 tracking-[0.05em] text-[#EFEFE452]"
            }
          >
            {label}
          </span>
        </div>
        <span
          className={
            emphasis
              ? "font-mono text-[10px] leading-3 font-medium text-[#14F195]"
              : "font-mono text-[10px] leading-3 text-[#14F195]"
          }
        >
          ✓
        </span>
      </div>

      <div>
        <div className="text-sm font-medium leading-[18px] text-[#EFEFE4]">{primary}</div>
        <div className="mt-0.5 font-mono text-[11px] leading-[14px] text-[#EFEFE46B]">
          {meta}
        </div>
      </div>

      <div
        className={
          emphasis
            ? "border-t border-[#14F1951A] pt-2.5"
            : "border-t border-[#FFFFFF0A] pt-2.5"
        }
      >
        <div className="font-mono text-[10px] leading-3 uppercase tracking-[0.05em] text-[#EFEFE46B]">
          {pdaLabel}
        </div>
        <div className="mt-0.5 font-mono text-[11px] leading-[14px] text-[#14F195] underline decoration-1 underline-offset-2">
          {shortenAddress(pda, 7, 6)} ↗
        </div>
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex shrink-0 items-center justify-center md:items-center">
      {/* Down arrow on mobile, right arrow on desktop */}
      <svg
        width="14"
        height="24"
        viewBox="0 0 14 24"
        fill="none"
        aria-hidden
        className="md:hidden"
      >
        <path
          d="M7 2v20M2 16l5 6 5-6"
          stroke="#14F19580"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        width="24"
        height="14"
        viewBox="0 0 24 14"
        fill="none"
        aria-hidden
        className="hidden md:block"
      >
        <path
          d="M2 7h20M16 2l6 5-6 5"
          stroke="#14F19580"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

interface DistributionCardProps {
  distribution: DistributionView;
  copy: DistributionCardCopy;
}

export function DistributionCard({ distribution, copy }: DistributionCardProps) {
  const d = distribution;

  return (
    <div className="px-5 pb-6 sm:px-8 sm:pb-8 md:px-12 lg:px-20">
      <article
        className="flex flex-col overflow-clip rounded-2xl border border-[#14F19529] bg-[#1A1A1A]"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(20,241,149,0.04) 0%, transparent 40%)",
          boxShadow: "inset 0 1px 0 #14F1952E, 0 8px 32px #00000066",
        }}
      >
        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-[#FFFFFF0F] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-5.5">
          <div className="flex items-center gap-3 sm:gap-3.5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-[11px] border border-[#FFFFFF12] bg-[#222222] sm:size-11">
              {ICONS[d.iconKind]}
            </span>
            <div className="min-w-0">
              <div className="truncate text-base font-semibold leading-[20px] tracking-[-0.015em] text-[#EFEFE4] sm:text-lg sm:leading-[22px]">
                {d.mustahikDisplayName}
              </div>
              <div className="mt-0.5 text-[12px] leading-4 text-[#EFEFE46B] sm:text-[13px]">
                {d.purpose} · {d.region}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3.5">
            <span className="text-[24px] font-medium leading-[100%] tracking-[-0.025em] text-[#EFEFE4] sm:text-[28px] md:text-[32px]">
              {formatRupiah(d.amountIdrz)}
            </span>
            <span className="rounded-[14px] border border-[#14F19538] bg-[#14F1951A] px-2.5 py-1 font-mono text-[10px] leading-[14px] font-medium text-[#14F195] sm:px-3 sm:py-1.25 sm:text-[11px]">
              {copy.confirmed(d.confirmedAgo)}
            </span>
          </div>
        </div>

        {/* Chain — 3 cards with arrows: stack vertical on mobile, horizontal at md+ */}
        <div className="flex flex-col gap-3 px-5 py-6 sm:px-7 sm:py-8 md:flex-row md:gap-4">
          <ChainStep
            n={1}
            label={copy.step1}
            primary={copy.step1Donor}
            meta={d.donationSignedAt}
            pda={d.donationCommitmentPda}
            pdaLabel={copy.pdaLabel}
          />
          <Arrow />
          <ChainStep
            n={2}
            label={copy.step2}
            primary={d.distributionByName}
            meta={d.distributionDecidedAt}
            pda={d.distributionDecisionPda}
            pdaLabel={copy.pdaLabel}
          />
          <Arrow />
          <ChainStep
            n={3}
            label={copy.step3}
            emphasis
            primary={d.receiptConfirmedBy}
            meta={d.receiptConfirmedAt}
            pda={d.receiptPda}
            pdaLabel={copy.pdaLabel}
          />
        </div>

        {/* Mustahik thank-you message */}
        {d.thankYouMessage && (
          <div className="flex flex-col gap-3 border-t border-[#FFFFFF0F] bg-[#14F19506] px-5 py-4 sm:flex-row sm:items-center sm:gap-4.5 sm:px-7 sm:py-5.5">
            <div className="flex grow basis-0 items-start gap-2.5">
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                aria-hidden
                className="mt-0.5 shrink-0"
              >
                <path
                  d="M3 6c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2H7l-3 3v-3H5c-1.1 0-2-.9-2-2V6z"
                  stroke="#14F195"
                  strokeWidth="1.4"
                />
              </svg>
              <div className="min-w-0">
                <div className="font-mono text-[10px] leading-3 tracking-[0.05em] text-[#EFEFE46B]">
                  {copy.encryptedMessage}
                </div>
                <p className="m-0 mt-1 text-[13px] italic leading-[155%] text-[#EFEFE4D9] sm:text-[14px]">
                  &ldquo;{d.thankYouMessage}&rdquo;
                </p>
              </div>
            </div>
            <span className="shrink-0 font-mono text-[10px] leading-3 text-[#EFEFE452]">
              — {d.mustahikDisplayName} · {d.region.split(",")[0]}
            </span>
          </div>
        )}
      </article>
    </div>
  );
}

interface DistributionRowProps {
  distribution: DistributionView;
}

/** Compact list row for the "26 other distributions" panel. */
export function DistributionRow({ distribution }: DistributionRowProps) {
  const d = distribution;
  const iconColor = ((): string => {
    switch (d.iconKind) {
      case "school":
        return "#FFB100";
      case "medical":
        return "#EF4444";
      case "shop":
        return "#3B82F6";
      case "basket":
        return "#14F195";
      default:
        return "#EFEFE48C";
    }
  })();

  return (
    <div className="flex flex-col gap-2 rounded-[11px] border border-[#FFFFFF0F] bg-[#1A1A1A] px-4 py-3 sm:flex-row sm:items-center sm:gap-3.5 sm:px-5 sm:py-3.5">
      <div className="flex grow basis-0 items-center gap-3 sm:gap-3.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-[9px] border border-[#FFFFFF12] bg-[#222222]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <circle cx="8" cy="8" r="6" stroke={iconColor} strokeWidth="1.4" />
            <path
              d="M5 8l2 2 4-4"
              stroke={iconColor}
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <div className="min-w-0 grow basis-0">
          <div className="truncate text-sm font-medium leading-[18px] text-[#EFEFE4]">
            {d.mustahikDisplayName} · {d.purpose}
          </div>
          <div className="mt-0.5 truncate font-mono text-[11px] leading-[14px] text-[#EFEFE46B]">
            {d.region}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-3.5">
        <span className="text-sm font-medium leading-[18px] text-[#EFEFE4]">
          {formatRupiah(d.amountIdrz)}
        </span>
        <span className="font-mono text-[11px] leading-[14px] text-[#EFEFE46B]">
          {d.confirmedAgo}
        </span>
        <span className="rounded-[14px] border border-[#14F1952E] bg-[#14F19514] px-2.25 py-0.75 font-mono text-[10px] leading-3 font-medium text-[#14F195]">
          ✓
        </span>
      </div>
    </div>
  );
}
