import { Link } from "@/i18n/navigation";
import type { SupportedLocale } from "@/lib/constants";

const COPY = {
  id: {
    eyebrow: "9% realisasi today. let's make it 100%.",
    headline: "setiap rupiah,\njejak yang verifiable.",
    sub: "indonesia leaving Rp 296 triliun zakat di meja per tahun. bukan karena niat — karena trust deficit. mizaan memperbaiki arsitekturnya.",
    ctaPrimary: "open mizaan app",
    ctaSecondary: "view github",
    trust: ["gratis untuk donor", "tanpa fee platform", "open source"],
  },
  en: {
    eyebrow: "9% realized today. let's make it 100%.",
    headline: "every rupiah,\na trail you can verify.",
    sub: "indonesia leaves Rp 296 trillion of zakat on the table every year. not from lack of intent — from a trust deficit. mizaan fixes the architecture.",
    ctaPrimary: "open mizaan app",
    ctaSecondary: "view github",
    trust: ["free for donors", "no platform fee", "open source"],
  },
} as const;

export function CTV({ locale }: { locale: SupportedLocale }) {
  const t = COPY[locale];
  return (
    <section className="relative flex flex-col items-center gap-6 overflow-clip border-t border-[#FFFFFF0D] bg-[#161616] px-5 py-16 sm:gap-7 sm:px-8 sm:py-20 md:gap-8 md:px-12 md:py-24 lg:gap-9 lg:px-20 lg:py-30">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50 mix-blend-overlay"
        style={{
          backgroundImage:
            "linear-gradient(in oklab 90deg, oklab(94.9% -0.004 0.014 / 10%) 0%, oklab(0% 0 .0001 / 0%) 100%), linear-gradient(in oklab 180deg, oklab(94.9% -0.004 0.014 / 10%) 0%, oklab(0% 0 .0001 / 0%) 100%)",
        }}
      />

      <p className="relative m-0 text-center font-mono text-[11px] leading-4 tracking-[0.04em] text-[#14F195A6] sm:text-xs">
        {t.eyebrow}
      </p>

      <h2 className="relative m-0 max-w-[920px] whitespace-pre-wrap text-center text-[36px] font-medium leading-[100%] tracking-[-0.035em] text-[#EFEFE4] sm:text-[44px] md:text-[52px] lg:text-[64px]">
        {t.headline}
      </h2>

      <p className="relative m-0 max-w-[540px] text-center text-[15px] leading-[155%] text-[#EFEFE48C] sm:text-[16px] md:text-[18px]">
        {t.sub}
      </p>

      <div className="relative mt-1 flex flex-wrap items-center justify-center gap-3 sm:mt-2 sm:gap-3.5">
        <Link
          href="/donate"
          className="flex h-12 items-center gap-2 rounded-[10px] bg-[#14F195] px-5 text-[14px] font-medium tracking-[-0.01em] leading-[18px] text-[#181818] transition-opacity hover:opacity-90 sm:px-7 sm:text-[15px]"
        >
          <span>{t.ctaPrimary}</span>
          <span aria-hidden>→</span>
        </Link>
        <a
          href="https://github.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 items-center gap-2 rounded-[10px] border border-[#FFFFFF1F] px-5 text-[14px] tracking-[-0.01em] leading-[18px] text-[#EFEFE4D9] transition-colors hover:border-[#FFFFFF33] sm:px-7 sm:text-[15px]"
        >
          <span>{t.ctaSecondary}</span>
          <span aria-hidden className="text-[#EFEFE48C]">↗</span>
        </a>
      </div>

      <ul className="relative mt-1.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 sm:gap-4.5">
        {t.trust.map((label) => (
          <li key={label} className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M3 7l3 3 5-6" stroke="#14F195" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[13px] leading-4 text-[#EFEFE46B]">{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
