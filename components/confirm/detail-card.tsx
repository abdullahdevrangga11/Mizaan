"use client";

import { formatRupiah } from "@/lib/utils";

interface DetailRow {
  label: string;
  value: React.ReactNode;
  /** Render value in mono (codes, addresses). */
  mono?: boolean;
  /** Tint value with the green accent (verification codes). */
  accent?: boolean;
}

interface DetailCardProps {
  amountLabel: string;
  amount: bigint;
  rows: DetailRow[];
}

/**
 * Receipt detail card for /confirm/[token].
 *
 * Mirrors the OAB-0 artboard: green-tinted gradient, inset highlight stroke,
 * 38px amount, then a label/value pair list separated by a hairline.
 */
export function DetailCard({ amountLabel, amount, rows }: DetailCardProps) {
  return (
    <div
      className="flex flex-col gap-4 rounded-[14px] border border-[#14F19533] bg-[#1A1A1A] px-5.5 py-5.5"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(20,241,149,0.06) 0%, transparent 50%)",
        boxShadow: "inset 0 1px 0 rgba(20,241,149,0.22)",
      }}
    >
      <div className="flex flex-col items-start gap-1.5">
        <span className="font-mono text-[11px] uppercase leading-[14px] tracking-[0.05em] text-[#EFEFE46B]">
          {amountLabel}
        </span>
        <span className="font-['Plus_Jakarta_Sans',system-ui,sans-serif] text-[38px] font-medium leading-[1] tracking-[-0.02em] text-text">
          {formatRupiah(amount)}
        </span>
      </div>

      <div aria-hidden className="h-px shrink-0 bg-[#FFFFFF0F]" />

      <dl className="flex flex-col gap-3.5">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-1">
            <dt className="font-mono text-[10px] uppercase leading-3 tracking-[0.05em] text-[#EFEFE452]">
              {row.label}
            </dt>
            <dd
              className={
                row.accent
                  ? "font-mono text-[13px] leading-4 text-[#14F195]"
                  : row.mono
                    ? "font-mono text-[13px] leading-[18px] text-[#EFEFE4D9]"
                    : "text-sm leading-[18px] text-text"
              }
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
