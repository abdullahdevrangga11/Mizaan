import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./locale-switcher";
import { MizaanIcon } from "./mizaan-icon";

type NavVariant = "landing" | "compact";

interface NavbarProps {
  /** Locale-aware copy. Defaults to id when not provided. */
  locale?: "id" | "en";
  /**
   * `landing` (default) — full nav with section anchors + open-app CTA.
   * `compact` — brand + locale switcher + a single back-to-home link. Use for
   *   focused flows like `/donate` where section anchors are distracting.
   */
  variant?: NavVariant;
}

export function Navbar({ locale = "id", variant = "landing" }: NavbarProps) {
  const labels =
    locale === "en"
      ? {
          solusi: "solution",
          caraKerja: "how it works",
          dampak: "impact",
          testimoni: "testimonials",
          faq: "faq",
          roadmap: "roadmap",
          verifikasi: "verify",
          openApp: "open app",
          backToHome: "back to home",
        }
      : {
          solusi: "solusi",
          caraKerja: "cara kerja",
          dampak: "dampak",
          testimoni: "testimoni",
          faq: "faq",
          roadmap: "roadmap",
          verifikasi: "verifikasi",
          openApp: "open app",
          backToHome: "kembali ke beranda",
        };

  // Absolute-path hashes so the section anchors work from inner pages
  // (e.g. /verify, /track). On the landing page the browser performs
  // same-document scroll; on inner pages it navigates home + scrolls.
  const sections = [
    { label: labels.solusi, href: "/#solusi" },
    { label: labels.caraKerja, href: "/#cara-kerja" },
    { label: labels.dampak, href: "/#dampak" },
    { label: labels.testimoni, href: "/#testimoni" },
    { label: labels.faq, href: "/#faq" },
    { label: labels.roadmap, href: "/#roadmap" },
  ];

  return (
    <header
      className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-[#FFFFFF0F] bg-[#181818D9] px-4 backdrop-blur-xl sm:px-6 md:px-8"
      aria-label="primary"
    >
      <Link href="/" className="flex items-center gap-2.5">
        <span className="flex size-6 shrink-0 items-center justify-center">
          <MizaanIcon />
        </span>
        <span className="text-base font-medium tracking-[-0.02em] leading-5 text-[#EFEFE4]">
          mizaan
        </span>
      </Link>

      {variant === "landing" ? (
        <nav className="hidden items-center gap-8 md:flex" aria-label="sections">
          {sections.map((s) => (
            <a
              key={s.href}
              href={s.href}
              className="text-sm leading-[18px] text-[#EFEFE48C] transition-colors hover:text-[#EFEFE4]"
            >
              {s.label}
            </a>
          ))}
        </nav>
      ) : (
        <nav className="hidden items-center gap-2 md:flex" aria-label="back">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm leading-[18px] text-[#EFEFE48C] transition-colors hover:text-[#EFEFE4]"
          >
            <span aria-hidden>←</span>
            <span>{labels.backToHome}</span>
          </Link>
        </nav>
      )}

      <div className="flex items-center gap-2 sm:gap-3.5">
        <LocaleSwitcher />
        {variant === "landing" && (
          <>
            <Link
              href="/verify"
              className="hidden text-sm leading-[18px] text-[#EFEFE48C] transition-colors hover:text-[#EFEFE4] sm:inline"
            >
              {labels.verifikasi}
            </Link>
            <Link
              href="/donate"
              className="flex h-8 items-center gap-1.5 rounded-lg bg-[#EFEFE4] px-2.5 text-[12px] font-medium tracking-[-0.01em] leading-4 text-[#181818] transition-opacity hover:opacity-90 sm:px-3.5 sm:text-[13px]"
            >
              <span>{labels.openApp}</span>
              <span aria-hidden>→</span>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
