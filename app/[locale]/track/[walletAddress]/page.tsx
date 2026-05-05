import { Navbar } from "@/components/navbar";
import { FooterReveal } from "@/components/footer-reveal";
import { DonorSummary } from "@/components/track/donor-summary";
import type { DistributionView } from "@/components/track/distribution-card";
import type { SupportedLocale } from "@/lib/constants";
import { TrackBody } from "./track-body";
import { trackCopy } from "./track-copy";

// ─── mock data — 1 featured + 26 others = 27 distributions total ─────────────

const SARAH_WALLET = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU";
const COMMITMENT_PDA = "3xK7Pm9TdRzN5kWfQ8sLpV2bX4nM7jH9aE1cYf9BmQr";
const COMMITMENT_AT = "22 apr 2026 · 14:32 wib";

const FEATURED: DistributionView = {
  id: "dist-001",
  mustahikDisplayName: "Pak Yusuf",
  purpose: "biaya sekolah anak SMP semester 2",
  region: "Bantul, DIY",
  category: "PENDIDIKAN",
  amountIdrz: 800_000n,
  confirmedAgo: "4h ago",
  donationCommitmentPda: COMMITMENT_PDA,
  donationSignedAt: COMMITMENT_AT,
  distributionDecisionPda: "8mR2sN5pK7vL3xQ1bW4dT6fH9jY2cE8aN4mPc1KpYz",
  distributionByName: "Bu Sri (LAZ amil)",
  distributionDecidedAt: "23 apr 2026 · 09:11 wib",
  receiptPda: "9dL4xQ7nK3vR8mT5bW2pH6fJ1cE4aY7sN9mPh7mPv",
  receiptConfirmedBy: "Pak Yusuf confirmed",
  receiptConfirmedAt: "23 apr 2026 · 13:08 wib",
  thankYouMessage:
    "terima kasih atas zakatnya, sangat membantu sarah belajar di sekolah. semoga allah membalas kebaikannya.",
  iconKind: "school",
  fresh: true,
};

interface MockEntry {
  name: string;
  purpose: string;
  region: string;
  amount: bigint;
  ago: string;
  iconKind: DistributionView["iconKind"];
  decisionAt: string;
  receiptAt: string;
  amilName?: string;
}

const MOCK_BY_CATEGORY: Record<
  "PENDIDIKAN" | "KESEHATAN" | "MODAL_USAHA" | "SANDANG_PANGAN",
  MockEntry[]
