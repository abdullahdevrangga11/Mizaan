import type { SupportedLocale } from "@/lib/constants";

const COPY = {
  id: {
    eyebrow: "why mizaan, in plain bahasa",
    headline: "empat benefit yang tidak bisa dipalsukan.",
    sub: "features tell. benefits sell. ini yang muzakki dapat saat memilih mizaan.",
    cards: [
      {
        n: "01 / ANTI-SKIM",
        title: "tidak ada admin yang bisa skim.",
        body: "distribusi membutuhkan tanda tangan mustahik. tanpa konfirmasi mustahik di rantai, donasi tidak terhitung selesai. cryptography > kepercayaan administratif.",
      },
      {
        n: "02 / DIASPORA",
        title: "zakat dari mana saja, ke kampung halaman.",
        body: "12 juta diaspora indonesia bisa donasi via email/sms login. tidak perlu rekening lokal, tidak perlu transfer bank lintas negara. solana < 1 detik finality.",
      },
      {
        n: "03 / REAL-TIME",
        title: "dari donor ke mustahik dalam jam, bukan bulan.",
        body: "tradisional: laporan donor 6-12 bulan setelah audit. mizaan: sms ke mustahik dalam 15 menit, konfirmasi rata-rata dalam 4 jam, donor lihat hari yang sama.",
      },
      {
        n: "04 / DIGNITY",
        title: "mustahik privacy default. opt-in disclosure.",
        body: 'on-chain hanya menyimpan hash dan inisial ("Pak Y., Bantul"). nama lengkap, foto, nomor hp tidak pernah on-chain. uu pdp 27/2022 compliant by design.',
      },
    ],
  },
  en: {
    eyebrow: "why mizaan, in plain english",
    headline: "four benefits no one can fake.",
    sub: "features tell. benefits sell. here's what muzakki get when they pick mizaan.",
    cards: [
      {
        n: "01 / ANTI-SKIM",
        title: "no admin can take a cut.",
        body: "every distribution needs the mustahik's signature. without on-chain confirmation, a donation doesn't count as done. cryptography > administrative trust.",
      },
      {
        n: "02 / DIASPORA",
        title: "zakat from anywhere, straight back home.",
        body: "12 million indonesian diaspora can donate via email/sms login. no local bank account, no cross-border wire. solana settles in under a second.",
      },
      {
        n: "03 / REAL-TIME",
        title: "donor to mustahik in hours, not months.",
        body: "the old way: donor reports 6-12 months after audit. mizaan: sms to mustahik in 15 minutes, average confirmation in 4 hours, donor sees it the same day.",
      },
      {
        n: "04 / DIGNITY",
        title: "mustahik privacy by default. opt-in disclosure.",
        body: 'on-chain only stores a hash and initials ("Pak Y., Bantul"). full name, photo, phone number never go on-chain. uu pdp 27/2022 compliant by design.',
      },
    ],
  },
} as const;

const ICONS = [
  // 01 — anti-skim shield
  <svg key="i1" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <path d="M10 2L3 5v5c0 4 3 7 7 8 4-1 7-4 7-8V5l-7-3z" stroke="#14F195" strokeWidth="1.4" />
    <path d="M7 10l2 2 4-4" stroke="#14F195" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
  // 02 — diaspora globe
  <svg key="i2" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <circle cx="10" cy="10" r="7.5" stroke="#EFEFE4B3" strokeWidth="1.4" />
    <path d="M2.5 10h15M10 2.5c2 2.4 3 5 3 7.5s-1 5.1-3 7.5c-2-2.4-3-5-3-7.5s1-5.1 3-7.5z" stroke="#EFEFE4B3" strokeWidth="1.4" />
  </svg>,
  // 03 — real-time clock
  <svg key="i3" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <circle cx="10" cy="10" r="7.5" stroke="#EFEFE4B3" strokeWidth="1.4" />
    <path d="M10 5v5l3 2" stroke="#EFEFE4B3" strokeWidth="1.4" strokeLinecap="round" />
  </svg>,
  // 04 — dignity / person
  <svg key="i4" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <circle cx="10" cy="7" r="3.5" stroke="#EFEFE4B3" strokeWidth="1.4" />
    <path d="M3 18c0-3.5 3-6.5 7-6.5s7 3 7 6.5" stroke="#EFEFE4B3" strokeWidth="1.4" strokeLinecap="round" />
  </svg>,
];

export function Benefits({ locale }: { locale: SupportedLocale }) {
  const t = COPY[locale];
  return (
    <section className="flex flex-col items-center gap-10 border-t border-[#FFFFFF0D] px-5 pt-16 pb-16 sm:gap-12 sm:px-8 sm:pt-20 sm:pb-20 md:gap-14 md:px-12 md:pb-24 lg:gap-15 lg:px-20 lg:pb-30">
      <div className="flex max-w-[760px] flex-col items-center gap-3.5 text-center">
        <p className="m-0 font-mono text-[11px] leading-4 tracking-[0.04em] text-[#EFEFE452] sm:text-xs">{t.eyebrow}</p>
        <h2 className="m-0 text-[28px] font-medium leading-[105%] tracking-[-0.025em] text-[#EFEFE4] sm:text-[36px] md:text-[44px] lg:text-[48px]">
          {t.headline}
        </h2>
        <p className="m-0 max-w-[560px] text-[14px] leading-[155%] text-[#EFEFE48C] sm:text-[15px] md:text-[16px] lg:text-[17px]">{t.sub}</p>
      </div>

      <div className="grid w-full max-w-7xl grid-cols-1 gap-3.5 md:grid-cols-2">
        {t.cards.map((b, i) => {
          const featured = i === 0;
          return (
            <article
              key={b.n}
              className={`flex min-h-65 flex-col gap-5 rounded-[14px] p-6 md:gap-6 md:p-8 lg:p-10 ${
                featured
                  ? "border border-[#14F1952E] bg-[#1A1A1A]"
                  : "border border-[#FFFFFF12] bg-[#1A1A1A]"
              }`}
              style={{
                backgroundImage: featured
                  ? "linear-gradient(180deg, rgba(20,241,149,0.06) 0%, transparent 50%)"
                  : undefined,
                boxShadow: featured
                  ? "inset 0 1px 0 rgba(20,241,149,0.20)"
                  : "inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-[10px] border ${
                    featured ? "border-[#14F19538] bg-[#14F1951A]" : "border-[#FFFFFF14] bg-[#FFFFFF0A]"
                  }`}
                >
                  {ICONS[i]}
                </span>
                <span
                  className={`font-mono text-[11px] leading-[14px] tracking-[0.04em] ${
                    featured ? "text-[#14F195]" : "text-[#EFEFE46B]"
                  }`}
                >
                  {b.n}
                </span>
              </div>
              <h3 className="m-0 text-[22px] font-medium leading-[115%] tracking-[-0.025em] text-[#EFEFE4] sm:text-[24px] md:text-[26px] lg:text-[28px]">
                {b.title}
              </h3>
              <p className="m-0 text-[14px] leading-[155%] text-[#EFEFE48C] md:text-[15px]">{b.body}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
