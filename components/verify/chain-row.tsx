import { formatRupiah, shortenAddress } from "@/lib/utils";
import type { Category } from "@/lib/types";

export interface ChainStep {
  /** "1" | "2" | "3" — fits the existing 3-attestation chain pattern. */
  n: "1" | "2" | "3";
  schema: string;
  signatoryName: string;
  signatoryWallet: string;
  timestamp: string;
  blockHeight: string;
  pda: string;
}

export interface DistributionRow {
  id: string;
  recipientLabel: string;
  purpose: string;
  region: string;
  category: Category;
  amountIdrz: bigint;
  steps: [ChainStep, ChainStep, ChainStep];
}

export interface ChainRowCopy {
  index: (current: number, total: number) => string;
  verified: string;
  rupiahLabel: (value: string) => string;
  signed: string;
  explorer: string;
}

interface ChainRowProps {
  index: number;
  total: number;
  distribution: DistributionRow;
  copy: ChainRowCopy;
}

const CATEGORY_LABELS: Record<Category, string> = {
  PENDIDIKAN: "pendidikan",
  KESEHATAN: "kesehatan",
  MODAL_USAHA: "modal usaha",
  SANDANG_PANGAN: "sandang & pangan",
  BIAYA_HIDUP: "biaya hidup",
  BENCANA: "bencana",
  FAKIR_MISKIN: "fakir miskin",
  MUALLAF: "muallaf",
  RIQAB: "riqab",
  GHARIMIN: "gharimin",
  FISABILILLAH: "fisabilillah",
  IBNU_SABIL: "ibnu sabil",
};

