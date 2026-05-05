import type { SupportedLocale } from "@/lib/constants";

const COPY = {
  id: {
    eyebrow: "the number that exists because trust is broken",
    headline: "Rp 296 triliun zakat hilang per tahun.",
    cells: [
      {
        label: "POTENSI ZAKAT NASIONAL",
        value: "Rp 327T",
        sub: "per tahun, BAZNAS Outlook 2024",
      },
      {
        label: "REALISASI 2024",
        value: "Rp 31T",
        sub: "9.5% dari potensi total",
      },
      {
        label: "GAP / OPPORTUNITY",
        value: "Rp 296T",
        sub: "unrealized — driven by trust deficit",
      },
      {
        label: "DIASPORA INDONESIA",
        value: "12 jt",
        sub: "muzakki tanpa channel terpercaya",
      },
    ],
  },
  en: {
    eyebrow: "the number that exists because trust is broken",
    headline: "Rp 296 trillion of zakat goes unrealized every year.",
    cells: [
      {
        label: "NATIONAL ZAKAT POTENTIAL",
        value: "Rp 327T",
        sub: "annually, BAZNAS Outlook 2024",
      },
      {
        label: "2024 REALIZATION",
        value: "Rp 31T",
        sub: "9.5% of total potential",
      },
      {
        label: "GAP / OPPORTUNITY",
        value: "Rp 296T",
        sub: "unrealized — driven by trust deficit",
      },
      {
        label: "INDONESIAN DIASPORA",
        value: "12 m",
        sub: "muzakki without a trusted channel",
      },
    ],
  },
} as const;

export function Stats({ locale }: { locale: SupportedLocale }) {
  const t = COPY[locale];
  return (
    <section
      id="dampak"
      className="flex flex-col items-center gap-10 border-t border-[#FFFFFF0D] bg-[#181818] px-5 pt-16 pb-16 sm:gap-12 sm:px-8 sm:pt-20 sm:pb-20 md:gap-14 md:px-12 md:pb-24 lg:gap-15 lg:px-20 lg:pb-25"
    >
      <div className="flex max-w-[760px] flex-col items-center gap-3.5 text-center">
        <p className="m-0 font-mono text-[11px] leading-4 tracking-[0.04em] text-[#EFEFE452] sm:text-xs">
          {t.eyebrow}
        </p>
        <h2 className="m-0 text-[28px] font-medium leading-[105%] tracking-[-0.025em] text-[#EFEFE4] sm:text-[36px] md:text-[44px] lg:text-[48px]">
          {t.headline}
        </h2>
      </div>

      <div className="grid w-full max-w-7xl grid-cols-2 gap-px bg-[#FFFFFF0F] lg:grid-cols-4">
        {t.cells.map((c, i) => {
          const highlight = i === 2;
          return (
            <div
              key={c.label}
              className={`flex flex-col gap-3 bg-[#181818] px-5 py-6 sm:px-7 sm:py-8 md:gap-3.5 lg:px-8 lg:py-9 ${
                highlight ? "border-t-2 border-t-[#14F195]" : ""
              }`}
            >
              <span
                className={`font-mono text-[10px] leading-[14px] tracking-[0.05em] sm:text-[11px] ${
                  highlight ? "text-[#14F195]" : "text-[#EFEFE452]"
                }`}
              >
                {c.label}
              </span>
              <span
                className={`text-[32px] font-medium leading-[100%] tracking-[-0.035em] sm:text-[40px] md:text-[46px] lg:text-[54px] ${
                  highlight ? "text-[#14F195]" : "text-[#EFEFE4]"
                }`}
              >
                {c.value}
              </span>
              <span className="text-[12px] leading-[150%] text-[#EFEFE48C] sm:text-[13px]">{c.sub}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
