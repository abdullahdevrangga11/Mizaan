import { formatRupiah } from "@/lib/utils";

export interface CategoryTotal {
  key: string;
  label: string;
  amountIdrz: bigint;
  mustahikCount: number;
  /** 0..1 — share of total. Used for the bar fill. */
  share: number;
  accent: "primary" | "neutral";
}

interface CategoryBreakdownProps {
  heading: string;
  totals: CategoryTotal[];
}

export function CategoryBreakdown({ heading, totals }: CategoryBreakdownProps) {
  return (
    <section className="px-5 pb-6 sm:px-8 sm:pb-8 md:px-12 lg:px-20">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[11px] leading-[14px] tracking-[0.05em] text-[#EFEFE46B]">
          {heading}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5 lg:grid-cols-4">
        {totals.map((t) => {
          const pct = Math.round(t.share * 100);
          const isAccent = t.accent === "primary";
          return (
            <div
              key={t.key}
              className="flex flex-col gap-3 rounded-[14px] border border-[#FFFFFF12] bg-[#1A1A1A] p-4 sm:p-5"
            >
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium leading-[18px] text-[#EFEFE4]">
                  {t.label}
                </span>
                <span className="font-mono text-[10px] leading-3 text-[#EFEFE46B]">
                  {pct}%
                </span>
              </div>
              <div className="text-[22px] font-medium leading-[100%] tracking-[-0.02em] text-[#EFEFE4]">
                {formatRupiah(t.amountIdrz)}
              </div>
              <div
                className="relative h-1 w-full overflow-hidden rounded-full bg-[#FFFFFF0F]"
                aria-hidden
              >
                <span
                  className={
                    isAccent
                      ? "absolute inset-y-0 left-0 rounded-full bg-[#14F195]"
                      : "absolute inset-y-0 left-0 rounded-full bg-[#EFEFE452]"
                  }
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="font-mono text-[10px] leading-3 text-[#EFEFE46B]">
                {t.mustahikCount} mustahik
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
