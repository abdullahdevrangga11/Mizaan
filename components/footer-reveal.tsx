import { Link } from "@/i18n/navigation";
import type { SupportedLocale } from "@/lib/constants";
import { MizaanIcon } from "./mizaan-icon";

const COPY = {
  id: {
    tagline: "on-chain zakat layer untuk indonesia. setiap rupiah, jejak yang verifiable.",
    statusChip: "solana devnet · live",
    productTitle: "PRODUCT",
    learnTitle: "LEARN",
    communityTitle: "COMMUNITY",
    legalTitle: "LEGAL",
    productLinks: [
      "donate", "verify", "laz directory", "live feed", "embeddable widget",
    ],
    learnLinks: ["how it works", "about", "api docs", "pitch deck", "roadmap"],
    communityLinks: ["github", "twitter / x", "discord", "contact", "superteam id"],
    legalLinks: ["privacy policy", "terms of use", "sharia compliance", "uu pdp 27/2022", "uu zakat 23/2011"],
    copyright: "© 2026 mizaan",
    hackathon: "indonesia national campus hackathon · 2026",
    submittedTo: "submitted to",
    scrollTop: "scroll to top",
  },
  en: {
    tagline: "on-chain zakat layer for indonesia. every rupiah, a trail you can verify.",
    statusChip: "solana devnet · live",
    productTitle: "PRODUCT",
    learnTitle: "LEARN",
    communityTitle: "COMMUNITY",
    legalTitle: "LEGAL",
    productLinks: [
      "donate", "verify", "laz directory", "live feed", "embeddable widget",
    ],
    learnLinks: ["how it works", "about", "api docs", "pitch deck", "roadmap"],
    communityLinks: ["github", "twitter / x", "discord", "contact", "superteam id"],
    legalLinks: ["privacy policy", "terms of use", "sharia compliance", "uu pdp 27/2022", "uu zakat 23/2011"],
    copyright: "© 2026 mizaan",
    hackathon: "indonesia national campus hackathon · 2026",
    submittedTo: "submitted to",
    scrollTop: "scroll to top",
  },
} as const;

interface FooterColumn {
  title: string;
  links: { label: string; href?: string; external?: boolean }[];
}

function buildColumns(t: (typeof COPY)[SupportedLocale]): FooterColumn[] {
  return [
    {
      title: t.productTitle,
      links: [
        { label: t.productLinks[0], href: "/donate" },
        { label: t.productLinks[1], href: "/verify" },
        { label: t.productLinks[2], href: "/laz" },
        { label: t.productLinks[3], href: "/feed" },
        { label: t.productLinks[4] },
      ],
    },
    {
      title: t.learnTitle,
      links: [
        { label: t.learnLinks[0], href: "#cara-kerja" },
        { label: t.learnLinks[1], href: "/about" },
        { label: t.learnLinks[2] },
        { label: t.learnLinks[3] },
        { label: t.learnLinks[4], href: "#roadmap" },
      ],
    },
    {
      title: t.communityTitle,
      links: [
        { label: t.communityLinks[0], external: true, href: "https://github.com/" },
        { label: t.communityLinks[1], external: true, href: "https://x.com/" },
        { label: t.communityLinks[2], external: true, href: "#" },
        { label: t.communityLinks[3] },
        { label: t.communityLinks[4], external: true, href: "https://superteam.fun/" },
      ],
    },
    {
      title: t.legalTitle,
      links: t.legalLinks.map((label) => ({ label })),
    },
  ];
}

interface FooterRevealProps {
  locale?: SupportedLocale;
  /**
   * When `true`, the footer is `position: fixed` at the viewport bottom
   * with a low z-index, sitting BENEATH the page's `<main>`. The page must
   * give its `<main>` a matching `margin-bottom: 728px` to reserve scroll
   * space — as the user scrolls past main, the fixed footer reveals from
   * underneath. Use this on the landing.
   *
   * When `false` (default), the footer renders inline at the end of the
   * document. Reliable on dashboard / tool pages.
   */
  reveal?: boolean;
}

