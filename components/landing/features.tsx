import type { SupportedLocale } from "@/lib/constants";

const COPY = {
  id: {
    eyebrow: "tiga properti yang sertifikat pdf tidak bisa",
    headline: "cryptographic proof, bukan janji.",
    sub: "setiap zakat di mizaan tercatat di solana blockchain dengan tiga tanda tangan kriptografis yang independen dan publicly verifiable.",
    cards: {
      immutableBody:
        "setelah donor, laz, dan mustahik tanda tangan, attestation tidak bisa diedit, dihapus, atau dipalsukan oleh siapapun. termasuk admin laz.",
      crossBorderBody:
        "12 juta diaspora indonesia bisa zakat ke kampung halaman dari singapura, riyadh, atau dubai. lacak ke mustahik dalam 4 jam.",
      composableBody:
        "aplikasi lain (rwa, defi, kyc, asuransi) bisa membaca attestation mizaan via satu sdk call. tidak siloed di satu vendor.",
    },
  },
  en: {
    eyebrow: "three properties a pdf certificate cannot offer",
    headline: "cryptographic proof, not just promises.",
    sub: "every zakat in mizaan is recorded on solana with three cryptographic signatures that are independent and publicly verifiable.",
    cards: {
      immutableBody:
        "once donor, laz, and mustahik sign, the attestation cannot be edited, deleted, or faked by anyone. not even by laz admins.",
      crossBorderBody:
        "12 million indonesian diaspora can zakat back home from singapore, riyadh, or dubai. trace to the mustahik in under 4 hours.",
      composableBody:
        "other apps (rwa, defi, kyc, insurance) can read mizaan attestations via one sdk call. not siloed inside any single vendor.",
    },
  },
} as const;

export function Features({ locale }: { locale: SupportedLocale }) {
  const t = COPY[locale];
  const features = [
    {
      n: "01",
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
          <rect x="3" y="6" width="16" height="13" rx="2" stroke="#14F195" strokeWidth="1.3" />
          <path d="M7 6V5a4 4 0 018 0v1" stroke="#14F195" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      ),
      numTone: "text-[#14F1958C]",
      title: "immutable",
      body: t.cards.immutableBody,
      code: "sas.createAttestation(donor, laz, mustahik)",
    },
    {
      n: "02",
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
          <circle cx="11" cy="11" r="7.5" stroke="#EFEFE4B3" strokeWidth="1.3" />
          <path d="M3.5 11h15M11 3.5c2 2.4 3 5 3 7.5s-1 5.1-3 7.5c-2-2.4-3-5-3-7.5s1-5.1 3-7.5z" stroke="#EFEFE4B3" strokeWidth="1.3" />
        </svg>
      ),
      numTone: "text-[#EFEFE452]",
      title: "cross-border",
      body: t.cards.crossBorderBody,
      code: "privy.connect(email) → sol.transfer()",
    },
    {
      n: "03",
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
          <path d="M11 3v16M3 11h16M5 5l12 12M17 5L5 17" stroke="#EFEFE4B3" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      ),
      numTone: "text-[#EFEFE452]",
      title: "composable",
      body: t.cards.composableBody,
      code: "mizaan.verify(walletAddress)",
    },
  ] as const;

  return (
    <section
      id="solusi"
      className="flex flex-col items-center gap-10 border-t border-[#FFFFFF0D] px-5 pt-12 pb-16 sm:gap-12 sm:px-8 sm:pt-14 sm:pb-20 md:gap-14 md:px-12 md:pt-15 md:pb-24 lg:gap-15 lg:px-20 lg:pb-30"
    >
      <div className="flex max-w-[760px] flex-col items-center gap-3.5 text-center">
        <p className="m-0 font-mono text-[11px] leading-4 tracking-[0.04em] text-[#EFEFE452] sm:text-xs">
          {t.eyebrow}
        </p>
        <h2 className="m-0 text-[28px] font-medium leading-[105%] tracking-[-0.025em] text-[#EFEFE4] sm:text-[36px] md:text-[44px] lg:text-[48px]">
          {t.headline}
        </h2>
        <p className="m-0 max-w-[560px] text-[14px] leading-[155%] text-[#EFEFE48C] sm:text-[15px] md:text-[16px] lg:text-[17px]">{t.sub}</p>
      </div>

      <div className="grid w-full max-w-[1280px] grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5 lg:grid-cols-3 lg:gap-px lg:bg-[#FFFFFF0F]">
        {features.map((f) => (
          <article key={f.n} className="flex flex-col gap-5 rounded-[14px] border border-[#FFFFFF12] bg-[#181818] p-6 md:p-8 lg:grow lg:basis-0 lg:gap-5.5 lg:rounded-none lg:border-0 lg:p-9">
            <div className="flex items-center justify-between">
              <span className={`font-mono text-[11px] leading-[14px] tracking-[0.06em] ${f.numTone}`}>
                {f.n}
              </span>
              {f.icon}
            </div>
            <div>
              <h3 className="m-0 mb-2.5 text-[20px] font-semibold leading-7 tracking-[-0.02em] text-[#EFEFE4] md:text-[22px]">
                {f.title}
              </h3>
              <p className="m-0 text-sm leading-[155%] text-[#EFEFE48C]">{f.body}</p>
            </div>
            <div className="mt-auto overflow-x-auto rounded-md border border-[#FFFFFF0F] bg-[#FFFFFF0A] px-3 py-2">
              <span className="whitespace-nowrap font-mono text-[10px] leading-[14px] text-[#EFEFE46B] md:text-[11px]">{f.code}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
