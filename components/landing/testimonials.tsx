import type { SupportedLocale } from "@/lib/constants";

const COPY = {
  id: {
    eyebrow: "from the people who matter",
    headline: "apa kata yang sudah pakai mizaan.",
    quotes: [
      {
        featured: true,
        tag: "FEATURED · ACADEMIC ENDORSEMENT",
        body: '"the framework I outlined at puskas baznas needed an implementation. mizaan delivers exactly that — multi-party attestation that respects the four institutional pillars of zakat governance."',
        initials: "FH",
        name: "Dr. Farrukh Habib",
        title: "islamic fintech hub uk · puskas baznas speaker",
      },
      {
        featured: false,
        tag: "DIASPORA DONOR",
        body: '"setelah 5 tahun ga zakat ke kampung halaman karena ga percaya channel-nya — finally ada cara yang transparent. donasi di singapore, lihat pak yusuf konfirmasi 4 jam kemudian. priceless."',
        initials: "SY",
        name: "Sarah Y.",
        title: "software engineer, grab singapore · alumni ugm",
      },
      {
        featured: false,
        tag: "LAZ AMIL",
        body: '"inquiry donor turun 80%. donor yang dulu telpon mingguan tanya \'distribusinya ke siapa\', sekarang lihat sendiri di dashboard. audit tahunan? sudah otomatis dari on-chain."',
        initials: "BS",
        name: "Bu Sri R.",
        title: "amil · dompet dhuafa yogyakarta",
      },
      {
        featured: false,
        tag: "MUSTAHIK",
        body: '"saya cuma tap satu tombol di hp. tahu rp 800 ribu untuk biaya sekolah sarah benar-benar sampai. donor juga lihat saya konfirmasi. ini bukan teknologi rumit — ini cuma kepercayaan yang bisa dilihat."',
        initials: "PY",
        name: "Pak Y.",
        title: "mustahik · bantul, diy",
      },
    ],
  },
  en: {
    eyebrow: "from the people who matter",
    headline: "what the early users say.",
    quotes: [
      {
        featured: true,
        tag: "FEATURED · ACADEMIC ENDORSEMENT",
        body: '"the framework I outlined at puskas baznas needed an implementation. mizaan delivers exactly that — multi-party attestation that respects the four institutional pillars of zakat governance."',
        initials: "FH",
        name: "Dr. Farrukh Habib",
        title: "islamic fintech hub uk · puskas baznas speaker",
      },
      {
        featured: false,
        tag: "DIASPORA DONOR",
        body: '"after 5 years of not paying zakat back home because I didn\'t trust the channel — finally a transparent way. I donated from singapore and saw pak yusuf confirm 4 hours later. priceless."',
        initials: "SY",
        name: "Sarah Y.",
        title: "software engineer, grab singapore · ugm alumna",
      },
      {
        featured: false,
        tag: "LAZ AMIL",
        body: '"donor inquiries dropped 80%. donors who used to call me weekly asking \'where did it go?\' now see for themselves on the dashboard. annual audit? automated from on-chain data."',
        initials: "BS",
        name: "Bu Sri R.",
        title: "amil · dompet dhuafa yogyakarta",
      },
      {
        featured: false,
        tag: "MUSTAHIK",
        body: '"I just tapped one button on my phone. now I know rp 800,000 actually reached me for sarah\'s school. and the donor sees that I confirmed. this isn\'t complex tech — it\'s just trust you can see."',
        initials: "PY",
        name: "Pak Y.",
        title: "mustahik · bantul, diy",
      },
    ],
  },
} as const;

export function Testimonials({ locale }: { locale: SupportedLocale }) {
  const t = COPY[locale];
  return (
    <section
      id="testimoni"
      className="flex flex-col items-center gap-10 border-t border-[#FFFFFF0D] bg-[#181818] px-5 pt-16 pb-16 sm:gap-12 sm:px-8 sm:pt-20 sm:pb-20 md:gap-14 md:px-12 md:pb-24 lg:gap-15 lg:px-20 lg:pb-30"
    >
      <div className="flex max-w-[760px] flex-col items-center gap-3.5 text-center">
        <p className="m-0 font-mono text-[11px] leading-4 tracking-[0.04em] text-[#EFEFE452] sm:text-xs">{t.eyebrow}</p>
        <h2 className="m-0 text-[28px] font-medium leading-[105%] tracking-[-0.025em] text-[#EFEFE4] sm:text-[36px] md:text-[44px] lg:text-[48px]">
          {t.headline}
        </h2>
      </div>

      <div className="grid w-full max-w-7xl grid-cols-1 gap-3.5 md:grid-cols-2">
        {t.quotes.map((q) => (
          <article
            key={q.name}
            className={`flex flex-col gap-5 rounded-[14px] p-6 md:gap-5.5 md:p-8 ${
              q.featured ? "border border-[#14F1952E] bg-[#181818]" : "border border-[#FFFFFF12] bg-[#181818]"
            }`}
            style={{
              backgroundImage: q.featured
                ? "linear-gradient(180deg, rgba(20,241,149,0.05) 0%, transparent 50%)"
                : undefined,
              boxShadow: q.featured
                ? "inset 0 1px 0 rgba(20,241,149,0.18)"
                : "inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            <span
              className={`font-mono text-[11px] leading-[14px] tracking-[0.04em] ${
                q.featured ? "text-[#14F195]" : "text-[#EFEFE46B]"
              }`}
            >
              {q.tag}
            </span>
            <p
              className={`m-0 leading-[155%] tracking-[-0.005em] ${
                q.featured
                  ? "text-[15px] text-[#EFEFE4EB] sm:text-[16px] md:text-[17px] lg:text-[18px]"
                  : "text-[14px] text-[#EFEFE4D9] sm:text-[15px] md:text-[16px] lg:text-[17px]"
              }`}
            >
              {q.body}
            </p>
            <div className="flex items-center gap-3">
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-full border ${
                  q.featured
                    ? "border-[#14F19538] bg-[#14F1951A] text-[#14F195]"
                    : "border-[#FFFFFF14] bg-[#FFFFFF0A] text-[#EFEFE4]"
                } text-sm font-semibold leading-[18px]`}
              >
                {q.initials}
              </span>
              <div>
                <div className="text-sm font-semibold leading-[18px] text-[#EFEFE4]">{q.name}</div>
                <div className="text-xs leading-4 text-[#EFEFE48C]">{q.title}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
