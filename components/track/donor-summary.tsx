import { formatRupiah, shortenAddress } from "@/lib/utils";

interface DonorSummaryCopy {
  hero: { tag: string; heading: string; sub: string };
  stats: {
    total: { label: string; meta: string; via: string };
    mustahik: { label: string; sub: string };
    confirmed: { label: string; sub: string };
    avgTime: { label: string; unit: string; sub: string };
  };
}

interface DonorSummaryProps {
  walletAddress: string;
  totalIdrz: bigint;
  mustahikCount: number;
  confirmedCount: number;
  avgConfirmHours: number;
  copy: DonorSummaryCopy;
}

export function DonorSummary({
  totalIdrz,
  mustahikCount,
  confirmedCount,
  avgConfirmHours,
  copy,
}: DonorSummaryProps) {
  const confirmRate = mustahikCount === 0 ? 0 : Math.round((confirmedCount / mustahikCount) * 100);

  return (
    <>
      {/* Hero copy */}
      <section className="flex flex-col gap-2 px-5 pt-10 pb-6 sm:px-8 sm:pt-12 sm:pb-8 md:px-12 lg:px-20">
        <span className="font-mono text-[11px] leading-[14px] tracking-[0.04em] text-[#EFEFE46B]">
          {copy.hero.tag}
        </span>
        <h1 className="m-0 text-[28px] font-medium leading-[105%] tracking-[-0.025em] text-[#EFEFE4] sm:text-[34px] md:text-[42px]">
          {copy.hero.heading}
        </h1>
        <p className="m-0 mt-1 text-[14px] leading-[155%] text-[#EFEFE48C] sm:text-[15px]">
          {copy.hero.sub}
        </p>
      </section>

      {/* Stat grid */}
      <section className="grid grid-cols-2 gap-3 px-5 pb-6 sm:gap-3.5 sm:px-8 sm:pb-8 md:px-12 lg:grid-cols-4 lg:px-20">
        {/* Featured: total zakat */}
        <div
          className="col-span-2 flex flex-col gap-3 rounded-[14px] border border-[#14F1952E] bg-[#1A1A1A] p-5 sm:gap-3.5 sm:p-7 lg:col-span-1"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(20,241,149,0.06) 0%, transparent 50%)",
            boxShadow: "inset 0 1px 0 #14F19533",
          }}
        >
          <span className="font-mono text-[11px] leading-[14px] tracking-[0.05em] text-[#EFEFE46B]">
            {copy.stats.total.label}
          </span>
          <div className="flex flex-wrap items-baseline gap-2 sm:gap-3.5">
            <span className="text-[32px] font-medium leading-[100%] tracking-[-0.03em] text-[#EFEFE4] sm:text-[40px] md:text-[48px]">
              {formatRupiah(totalIdrz)}
            </span>
            <span className="font-mono text-[11px] leading-[14px] text-[#EFEFE46B]">
              {copy.stats.total.meta}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3.5">
            <div className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="size-1.25 shrink-0 rounded-full bg-[#14F195]"
                style={{ boxShadow: "0 0 6px rgba(20,241,149,0.7)" }}
              />
              <span className="font-mono text-[10px] leading-3 text-[#14F195]">
                2.5% × Rp 880M
              </span>
            </div>
            <span className="font-mono text-[10px] leading-3 text-[#EFEFE452]">
              {copy.stats.total.via}
            </span>
          </div>
        </div>

        {/* Mustahik served */}
        <div className="flex flex-col gap-3 rounded-[14px] border border-[#FFFFFF12] bg-[#1A1A1A] p-5 sm:gap-3.5 sm:p-7">
          <span className="font-mono text-[11px] leading-[14px] tracking-[0.05em] text-[#EFEFE46B]">
            {copy.stats.mustahik.label}
          </span>
          <span className="text-[32px] font-medium leading-[100%] tracking-[-0.03em] text-[#EFEFE4] sm:text-[40px] md:text-[48px]">
            {mustahikCount}
          </span>
          <span className="font-mono text-[10px] leading-3 text-[#EFEFE46B]">
            {copy.stats.mustahik.sub}
          </span>
        </div>

        {/* Confirmation rate */}
        <div className="flex flex-col gap-3 rounded-[14px] border border-[#FFFFFF12] bg-[#1A1A1A] p-5 sm:gap-3.5 sm:p-7">
          <span className="font-mono text-[11px] leading-[14px] tracking-[0.05em] text-[#EFEFE46B]">
            {copy.stats.confirmed.label}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[32px] font-medium leading-[100%] tracking-[-0.03em] text-[#14F195] sm:text-[40px] md:text-[48px]">
              {confirmRate}
            </span>
            <span className="text-xl font-medium leading-[24px] text-[#14F195] sm:text-2xl sm:leading-[30px]">%</span>
          </div>
          <span className="font-mono text-[10px] leading-3 text-[#EFEFE46B]">
            {confirmedCount} / {mustahikCount} {copy.stats.confirmed.sub}
          </span>
        </div>

        {/* Avg time to confirm */}
        <div className="col-span-2 flex flex-col gap-3 rounded-[14px] border border-[#FFFFFF12] bg-[#1A1A1A] p-5 sm:gap-3.5 sm:p-7 lg:col-span-1">
          <span className="font-mono text-[11px] leading-[14px] tracking-[0.05em] text-[#EFEFE46B]">
            {copy.stats.avgTime.label}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[32px] font-medium leading-[100%] tracking-[-0.03em] text-[#EFEFE4] sm:text-[40px] md:text-[48px]">
              {avgConfirmHours.toFixed(1)}
            </span>
            <span className="text-base font-medium leading-[20px] text-[#EFEFE48C] sm:text-lg sm:leading-[22px]">
              {copy.stats.avgTime.unit}
            </span>
          </div>
          <span className="font-mono text-[10px] leading-3 text-[#EFEFE46B]">
            {copy.stats.avgTime.sub}
          </span>
        </div>
      </section>
    </>
  );
}

export function DonorWalletPill({ walletAddress }: { walletAddress: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-lg border border-[#14F1952E] bg-[#14F19514] px-3 py-1.25">
      <span
        aria-hidden
        className="size-1.25 shrink-0 rounded-full bg-[#14F195]"
        style={{ boxShadow: "0 0 6px rgba(20,241,149,0.7)" }}
      />
      <span className="font-mono text-[11px] leading-[14px] font-medium text-[#14F195]">
        phantom · {shortenAddress(walletAddress, 4, 3)}
      </span>
    </span>
  );
}
