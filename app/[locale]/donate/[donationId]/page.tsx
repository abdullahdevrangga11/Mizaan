import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";
import { Navbar } from "@/components/navbar";
import { FooterReveal } from "@/components/footer-reveal";
import { Button } from "@/components/ui/button";
import {
  CATEGORY_LABELS,
  DONATION_TYPE_LABELS,
  type SupportedLocale,
} from "@/lib/constants";
import { formatRupiah, shortenAddress } from "@/lib/utils";
import { MOCK_LAZ } from "@/lib/api/mock-laz";
import type { ApiResult, DonationMeta } from "@/lib/types";

interface SuccessPageProps {
  params: Promise<{ locale: string; donationId: string }>;
}

/** Resolve the donation via /api/donations?pda=&lt;id&gt;. The route handles
 *  mock vs real-mode internally, so this is the same code path either way. */
async function fetchDonation(
  donationId: string,
): Promise<DonationMeta | null> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3001";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const url = `${proto}://${host}/api/donations?pda=${encodeURIComponent(donationId)}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  const json = (await res.json()) as ApiResult<DonationMetaWire>;
  if (json.error || !json.data) return null;

  // Wire format encodes bigint as string (JSON has no BigInt).
  return {
    ...json.data,
    amountIdrz: BigInt(json.data.amountIdrz),
    totalDistributedIdrz: BigInt(json.data.totalDistributedIdrz ?? "0"),
  };
}

type DonationMetaWire = Omit<
  DonationMeta,
  "amountIdrz" | "totalDistributedIdrz"
> & {
  amountIdrz: string;
  totalDistributedIdrz: string;
};

function getMockLazName(lazId: string): string {
  return (
    MOCK_LAZ.find((l) => l.id === lazId)?.name ?? lazId.toLowerCase()
  );
}

export default async function DonationSuccessPage({
  params,
}: SuccessPageProps) {
  const { donationId } = await params;
  const locale = (await getLocale()) as SupportedLocale;
  const t = await getTranslations("donate.success");

  const donation = await fetchDonation(donationId);
  if (!donation) {
    notFound();
  }
  const lazName = getMockLazName(donation.lazId);

  const rows: Array<{ label: string; value: React.ReactNode; mono?: boolean }> =
    [
      {
        label: t("amountLabel"),
        value: (
          <span className="text-[20px] font-medium tracking-tight text-text">
            {formatRupiah(donation.amountIdrz)}
          </span>
        ),
      },
      {
        label: t("lazLabel"),
        value: lazName.toLowerCase(),
      },
      {
        label: t("categoryLabel"),
        value:
          donation.categoryPreference.length === 0
            ? "—"
            : donation.categoryPreference
                .map((c) => CATEGORY_LABELS[c][locale].toLowerCase())
                .join(", "),
      },
      {
        label: t("donationPda"),
        value: shortenAddress(donation.donationCommitmentPda, 8, 8),
        mono: true,
      },
      {
        label: t("transferSig"),
        value: shortenAddress(donation.tokenTransferSignature, 8, 8),
        mono: true,
      },
      {
        label: t("statusLabel"),
        value: <span className="chip chip-verified">{t("statusPending")}</span>,
      },
    ];

  return (
    <>
      <Navbar locale={locale} variant="compact" />
      <main className="relative z-[2] mb-[728px] min-h-[calc(100dvh-4rem)] bg-[#181818]">
        <section className="relative isolate">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[420px] grid-backdrop-subtle"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(20,241,149,0.14),transparent)] blur-3xl"
          />

          <div className="relative mx-auto flex min-h-[78vh] max-w-[760px] flex-col px-5 pb-16 pt-10 sm:px-8 sm:pb-24 sm:pt-16 md:pt-20 lg:px-6 lg:pt-24">
            {/* Verified glyph */}
            <div className="mb-8 flex items-center gap-3 sm:mb-10">
              <span
                aria-hidden
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
              >
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 8.5l3.2 3.2L13 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="chip chip-verified">{t("eyebrow")}</span>
            </div>

            <h1 className="text-balance text-[28px] font-semibold leading-[1.08] tracking-[-0.02em] text-text sm:text-[40px] md:text-[52px]">
              {t("title")}
            </h1>
            <p className="mt-4 max-w-[600px] text-[14px] leading-relaxed text-text-secondary sm:mt-5 sm:text-[15px]">
              {t("subtitle")}
            </p>

            {/* Summary card */}
            <div className="card-mizaan mt-8 divide-y divide-white/[0.06] overflow-hidden sm:mt-12">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className="flex flex-col items-start gap-1.5 px-5 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 sm:px-6"
                >
                  <span className="font-mono text-[11px] tracking-[0.04em] text-text-muted lowercase">
                    {row.label}
                  </span>
                  <span
                    className={
                      row.mono
                        ? "break-all font-mono text-[12px] text-text-secondary sm:text-[13px]"
                        : "break-words text-left text-[14px] text-text sm:text-right"
                    }
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-6 font-mono text-[11px] tracking-[0.04em] text-text-muted lowercase">
              // donation type:{" "}
              {DONATION_TYPE_LABELS[donation.donationType][
                locale
              ].toLowerCase()}
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:mt-12 sm:flex-row sm:flex-wrap">
              <Link href={`/track/${donation.donorWallet}`} className="w-full sm:w-auto">
                <Button size="lg" className="w-full lowercase sm:w-auto">
                  {t("ctaTrack")} →
                </Button>
              </Link>
              <Link href="/" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full lowercase sm:w-auto">
                  {t("ctaHome")}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <FooterReveal locale={locale} reveal />
    </>
  );
}
