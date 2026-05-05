import { formatRupiah } from "@/lib/utils";

export interface LazStat {
  label: string;
  value: string;
  /** Render the value in the green accent color (used for distributed totals). */
  emphasis?: boolean;
  /** Render the value with monospace styling (used for numeric counts). */
  mono?: boolean;
}

interface LazStatsProps {
  items: LazStat[];
  /** "row" — large stat row used on hero + LAZ profile.
   *  "compact" — smaller card-internal row (used inside laz-card). */
  variant?: "row" | "compact";
}

/**
 * Reusable stats strip. Used in two places:
 *  1. /laz hero — three big numbers (verified · mustahik · regions)
 *  2. /laz/[lazId] header — four big numbers (received · distributed · mustahik · donors)
 */
export function LazStats({ items, variant = "row" }: LazStatsProps) {
  if (variant === "compact") {
    return (
      <div className="flex items-center gap-5 border-y border-[#FFFFFF0F] py-3">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col">
            <span
              className={
                item.emphasis
                  ? "text-[18px] font-medium leading-[100%] tracking-[-0.015em] text-[#14F195]"
                  : "text-[18px] font-medium leading-[100%] tracking-[-0.015em] text-[#EFEFE4]"
              }
            >
              {item.value}
            </span>
            <span className="mt-1 font-mono text-[10px] leading-3 tracking-[0.05em] text-[#EFEFE46B]">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 overflow-clip rounded-xl border border-[#FFFFFF12] bg-[#FFFFFF0A] sm:flex sm:flex-wrap">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        const isFirstColMobile = idx % 2 === 0;
        return (
          <div
            key={item.label}
            className={
              isLast
                ? "min-w-0 flex-1 px-4 py-3 sm:min-w-[140px] sm:px-6 sm:py-4"
                : `min-w-0 flex-1 ${isFirstColMobile ? "border-r border-[#FFFFFF0F]" : ""} border-b border-[#FFFFFF0F] px-4 py-3 sm:min-w-[140px] sm:border-r sm:border-b-0 sm:px-6 sm:py-4`
            }
          >
            <div
              className={
                item.emphasis
                  ? "text-[20px] font-medium leading-[100%] tracking-[-0.02em] text-[#14F195] sm:text-[22px] md:text-[24px]"
                  : item.mono
                    ? "font-mono text-[18px] font-medium leading-[100%] tracking-[-0.01em] text-[#EFEFE4] sm:text-[20px] md:text-[22px]"
                    : "text-[20px] font-medium leading-[100%] tracking-[-0.02em] text-[#EFEFE4] sm:text-[22px] md:text-[24px]"
              }
            >
              {item.value}
            </div>
            <div className="mt-1.5 font-mono text-[10px] leading-3 tracking-[0.06em] text-[#EFEFE46B]">
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Helper: format an IDRZ amount with a compact suffix (Jt / M) for hero stats. */
export function formatRupiahCompact(amount: bigint): string {
  if (amount >= 1_000_000_000n) {
    const millions = Number(amount / 1_000_000n) / 1000;
    return `Rp ${millions.toFixed(1)}M`;
  }
  if (amount >= 1_000_000n) {
    const thousands = Number(amount / 1_000n) / 1000;
    return `Rp ${thousands.toFixed(1)}Jt`;
  }
  return formatRupiah(amount);
}