export function ChainRow({ index, total, distribution, copy }: ChainRowProps) {
  const isLast = index === total - 1;

  return (
    <article
      className="flex flex-col"
      style={{
        backgroundColor: "#1A1A1A",
        borderLeft: "1px solid #FFFFFF12",
        borderRight: "1px solid #FFFFFF12",
        borderBottom: isLast ? "1px solid #14F19529" : "1px solid #FFFFFF0D",
        borderBottomLeftRadius: isLast ? 14 : 0,
        borderBottomRightRadius: isLast ? 14 : 0,
        backgroundImage: isLast
          ? "linear-gradient(180deg, rgba(20,241,149,0.04) 0%, transparent 35%)"
          : undefined,
        boxShadow: isLast ? "inset 0 1px 0 #14F1951F" : undefined,
      }}
    >
      {/* Top row: index, recipient, amount */}
      <div className="flex flex-col gap-3 px-5 pt-5 pb-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-7 sm:pt-6">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3.5">
          <span className="font-mono text-[11px] leading-[14px] tracking-[0.05em] text-[#EFEFE46B]">
            {copy.index(index + 1, total)}
          </span>
          <span className="rounded-[14px] border border-[#FFFFFF14] bg-[#FFFFFF08] px-2.5 py-[3px] font-mono text-[10px] leading-3 tracking-[0.04em] text-[#EFEFE48C] uppercase">
            {CATEGORY_LABELS[distribution.category]}
          </span>
          <span className="rounded-[14px] border border-[#14F19538] bg-[#14F1951A] px-2.5 py-[3px] font-mono text-[10px] leading-3 font-medium text-[#14F195]">
            {copy.signed}
          </span>
        </div>

        <div className="flex flex-wrap items-baseline gap-2 sm:gap-3.5">
          <span className="text-[20px] font-medium leading-[100%] tracking-[-0.02em] text-[#EFEFE4] sm:text-[24px]">
            {formatRupiah(distribution.amountIdrz)}
          </span>
          <span className="font-mono text-[10px] leading-3 text-[#EFEFE452]">
            {copy.rupiahLabel(distribution.amountIdrz.toString())}
          </span>
        </div>
      </div>

      {/* Recipient row */}
      <div className="flex flex-wrap items-center gap-3 px-5 pb-5 sm:px-7">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] border border-[#FFFFFF12] bg-[#222222]">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path
              d="M3 6h14M5 6v8a2 2 0 002 2h6a2 2 0 002-2V6M8 6V4a2 2 0 014 0v2"
              stroke="#EFEFE4BF"
              strokeWidth="1.2"
            />
          </svg>
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="text-[14px] font-medium leading-[18px] tracking-[-0.01em] text-[#EFEFE4] sm:text-[15px]">
            {distribution.recipientLabel}
          </span>
          <span className="text-[12px] leading-4 text-[#EFEFE48C]">
            {distribution.purpose} · {distribution.region}
          </span>
        </div>
        <span className="ml-auto flex items-center gap-1.5 rounded-[14px] border border-[#14F19538] bg-[#14F1951A] px-2.5 py-1 font-mono text-[11px] leading-[14px] font-medium text-[#14F195]">
          <svg width="11" height="11" viewBox="0 0 13 13" fill="none">
            <path
              d="M3 6.5l2.5 2.5 4.5-5"
              stroke="#14F195"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {copy.verified}
        </span>
      </div>

      {/* Chain table — horizontal scroll on mobile to preserve fixed-width signatory/timestamp columns */}
      <div className="overflow-x-auto border-t border-[#FFFFFF0D]">
        <div className="flex min-w-[640px] flex-col md:min-w-0">
          {distribution.steps.map((step, i) => {
            const last = i === distribution.steps.length - 1;
            return (
              <div
                key={step.n}
                className="flex items-center gap-[14px] px-5 py-[14px] sm:gap-[18px] sm:px-7 sm:py-[18px]"
                style={{
                  backgroundColor: last ? "#14F19508" : "transparent",
                  borderBottom: last ? "none" : "1px solid #FFFFFF0A",
                }}
              >
                {/* Stage / schema */}
                <div className="flex w-[160px] shrink-0 items-center gap-2.5 sm:w-[180px]">
                  <span
                    className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full"
                    style={
                      last
                        ? {
                            backgroundColor: "#14F195",
                            boxShadow: "0 0 8px #14F19566",
                          }
                        : {
                            backgroundColor: "#14F1951A",
                            border: "1px solid #14F1954D",
                          }
                    }
                  >
                    <span
                      className="font-mono text-[10px] leading-3 font-semibold"
                      style={{ color: last ? "#0F1A14" : "#14F195" }}
                    >
                      {step.n}
                    </span>
                  </span>
                  <div>
                    <div className="text-[13px] font-medium leading-4 text-[#EFEFE4]">
                      {STAGE_LABELS[step.n]}
                    </div>
                    <div className="font-mono text-[10px] leading-3 text-[#EFEFE466]">
                      {step.schema}
                    </div>
                  </div>
                </div>

                {/* Signatory */}
                <div className="hidden w-[180px] shrink-0 sm:block md:w-[200px]">
                  <div className="text-[13px] leading-4 text-[#EFEFE4]">
                    {step.signatoryName}
                  </div>
                  <div className="font-mono text-[10px] leading-3 text-[#EFEFE466]">
                    {shortenAddress(step.signatoryWallet, 4, 3)}
                  </div>
                </div>

                {/* Timestamp */}
                <div className="hidden w-[160px] shrink-0 sm:block md:w-[180px]">
                  <div className="text-[13px] leading-4 text-[#EFEFE4]">
                    {step.timestamp}
                  </div>
                  <div className="font-mono text-[10px] leading-3 text-[#EFEFE466]">
                    block {step.blockHeight}
                  </div>
                </div>

                {/* PDA */}
                <a
                  href="#"
                  className="min-w-0 grow basis-0 truncate font-mono text-[12px] leading-4 text-[#14F195] underline decoration-1 underline-offset-2 sm:text-[13px]"
                >
                  {shortenAddress(step.pda, 14, 6)}
                </a>

                {/* Action */}
                <a
                  href="#"
                  aria-label={copy.explorer}
                  className="flex w-[40px] shrink-0 justify-end font-mono text-[13px] leading-4 text-[#14F195] sm:w-[60px]"
                >
                  ↗
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}

const STAGE_LABELS: Record<"1" | "2" | "3", string> = {
  "1": "Donation",
  "2": "Distribution",
  "3": "Receipt",
};
