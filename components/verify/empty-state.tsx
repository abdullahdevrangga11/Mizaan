interface EmptyStateCopy {
  eyebrow: string;
  title: string;
  description: string;
  hints: { wallet: string; pda: string; donation: string };
}

interface EmptyStateProps {
  copy: EmptyStateCopy;
}

export function EmptyState({ copy }: EmptyStateProps) {
  return (
    <section className="flex flex-col items-center px-5 pb-16 sm:px-8 sm:pb-20 md:px-12 md:pb-24 lg:px-20">
      <div
        className="flex w-full max-w-[920px] flex-col items-center gap-6 rounded-[18px] border border-dashed border-[#FFFFFF14] bg-[#161616] px-6 py-10 text-center sm:gap-8 sm:px-12 sm:py-16"
        style={{ backgroundImage: "radial-gradient(120% 80% at 50% 0%, #14F1950A 0%, transparent 60%)" }}
      >
        {/* Decorative chip cluster */}
        <div aria-hidden className="relative flex h-24 w-32 items-center justify-center">
          <div
            className="absolute left-0 top-2 flex h-14 w-14 -rotate-12 items-center justify-center rounded-[10px] border border-[#FFFFFF12] bg-[#1A1A1A]"
            style={{ boxShadow: "0 12px 24px #00000066" }}
          >
            <span className="font-mono text-[10px] leading-3 text-[#EFEFE466]">PDA</span>
          </div>
          <div
            className="absolute left-9 top-4 flex h-14 w-14 rotate-3 items-center justify-center rounded-[10px] border border-[#14F19533] bg-[#1A1A1A]"
            style={{
              boxShadow: "0 12px 24px #00000066, inset 0 1px 0 #14F1952E",
              backgroundImage:
                "linear-gradient(180deg, #14F19514 0%, transparent 70%)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M5 10l3 3 7-7"
                stroke="#14F195"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div
            className="absolute left-[72px] top-1 flex h-14 w-14 rotate-12 items-center justify-center rounded-[10px] border border-[#FFFFFF12] bg-[#1A1A1A]"
            style={{ boxShadow: "0 12px 24px #00000066" }}
          >
            <span className="font-mono text-[10px] leading-3 text-[#EFEFE466]">SIG</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-[11px] leading-[14px] tracking-[0.04em] text-[#14F1958C]">
            {copy.eyebrow}
          </span>
          <h2 className="m-0 max-w-[480px] text-[18px] font-medium leading-[130%] tracking-[-0.015em] text-[#EFEFE4] sm:text-[22px]">
            {copy.title}
          </h2>
          <p className="m-0 max-w-[420px] text-[13px] leading-[155%] text-[#EFEFE48C] sm:text-[14px]">
            {copy.description}
          </p>
        </div>

        {/* Hints lane */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <span className="rounded-[14px] border border-[#FFFFFF12] bg-[#FFFFFF0A] px-3 py-1 font-mono text-[11px] leading-[14px] text-[#EFEFE48C]">
            {copy.hints.wallet}
          </span>
          <span className="rounded-[14px] border border-[#FFFFFF12] bg-[#FFFFFF0A] px-3 py-1 font-mono text-[11px] leading-[14px] text-[#EFEFE48C]">
            {copy.hints.pda}
          </span>
          <span className="rounded-[14px] border border-[#FFFFFF12] bg-[#FFFFFF0A] px-3 py-1 font-mono text-[11px] leading-[14px] text-[#EFEFE48C]">
            {copy.hints.donation}
          </span>
        </div>
      </div>
    </section>
  );
}
