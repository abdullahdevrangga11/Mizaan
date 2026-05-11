/**
 * <AdminShell />
 *
 * Reusable shell for the LAZ admin panel — sidebar + top header.
 * Owned by the laz-admin/distribute agent (this directory) but designed
 * to be reused by other LAZ admin pages (incoming queue, mustahik registry,
 * monthly summary, etc.) by passing a `currentNav` key.
 *
 * Mirrors Paper artboard `OFG-0` left rail and top breadcrumb bar.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import type { SupportedLocale } from "@/lib/constants";
import { MizaanIcon } from "@/components/mizaan-icon";

export type AdminNavKey =
  | "incoming"
  | "awaiting"
  | "completed"
  | "mustahik"
  | "monthly"
  | "audit";

interface AdminShellProps {
  currentNav: AdminNavKey;
  locale: SupportedLocale;
  /** Breadcrumb tail — last segment is the highlighted current entity. */
  breadcrumb: { label: string; current?: boolean }[];
  children: ReactNode;
}

interface NavItem {
  key: AdminNavKey;
  label: { id: string; en: string };
  count?: number;
  group: "DISTRIBUSI" | "REPORTING";
  icon: ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    key: "incoming",
    label: { id: "incoming", en: "incoming" },
    count: 3,
    group: "DISTRIBUSI",
    icon: (
      <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-[#14F195]" />
    ),
  },
  {
    key: "awaiting",
    label: { id: "awaiting confirm", en: "awaiting confirm" },
    count: 8,
    group: "DISTRIBUSI",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <circle cx="7" cy="7" r="5.5" stroke="#EFEFE46B" strokeWidth="1.3" />
        <path
          d="M7 4v3l2 2"
          stroke="#EFEFE46B"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    key: "completed",
    label: { id: "completed", en: "completed" },
    count: 247,
    group: "DISTRIBUSI",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <path
          d="M3 7l3 3 5-6"
          stroke="#EFEFE46B"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: "mustahik",
    label: { id: "mustahik registry", en: "mustahik registry" },
    count: 142,
    group: "DISTRIBUSI",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <circle cx="5" cy="5" r="2" stroke="#EFEFE46B" strokeWidth="1.3" />
        <path
          d="M2 12c0-1.7 1.5-3 3-3s3 1.3 3 3M9 4l2 2 3-3"
          stroke="#EFEFE46B"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    key: "monthly",
    label: { id: "monthly summary", en: "monthly summary" },
    group: "REPORTING",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <path
          d="M2 11l3-3 3 3 5-6"
          stroke="#EFEFE46B"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: "audit",
    label: { id: "audit export (PDF)", en: "audit export (PDF)" },
    group: "REPORTING",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <path
          d="M3 2h6l3 3v7c0 .6-.4 1-1 1H3c-.6 0-1-.4-1-1V3c0-.6.4-1 1-1z"
          stroke="#EFEFE46B"
          strokeWidth="1.3"
        />
        <path d="M9 2v3h3" stroke="#EFEFE46B" strokeWidth="1.3" />
      </svg>
    ),
  },
];

const SEARCH_LABEL: Record<SupportedLocale, string> = {
  id: "cari donasi atau mustahik...",
  en: "search donations or mustahik...",
};