export function FooterReveal({
  locale = "id",
  reveal = false,
}: FooterRevealProps) {
  const t = COPY[locale];
  const columns = buildColumns(t);
  return (
    <footer
      className={
        reveal
          ? "footer-reveal fixed inset-x-0 bottom-0 z-[1] h-[min(728px,100svh)] w-full overflow-clip bg-[#181818]"
          : "footer-reveal relative z-0 h-[min(728px,100svh)] w-full overflow-clip bg-[#181818]"
      }
      style={{
        backgroundImage:
          "linear-gradient(in oklab 90deg, oklab(94.9% -0.004 0.014 / 6%) 0%, oklab(0% 0 .0001 / 0%) 100%), linear-gradient(in oklab 180deg, oklab(94.9% -0.004 0.014 / 6%) 0%, oklab(0% 0 .0001 / 0%) 100%)",
      }}
    >
      {/* Grid backdrop — paper.design 10×10px lines @ 0.06 alpha */}
      <div
        aria-hidden
        className="grid-backdrop pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(239,239,228,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(239,239,228,0.06) 1px, transparent 1px)",
          backgroundSize: "10px 10px",
        }}
      />

      {/* Giant wordmark — paper.design "footer reveal" pattern */}
      <div
        aria-hidden
        className="absolute -bottom-3 flex items-end justify-center inset-x-0 sm:-bottom-5 md:-bottom-7.5"
      >
        <span className="text-[140px] font-extrabold leading-[85%] tracking-[-0.06em] text-[#EFEFE40F] sm:text-[220px] md:text-[320px] lg:text-[440px]">
          mizaan
        </span>
      </div>

      <div className="absolute top-12 bottom-8 inset-x-0 mx-auto flex w-full max-w-[1440px] flex-col justify-between gap-10 px-5 sm:gap-12 sm:px-8 md:top-20 md:bottom-16 md:gap-14 md:px-12 lg:gap-15 lg:px-20">
        {/* Top row: brand + 4 columns */}
        <div className="flex flex-col items-start gap-8 lg:flex-row lg:justify-between lg:gap-12">
          {/* Brand block */}
          <div className="flex max-w-[280px] shrink-0 flex-col gap-4 sm:gap-5">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex size-9 shrink-0 items-center justify-center">
                <MizaanIcon />
              </span>
              <span className="text-lg font-medium leading-[22px] tracking-[-0.02em] text-[#EFEFE4]">
                mizaan
              </span>
            </Link>
            <p className="m-0 text-sm leading-[160%] tracking-[-0.005em] text-[#EFEFE48C]">
              {t.tagline}
            </p>
            <span className="flex items-center gap-1.5 self-start rounded-[14px] border border-[#14F1952E] bg-[#14F19514] px-2.5 py-1.25">
              <span
                aria-hidden
                className="size-1.25 shrink-0 rounded-full bg-[#14F195]"
                style={{ boxShadow: "0 0 6px rgba(20,241,149,0.6)" }}
              />
              <span className="font-mono text-[10px] leading-3 font-medium text-[#14F195]">
                {t.statusChip}
              </span>
            </span>
          </div>

          {/* Link columns */}
          <div className="grid w-full grid-cols-2 items-start gap-x-6 gap-y-8 sm:grid-cols-4 sm:gap-x-8 lg:flex lg:w-auto lg:gap-12">
            {columns.map((col) => (
              <div key={col.title} className="flex min-w-0 flex-col gap-3 lg:min-w-30">
                <span className="mb-1 font-mono text-[11px] leading-[14px] font-medium uppercase tracking-[0.06em] text-[#EFEFE466]">
                  {col.title}
                </span>
                {col.links.map((link) => {
                  const className =
                    "text-sm leading-[18px] text-[#EFEFE4BF] transition-colors hover:text-[#EFEFE4]";
                  if (!link.href) {
                    return (
                      <span
                        key={link.label}
                        className="text-sm leading-[18px] text-[#EFEFE4BF] opacity-70"
                      >
                        {link.label}
                      </span>
                    );
                  }
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className={className}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[11px] leading-[14px] uppercase tracking-[0.04em] text-[#EFEFE46B]">
              {t.copyright}
            </span>
            <a
              href="mailto:team@mizaan.id"
              className="text-base leading-[22px] tracking-[-0.01em] text-[#EFEFE4CC] transition-colors hover:text-[#EFEFE4] sm:text-lg"
            >
              team@mizaan.id
            </a>
          </div>

          <a
            href="#top"
            className="hidden flex-col items-center gap-2 opacity-40 transition-opacity hover:opacity-70 sm:flex"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
              <path
                d="M11 17V5M5 11l6-6 6 6"
                stroke="#EFEFE4"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-mono text-[10px] leading-3 tracking-[0.04em] text-[#EFEFE46B]">
              {t.scrollTop}
            </span>
          </a>

          <div className="flex flex-col items-start gap-1.5 sm:items-end">
            <span className="font-mono text-[10px] leading-[14px] uppercase tracking-[0.04em] text-[#EFEFE46B] sm:text-[11px]">
              {t.hackathon}
            </span>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] leading-[14px] sm:gap-2.5 sm:text-[11px]">
              <span className="text-[#EFEFE452]">{t.submittedTo}</span>
              <span className="font-medium text-[#14F195]">superteam earn</span>
              <span className="text-[#EFEFE452]">+</span>
              <span className="font-medium text-[#14F195]">colosseum frontier</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
