/**
 * Hero product mockup — a "browser-chrome" frame showing /track dashboard
 * with the 3-attestation chain confirmed. Static, server-rendered.
 */
export function HeroProductImage() {
  return (
    <section className="flex flex-col items-center px-5 pt-8 pb-16 sm:px-8 sm:pt-10 sm:pb-20 md:px-12 md:pt-12 md:pb-24 lg:px-20 lg:pt-16 lg:pb-30">
      <div
        className="mx-auto flex w-full max-w-7xl flex-col overflow-clip rounded-[14px] border border-[#FFFFFF12] bg-[#1A1A1A]"
        style={{
          boxShadow:
            "0 0 0 1px #FFFFFF0A, 0 30px 80px #00000099, 0 12px 24px #00000066",
        }}
      >
        {/* Browser chrome */}
        <div className="flex h-9 shrink-0 items-center gap-2.5 border-b border-[#FFFFFF0F] bg-[#141414] px-3.5">
          <div className="flex items-center gap-1.75">
            <span className="size-2.75 shrink-0 rounded-full bg-[#FF5F57]" />
            <span className="size-2.75 shrink-0 rounded-full bg-[#FFBD2E]" />
            <span className="size-2.75 shrink-0 rounded-full bg-[#28C941]" />
          </div>
          <div className="ml-2 flex min-w-0 flex-1 items-center gap-1.5 sm:ml-3.5">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden className="shrink-0">
              <rect x="1" y="3" width="9" height="6" rx="1" stroke="#FFFFFF66" strokeWidth="0.8" />
              <rect x="3" y="1" width="5" height="2" rx="0.5" stroke="#FFFFFF66" strokeWidth="0.8" />
            </svg>
            <span className="truncate font-mono text-[11px] leading-[14px] text-[#EFEFE46B]">
              mizaan.id/track/7xKX...bW2
            </span>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-1.5 rounded-[14px] border border-[#14F1952E] bg-[#14F19514] px-1.5 py-0.75 sm:px-2.5">
            <span
              aria-hidden
              className="size-1.25 shrink-0 rounded-full bg-[#14F195]"
              style={{ boxShadow: "0 0 6px rgba(20,241,149,0.7)" }}
            />
            <span className="hidden font-mono text-[10px] leading-3 font-medium text-[#14F195] sm:inline">
              live · solana devnet
            </span>
          </div>
        </div>

        {/* Body — stacks vertically on mobile, side-by-side on md+ */}
        <div className="flex flex-col gap-6 bg-[#181818] px-5 pt-5 pb-6 sm:px-6 sm:pt-6 sm:pb-8 md:flex-row md:gap-8 md:px-9 md:pt-8 md:pb-10 lg:gap-10 lg:px-12 lg:pt-9 lg:pb-12">
          {/* Left: donor summary */}
          <div className="flex w-full shrink-0 flex-col gap-5 md:w-[320px] md:gap-6">
            <div>
              <div className="font-mono text-[11px] leading-[14px] tracking-[0.04em] text-[#EFEFE44D]">
                donor wallet
              </div>
              <div className="mt-1.5 font-mono text-sm leading-[18px] text-[#EFEFE4D9]">
                7xKX...bW2
              </div>
            </div>
            <div className="flex flex-col gap-4.5 border-t border-[#FFFFFF0F] pt-4.5">
              <div>
                <div className="text-[34px] font-medium leading-[100%] tracking-[-0.025em] text-[#EFEFE4]">
                  Rp 22,000,000
                </div>
                <div className="mt-1.5 text-[13px] leading-4 text-[#EFEFE46B]">
                  total zakat 2026
                </div>
              </div>
              <div className="flex gap-6 border-t border-[#FFFFFF0F] pt-4.5">
                <div>
                  <div className="text-[22px] font-medium leading-[100%] tracking-[-0.02em] text-[#14F195]">
                    27
                  </div>
                  <div className="mt-1 text-xs leading-4 text-[#EFEFE46B]">
                    mustahik
                  </div>
                </div>
                <div>
                  <div className="text-[22px] font-medium leading-[100%] tracking-[-0.02em] text-[#EFEFE4]">
                    100%
                  </div>
                  <div className="mt-1 text-xs leading-4 text-[#EFEFE46B]">
                    confirmed
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: latest distribution card */}
          <div className="flex grow basis-0 flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium leading-[18px] text-[#EFEFE4D9]">
                latest distribution
              </span>
              <span className="font-mono text-[11px] leading-[14px] text-[#EFEFE44D]">
                4 hours ago
              </span>
            </div>

            <div
              className="flex flex-col gap-4.5 rounded-xl border border-[#14F19533] bg-[#1A1A1A] px-5.5 py-5.5"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, rgba(20,241,149,0.06) 0%, transparent 50%)",
                boxShadow: "inset 0 1px 0 rgba(20,241,149,0.22)",
              }}
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-3.5">
                <div className="flex items-center gap-3.5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-[#FFFFFF12] bg-[#222222]">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M3 6h14M5 6v8a2 2 0 002 2h6a2 2 0 002-2V6M8 6V4a2 2 0 014 0v2"
                        stroke="#EFEFE4"
                        strokeWidth="1.2"
                      />
                    </svg>
                  </span>
                  <div>
                    <div className="text-base font-semibold leading-5 tracking-[-0.015em] text-[#EFEFE4]">
                      Pak Yusuf
                    </div>
                    <div className="mt-0.5 text-xs leading-4 text-[#EFEFE46B]">
                      biaya sekolah anak · Bantul, DIY
                    </div>
                  </div>
                </div>
                <span className="flex items-center gap-1.25 rounded-[14px] border border-[#14F19538] bg-[#14F1951A] px-2.5 py-1 font-mono text-[11px] leading-[14px] font-medium text-[#14F195]">
                  ✓ verified
                </span>
              </div>

              {/* Amount */}
              <div className="flex items-baseline gap-3.5 border-y border-[#FFFFFF0D] py-3.5">
                <span className="text-[32px] font-medium leading-[100%] tracking-[-0.025em] text-[#EFEFE4]">
                  Rp 800,000
                </span>
                <span className="font-mono text-[11px] leading-[14px] text-[#EFEFE44D]">
                  800,000 IDRZ
                </span>
              </div>

              {/* 3-attestation chain */}
              <ol className="flex flex-col gap-2.5">
                {[
                  {
                    n: "1",
                    label: "DONATION COMMITMENT",
                    detail: "donor signed · 22 Apr, 14:32",
                    sig: "3xK7...f9Bm",
                  },
                  {
                    n: "2",
                    label: "DISTRIBUTION DECISION",
                    detail: "Dompet Dhuafa Yogya · 23 Apr, 09:11",
                    sig: "8mR2...c1Kp",
                  },
                  {
                    n: "3",
                    label: "RECEIPT CONFIRMATION",
                    detail: "Pak Yusuf confirmed · 23 Apr, 13:08",
                    sig: "9dL4...h7m",
                  },
                ].map((step, i) => (
                  <li key={step.n} className="flex flex-col">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-[#14F195]"
                        style={{ boxShadow: "0 0 8px rgba(20,241,149,0.4)" }}
                      >
                        <span className="font-mono text-[9px] leading-3 font-semibold text-[#181818]">
                          {step.n}
                        </span>
                      </span>
                      <div className="flex grow basis-0 items-center justify-between">
                        <div>
                          <div className="font-mono text-[10px] leading-3 tracking-[0.04em] text-[#EFEFE44D]">
                            {step.label}
                          </div>
                          <div className="mt-0.5 text-[13px] leading-4 text-[#EFEFE4D9]">
                            {step.detail}
                          </div>
                        </div>
                        <span className="font-mono text-[10px] leading-3 text-[#14F1958C]">
                          {step.sig} ↗
                        </span>
                      </div>
                    </div>
                    {i < 2 && (
                      <span
                        aria-hidden
                        className="ml-2.25 h-3.5 w-px shrink-0 bg-[#14F1954D]"
                      />
                    )}
                  </li>
                ))}
              </ol>

              {/* Mustahik message */}
              <div className="rounded-[9px] border border-[#FFFFFF0D] bg-[#FFFFFF06] px-4 py-3.5">
                <div className="mb-1.5 font-mono text-[10px] leading-3 tracking-[0.04em] text-[#EFEFE44D]">
                  — pesan dari mustahik
                </div>
                <p className="m-0 italic text-[13px] leading-[150%] text-[#EFEFE4BF]">
                  &ldquo;terima kasih atas zakatnya, sangat membantu Sarah
                  belajar di sekolah.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
