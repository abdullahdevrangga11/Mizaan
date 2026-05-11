"use client";

import { useEffect, useMemo, useState } from "react";
import type { Category } from "@/lib/types";
import type { SupportedLocale } from "@/lib/constants";
import { SearchInput, type VerifyTab } from "@/components/verify/search-input";
import { EmptyState } from "@/components/verify/empty-state";
import { ResultCard } from "@/components/verify/result-card";
import { ChainRow, type DistributionRow } from "@/components/verify/chain-row";

// Wire response shape from GET /api/verify/[identifier].
interface VerifyApiResponse {
  donation: {
    id: string;
    donationCommitmentPda: string;
    donorWallet: string;
    amountIdrz: string;
    donationType: string;
    tokenTransferSignature: string;
    status: string;
    createdAt: string;
    laz: { slug: string; name: string; region: string; wallet_address: string };
  };
  distributions: Array<{
    id: string;
    distributionDecisionPda: string;
    mustahikInitials: string | null;
    mustahikRegion: string | null;
    amountIdrz: string;
    category: string;
    asnaf: string;
    purposeDescription: string;
    tokenTransferSignature: string;
    receiptPda: string | null;
    receiptConfirmedAt: string | null;
    createdAt: string;
  }>;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const month = d.toLocaleString("en-US", { month: "short" }).toLowerCase();
  const day = d.getDate();
  const hour = d.getHours().toString().padStart(2, "0");
  const min = d.getMinutes().toString().padStart(2, "0");
  return `${day} ${month} · ${hour}:${min}`;
}

interface VerifyFormProps {
  locale: SupportedLocale;
}

// ---------- copy ----------

const copy = {
  id: {
    eyebrow: "// public verifier · zero gatekeepers",
    headline: "verifikasi donasi mizaan.",
    subtitle:
      "paste alamat wallet, attestation pda, atau scan qr code. lihat full chain donasi langsung dari solana, tanpa pihak ketiga, tanpa akun.",
    search: {
      placeholder: "paste wallet address, attestation pda, atau scan qr code…",
      verify: "verify",
      shortcut: "⌘ K",
      tabs: {
        wallet: "by donor wallet",
        pda: "by attestation pda",
        donation: "by donation id",
      },
      examplesLabel: "contoh:",
      exampleWallet: "7xKX...bW2pNa",
      examplePda: "3xK7Pm9...f9Bm",
    },
    empty: {
      eyebrow: "menunggu input",
      title: "tidak ada riwayat untuk ditampilkan.",
      description:
        "paste wallet, attestation pda, atau donation id di atas — semua data hidup langsung di solana devnet dan bisa dibaca siapa pun.",
      hints: {
        wallet: "wallet base58 · 32–44 char",
        pda: "attestation pda · solana sas",
        donation: "donation id · uuid v4",
      },
    },
    result: {
      verifiedTag: "VERIFIED ON-CHAIN",
      fetched: "data fetched 3s ago via helius rpc",
      explorer: "view on solana explorer ↗",
      stats: {
        total: { label: "TOTAL DONASI", meta: "2026 · 1 wallet · 1 laz partner" },
        distribution: {
          label: "DISTRIBUSI",
          meta: "2 categories · DIY/Jakarta",
        },
        confirmation: {
          label: "CONFIRMATION",
          meta: "avg 4.2 hours · all valid signatures",
        },
        attestations: {
          label: "ATTESTATIONS",
          meta: "3 donations · 3 distributions · 3 receipts",
        },
      },
    },
    chain: {
      sectionTitle: "chain audit · 3 distribusi",
      sectionMeta: "newest first · semua bisa diverifikasi terpisah",
      verified: "verified",
      signed: "3-of-3 signed",
      indexLabel: (current: number, total: number) => `#${current} of ${total}`,
      rupiahLabel: (idrz: string) => `${idrz} IDRZ`,
      explorerAria: "lihat di solana explorer",
    },
    trust: {
      pill: "verified on solana devnet",
      readable: "publicly readable",
      noAccounts: "zero accounts required",
      latency: "latency: 287ms",
      raw: "view raw json ↗",
    },
  },
  en: {
    eyebrow: "// public verifier · zero gatekeepers",
    headline: "verify any mizaan donation.",
    subtitle:
      "paste a wallet address, attestation pda, or scan a qr code. read the full donation chain straight from solana — no middlemen, no accounts.",
    search: {
      placeholder: "paste wallet address, attestation pda, or scan qr code…",
      verify: "verify",
      shortcut: "⌘ K",
      tabs: {
        wallet: "by donor wallet",
        pda: "by attestation pda",
        donation: "by donation id",
      },
      examplesLabel: "try:",
      exampleWallet: "7xKX...bW2pNa",
      examplePda: "3xK7Pm9...f9Bm",
    },
    empty: {
      eyebrow: "awaiting input",
      title: "nothing to show yet.",
      description:
        "paste a wallet, attestation pda, or donation id above — every record lives directly on solana devnet and is readable by anyone.",
      hints: {
        wallet: "base58 wallet · 32–44 chars",
        pda: "attestation pda · solana sas",
        donation: "donation id · uuid v4",
      },
    },
    result: {
      verifiedTag: "VERIFIED ON-CHAIN",
      fetched: "data fetched 3s ago via helius rpc",
      explorer: "view on solana explorer ↗",
      stats: {
        total: { label: "TOTAL DONATED", meta: "2026 · 1 wallet · 1 laz partner" },
        distribution: {
          label: "DISTRIBUTIONS",
          meta: "2 categories · DIY/Jakarta",
        },
        confirmation: {
          label: "CONFIRMATION",
          meta: "avg 4.2 hours · all valid signatures",
        },
        attestations: {
          label: "ATTESTATIONS",
          meta: "3 donations · 3 distributions · 3 receipts",
        },
      },
    },
    chain: {
      sectionTitle: "chain audit · 3 distributions",
      sectionMeta: "newest first · each verifiable on its own",
      verified: "verified",
      signed: "3-of-3 signed",
      indexLabel: (current: number, total: number) => `#${current} of ${total}`,
      rupiahLabel: (idrz: string) => `${idrz} IDRZ`,
      explorerAria: "open in solana explorer",
    },
    trust: {
      pill: "verified on solana devnet",
      readable: "publicly readable",
      noAccounts: "zero accounts required",
      latency: "latency: 287ms",
      raw: "view raw json ↗",
    },
  },
} as const;

