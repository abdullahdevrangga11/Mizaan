import { Link } from "@/i18n/navigation";
import type { SupportedLocale } from "@/lib/constants";

const COPY = {
  id: {
    eyebrow: "on-chain zakat layer · for indonesia · on solana",
    headline1: "donate transparently",
    headline2: "see every rupiah reach",
    headline3: "the right mustahik.",
    body: "mizaan menambahkan lapisan attestation kriptografis di atas operasional LAZ. setiap zakat punya tiga tanda tangan: donor, laz, mustahik. tidak ada yang bisa dipalsukan.",
    ctaPrimary: "open mizaan app",
    ctaSecondary: "see how it works",
    trust: "gratis untuk donor · tanpa fee · tanpa akun",
  },
  en: {
    eyebrow: "on-chain zakat layer · for indonesia · on solana",
    headline1: "donate transparently",
    headline2: "see every rupiah reach",
    headline3: "the right mustahik.",
    body: "mizaan adds a cryptographic attestation layer on top of laz operations. every zakat has three signatures: donor, laz, mustahik. nothing can be faked.",
    ctaPrimary: "open mizaan app",
    ctaSecondary: "see how it works",
    trust: "free for donors · no platform fee · no account required",
  },
} as const;

export function Hero({ locale }: { locale: SupportedLocale }) {
  const t = COPY[locale];
  return (
    <section
      className="relative pt-16 pb-12 sm:pt-20 sm:pb-16 md:pt-24 md:pb-20 lg:pt-30 lg:pb-20"
      style={{
        backgroundImage:
          "linear-gradient(in oklab 90deg, oklab(94.9% -0.004 0.014 / 2.4%) 0%, oklab(0% 0 .0001 / 0%) 100%), linear-gradient(in oklab 180deg, oklab(94.9% -0.004 0.014 / 2.4%) 0%, oklab(0% 0 .0001 / 0%) 100%)",
      }}
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-start gap-6 px-5 sm:gap-7 sm:px-8 md:px-12 lg:gap-8 lg:px-20">
      <div className="flex items-center gap-2 rounded-[20px] border border-[#14F1952E] bg-[#14F1950F] px-3 py-1.5">
        <span
          aria-hidden
          className="size-1.5 shrink-0 rounded-full bg-[#14F195]"
          style={{ boxShadow: "0 0 8px rgba(20,241,149,0.6)" }}
        />
        <span className="font-mono text-[10px] leading-4 font-medium tracking-[0.02em] text-[#14F195] sm:text-[11px] md:text-xs">
          {t.eyebrow}
        </span>
      </div>

      <div className="flex max-w-[920px] flex-col">
        <h1 className="m-0 text-[40px] font-medium leading-[100%] tracking-[-0.035em] text-[#EFEFE4] sm:text-[52px] md:text-[64px] lg:text-[80px]">
          {t.headline1}
        </h1>
        <span className="text-[40px] font-medium leading-[100%] tracking-[-0.035em] text-[#EFEFE49E] sm:text-[52px] md:text-[64px] lg:text-[80px]">
          {t.headline2}
        </span>
        <span className="text-[40px] font-medium leading-[100%] tracking-[-0.035em] text-[#EFEFE49E] sm:text-[52px] md:text-[64px] lg:text-[80px]">
          {t.headline3}
        </span>
      </div>

      <p className="m-0 max-w-[560px] text-[15px] leading-[160%] text-[#EFEFE48C] sm:text-[16px] md:text-[18px]">
        {t.body}
      </p>

      <div className="mt-1 flex flex-wrap items-center gap-2.5 sm:mt-2 sm:gap-3.5">
        <Link
          href="/donate"
          className="flex h-11 items-center gap-2 rounded-[10px] bg-[#EFEFE4] px-4 text-sm font-medium tracking-[-0.01em] leading-[18px] text-[#181818] transition-opacity hover:opacity-90 sm:px-5.5"
        >
          <span>{t.ctaPrimary}</span>
          <span aria-hidden>→</span>
        </Link>
        <a
          href="#cara-kerja"
          className="flex h-11 items-center gap-2 rounded-[10px] border border-[#FFFFFF1F] px-4 text-sm tracking-[-0.01em] leading-[18px] text-[#EFEFE4D9] transition-colors hover:border-[#FFFFFF33] sm:px-5.5"
        >
          <span>{t.ctaSecondary}</span>
          <span aria-hidden className="text-[#EFEFE48C]">
            →
          </span>
        </a>
      </div>

      <div className="mt-1 flex items-center gap-2">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="shrink-0">
          <path d="M3 7l3 3 5-6" stroke="#14F195" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-[12px] leading-4 text-[#EFEFE466] sm:text-[13px]">{t.trust}</span>
      </div>
      </div>
    </section>
  );
}
