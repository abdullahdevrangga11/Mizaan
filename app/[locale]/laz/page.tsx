import { getLocale } from "next-intl/server";
import { Navbar } from "@/components/navbar";
import { FooterReveal } from "@/components/footer-reveal";
import { LazStats } from "@/components/laz-directory/laz-stats";
import { LazGrid } from "./laz-grid";
import { MOCK_LAZ } from "@/lib/api/mock-laz";
import { listActiveLazPublic } from "@/lib/db/laz";
import type { SupportedLocale } from "@/lib/constants";

const COPY: Record<
  SupportedLocale,
  {
    eyebrow: string;
    headline: (count: number) => string;
    subtitle: string;
    statVerified: string;
    statMustahik: string;
    statRegions: string;
    grid: Parameters<typeof LazGrid>[0]["copy"];
  }
> = {
  id: {
    eyebrow: "// laz directory · all baznas-verified",
    headline: (count) => `${count} mitra laz aktif.`,
    subtitle:
      "setiap LAZ di mizaan ditampilkan dengan cryptographic identity attestation. data live dari solana — tidak bisa dipalsukan. pilih partner sesuai kebutuhan zakat anda.",
    statVerified: "VERIFIED",
    statMustahik: "MUSTAHIK",
    statRegions: "REGIONS",
    grid: {
      filters: {
        jurisdictionLabel: "yurisdiksi",
        regionLabel: "region",
        jurisdictionAll: "all",
        jurisdictionNational: "nasional",
        jurisdictionProvincial: "provinsi",
        jurisdictionRegency: "kabupaten",
        jurisdictionMosque: "masjid",
        regionAll: "all",
        regionDIY: "diy",
        regionJakarta: "jakarta",
        regionIndonesia: "indonesia",
      },
      sort: {
        legend: "urutkan",
        received: "total diterima",
        mustahik: "jumlah mustahik",
        name: "nama (a–z)",
      },
      card: {
        received: "DITERIMA",
        distributed: "DISALURKAN",
        mustahik: "MUSTAHIK",
        donor: "DONATUR",
        verifiedOnChain: "verified",
        detailCta: "lihat detail",
      },
      empty: {
        title: "tidak ada laz cocok",
        subtitle:
          "coba longgarkan filter yurisdiksi atau region untuk melihat lebih banyak partner.",
      },
    },
  },
  en: {
    eyebrow: "// laz directory · all baznas-verified",
    headline: (count) => `${count} active laz partners.`,
    subtitle:
      "every LAZ on mizaan is displayed with a cryptographic identity attestation. data live from solana — uncounterfeitable. pick a partner that matches your zakat intent.",
    statVerified: "VERIFIED",
    statMustahik: "MUSTAHIK",
    statRegions: "REGIONS",
    grid: {
      filters: {
        jurisdictionLabel: "jurisdiction",
        regionLabel: "region",
        jurisdictionAll: "all",
        jurisdictionNational: "national",
        jurisdictionProvincial: "provincial",
        jurisdictionRegency: "regency",
        jurisdictionMosque: "mosque",
        regionAll: "all",
        regionDIY: "diy",
        regionJakarta: "jakarta",
        regionIndonesia: "indonesia",
      },
      sort: {
        legend: "sort by",
        received: "total received",
        mustahik: "mustahik count",
        name: "name (a–z)",
      },
      card: {
        received: "RECEIVED",
        distributed: "DISTRIBUTED",
        mustahik: "MUSTAHIK",
        donor: "DONORS",
        verifiedOnChain: "verified",
        detailCta: "view detail",
      },
      empty: {
        title: "no matching laz",
        subtitle:
          "try loosening the jurisdiction or region filters to see more partners.",
      },
    },
  },
};

export default async function LazDirectoryPage() {
  const locale = (await getLocale()) as SupportedLocale;
  const copy = COPY[locale];

  // Read the real LAZ directory from Supabase. Fall back to MOCK_LAZ if
  // the table is empty or unreachable so an unseeded environment still
  // shows the design.
  const { data: realLaz } = await listActiveLazPublic();
  const laz = realLaz && realLaz.length > 0 ? realLaz : MOCK_LAZ;

  const totalLaz = laz.length;
  const totalMustahik = laz.reduce((sum, l) => sum + l.mustahikCount, 0);
  const uniqueRegions = new Set(
    laz.map((l) => l.region.toLowerCase()),
  ).size;

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
            className="pointer-events-none absolute -left-32 top-12 h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(20,241,149,0.12),transparent)] blur-3xl"
          />

          <div className="relative mx-auto flex max-w-[1280px] flex-col gap-10 px-5 pb-16 pt-10 sm:gap-12 sm:px-8 sm:pb-24 sm:pt-16 md:px-12 md:pt-20 lg:px-8">
            {/* Hero */}
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
              <div className="flex max-w-[720px] flex-col gap-3 sm:gap-3.5">
                <span className="font-mono text-[11px] leading-4 tracking-[0.04em] text-[#14F195A6] sm:text-xs">
                  {copy.eyebrow}
                </span>
                <h1 className="m-0 text-[28px] font-medium leading-[105%] tracking-[-0.025em] text-[#EFEFE4] sm:text-[36px] md:text-[44px] lg:text-[52px]">
                  {copy.headline(totalLaz)}
                </h1>
                <p className="m-0 max-w-[560px] text-[13px] leading-[155%] text-[#EFEFE48C] sm:text-[15px]">
                  {copy.subtitle}
                </p>
              </div>

              <div className="w-full shrink-0 lg:max-w-[360px]">
                <LazStats
                  items={[
                    {
                      label: copy.statVerified,
                      value: String(totalLaz),
                      mono: true,
                    },
                    {
                      label: copy.statMustahik,
                      value: String(totalMustahik),
                      emphasis: true,
                    },
                    {
                      label: copy.statRegions,
                      value: String(uniqueRegions),
                      mono: true,
                    },
                  ]}
                />
              </div>
            </div>

            {/* Grid + filters */}
            <LazGrid laz={laz} locale={locale} copy={copy.grid} />
          </div>
        </section>
      </main>
      <FooterReveal locale={locale} reveal />
    </>
  );
}