> = {
  PENDIDIKAN: [
    { name: "Bu Hadi", purpose: "biaya kuliah semester 4", region: "Sleman, DIY", amount: 1_200_000n, ago: "3 days ago", iconKind: "school", decisionAt: "20 apr 2026 · 11:02 wib", receiptAt: "20 apr 2026 · 18:45 wib" },
    { name: "Adik Maya", purpose: "biaya sekolah SD", region: "Yogyakarta", amount: 350_000n, ago: "5 days ago", iconKind: "school", decisionAt: "18 apr 2026 · 10:14 wib", receiptAt: "18 apr 2026 · 16:30 wib" },
    { name: "Pak Bambang", purpose: "biaya pesantren", region: "Magelang, Jateng", amount: 950_000n, ago: "6 days ago", iconKind: "school", decisionAt: "17 apr 2026 · 09:40 wib", receiptAt: "17 apr 2026 · 19:12 wib" },
    { name: "Bu Indah", purpose: "biaya buku & seragam", region: "Klaten, Jateng", amount: 480_000n, ago: "1 week ago", iconKind: "school", decisionAt: "16 apr 2026 · 08:55 wib", receiptAt: "16 apr 2026 · 15:22 wib" },
    { name: "Adik Rafi", purpose: "beasiswa SMA", region: "Solo, Jateng", amount: 1_500_000n, ago: "9 days ago", iconKind: "school", decisionAt: "14 apr 2026 · 13:30 wib", receiptAt: "14 apr 2026 · 20:01 wib" },
    { name: "Pak Andi", purpose: "biaya kuliah anak", region: "Semarang, Jateng", amount: 2_000_000n, ago: "10 days ago", iconKind: "school", decisionAt: "13 apr 2026 · 14:48 wib", receiptAt: "13 apr 2026 · 21:14 wib" },
    { name: "Bu Rina", purpose: "biaya sekolah anak", region: "Sleman, DIY", amount: 600_000n, ago: "12 days ago", iconKind: "school", decisionAt: "11 apr 2026 · 11:24 wib", receiptAt: "11 apr 2026 · 17:48 wib" },
    { name: "Pak Joko", purpose: "biaya pendidikan tambahan", region: "Bantul, DIY", amount: 720_000n, ago: "13 days ago", iconKind: "school", decisionAt: "10 apr 2026 · 09:18 wib", receiptAt: "10 apr 2026 · 16:55 wib" },
    { name: "Bu Siti", purpose: "biaya kursus bahasa", region: "Kulonprogo, DIY", amount: 400_000n, ago: "15 days ago", iconKind: "school", decisionAt: "8 apr 2026 · 12:50 wib", receiptAt: "8 apr 2026 · 19:22 wib" },
    { name: "Adik Putri", purpose: "biaya sekolah SMP", region: "Sleman, DIY", amount: 550_000n, ago: "16 days ago", iconKind: "school", decisionAt: "7 apr 2026 · 14:05 wib", receiptAt: "7 apr 2026 · 20:45 wib" },
    { name: "Pak Toni", purpose: "biaya kuliah anak", region: "Yogyakarta", amount: 850_000n, ago: "18 days ago", iconKind: "school", decisionAt: "5 apr 2026 · 10:33 wib", receiptAt: "5 apr 2026 · 18:08 wib" },
  ],
  KESEHATAN: [
    { name: "Pak Hasan", purpose: "biaya berobat", region: "Yogyakarta", amount: 600_000n, ago: "1 week ago", iconKind: "medical", decisionAt: "16 apr 2026 · 10:18 wib", receiptAt: "16 apr 2026 · 21:30 wib", amilName: "Pak Imam (LAZ amil)" },
    { name: "Bu Yuni", purpose: "biaya operasi", region: "Bantul, DIY", amount: 3_500_000n, ago: "11 days ago", iconKind: "medical", decisionAt: "12 apr 2026 · 09:00 wib", receiptAt: "12 apr 2026 · 17:42 wib" },
    { name: "Pak Dwi", purpose: "obat rutin", region: "Sleman, DIY", amount: 250_000n, ago: "13 days ago", iconKind: "medical", decisionAt: "10 apr 2026 · 11:12 wib", receiptAt: "10 apr 2026 · 18:30 wib" },
    { name: "Bu Ani", purpose: "biaya periksa", region: "Yogyakarta", amount: 180_000n, ago: "14 days ago", iconKind: "medical", decisionAt: "9 apr 2026 · 13:25 wib", receiptAt: "9 apr 2026 · 19:50 wib" },
    { name: "Pak Sigit", purpose: "fisioterapi", region: "Magelang, Jateng", amount: 400_000n, ago: "17 days ago", iconKind: "medical", decisionAt: "6 apr 2026 · 10:08 wib", receiptAt: "6 apr 2026 · 17:55 wib", amilName: "Pak Imam (LAZ amil)" },
    { name: "Bu Ratna", purpose: "biaya rumah sakit", region: "Solo, Jateng", amount: 870_000n, ago: "19 days ago", iconKind: "medical", decisionAt: "4 apr 2026 · 12:40 wib", receiptAt: "4 apr 2026 · 20:11 wib" },
    { name: "Pak Yono", purpose: "biaya berobat anak", region: "Klaten, Jateng", amount: 290_000n, ago: "21 days ago", iconKind: "medical", decisionAt: "2 apr 2026 · 09:30 wib", receiptAt: "2 apr 2026 · 16:48 wib" },
  ],
  MODAL_USAHA: [
    { name: "Bu Aminah", purpose: "modal warung kelontong", region: "Bandung", amount: 2_500_000n, ago: "2 weeks ago", iconKind: "shop", decisionAt: "9 apr 2026 · 14:55 wib", receiptAt: "10 apr 2026 · 08:12 wib" },
    { name: "Pak Karim", purpose: "modal usaha rumahan", region: "Sleman, DIY", amount: 1_800_000n, ago: "16 days ago", iconKind: "shop", decisionAt: "7 apr 2026 · 11:18 wib", receiptAt: "7 apr 2026 · 19:00 wib" },
    { name: "Bu Wati", purpose: "modal jualan kue", region: "Yogyakarta", amount: 750_000n, ago: "18 days ago", iconKind: "shop", decisionAt: "5 apr 2026 · 09:42 wib", receiptAt: "5 apr 2026 · 17:20 wib" },
    { name: "Pak Heri", purpose: "modal bengkel", region: "Bantul, DIY", amount: 2_200_000n, ago: "20 days ago", iconKind: "shop", decisionAt: "3 apr 2026 · 13:55 wib", receiptAt: "3 apr 2026 · 21:08 wib" },
    { name: "Bu Nur", purpose: "modal produksi tempe", region: "Magelang, Jateng", amount: 1_350_000n, ago: "22 days ago", iconKind: "shop", decisionAt: "1 apr 2026 · 10:50 wib", receiptAt: "1 apr 2026 · 18:35 wib" },
  ],
  SANDANG_PANGAN: [
    { name: "Pak Sulaiman", purpose: "sandang & pangan", region: "Cianjur, Jabar", amount: 400_000n, ago: "3 weeks ago", iconKind: "basket", decisionAt: "2 apr 2026 · 13:40 wib", receiptAt: "2 apr 2026 · 19:02 wib", amilName: "Pak Imam (LAZ amil)" },
    { name: "Bu Tini", purpose: "kebutuhan harian", region: "Yogyakarta", amount: 350_000n, ago: "23 days ago", iconKind: "basket", decisionAt: "31 mar 2026 · 11:15 wib", receiptAt: "31 mar 2026 · 18:48 wib" },
    { name: "Pak Marno", purpose: "paket sembako", region: "Bantul, DIY", amount: 280_000n, ago: "25 days ago", iconKind: "basket", decisionAt: "29 mar 2026 · 09:55 wib", receiptAt: "29 mar 2026 · 17:30 wib" },
  ],
};

