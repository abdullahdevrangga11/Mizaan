import type { SupportedLocale } from "@/lib/constants";

const COPY = {
  id: {
    eyebrow: "three signatures, one chain of trust",
    headline: "cara kerja, dalam tiga langkah.",
    steps: [
      {
        n: "01",
        role: "DONOR · MUZAKKI",
        title: "donor sign donation commitment",
        body: "muzakki connect phantom atau email login. pilih jumlah, pilih laz, pilih kategori. tanda tangan lewat wallet → token IDRZ ditransfer ke laz, attestation pertama tercipta di solana.",
        tags: ["phantom", "privy", "SAS schema #1"],
      },
      {
        n: "02",
        role: "LAZ · AMIL",
        title: "laz sign distribution decision",
        body: "amil laz lihat queue donasi pending. pilih mustahik dari registry, alokasi jumlah dan kategori, tanda tangan distribusi. token IDRZ otomatis transfer ke wallet mustahik (custodial), magic link sms terkirim.",
        tags: ["email auth", "jwt session", "SAS schema #2"],
      },
      {
        n: "03",
        role: "MUSTAHIK · RECIPIENT",
        title: "mustahik confirm receipt",
        body: "mustahik buka magic link di hp, lihat detail penerimaan, tap satu tombol konfirmasi. attestation ketiga tercipta. donor lihat update di dashboard dalam hitungan detik.",
        tags: ["magic link", "no app needed", "SAS schema #3"],
      },
    ],
  },
  en: {
    eyebrow: "three signatures, one chain of trust",
    headline: "how it works, in three steps.",
    steps: [
      {
        n: "01",
        role: "DONOR · MUZAKKI",
        title: "donor signs the donation commitment",
        body: "the muzakki connects phantom or signs in by email. they pick the amount, the laz, and the category. they sign with their wallet → IDRZ tokens move to the laz and the first attestation lands on solana.",
        tags: ["phantom", "privy", "SAS schema #1"],
      },
      {
        n: "02",
        role: "LAZ · AMIL",
        title: "laz signs the distribution decision",
        body: "the amil opens the pending queue. picks the mustahik from the registry, allocates amount + category, then signs the distribution. IDRZ moves to the mustahik's custodial wallet and a magic-link sms is sent.",
        tags: ["email auth", "jwt session", "SAS schema #2"],
      },
      {
        n: "03",
        role: "MUSTAHIK · RECIPIENT",
        title: "mustahik confirms receipt",
        body: "the mustahik opens the magic link on their phone, sees the receipt detail, and taps one button to confirm. the third attestation lands. the donor sees the update on their dashboard in seconds.",
        tags: ["magic link", "no app needed", "SAS schema #3"],
      },
    ],
  },
} as const;

export function HowItWorks({ locale }: { locale: SupportedLocale }) {
  const t = COPY[locale];
  return (
    <section
      className="flex flex-col items-center gap-10 border-t border-[#FFFFFF0D] bg-[#161616] px-5 pt-16 pb-16 sm:gap-12 sm:px-8 sm:pt-20 sm:pb-20 md:gap-14 md:px-12 md:pb-24 lg:gap-15 lg:px-20 lg:pb-30"
      style={{
        backgroundImage:
          "linear-gradient(in oklab 90deg, oklab(94.9% -0.004 0.014 / 3.5%) 0%, oklab(0% 0 .0001 / 0%) 100%), linear-gradient(in oklab 180deg, oklab(94.9% -0.004 0.014 / 3.5%) 0%, oklab(0% 0 .0001 / 0%) 100%)",
      }}
    >
      <div className="flex max-w-[760px] flex-col items-center gap-3.5 text-center">
        <p className="m-0 font-mono text-[11px] leading-4 tracking-[0.04em] text-[#EFEFE452] sm:text-xs">
          {t.eyebrow}
        </p>
        <h2 className="m-0 text-[28px] font-medium leading-[105%] tracking-[-0.025em] text-[#EFEFE4] sm:text-[36px] md:text-[44px] lg:text-[48px]">
          {t.headline}
        </h2>
      </div>

      <div className="flex w-full max-w-[1180px] flex-col items-start gap-8 lg:flex-row lg:items-start lg:justify-between">
        {t.steps.map((s) => (
          <div key={s.n} className="flex w-full flex-col gap-3.5 lg:grow lg:basis-0 lg:gap-4.5">
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#14F1954D] bg-[#14F1951F] font-mono text-[13px] leading-4 font-semibold text-[#14F195]">
                {s.n}
              </span>
              <span className="font-mono text-[11px] leading-[14px] tracking-[0.04em] text-[#EFEFE46B]">
                {s.role}
              </span>
            </div>
            <h3 className="m-0 text-[20px] font-medium leading-[120%] tracking-[-0.02em] text-[#EFEFE4] sm:text-[22px] md:text-2xl">
              {s.title}
            </h3>
            <p className="m-0 text-sm leading-[160%] text-[#EFEFE48C]">{s.body}</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {s.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-[14px] border border-[#FFFFFF12] bg-[#FFFFFF0A] px-2.25 py-0.75 font-mono text-[10px] leading-3 text-[#EFEFE48C]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
