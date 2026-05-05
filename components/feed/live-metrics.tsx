import type { SupportedLocale } from "@/lib/constants";
import { formatRupiah } from "@/lib/utils";

interface LiveMetricsProps {
  locale: SupportedLocale;
  /** Today's distributed (in rupiah, bigint). */
  distributedTodayIdrz: bigint;
  /** Total mustahik reached today. */
  mustahikReachedToday: number;
  /** Average time-to-confirm in seconds. */
  avgTimeToConfirmSeconds: number;
  /** All-time distributed amount (string-formatted, e.g. "Rp 4.7B"). */
  allTimeDistributedLabel: string;
  /** All-time distribution count. */
  allTimeDistributionCount: number;
}

const COPY = {
  today: { id: "HARI INI", en: "TODAY" },
  todayCaption: { id: "distribusi terdistribusi", en: "distributed" },
  reach: { id: "MUSTAHIK", en: "MUSTAHIK" },
  reachCaption: {
    id: "tercapai hari ini",
    en: "reached today",
  },
  ttc: { id: "AVG TIME-TO-CONFIRM", en: "AVG TIME-TO-CONFIRM" },
  ttcCaption: { id: "lintas semua LAZ", en: "across all LAZ" },
  allTime: { id: "ALL-TIME", en: "ALL-TIME" },
} as const;

function formatDuration(seconds: number, locale: SupportedLocale): string {
  if (seconds < 60) {
    return locale === "id" ? `${seconds}d` : `${seconds}s`;
  }
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return locale === "id" ? `${minutes}m` : `${minutes}m`;
  }
  const hours = Math.round(minutes / 60);
  return locale === "id" ? `${hours}j` : `${hours}h`;
}

function compactRupiah(amount: bigint): string {
  const num = Number(amount);
  if (num >= 1_000_000_000) {
    return `Rp ${(num / 1_000_000_000).toFixed(num >= 10_000_000_000 ? 0 : 1)}B`;
  }
  if (num >= 1_000_000) {
    return `Rp ${(num / 1_000_000).toFixed(num >= 10_000_000 ? 0 : 1)}M`;
  }
  if (num >= 1_000) {
    return `Rp ${(num / 1_000).toFixed(0)}K`;
  }
  return formatRupiah(amount);
}

/**
 * Top metrics row for /feed. Three glanceable counters:
 * today's distributed amount, mustahik reached, avg time-to-confirm.
 * The middle card is the "hero" stat with green accent borders.
 */
export function LiveMetrics({
  locale,
  distributedTodayIdrz,
  mustahikReachedToday,
  avgTimeToConfirmSeconds,
  allTimeDistributedLabel,
  allTimeDistributionCount,
}: LiveMetricsProps) {
  const todayCompact = compactRupiah(distributedTodayIdrz);
  const ttc = formatDuration(avgTimeToConfirmSeconds, locale);

  return (
    <div className="grid w-full shrink-0 grid-cols-3 gap-2 sm:gap-3.5 md:w-auto md:flex">
      <div className="flex min-w-0 flex-col gap-1 rounded-[11px] border border-solid border-[#FFFFFF12] bg-[#1A1A1A] px-3 py-3 sm:gap-1.5 sm:px-5.5 sm:py-4.5 md:min-w-[140px]">
        <span className="font-mono text-[9px] leading-3 tracking-[0.05em] text-[#EFEFE46B] sm:text-[10px]">
          {COPY.today[locale]}
        </span>
        <span className="font-medium text-lg leading-[24px] tracking-[-0.02em] text-[#EFEFE4] sm:text-2xl sm:leading-[30px]">
          {todayCompact}
        </span>
        <span className="truncate font-mono text-[9px] leading-3 text-[#EFEFE46B] sm:text-[10px]">
          {COPY.todayCaption[locale]}
        </span>
      </div>

      <div
        className="flex min-w-0 flex-col gap-1 rounded-[11px] border border-solid border-[#14F1952E] bg-[#1A1A1A] px-3 py-3 sm:gap-1.5 sm:px-5.5 sm:py-4.5 md:min-w-[140px]"
        style={{
          backgroundImage:
            "linear-gradient(in oklab 180deg, oklab(84.4% -0.183 0.078 / 5%) 0%, oklab(0% -.0001 0 / 0%) 50%)",
          boxShadow: "#14F1952E 0px 1px 0px inset",
        }}
      >
        <span className="font-mono text-[9px] leading-3 tracking-[0.05em] text-[#14F195A6] sm:text-[10px]">
          {COPY.reach[locale]}
        </span>
        <span className="font-medium text-lg leading-[24px] tracking-[-0.02em] text-[#14F195] sm:text-2xl sm:leading-[30px]">
          {mustahikReachedToday.toLocaleString(
            locale === "id" ? "id-ID" : "en-US",
          )}
        </span>
        <span className="truncate font-mono text-[9px] leading-3 text-[#EFEFE46B] sm:text-[10px]">
          {COPY.reachCaption[locale]}
        </span>
      </div>

      <div className="flex min-w-0 flex-col gap-1 rounded-[11px] border border-solid border-[#FFFFFF12] bg-[#1A1A1A] px-3 py-3 sm:gap-1.5 sm:px-5.5 sm:py-4.5 md:min-w-[166px]">
        <span className="truncate font-mono text-[9px] leading-3 tracking-[0.05em] text-[#EFEFE46B] sm:text-[10px]">
          {COPY.ttc[locale]}
        </span>
        <span className="font-medium text-lg leading-[24px] tracking-[-0.02em] text-[#EFEFE4] sm:text-2xl sm:leading-[30px]">
          {ttc}
        </span>
        <span className="truncate font-mono text-[9px] leading-3 text-[#EFEFE46B] sm:text-[10px]">
          {COPY.allTime[locale]} · {allTimeDistributionCount.toLocaleString()} ·{" "}
          {allTimeDistributedLabel}
        </span>
      </div>
    </div>
  );
}