// ---------- mock data ----------

interface MockDistribution {
  id: string;
  recipient: string;
  purpose: string;
  region: string;
  category: Category;
  amountIdrz: bigint;
  donorPda: string;
  donorTime: string;
  donorBlock: string;
  amilName: string;
  amilWallet: string;
  amilPda: string;
  amilTime: string;
  amilBlock: string;
  mustahikInitial: string;
  mustahikWallet: string;
  receiptPda: string;
  receiptTime: string;
  receiptBlock: string;
}

const MOCK_DISTRIBUTIONS: MockDistribution[] = [
  {
    id: "dist-yusuf",
    recipient: "Pak Yusuf",
    purpose: "biaya sekolah anak",
    region: "Bantul, DIY",
    category: "PENDIDIKAN",
    amountIdrz: 800_000n,
    donorPda: "3xK7Pm9k4tQrXzWnE5cHbT8sJ2dGyVrUaP6oYf9BmQr",
    donorTime: "22 apr · 14:32 wib",
    donorBlock: "234,567,890",
    amilName: "Bu Sri (LAZ amil)",
    amilWallet: "LzxDLDDY4nMpQs7e8fGhJkLmNbRtPwYa3xBcVvDD",
    amilPda: "8mR2sN5eYpKw9cT3aLhUvXz2bDc4qFgNoMrJk1c1KpYz",
    amilTime: "23 apr · 09:11 wib",
    amilBlock: "234,612,001",
    mustahikInitial: "Pak Y. (mustahik)",
    mustahikWallet: "9aFM3p7yQrXz2bDc4qFgNoMrJk1custodial",
    receiptPda: "9dL4xQ2vRm8tHsLpMnZxC5wYuVo3bN6kJh9h7mPv",
    receiptTime: "23 apr · 13:08 wib",
    receiptBlock: "234,634,775",
  },
  {
    id: "dist-hadi",
    recipient: "Bu Hadi",
    purpose: "biaya kuliah",
    region: "Yogyakarta, DIY",
    category: "PENDIDIKAN",
    amountIdrz: 1_200_000n,
    donorPda: "3xK7Pm9k4tQrXzWnE5cHbT8sJ2dGyVrUaP6oYf9BmQr",
    donorTime: "22 apr · 14:32 wib",
    donorBlock: "234,567,890",
    amilName: "Pak Anwar (LAZ amil)",
    amilWallet: "LzxAMRJoYPq7c9hG4Rt6FxN1WeUbVk2zXyDDPP",
    amilPda: "5tQpZ8vEkFs3wYxLmNh2BcD9oRgKjUvAi6cMrXz4Lp",
    amilTime: "24 apr · 10:42 wib",
    amilBlock: "234,712,448",
    mustahikInitial: "Bu H. (mustahik)",
    mustahikWallet: "4dKsQ7zPxRv1bTcL9mWpEcustodial",
    receiptPda: "2gHvY6cKjXw3rTpNz5fAeUq8sLm1bZdR9xMnPo7tFq",
    receiptTime: "24 apr · 18:55 wib",
    receiptBlock: "234,738,912",
  },
  {
    id: "dist-hasan",
    recipient: "Pak Hasan",
    purpose: "biaya berobat",
    region: "Bekasi, Jabar",
    category: "KESEHATAN",
    amountIdrz: 600_000n,
    donorPda: "3xK7Pm9k4tQrXzWnE5cHbT8sJ2dGyVrUaP6oYf9BmQr",
    donorTime: "22 apr · 14:32 wib",
    donorBlock: "234,567,890",
    amilName: "Bu Lina (LAZ amil)",
    amilWallet: "LzxBKCpQuV7nRyGd5XaH3oWtUjYr2mDDWFFDDS",
    amilPda: "6kBmYx2RnEcUwLp4tQfZj9NoVrShAi3vMcKp7PdQrL",
    amilTime: "25 apr · 08:24 wib",
    amilBlock: "234,801,330",
    mustahikInitial: "Pak H. (mustahik)",
    mustahikWallet: "1bMpW9zAcN4yVcustodial",
    receiptPda: "7nRoXc1hKwYpZ5dBeUv2MqLs8FjAi6tCx3JmVrPo9Lq",
    receiptTime: "25 apr · 16:02 wib",
    receiptBlock: "234,829,778",
  },
];

