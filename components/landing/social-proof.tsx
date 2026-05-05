import type { SupportedLocale } from "@/lib/constants";

const COPY = {
  id: { eyebrow: "didukung oleh institusi & akademisi yang peduli transparansi zakat" },
  en: { eyebrow: "backed by institutions & academics who care about zakat transparency" },
} as const;

export function SocialProof({ locale }: { locale: SupportedLocale }) {
  const t = COPY[locale];
  const wordmarks = [
    { name: "Universitas Gadjah Mada", weight: "font-semibold" },
    { name: "Dompet Dhuafa", weight: "font-bold" },
    { name: "Rumah Zakat", weight: "font-semibold" },
    { name: "LAZ Inisiatif Zakat Indonesia", weight: "font-medium" },
    { name: "Puskas BAZNAS", weight: "font-semibold" },
    { name: "Superteam Indonesia", weight: "font-medium" },
    { name: "Solana Foundation", weight: "font-bold" },
    { name: "Helius", weight: "font-semibold" },
  ] as const;

  return (
    <section className="flex flex-col items-center gap-6 px-5 pb-16 sm:gap-7 sm:px-8 sm:pb-20 md:px-12 md:pb-24 lg:gap-8 lg:px-20 lg:pb-25">
      <p className="m-0 max-w-[560px] text-center font-mono text-[11px] leading-4 tracking-[0.05em] text-[#EFEFE452] sm:text-xs">
        {t.eyebrow}
      </p>
      <div className="flex w-full max-w-[1180px] flex-wrap items-center justify-center gap-x-6 gap-y-5 sm:gap-x-10 sm:gap-y-8 md:gap-x-12 md:gap-y-10 lg:gap-x-16 lg:gap-y-12">
        {wordmarks.map((w) => (
          <span
            key={w.name}
            className={`text-sm leading-[20px] tracking-[-0.02em] text-[#EFEFE46B] sm:text-base md:text-lg md:leading-[22px] ${w.weight}`}
          >
            {w.name}
          </span>
        ))}
      </div>
    </section>
  );
}
