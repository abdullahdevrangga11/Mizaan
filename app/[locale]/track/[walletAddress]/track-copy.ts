import type { CategoryTotal } from "@/components/track/category-breakdown";
import type { DonorSummary } from "@/components/track/donor-summary";
import type { DistributionCard } from "@/components/track/distribution-card";
import type { SupportedLocale } from "@/lib/constants";

/**
 * Locale copy for /track. Lives in a shared module so it can be imported by
 * both the server page (for the DonorSummary rendered server-side) AND the
 * client TrackBody (which uses the function-shaped fields like
 * `confirmed(timeAgo)` inside DistributionCard). Importing in both places
 * avoids passing functions across the server→client boundary.
 */
export interface TrackCopy {
  summary: Parameters<typeof DonorSummary>[0]["copy"];
  categories: Array<{ key: string; label: string; count: number }>;
  breakdown: { sortBy: string; filter: string; share: string };
  share: {
    label: string;
    copied: string;
    payload: (totalRupiah: string, n: number) => string;
  };
  featuredHeader: { title: string; meta: string };
  distributionCardCopy: Parameters<typeof DistributionCard>[0]["copy"];
  breakdownHeading: string;
  categoryTotals: CategoryTotal[];
  otherList: {
    heading: (count: number) => string;
    viewAll: string;
    collapse: string;
    noResults: string;
    walletAttribution: (wallet: string) => string;
    onChain: string;
  };
}

