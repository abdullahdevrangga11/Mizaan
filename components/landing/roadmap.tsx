import type { SupportedLocale } from "@/lib/constants";
import { MizaanIcon } from "@/components/mizaan-icon";

const COPY = {
  id: {
    eyebrow: "// what's coming next",
    headline: "mizaan\nroadmap",
    sub: "lihat apa yang sedang kami bangun. ide besar, milestone realistis, transparansi yang sama dengan zakatnya.",
    milestones: [
      { v: "V1.0", label: "core MVP · zakat + sedekah + infaq", tag: "live" },
      { v: "V1.1", label: "real IDRX integration · mainnet", tag: "jun '26" },
      { v: "V2", label: "wakaf vertical · asset tokenization", tag: "q4 '26" },
      { v: "V3", label: "cross-border · jakim/gso integration", tag: "2027" },
    ],
    viewAll: "view full roadmap",
    badge: "MIZAAN · BUILD-IN-PUBLIC",
    smallCards: {
      buildLog: { tag: "BUILD LOG", title: "what's new in mizaan", body: "may 7, 2026: SAS schemas v1, IDRX devnet integration, donor dashboard live tracking, dr. habib endorsement.", cta: "build log" },
      blog: { tag: "FROM THE BLOG", title: "building zakat rails for indonesia", body: "artikel: kenapa solana attestation service adalah primitive yang tepat untuk transparency layer di sektor zakat indonesia.", cta: "read article" },
    },
  },
  en: {
    eyebrow: "// what's coming next",
    headline: "mizaan\nroadmap",
    sub: "see what we're building. big ideas, realistic milestones — the same transparency we ask of zakat itself.",
    milestones: [
      { v: "V1.0", label: "core MVP · zakat + sedekah + infaq", tag: "live" },
      { v: "V1.1", label: "real IDRX integration · mainnet", tag: "jun '26" },
      { v: "V2", label: "wakaf vertical · asset tokenization", tag: "q4 '26" },
      { v: "V3", label: "cross-border · jakim/gso integration", tag: "2027" },
    ],
    viewAll: "view full roadmap",
    badge: "MIZAAN · BUILD-IN-PUBLIC",
    smallCards: {
      buildLog: { tag: "BUILD LOG", title: "what's new in mizaan", body: "may 7, 2026: SAS schemas v1, IDRX devnet integration, donor dashboard live tracking, dr. habib endorsement.", cta: "build log" },
      blog: { tag: "FROM THE BLOG", title: "building zakat rails for indonesia", body: "article: why the solana attestation service is the right primitive for a transparency layer in indonesian zakat.", cta: "read article" },
    },
  },
} as const;

