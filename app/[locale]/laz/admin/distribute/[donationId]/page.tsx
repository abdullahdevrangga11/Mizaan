/**
 * /laz/admin/distribute/[donationId] — LAZ admin distribution form.
 *
 * Server shell that loads a (mock) donation by id, builds the pre-filled
 * distribution rows, hands an inline mustahik pool to the client form, and
 * mounts everything inside <AdminShell />.
 *
 * Per PRD §7.2 (Flow B — Bu Sri) and SRS §11.5.
 */
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { AdminShell } from "@/components/laz-admin/admin-shell";
import { DistributeForm } from "./distribute-form";
import type { DistributionRowData } from "@/components/laz-admin/distribution-row";
import type { PickerMustahik } from "@/components/laz-admin/mustahik-picker";
import type { Category, DonationType } from "@/lib/types";
import type { SupportedLocale } from "@/lib/constants";
import { requireLazAdminSession } from "@/lib/auth/laz-session";

export const metadata: Metadata = {
  title: "distribusi · laz admin · mizaan",
  description:
    "alokasikan donasi ke mustahik terdaftar dan tanda tangani distribusi on-chain.",
};

interface PageProps {
  params: Promise<{ locale: string; donationId: string }>;
}

interface MockDonation {
  id: string;
  shortId: string;
  donorWallet: string;
  donorDisplayName: string;
  donationType: DonationType;
  amountIdrz: bigint;
  primaryCategory: Category;
}

/**
 * Mock donation fixture — single happy-path donation for V1 demo. The
 * `donationId` is echoed into `id` so any URL slug works in dev.
 */
function getMockDonation(donationId: string): MockDonation {
  return {
    id: donationId,
    shortId: "#DN-2026-0428",
    donorWallet: "7xKX...bW2",
    donorDisplayName: "Sarah Y.",
    donationType: "ZAKAT_MAL",
    amountIdrz: 22_000_000n,
    primaryCategory: "PENDIDIKAN",
  };
}

const PRE_FILLED_ROWS: DistributionRowData[] = [
  {
    index: 1,
    mustahikLabel: "Pak Yusuf #1247",
    mustahikRegionAge: "Bantul, DIY · adult",
    amountIdrz: 800_000n,
    category: "PENDIDIKAN",
    asnaf: "MISKIN",
    purpose: "biaya sekolah anak SMP semester 2",
    categoryTier: "primary",
    status: "ready",
  },
  {
    index: 2,
    mustahikLabel: "Bu Hadi #1248",
    mustahikRegionAge: "Sleman, DIY · teen",
    amountIdrz: 1_200_000n,
    category: "PENDIDIKAN",
    asnaf: "MISKIN",
    purpose: "biaya kuliah semester 4 · UGM Sastra",
    categoryTier: "primary",
    status: "ready",
  },
  {
    index: 3,
    mustahikLabel: "Pak Hasan #1251",
    mustahikRegionAge: "Yogyakarta · elder",
    amountIdrz: 600_000n,
    category: "KESEHATAN",
    asnaf: "FAKIR",
    purpose: "biaya berobat darah tinggi rutin",
    categoryTier: "neutral",
    status: "ready",
  },
];

const MUSTAHIK_POOL: PickerMustahik[] = [
  {
    id: "msthk-1289",
    internalId: "#1289",
    initials: "BA",
    fullDisplayName: "Bu Aminah",
    region: "Bandung",
    asnaf: "MISKIN",
    ageRange: "ADULT",
  },
  {
    id: "msthk-1304",
    internalId: "#1304",
    initials: "PT",
    fullDisplayName: "Pak Tarmidzi",
    region: "Kulon Progo, DIY",
    asnaf: "FAKIR",
    ageRange: "ELDER",
  },
  {
    id: "msthk-1322",
    internalId: "#1322",
    initials: "BS",
    fullDisplayName: "Bu Siti Maryam",
    region: "Sleman, DIY",
    asnaf: "MISKIN",
    ageRange: "ADULT",
  },
  {
    id: "msthk-1356",
    internalId: "#1356",
    initials: "PI",
    fullDisplayName: "Pak Ibrahim",
    region: "Gunungkidul, DIY",
    asnaf: "GHARIMIN",
    ageRange: "ADULT",
  },
  {
    id: "msthk-1391",
    internalId: "#1391",
    initials: "SR",
    fullDisplayName: "Saudari Rahma",
    region: "Yogyakarta",
    asnaf: "MUALLAF",
    ageRange: "TEEN",
  },
];

export default async function LazAdminDistributePage({ params }: PageProps) {
  const { donationId } = await params;
  const locale = (await getLocale()) as SupportedLocale;
  const safeLocale: SupportedLocale = locale === "en" ? "en" : "id";

  // Auth gate. No session -> redirect to /laz/login preserving this URL.
  await requireLazAdminSession(
    safeLocale,
    `/${safeLocale}/laz/admin/distribute/${donationId}`,
  );

  const donation = getMockDonation(donationId);

  return (
    <AdminShell
      currentNav="incoming"
      locale={locale}
      breadcrumb={[
        { label: locale === "id" ? "Distribusi" : "Distribution" },
        { label: locale === "id" ? "Incoming" : "Incoming" },
        { label: `Donation ${donation.shortId}`, current: true },
      ]}
    >
      <DistributeForm
        locale={locale}
        donation={donation}
        initialRows={PRE_FILLED_ROWS}
        pool={MUSTAHIK_POOL}
      />
    </AdminShell>
  );
}