export const trackCopy: Record<SupportedLocale, TrackCopy> = {
  id: {
    summary: {
      hero: {
        tag: "// my zakat · year 2026",
        heading: "jejak zakat anda.",
        sub: "setiap rupiah, terlacak end-to-end. dari wallet anda di singapore ke mustahik di kampung halaman.",
      },
      stats: {
        total: { label: "TOTAL ZAKAT 2026", meta: "+ 22M IDRZ", via: "via dompet dhuafa yogya" },
        mustahik: { label: "MUSTAHIK SERVED", sub: "across 5 categories · 4 regions" },
        confirmed: { label: "CONFIRMATION RATE", sub: "mustahik confirmed receipt" },
        avgTime: { label: "AVG TIME TO CONFIRM", unit: "jam", sub: "tradisional: 6-12 bulan" },
      },
    },
    categories: [
      { key: "all", label: "all categories", count: 0 },
      { key: "PENDIDIKAN", label: "pendidikan", count: 12 },
      { key: "KESEHATAN", label: "kesehatan", count: 7 },
      { key: "MODAL_USAHA", label: "modal usaha", count: 5 },
      { key: "SANDANG_PANGAN", label: "sandang", count: 3 },
    ],
    breakdown: { sortBy: "sort: most recent", filter: "filter", share: "share" },
    share: {
      label: "share",
      copied: "tersalin",
      payload: (total, n) =>
        `saya zakat ${total} tahun ini, terdistribusi ke ${n} mustahik. lihat: mizaan.id/share/abc`,
    },
    featuredHeader: { title: "DISTRIBUSI TERAKHIR", meta: "4 jam yang lalu" },
    distributionCardCopy: {
      step1: "DONATION COMMITMENT",
      step1Donor: "donor signed",
      step2: "DISTRIBUTION DECISION",
      step3: "RECEIPT CONFIRMATION",
      fresh: "✓ FRESH",
      pdaLabel: "PDA",
      confirmed: (t) => `✓ confirmed · ${t}`,
      encryptedMessage: "PESAN DARI MUSTAHIK · ENCRYPTED",
      signature: "signature",
    },
    breakdownHeading: "RINCIAN PER KATEGORI · 22M IDRZ TERDISTRIBUSI",
    categoryTotals: [
      { key: "PENDIDIKAN", label: "pendidikan", amountIdrz: 9_600_000n, mustahikCount: 12, share: 9.6 / 22, accent: "primary" },
      { key: "KESEHATAN", label: "kesehatan", amountIdrz: 5_400_000n, mustahikCount: 7, share: 5.4 / 22, accent: "neutral" },
      { key: "MODAL_USAHA", label: "modal usaha", amountIdrz: 4_000_000n, mustahikCount: 5, share: 4 / 22, accent: "neutral" },
      { key: "SANDANG_PANGAN", label: "sandang & pangan", amountIdrz: 3_000_000n, mustahikCount: 3, share: 3 / 22, accent: "neutral" },
    ],
    otherList: {
      heading: (n) => `${n} OTHER DISTRIBUTIONS · ALL CONFIRMED`,
      viewAll: "view all →",
      collapse: "show less ↑",
      noResults: "tidak ada distribusi di kategori ini.",
      walletAttribution: (w) => `donor wallet · ${w}`,
      onChain: "all attestations on-chain · solana devnet",
    },
  },
  en: {
    summary: {
      hero: {
        tag: "// my zakat · year 2026",
        heading: "your zakat trail.",
        sub: "every rupiah, tracked end-to-end. from your wallet in singapore to a mustahik back home.",
      },
      stats: {
        total: { label: "TOTAL ZAKAT 2026", meta: "+ 22M IDRZ", via: "via dompet dhuafa yogya" },
        mustahik: { label: "MUSTAHIK SERVED", sub: "across 5 categories · 4 regions" },
        confirmed: { label: "CONFIRMATION RATE", sub: "mustahik confirmed receipt" },
        avgTime: { label: "AVG TIME TO CONFIRM", unit: "hrs", sub: "traditional: 6-12 months" },
      },
    },
    categories: [
      { key: "all", label: "all categories", count: 0 },
      { key: "PENDIDIKAN", label: "education", count: 12 },
      { key: "KESEHATAN", label: "health", count: 7 },
      { key: "MODAL_USAHA", label: "business capital", count: 5 },
      { key: "SANDANG_PANGAN", label: "clothing & food", count: 3 },
    ],
    breakdown: { sortBy: "sort: most recent", filter: "filter", share: "share" },
    share: {
      label: "share",
      copied: "copied",
      payload: (total, n) =>
        `i gave ${total} of zakat this year, distributed to ${n} mustahik. see: mizaan.id/share/abc`,
    },
    featuredHeader: { title: "LATEST DISTRIBUTION", meta: "4 hours ago" },
    distributionCardCopy: {
      step1: "DONATION COMMITMENT",
      step1Donor: "donor signed",
      step2: "DISTRIBUTION DECISION",
      step3: "RECEIPT CONFIRMATION",
      fresh: "✓ FRESH",
      pdaLabel: "PDA",
      confirmed: (t) => `✓ confirmed · ${t}`,
      encryptedMessage: "MESSAGE FROM MUSTAHIK · ENCRYPTED",
      signature: "signature",
    },
    breakdownHeading: "BREAKDOWN BY CATEGORY · 22M IDRZ DISTRIBUTED",
    categoryTotals: [
      { key: "PENDIDIKAN", label: "education", amountIdrz: 9_600_000n, mustahikCount: 12, share: 9.6 / 22, accent: "primary" },
      { key: "KESEHATAN", label: "health", amountIdrz: 5_400_000n, mustahikCount: 7, share: 5.4 / 22, accent: "neutral" },
      { key: "MODAL_USAHA", label: "business capital", amountIdrz: 4_000_000n, mustahikCount: 5, share: 4 / 22, accent: "neutral" },
      { key: "SANDANG_PANGAN", label: "clothing & food", amountIdrz: 3_000_000n, mustahikCount: 3, share: 3 / 22, accent: "neutral" },
    ],
    otherList: {
      heading: (n) => `${n} OTHER DISTRIBUTIONS · ALL CONFIRMED`,
      viewAll: "view all →",
      collapse: "show less ↑",
      noResults: "no distributions in this category.",
      walletAttribution: (w) => `donor wallet · ${w}`,
      onChain: "all attestations on-chain · solana devnet",
    },
  },
};
