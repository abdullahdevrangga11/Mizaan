import { formatRupiah, shortenAddress } from "@/lib/utils";

export interface ResultCardCopy {
  verifiedTag: string;
  fetched: string;
  explorer: string;
  stats: {
    total: { label: string; meta: string };
    distribution: { label: string; meta: string };
    confirmation: { label: string; meta: string };
    attestations: { label: string; meta: string };
  };
}

interface ResultCardProps {
  walletAddress: string;
  totalIdrz: bigint;
  distributionCount: number;
  confirmedCount: number;
  attestationCount: number;
  copy: ResultCardCopy;
  explorerHref?: string;
}

export function ResultCard({
  walletAddress,
  totalIdrz,
  distributionCount,
  confirmedCount,
  attestationCount,
  copy,
  explorerHref,
}: ResultCardProps) {
  return (
    <div className="flex flex-col">
      {/* Header strip */}
      <div className="flex flex-col gap-3 rounded-t-[14px] border border-[#FFFFFF12] border-b-[#FFFFFF0D] bg-[#1A1A1A] px-5 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-7 sm:py-5">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3.5">
          <span className="flex items-center gap-1.5 rounded-[14px] border border-[#14F19538] bg-[#14F1951A] px-3 py-1.25 font-mono text-[11px] leading-[14px] font-medium text-[#14F195]">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path
                d="M3 6.5l2.5 2.5 4.5-5"
                stroke="#14F195"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {copy.verifiedTag}
          </span>
          <span className="break-all font-mono text-[12px] leading-4 text-[#EFEFE4D9] sm:text-[13px]">
            {shortenAddress(walletAddress, 8, 8)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3.5">
          <span className="font-mono text-[11px] leading-[14px] text-[#EFEFE46B]">
            {copy.fetched}
          </span>
          <a
            href={explorerHref ?? `https://solscan.io/account/${walletAddress}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[11px] leading-[14px] text-[#14F195] underline decoration-1 underline-offset-2 transition-opacity hover:opacity-80"
          >
            {copy.explorer}
          </a>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 overflow-clip border-x border-[#FFFFFF12] bg-[#1A1A1A] lg:grid-cols-4">
        <StatCell
          label={copy.stats.total.label}
          value={formatRupiah(totalIdrz)}
          meta={copy.stats.total.meta}
          divider
        />
        <StatCell
          label={copy.stats.distribution.label}
          value={`${distributionCount} mustahik`}
          meta={copy.stats.distribution.meta}
          divider
        />
        <StatCell
          label={copy.stats.confirmation.label}
          value={`${confirmedCount} / ${distributionCount} ✓`}
          meta={copy.stats.confirmation.meta}
          accent
          divider
        />
        <StatCell
          label={copy.stats.attestations.label}
          value={String(attestationCount)}
          meta={copy.stats.attestations.meta}
        />
      </div>
    </div>
  );
}

function StatCell({
  label,
  value,
  meta,
  accent,
  divider,
}: {
  label: string;
  value: string;
  meta: string;
  accent?: boolean;
  divider?: boolean;
}) {
  return (
    <div
      className={
        divider
          ? "flex flex-col gap-2 border-b border-r border-[#FFFFFF0D] px-5 py-5 sm:px-7 sm:py-6 lg:border-b-0"
          : "flex flex-col gap-2 border-b border-[#FFFFFF0D] px-5 py-5 sm:px-7 sm:py-6 lg:border-b-0"
      }
    >
      <span className="font-mono text-[10px] leading-3 tracking-[0.05em] text-[#EFEFE46B]">
        {label}
      </span>
      <span
        className={
          accent
            ? "text-[20px] font-medium leading-[100%] tracking-[-0.02em] text-[#14F195] sm:text-[24px] lg:text-[28px]"
            : "text-[20px] font-medium leading-[100%] tracking-[-0.02em] text-[#EFEFE4] sm:text-[24px] lg:text-[28px]"
        }
      >
        {value}
      </span>
      <span className="font-mono text-[10px] leading-3 text-[#EFEFE46B]">
        {meta}
      </span>
    </div>
  );
}