function buildOthers(): DistributionView[] {
  const out: DistributionView[] = [];
  let i = 2;
  const cats = ["PENDIDIKAN", "KESEHATAN", "MODAL_USAHA", "SANDANG_PANGAN"] as const;
  for (const cat of cats) {
    for (const m of MOCK_BY_CATEGORY[cat]) {
      const id = String(i).padStart(3, "0");
      out.push({
        id: `dist-${id}`,
        mustahikDisplayName: m.name,
        purpose: m.purpose,
        region: m.region,
        category: cat,
        amountIdrz: m.amount,
        confirmedAgo: m.ago,
        donationCommitmentPda: COMMITMENT_PDA,
        donationSignedAt: COMMITMENT_AT,
        distributionDecisionPda: pseudoBase58(`dec-${id}`, 43),
        distributionByName: m.amilName ?? "Bu Sri (LAZ amil)",
        distributionDecidedAt: m.decisionAt,
        receiptPda: pseudoBase58(`rec-${id}`, 43),
        receiptConfirmedBy: `${m.name} confirmed`,
        receiptConfirmedAt: m.receiptAt,
        thankYouMessage: null,
        iconKind: m.iconKind,
      });
      i += 1;
    }
  }
  return out;
}

function pseudoBase58(seed: string, length: number): string {
  const alphabet =
    "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let h = 2166136261;
  for (let k = 0; k < seed.length; k++) {
    h ^= seed.charCodeAt(k);
    h = Math.imul(h, 16777619);
  }
  let out = "";
  for (let k = 0; k < length; k++) {
    h = Math.imul(h ^ (h >>> 13), 1540483477);
    out += alphabet[(h >>> 0) % alphabet.length];
  }
  return out;
}

const OTHERS: DistributionView[] = buildOthers();

// ─── page ────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ locale: string; walletAddress: string }>;
}

export default async function DonorTrackPage({ params }: PageProps) {
  const { locale: rawLocale, walletAddress } = await params;
  const locale: SupportedLocale = rawLocale === "en" ? "en" : "id";
  const t = trackCopy[locale];

  const wallet = walletAddress || SARAH_WALLET;

  return (
    <>
      <Navbar locale={locale} variant="compact" />
      <main className="relative z-[2] mb-[728px] min-h-[calc(100dvh-4rem)] bg-bg">
        <div className="mx-auto w-full max-w-[1440px]">
          <DonorSummary
            walletAddress={wallet}
            totalIdrz={22_000_000n}
            mustahikCount={27}
            confirmedCount={27}
            avgConfirmHours={4.2}
            copy={t.summary}
          />

          <TrackBody
            locale={locale}
            featured={FEATURED}
            others={OTHERS}
            wallet={wallet}
            totalRupiahDisplay="Rp 22,000,000"
            mustahikCount={27}
          />
        </div>
      </main>
      <FooterReveal locale={locale} reveal />
    </>
  );
}