export function AdminShell({
  currentNav,
  locale,
  breadcrumb,
  children,
}: AdminShellProps) {
  const distribusi = NAV_ITEMS.filter((n) => n.group === "DISTRIBUSI");
  const reporting = NAV_ITEMS.filter((n) => n.group === "REPORTING");

  return (
    <div className="flex min-h-screen bg-[#181818] text-[#EFEFE4]">
      {/* ---------------- Sidebar (hidden on mobile/tablet) ---------------- */}
      <aside
        aria-label="laz admin nav"
        className="sticky top-0 z-30 hidden h-screen w-60 shrink-0 flex-col border-r border-[#FFFFFF0F] bg-[#161616] lg:flex"
      >
        {/* Brand + LAZ chip */}
        <div className="flex flex-col gap-3.5 border-b border-[#FFFFFF0F] px-4.5 py-5">
          <Link href="/" className="flex items-center gap-2.25">
            <span className="flex size-6 shrink-0 items-center justify-center">
              <MizaanIcon />
            </span>
            <span className="flex flex-col">
              <span className="text-sm leading-[18px] font-medium tracking-[-0.015em] text-[#EFEFE4]">
                mizaan
              </span>
              <span className="font-mono text-[9px] leading-3 text-[#EFEFE46B]">
                laz panel · admin
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-2.5 rounded-[9px] border border-[#FFFFFF12] bg-[#FFFFFF0A] px-3 py-2.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-[7px] border border-[#FFFFFF12] bg-[#222222]">
              <span className="text-[11px] leading-3.5 font-bold text-[#EFEFE4D9]">
                DD
              </span>
            </span>
            <span className="flex min-w-0 grow basis-0 flex-col">
              <span className="truncate text-xs leading-4 font-medium text-[#EFEFE4]">
                Dompet Dhuafa Yogya
              </span>
              <span className="truncate font-mono text-[9px] leading-3 text-[#EFEFE46B]">
                verified · BAZNAS-LAZ-DIY-04
              </span>
            </span>
          </div>
        </div>

        {/* Nav groups */}
        <nav className="flex grow basis-0 flex-col gap-0.5 px-3 py-3.5">
          <NavGroupHeader>DISTRIBUSI</NavGroupHeader>
          {distribusi.map((item) => (
            <NavRow
              key={item.key}
              item={item}
              active={item.key === currentNav}
              locale={locale}
            />
          ))}
          <div className="mt-3.5">
            <NavGroupHeader>REPORTING</NavGroupHeader>
          </div>
          {reporting.map((item) => (
            <NavRow
              key={item.key}
              item={item}
              active={item.key === currentNav}
              locale={locale}
            />
          ))}
        </nav>

        {/* Active amil chip */}
        <div className="border-t border-[#FFFFFF0F] px-3 py-3.5">
          <div className="flex items-center gap-2.5 rounded-[9px] bg-[#FFFFFF06] px-2.5 py-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#14F19538] bg-[#14F1951A]">
              <span className="text-xs leading-4 font-semibold text-[#14F195]">
                BS
              </span>
            </span>
            <span className="flex min-w-0 grow basis-0 flex-col">
              <span className="truncate text-[13px] leading-4 font-medium text-[#EFEFE4]">
                Bu Sri R.
              </span>
              <span className="truncate font-mono text-[10px] leading-3 text-[#EFEFE46B]">
                amil · jabar/diy
              </span>
            </span>
          </div>
        </div>
      </aside>

      {/* ---------------- Main column ---------------- */}
      <div className="flex min-w-0 grow basis-0 flex-col">
        {/* Breadcrumb / top bar */}
        <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between gap-3 border-b border-[#FFFFFF0F] bg-[#181818CC] px-5 py-3.5 backdrop-blur-xl sm:px-8 sm:py-4.5">
          <nav
            aria-label="breadcrumb"
            className="flex min-w-0 items-center gap-2"
          >
            {/* Compact mobile brand badge — sidebar is hidden under lg */}
            <Link
              href="/"
              className="flex shrink-0 items-center gap-1.5 lg:hidden"
              aria-label="mizaan"
            >
              <span className="flex size-5 shrink-0 items-center justify-center">
                <MizaanIcon />
              </span>
            </Link>
            <span aria-hidden className="font-mono text-[11px] leading-3.5 text-[#EFEFE44D] lg:hidden">
              /
            </span>
            {breadcrumb.map((crumb, i) => (
              <span
                key={`${crumb.label}-${i}`}
                className="flex min-w-0 items-center gap-2"
              >
                {i > 0 ? (
                  <span className="font-mono text-[11px] leading-3.5 text-[#EFEFE44D]">
                    /
                  </span>
                ) : null}
                <span
                  className={
                    crumb.current
                      ? "truncate font-mono text-[11px] leading-3.5 font-medium text-[#EFEFE4]"
                      : "hidden truncate font-mono text-[11px] leading-3.5 text-[#EFEFE46B] sm:inline"
                  }
                >
                  {crumb.label}
                </span>
              </span>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3.5">
            <button
              type="button"
              aria-label={SEARCH_LABEL[locale]}
              className="hidden items-center gap-1.5 rounded-lg border border-[#FFFFFF12] bg-[#FFFFFF0D] px-3 py-1.25 text-xs leading-4 text-[#EFEFE48C] transition-colors hover:text-[#EFEFE4] md:flex"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden
                className="shrink-0"
              >
                <circle
                  cx="5"
                  cy="5"
                  r="3.5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
                <path
                  d="M8 8l3 3"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
              <span>{SEARCH_LABEL[locale]}</span>
            </button>
            <span className="flex items-center gap-1.5 rounded-lg border border-[#14F1952E] bg-[#14F19514] px-2 py-1 sm:px-3 sm:py-1.25">
              <span
                aria-hidden
                className="size-1.25 shrink-0 rounded-full bg-[#14F195]"
                style={{ boxShadow: "0 0 6px rgba(20,241,149,0.6)" }}
              />
              <span className="font-mono text-[10px] leading-3.5 font-medium text-[#14F195] sm:text-[11px]">
                <span className="hidden sm:inline">solana devnet · </span>live
              </span>
            </span>
          </div>
        </header>

        {/* Page content */}
        <div className="flex min-w-0 grow basis-0 flex-col">{children}</div>
      </div>
    </div>
  );
}

function NavGroupHeader({ children }: { children: ReactNode }) {
  return (
    <div className="mb-1.5 px-2">
      <span className="font-mono text-[9px] leading-3 tracking-[0.06em] text-[#EFEFE44D]">
        {children}
      </span>
    </div>
  );
}

function NavRow({
  item,
  active,
  locale,
}: {
  item: NavItem;
  active: boolean;
  locale: SupportedLocale;
}) {
  if (active) {
    return (
      <span
        className="flex items-center gap-2.5 rounded-lg border border-[#14F1952E] px-2.5 py-2"
        style={{
          backgroundImage:
            "linear-gradient(in oklab 90deg, oklab(84.4% -0.183 0.078 / 8%) 0%, oklab(20% -.0001 0) 100%)",
        }}
      >
        <span className="size-1.5 shrink-0 rounded-full bg-[#14F195]" />
        <span className="grow basis-0 text-[13px] leading-4 font-medium text-[#14F195]">
          {item.label[locale]}
        </span>
        {item.count !== undefined ? (
          <span className="font-mono text-[10px] leading-3 font-medium text-[#14F195]">
            {item.count}
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <button
      type="button"
      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-[#FFFFFF06]"
    >
      {item.icon}
      <span className="grow basis-0 text-left text-[13px] leading-4 text-[#EFEFE48C]">
        {item.label[locale]}
      </span>
      {item.count !== undefined ? (
        <span className="font-mono text-[10px] leading-3 text-[#EFEFE46B]">
          {item.count}
        </span>
      ) : null}
    </button>
  );
}