// ---------- main ----------

export function VerifyForm({ locale }: VerifyFormProps) {
  const c = copy[locale === "en" ? "en" : "id"];
  const [value, setValue] = useState("");
  const [activeTab, setActiveTab] = useState<VerifyTab>("WALLET");
  const [apiData, setApiData] = useState<VerifyApiResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const trimmed = value.trim();
  const isResolved = trimmed.length >= 32;

  // Fetch the real chain whenever the user pastes a viable identifier.
  // Debounced lightly to avoid hammering the API on each keystroke.
  useEffect(() => {
    if (!isResolved) {
      setApiData(null);
      setApiError(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setApiError(null);
      try {
        const res = await fetch(`/api/verify/${encodeURIComponent(trimmed)}`, {
          cache: "no-store",
        });
        const json = (await res.json()) as
          | { data: VerifyApiResponse; error: null }
          | { data: null; error: { code: string; message: string } };
        if (cancelled) return;
        if (!res.ok || json.error) {
          setApiData(null);
          setApiError(json.error?.message ?? `HTTP ${res.status}`);
        } else {
          setApiData(json.data);
        }
      } catch (err) {
        if (cancelled) return;
        setApiError(err instanceof Error ? err.message : "fetch failed");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isResolved, trimmed]);

  const distributions: DistributionRow[] = useMemo(() => {
    if (!apiData) return [];
    const donorTime = formatTimestamp(apiData.donation.createdAt);
    return apiData.distributions.map((d) => ({
      id: d.id,
      recipientLabel: d.mustahikInitials ?? "(anonymized)",
      purpose: d.purposeDescription,
      region: d.mustahikRegion ?? "",
      category: d.category as Category,
      amountIdrz: BigInt(d.amountIdrz),
      steps: [
        {
          n: "1",
          schema: "DONATION_V1",
          signatoryName: "Donor wallet",
          signatoryWallet: apiData.donation.donorWallet,
          timestamp: donorTime,
          blockHeight: "—",
          pda: apiData.donation.donationCommitmentPda,
        },
        {
          n: "2",
          schema: "DISTRIBUTION_V1",
          signatoryName: `${apiData.donation.laz.name} (LAZ amil)`,
          signatoryWallet: apiData.donation.laz.wallet_address,
          timestamp: formatTimestamp(d.createdAt),
          blockHeight: "—",
          pda: d.distributionDecisionPda,
        },
        {
          n: "3",
          schema: "RECEIPT_V1",
          signatoryName: d.mustahikInitials
            ? `${d.mustahikInitials} (mustahik)`
            : "(unconfirmed)",
          signatoryWallet: "",
          timestamp: d.receiptConfirmedAt
            ? formatTimestamp(d.receiptConfirmedAt)
            : "pending",
          blockHeight: "—",
          pda: d.receiptPda ?? "—",
        },
      ],
    }));
  }, [apiData]);

  const totalIdrz = useMemo(
    () =>
      distributions.reduce<bigint>((sum, d) => sum + d.amountIdrz, 0n),
    [distributions],
  );

  return (
    <>
      {/* Hero */}
      <section className="flex flex-col items-center gap-5 px-5 pt-12 pb-8 sm:gap-7 sm:px-8 sm:pt-16 sm:pb-12 md:px-12 md:pt-20 lg:px-20">
        <span className="font-mono text-[11px] leading-4 tracking-[0.04em] text-[#14F195A6] sm:text-[12px]">
          {c.eyebrow}
        </span>
        <h1
          className="m-0 max-w-[920px] text-center text-[28px] font-medium leading-[105%] tracking-[-0.03em] text-[#EFEFE4] sm:text-[36px] md:text-[44px] lg:text-[52px]"
        >
          {c.headline}
        </h1>
        <p className="m-0 max-w-[600px] text-center text-[14px] leading-[160%] tracking-[-0.005em] text-[#EFEFE48C] sm:text-[16px]">
          {c.subtitle}
        </p>

        <SearchInput
          value={value}
          onChange={setValue}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isResolved={isResolved}
          copy={c.search}
        />
      </section>

      {/* Result vs empty state */}
      {isResolved ? (
        <section className="flex flex-col gap-3.5 px-5 pb-12 sm:px-8 md:px-12 lg:px-20">
          <ResultCard
            walletAddress={trimmed}
            totalIdrz={totalIdrz}
            distributionCount={distributions.length}
            confirmedCount={distributions.length}
            attestationCount={distributions.length * 3}
            copy={c.result}
          />

          {/* Section header for chain rows */}
          <div className="mt-3 flex flex-col items-start gap-2 border-t border-[#FFFFFF0F] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="m-0 text-[15px] font-medium leading-[18px] tracking-[-0.005em] text-[#EFEFE4]">
              {c.chain.sectionTitle}
            </h2>
            <span className="font-mono text-[11px] leading-[14px] text-[#EFEFE466]">
              {c.chain.sectionMeta}
            </span>
          </div>

          <div className="flex flex-col">
            {distributions.map((dist, i) => (
              <ChainRow
                key={dist.id}
                index={i}
                total={distributions.length}
                distribution={dist}
                copy={{
                  index: c.chain.indexLabel,
                  verified: c.chain.verified,
                  rupiahLabel: c.chain.rupiahLabel,
                  signed: c.chain.signed,
                  explorer: c.chain.explorerAria,
                }}
              />
            ))}
          </div>

          {/* Trust strip */}
          <div className="mt-1.5 flex flex-col gap-3 rounded-[12px] border border-[#FFFFFF0D] bg-[#161616] px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div className="flex items-start gap-3 sm:items-center sm:gap-3.5">
              <span
                aria-hidden
                className="mt-1 size-1.5 shrink-0 rounded-full bg-[#14F195] sm:mt-0"
                style={{ boxShadow: "0 0 6px rgba(20,241,149,0.7)" }}
              />
              <span className="font-mono text-[11px] leading-4 text-[#EFEFE48C] sm:text-[12px]">
                {c.trust.pill}
                <span className="text-[#EFEFE452]"> · </span>
                {c.trust.readable}
                <span className="text-[#EFEFE452]"> · </span>
                {c.trust.noAccounts}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3.5 sm:justify-end">
              <span className="font-mono text-[11px] leading-[14px] text-[#EFEFE466]">
                {c.trust.latency}
              </span>
              <a
                href="#"
                className="font-mono text-[11px] leading-[14px] text-[#14F195] underline decoration-1 underline-offset-2"
              >
                {c.trust.raw}
              </a>
            </div>
          </div>
        </section>
      ) : (
        <EmptyState copy={c.empty} />
      )}
    </>
  );
}
