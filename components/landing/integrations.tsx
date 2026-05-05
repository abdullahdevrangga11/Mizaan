import type { SupportedLocale } from "@/lib/constants";

const COPY = {
  id: {
    eyebrow: "built on solana, composable with everything",
    headline: "stack yang lo bisa percaya.",
    sub: "tidak ada custom blockchain, tidak ada kunci proprietary. semua open-source, semua battle-tested di production solana.",
    items: {
      solana: "L1 blockchain. ~$0.0001/tx, 400ms finality",
      sas: "credential primitive, schema-based",
      helius: "DAS API for fast attestation reads",
      phantom: "primary wallet for crypto-native donors",
      privy: "embedded wallet via email/sms — diaspora-friendly",
      idrx: "real Indonesian Rupiah on Solana, OJK-compliant",
      idrxBadge: "v1.1 roadmap",
    },
  },
  en: {
    eyebrow: "built on solana, composable with everything",
    headline: "a stack you can actually trust.",
    sub: "no custom blockchain, no proprietary keys. all open-source, all battle-tested on solana mainnet.",
    items: {
      solana: "L1 blockchain. ~$0.0001/tx, 400ms finality",
      sas: "credential primitive, schema-based",
      helius: "DAS API for fast attestation reads",
      phantom: "primary wallet for crypto-native donors",
      privy: "embedded wallet via email/sms — diaspora-friendly",
      idrx: "real indonesian rupiah on solana, ojk-compliant",
      idrxBadge: "v1.1 roadmap",
    },
  },
} as const;

export function Integrations({ locale }: { locale: SupportedLocale }) {
  const t = COPY[locale];
  const items = [
    {
      name: "Solana",
      sub: t.items.solana,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M3.5 13.8h12.3l1.3 1.7H4.8L3.5 13.8zM3.5 9.2l1.3 1.7H17.1L15.8 9.2H3.5zM3.5 4.5h12.3l1.3 1.7H4.8L3.5 4.5z" fill="#14F195" />
        </svg>
      ),
    },
    {
      name: "Solana Attestation Service",
      sub: t.items.sas,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M5 7l5 5 5-5M5 12l5 5 5-5" stroke="#EFEFE4D9" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      name: "Helius RPC",
      sub: t.items.helius,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <circle cx="10" cy="10" r="3" fill="#FFB800" />
          <path d="M10 2v3M10 15v3M2 10h3M15 10h3M4.5 4.5l2 2M13.5 13.5l2 2M4.5 15.5l2-2M13.5 6.5l2-2" stroke="#FFB800" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      name: "Phantom",
      sub: t.items.phantom,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M3 9c0-3 3-6 7-6s7 3 7 6v6c0 1-1 2-2 2H5c-1 0-2-1-2-2V9z" fill="#AB9FF2" />
          <circle cx="8" cy="9" r="1.5" fill="#181818" />
          <circle cx="13" cy="9" r="1.5" fill="#181818" />
        </svg>
      ),
    },
    {
      name: "Privy",
      sub: t.items.privy,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="3" y="3" width="14" height="14" rx="3" stroke="#EFEFE4D9" strokeWidth="1.4" />
          <path d="M7 10h6M10 7v6" stroke="#EFEFE4D9" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      name: "IDRX",
      sub: t.items.idrx,
      badge: t.items.idrxBadge,
      icon: (
        <span className="font-mono text-xs leading-4 font-semibold text-[#14F195]">Rp</span>
      ),
      iconWrap: "border-[#14F1952E] bg-[#14F1950F]",
    },
  ] as const;

  return (
    <section className="flex flex-col items-center gap-8 border-t border-[#FFFFFF0D] px-5 pt-16 pb-16 sm:gap-10 sm:px-8 sm:pt-20 sm:pb-20 md:gap-12 md:px-12 md:pb-24 lg:px-20 lg:pb-25">
      <div className="flex max-w-[760px] flex-col items-center gap-3.5 text-center">
        <p className="m-0 font-mono text-[11px] leading-4 tracking-[0.04em] text-[#EFEFE452] sm:text-xs">
          {t.eyebrow}
        </p>
        <h2 className="m-0 text-[28px] font-medium leading-[105%] tracking-[-0.025em] text-[#EFEFE4] sm:text-[36px] md:text-[44px] lg:text-[48px]">
          {t.headline}
        </h2>
        <p className="m-0 max-w-[560px] text-[14px] leading-[155%] text-[#EFEFE48C] sm:text-[15px] md:text-[16px] lg:text-[17px]">{t.sub}</p>
      </div>

      <div className="grid w-full max-w-7xl grid-cols-2 gap-px overflow-clip rounded-[14px] border border-[#FFFFFF0F] bg-[#FFFFFF0F] md:grid-cols-3">
        {items.map((item) => {
          const wrap =
            "iconWrap" in item ? item.iconWrap : "border-[#FFFFFF14] bg-[#FFFFFF0A]";
          return (
            <article key={item.name} className="flex flex-col items-start gap-3 bg-[#181818] p-5 sm:gap-3.5 sm:p-6 md:p-7">
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-[9px] border ${wrap}`}
              >
                {item.icon}
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-semibold leading-5 tracking-[-0.015em] text-[#EFEFE4]">
                    {item.name}
                  </span>
                  {"badge" in item && (
                    <span className="rounded-[10px] border border-[#14F19533] bg-[#14F19514] px-1.75 py-px font-mono text-[10px] leading-3 text-[#14F195]">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[13px] leading-4 text-[#EFEFE48C]">{item.sub}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