export function Roadmap({ locale }: { locale: SupportedLocale }) {
  const t = COPY[locale];
  return (
    <section
      id="roadmap"
      className="relative flex flex-col gap-5 overflow-clip border-t border-[#FFFFFF0D] bg-[#161616] px-5 py-16 sm:gap-6 sm:px-8 sm:py-20 md:px-12 md:py-24 lg:px-20 lg:py-30"
    >
      <div className="relative flex w-full max-w-7xl flex-col items-start gap-2 self-center">
        <span className="font-mono text-[11px] leading-4 tracking-[0.04em] text-[#14F195A6] sm:text-xs">
          {t.eyebrow}
        </span>
      </div>

      <div className="relative flex min-h-[280px] w-full max-w-7xl flex-col self-center overflow-clip rounded-[18px] border border-[#FFFFFF12] bg-[#1A1A1A] md:flex-row md:justify-between">
        <div className="flex flex-col justify-between gap-5 border-b border-[#FFFFFF0D] p-7 sm:p-9 md:grow-[1.2] md:basis-0 md:border-r md:border-b-0 md:p-10 lg:p-12">
          <div className="flex flex-col gap-3.5 md:gap-4.5">
            <h2 className="m-0 whitespace-pre-wrap text-[32px] font-medium leading-[100%] tracking-[-0.025em] text-[#EFEFE4] sm:text-[40px] md:text-[44px] lg:text-[48px]">
              {t.headline}
            </h2>
            <p className="m-0 max-w-[380px] text-[14px] leading-[160%] text-[#EFEFE48C] md:text-[15px]">{t.sub}</p>
          </div>

          <ul className="flex flex-col gap-2.5">
            {t.milestones.map((m, i) => {
              const live = i === 0;
              return (
                <li key={m.v} className="flex items-center gap-3.5">
                  <span
                    className={`w-15 shrink-0 font-mono text-[11px] leading-[14px] tracking-[0.04em] font-medium ${
                      live ? "text-[#14F195]" : "text-[#EFEFE48C]"
                    }`}
                  >
                    {m.v}
                  </span>
                  <span className={`text-[13px] leading-4 ${live ? "text-[#EFEFE4D9]" : "text-[#EFEFE4A6]"}`}>
                    {m.label}
                  </span>
                  <span
                    className={`ml-auto rounded-[14px] border px-2 py-0.5 font-mono text-[10px] leading-3 font-medium ${
                      live
                        ? "border-[#14F19538] bg-[#14F1951A] text-[#14F195]"
                        : "border-[#FFFFFF1A] bg-[#FFFFFF0D] text-[#EFEFE48C]"
                    }`}
                  >
                    {m.tag}
                  </span>
                </li>
              );
            })}
          </ul>

          <span className="mt-1.5 flex h-9.5 shrink-0 items-center gap-2 self-start rounded-[9px] border border-[#FFFFFF1A] bg-[#FFFFFF0F] px-4.5 text-[13px] font-medium tracking-[-0.01em] leading-4 text-[#EFEFE4]">
            <span>{t.viewAll}</span>
            <span aria-hidden className="text-[#EFEFE48C]">→</span>
          </span>
        </div>

        <div className="relative hidden grow basis-0 items-center justify-center overflow-clip bg-[#141414] md:flex">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(in oklab 90deg, oklab(84.4% -0.183 0.078 / 4%) 0%, oklab(0% -.0001 0 / 0%) 100%)",
            }}
          />
          <div aria-hidden className="absolute top-15 left-15 grid grid-cols-[repeat(8,8px)] grid-rows-[repeat(8,8px)] gap-0.5 opacity-80">
            <span className="col-start-1 col-end-4 row-start-1 row-end-2 bg-[#14F1954D]" />
            <span className="col-start-5 col-end-9 row-start-1 row-end-3 bg-[#14F19580]" />
            <span className="col-start-2 col-end-5 row-start-3 row-end-5 bg-[#14F19533]" />
            <span className="col-start-6 col-end-8 row-start-4 row-end-6 bg-[#14F195B3]" />
            <span className="col-start-1 col-end-3 row-start-6 row-end-8 bg-[#14F19566]" />
            <span className="col-start-4 col-end-7 row-start-6 row-end-9 bg-[#14F1958C]" />
          </div>
          <div aria-hidden className="absolute bottom-12.5 right-15 grid grid-cols-[repeat(6,8px)] grid-rows-[repeat(6,8px)] gap-0.5 opacity-60">
            <span className="col-start-1 col-end-3 row-start-2 row-end-4 bg-[#EFEFE433]" />
            <span className="col-start-3 col-end-5 row-start-1 row-end-3 bg-[#EFEFE44D]" />
            <span className="col-start-5 col-end-7 row-start-3 row-end-5 bg-[#EFEFE426]" />
            <span className="col-start-2 col-end-5 row-start-4 row-end-6 bg-[#EFEFE440]" />
          </div>
          <div className="relative flex flex-col items-center gap-3.5">
            <span
              className="flex size-16 shrink-0 items-center justify-center"
              style={{ filter: "drop-shadow(0 8px 32px rgba(20,241,149,0.30))" }}
            >
              <MizaanIcon />
            </span>
            <span className="font-mono text-[11px] leading-[14px] tracking-[0.06em] text-[#EFEFE46B]">
              {t.badge}
            </span>
          </div>
        </div>
      </div>

      <div className="relative flex w-full max-w-7xl flex-col gap-4 self-center sm:gap-5 lg:flex-row lg:gap-6">
        <div className="flex min-h-[200px] grow basis-0 overflow-clip rounded-[18px] border border-[#FFFFFF12] bg-[#1A1A1A]">
          <div className="relative hidden w-40 shrink-0 flex-col items-center justify-center overflow-clip bg-[#141414] sm:flex">
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(in oklab 90deg, oklab(94.9% -0.004 0.014 / 4%) 0%, oklab(0% 0 .0001 / 0%) 100%)",
              }}
            />
            <div className="relative grid grid-cols-[repeat(3,28px)] grid-rows-[repeat(3,28px)] gap-1.5">
              <span className="flex items-center justify-center"><MizaanIcon /></span>
              <span className="rounded-md bg-[#3D5AFE]" />
              <span className="rounded-md bg-[#9C27B0]" />
              <span className="rounded-md bg-[#FF5722]" />
              <span className="rounded-md border border-[#14F19566] bg-[#14F1954D]" />
              <span className="rounded-md bg-[#FFC107]" />
              <span className="rounded-md bg-[#00BCD4]" />
              <span className="rounded-md bg-[#E91E63]" />
              <span className="rounded-md bg-[#EFEFE433]" />
            </div>
          </div>
          <div className="flex grow basis-0 flex-col justify-between gap-3 p-5 sm:p-6 md:p-7">
            <div className="flex flex-col gap-2.5">
              <span className="font-mono text-[11px] leading-[14px] tracking-[0.04em] text-[#EFEFE46B]">
                {t.smallCards.buildLog.tag}
              </span>
              <h3 className="m-0 text-[20px] font-medium leading-[115%] tracking-[-0.02em] text-[#EFEFE4] sm:text-[22px] md:text-2xl">
                {t.smallCards.buildLog.title}
              </h3>
              <p className="m-0 text-[13px] leading-[155%] text-[#EFEFE48C]">{t.smallCards.buildLog.body}</p>
            </div>
            <span className="flex items-center gap-1.5 text-[13px] leading-4 font-medium text-[#14F195]">
              <span>{t.smallCards.buildLog.cta}</span>
              <span aria-hidden>→</span>
            </span>
          </div>
        </div>

        <div className="flex min-h-[200px] grow basis-0 overflow-clip rounded-[18px] border border-[#FFFFFF12] bg-[#1A1A1A]">
          <div className="flex grow basis-0 flex-col justify-between gap-3 p-5 sm:p-6 md:p-7">
            <div className="flex flex-col gap-2.5">
              <span className="font-mono text-[11px] leading-[14px] tracking-[0.04em] text-[#EFEFE46B]">
                {t.smallCards.blog.tag}
              </span>
              <h3 className="m-0 text-[20px] font-medium leading-[115%] tracking-[-0.02em] text-[#EFEFE4] sm:text-[22px] md:text-2xl">
                {t.smallCards.blog.title}
              </h3>
              <p className="m-0 text-[13px] leading-[155%] text-[#EFEFE48C]">{t.smallCards.blog.body}</p>
            </div>
            <span className="flex items-center gap-1.5 text-[13px] leading-4 font-medium text-[#14F195]">
              <span>{t.smallCards.blog.cta}</span>
              <span aria-hidden>→</span>
            </span>
          </div>
          <div
            aria-hidden
            className="relative hidden w-50 shrink-0 overflow-clip sm:block"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(20,241,149,0.30) 0%, rgba(120,150,255,0.20) 50%, rgba(20,241,149,0.10) 100%)",
            }}
          >
            <span className="absolute -top-10 -right-10 size-30 rounded-full bg-[#FFFFFF1A] blur-2xl" />
            <span className="absolute -bottom-5 left-5 size-20 rounded-full bg-[#14F1954D] blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
