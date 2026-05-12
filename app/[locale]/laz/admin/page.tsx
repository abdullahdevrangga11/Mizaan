import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { Navbar } from "@/components/navbar";
import { FooterReveal } from "@/components/footer-reveal";
import { requireLazAdminSession } from "@/lib/auth/laz-session";
import { LogoutButton } from "./logout-button";
import { listDonationsForLaz } from "@/lib/db/donations";
import { listActiveLazPublic } from "@/lib/db/laz";
import { formatRupiah, shortenAddress } from "@/lib/utils";
import type { SupportedLocale } from "@/lib/constants";

export const metadata: Metadata = {
  title: "laz admin · mizaan",
  description: "Mizaan LAZ admin dashboard — pending donations + distributions.",
};

export default async function LazAdminIndexPage() {
  const locale = (await getLocale()) as SupportedLocale;
  const safeLocale = locale === "en" ? "en" : "id";

  // Auth gate. Anyone without a session is redirected to /laz/login.
  const session = await requireLazAdminSession(
    safeLocale,
    `/${safeLocale}/laz/admin`,
  );

  // Surface pending donations across all active LAZ (no scoping yet — every
  // demo judge currently sees the same queue). Soft fallbacks keep the page
  // alive if either query returns empty.
  const { data: lazList } = await listActiveLazPublic();
  const firstLaz = lazList?.[0] ?? null;

  let pendingCount = 0;
  let recentDonations: Array<{
    pda: string;
    amount: bigint;
    createdAt: string;
  }> = [];
  if (firstLaz) {
    const { data: donations } = await listDonationsForLaz(
      firstLaz.id,
      "PENDING_DISTRIBUTION",
      10,
    );
    if (donations) {
      pendingCount = donations.length;
      recentDonations = donations.map((d) => ({
        pda: d.donationCommitmentPda,
        amount: d.amountIdrz,
        createdAt: d.createdAt,
      }));
    }
  }

  const t =
    locale === "id"
      ? {
          eyebrow: "// laz admin",
          headline: "selamat datang.",
          subtitle:
            "kelola donasi masuk, distribusikan ke mustahik terdaftar, dan tanda tangani receipt on-chain.",
          loggedInAs: "MASUK SEBAGAI",
          statQueue: "ANTRIAN DISTRIBUSI",
          statLazScope: "LAZ AKTIF",
          statAttest: "ATTESTATION SCHEMA",
          recentEyebrow: "// donasi tertunda",
          recentNoneTitle: "tidak ada donasi tertunda.",
          recentNoneBody:
            "semua donasi yang masuk sudah didistribusikan. silakan kembali setelah ronde donasi berikutnya.",
          distributeCta: "buka distribusi",
        }
      : {
          eyebrow: "// laz admin",
          headline: "welcome.",
          subtitle:
            "manage incoming donations, allocate to verified mustahik, and sign receipts on-chain.",
          loggedInAs: "LOGGED IN AS",
          statQueue: "PENDING QUEUE",
          statLazScope: "ACTIVE LAZ",
          statAttest: "ATTESTATION SCHEMAS",
          recentEyebrow: "// pending donations",
          recentNoneTitle: "no pending donations.",
          recentNoneBody:
            "every incoming donation has been distributed. check back after the next donor round.",
          distributeCta: "open distribute",
        };

  return (
    <>
      <Navbar locale={locale} variant="compact" />
      <main className="relative z-[2] mb-[728px] min-h-[calc(100dvh-4rem)] bg-[#181818]">
        <section className="relative isolate overflow-x-clip">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(239,239,228,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(239,239,228,0.04) 1px, transparent 1px)",
              backgroundSize: "10px 10px",
            }}
          />
          <div className="relative mx-auto flex max-w-[1100px] flex-col gap-10 px-5 pb-16 pt-12 sm:gap-12 sm:px-8 sm:pt-16 md:px-12 lg:px-8">
            {/* Header strip */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
              <div className="flex flex-col gap-3">
                <span className="font-mono text-[11px] leading-4 tracking-[0.04em] text-[#14F195A6] sm:text-xs">
                  {t.eyebrow}
                </span>
                <h1 className="m-0 text-[28px] font-medium leading-[105%] tracking-[-0.025em] text-[#EFEFE4] sm:text-[36px] md:text-[44px]">
                  {t.headline}
                </h1>
                <p className="m-0 max-w-[640px] text-[13px] leading-[155%] text-[#EFEFE48C] sm:text-[15px]">
                  {t.subtitle}
                </p>
              </div>
              <div className="flex flex-col items-start gap-2 rounded-[12px] border border-[#FFFFFF12] bg-[#1A1A1A] px-4 py-3 sm:items-end">
                <span className="font-mono text-[10px] leading-3 uppercase tracking-[0.06em] text-[#EFEFE466]">
                  {t.loggedInAs}
                </span>
                <span className="font-mono text-[12px] leading-4 text-[#EFEFE4]">
                  {session.email}
                </span>
                <LogoutButton locale={safeLocale} />
              </div>
            </div>

            {/* Stat row */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatCell
                label={t.statQueue}
                value={String(pendingCount)}
                emphasis
              />
              <StatCell
                label={t.statLazScope}
                value={String(lazList?.length ?? 0)}
              />
              <StatCell label={t.statAttest} value="5" mono />
            </div>

            {/* Recent donations */}
            <section className="flex flex-col gap-4">
              <span className="font-mono text-[11px] leading-4 tracking-[0.04em] text-[#14F195A6]">
                {t.recentEyebrow}
              </span>
              {recentDonations.length === 0 ? (
                <div className="rounded-[14px] border border-dashed border-[#FFFFFF14] bg-[#141414] px-5 py-10 text-center">
                  <div className="m-0 text-[15px] font-medium leading-5 text-[#EFEFE4]">
                    {t.recentNoneTitle}
                  </div>
                  <p className="mx-auto mt-2 max-w-[420px] text-[12px] leading-5 text-[#EFEFE48C]">
                    {t.recentNoneBody}
                  </p>
                </div>
              ) : (
                <ul className="flex flex-col gap-2">
                  {recentDonations.map((d) => (
                    <li
                      key={d.pda}
                      className="flex flex-col gap-2 rounded-[12px] border border-[#FFFFFF12] bg-[#1A1A1A] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-[10px] leading-3 uppercase tracking-[0.06em] text-[#EFEFE466]">
                          DONATION
                        </span>
                        <span className="font-mono text-[12px] leading-4 text-[#EFEFE4D9]">
                          {shortenAddress(d.pda, 8, 8)}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-[10px] leading-3 uppercase tracking-[0.06em] text-[#EFEFE466]">
                          AMOUNT
                        </span>
                        <span className="text-[15px] font-medium leading-5 text-[#EFEFE4]">
                          {formatRupiah(d.amount)}
                        </span>
                      </div>
                      <Link
                        href={`/${safeLocale}/laz/admin/distribute/${d.pda}`}
                        className="flex items-center justify-center gap-2 rounded-[10px] border border-[#14F1952E] bg-[#14F19514] px-3.5 py-2 font-mono text-[11px] font-medium leading-4 tracking-[0.04em] text-[#14F195] transition-colors hover:bg-[#14F1951F]"
                      >
                        {t.distributeCta} →
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </section>
      </main>
      <FooterReveal locale={locale} reveal />
    </>
  );
}

function StatCell({
  label,
  value,
  emphasis,
  mono,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  mono?: boolean;
}) {
  return (
    <div
      className={
        emphasis
          ? "flex flex-col gap-1.5 rounded-[14px] border border-[#14F1952E] bg-[#14F1950A] px-5 py-4"
          : "flex flex-col gap-1.5 rounded-[14px] border border-[#FFFFFF12] bg-[#1A1A1A] px-5 py-4"
      }
      style={
        emphasis
          ? { boxShadow: "inset 0 1px 0 rgba(20,241,149,0.18)" }
          : { boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }
      }
    >
      <span className="font-mono text-[10px] leading-3 uppercase tracking-[0.06em] text-[#EFEFE466]">
        {label}
      </span>
      <span
        className={
          mono
            ? "font-mono text-[28px] leading-8 text-[#EFEFE4]"
            : "text-[28px] font-medium leading-8 tracking-[-0.02em] text-[#EFEFE4]"
        }
      >
        {value}
      </span>
    </div>
  );
}
