import { getLocale } from "next-intl/server";
import { Navbar } from "@/components/navbar";
import { FooterReveal } from "@/components/footer-reveal";
import { PulseDot } from "@/components/feed/pulse-dot";
import { LiveMetrics } from "@/components/feed/live-metrics";
import type { SupportedLocale } from "@/lib/constants";
import type { Category, FeedEventType } from "@/lib/types";
import type { FeedItemView } from "@/components/feed/feed-item";
import { FeedStream } from "./feed-stream";

const COPY = {
  eyebrow: {
    id: "// aktivitas live · solana devnet",
    en: "// live activity · solana devnet",
  },
  headline: {
    id: "saksikan zakat mengalir.",
    en: "watch zakat flow.",
  },
  subtitle: {
    id: "data live streaming dari semua 79 LAZ. semua mustahik anonim (initials + region). cryptographic proof, zero PII.",
    en: "live stream across all 79 LAZ. every mustahik is anonymized (initials + region). cryptographic proof, zero PII.",
  },
  pulse: {
    id: "streaming · supabase realtime",
    en: "streaming · supabase realtime",
  },
} as const;

/* -------------------------------------------------------------- */
/*  Deterministic seed mock generation. The same seed produces    */
/*  the same 20 items so SSR and the first client render match.   */
/* -------------------------------------------------------------- */

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4_294_967_296;
  };
}

const SEED = 0xC0FFEE;

const INITIALS = [
  "Pak Y.",
  "Bu H.",
  "Pak H.",
  "Bu A.",
  "Pak S.",
  "Bu N.",
  "Pak R.",
  "Bu I.",
  "Pak D.",
  "Bu M.",
];

const REGIONS = [
  "Yogyakarta",
  "Jakarta",
  "Surabaya",
  "Bandung",
  "Bantul",
  "Sleman",
  "Cianjur",
  "Bogor",
];

interface SeedLaz {
  slug: string;
  name: string;
}

const LAZS: SeedLaz[] = [
  { slug: "dompet-dhuafa", name: "Dompet Dhuafa Yogya" },
  { slug: "rumah-zakat", name: "Rumah Zakat" },
  { slug: "izi", name: "IZI" },
  { slug: "baznas-pusat", name: "BAZNAS Pusat" },
  { slug: "laz-aksi-cepat", name: "LAZ Aksi Cepat" },
  { slug: "laz-ugm", name: "LAZ UGM Yogyakarta" },
  { slug: "lazismu", name: "Lazismu" },
];

const PURPOSES_BY_CAT: Record<Category, string[]> = {
  PENDIDIKAN: ["biaya sekolah anak SMP", "biaya kuliah", "buku & seragam"],
  KESEHATAN: ["biaya berobat", "obat rutin lansia", "fisioterapi"],
  MODAL_USAHA: ["modal warung kelontong", "alat jahit", "modal gerobak nasi"],
  SANDANG_PANGAN: ["sembako bulanan", "kebutuhan dapur", "pakaian anak"],
  BIAYA_HIDUP: ["uang transport", "biaya kontrakan"],
  BENCANA: ["korban banjir", "logistik pengungsi"],
  FAKIR_MISKIN: ["bantuan fakir"],
  MUALLAF: ["pembinaan muallaf"],
  RIQAB: ["pembebasan utang"],
  GHARIMIN: ["bantuan gharimin"],
  FISABILILLAH: ["operasional masjid"],
  IBNU_SABIL: ["musafir terlantar"],
};

const ACTIVE_CATS: Category[] = [
  "PENDIDIKAN",
  "KESEHATAN",
  "MODAL_USAHA",
  "SANDANG_PANGAN",
  "BIAYA_HIDUP",
  "BENCANA",
];

const EVENT_WEIGHTS: { type: FeedEventType; weight: number }[] = [
  { type: "RECEIPT_CONFIRMED", weight: 5 },
  { type: "DISTRIBUTION_CREATED", weight: 4 },
  { type: "DONATION_CREATED", weight: 3 },
];

const PDA_ALPHABET =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function pickWeighted(rng: () => number): FeedEventType {
  const total = EVENT_WEIGHTS.reduce((s, w) => s + w.weight, 0);
  const r = rng() * total;
  let acc = 0;
  for (const opt of EVENT_WEIGHTS) {
    acc += opt.weight;
    if (r < acc) return opt.type;
  }
  return "RECEIPT_CONFIRMED";
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)] as T;
}

function fakePda(rng: () => number, length = 44): string {
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += PDA_ALPHABET[Math.floor(rng() * PDA_ALPHABET.length)] ?? "1";
  }
  return out;
}

function pickAmount(rng: () => number, type: FeedEventType): bigint {
  if (type === "DONATION_CREATED") {
    const buckets = [500_000n, 1_000_000n, 2_500_000n, 25_000_000n];
    return pick(rng, buckets);
  }
  const buckets = [
    200_000n,
    400_000n,
    600_000n,
    800_000n,
    1_200_000n,
    1_500_000n,
    2_500_000n,
  ];
  return pick(rng, buckets);
}

/**
 * Build the initial 20 items. Use a fixed reference timestamp so that
 * the SSR output is stable on every render — the client takes over
 * with its own generation loop after hydration.
 */
function buildInitialItems(): FeedItemView[] {
  const rng = mulberry32(SEED);
  // Reference moment "now" for the fixed seeded snapshot. We use a fixed
  // epoch so SSR + initial CSR match. The client's interval immediately
  // pushes new items with real `Date.now()` after hydration.
  const reference = new Date("2026-05-05T09:00:00.000Z").getTime();

  const items: FeedItemView[] = [];
  for (let i = 0; i < 20; i += 1) {
    const eventType = pickWeighted(rng);
    const cat = pick(rng, ACTIVE_CATS);
    const purposes = PURPOSES_BY_CAT[cat] ?? [];
    const region = pick(rng, REGIONS);
    const initials =
      eventType === "DONATION_CREATED" ? null : pick(rng, INITIALS);
    const laz = pick(rng, LAZS);
    const amount = pickAmount(rng, eventType);
    // Each successive item is "older". Spacing mixed: 30s–8m.
    const minutesAgo = i * 2 + Math.floor(rng() * 3);
    const occurredAt = new Date(reference - minutesAgo * 60_000);

    items.push({
      id: `seed-${i}-${SEED.toString(16)}`,
      eventType,
      amountIdrz: amount.toString(),
      category: cat,
      region: eventType === "DONATION_CREATED" ? null : region,
      mustahikInitials: initials,
      lazSlug: laz.slug,
      lazName: laz.name,
      purposeShort:
        purposes.length > 0 ? (pick(rng, purposes) as string) : null,
      occurredAt: occurredAt.toISOString(),
      attestationPda: fakePda(rng),
      fresh: false,
    });
  }
  return items;
}

export default async function FeedPage() {
  const locale = (await getLocale()) as SupportedLocale;
  const initialItems = buildInitialItems();

  // Mock running totals — would be a Supabase aggregation in prod.
  const distributedTodayIdrz = 84_000_000n;
  const mustahikReachedToday = 147;
  const avgTimeToConfirmSeconds = 4 * 3600 + 12 * 60; // 4h 12m

  // Distinct regions actually present in the data, used to populate
  // the region-filter pills.
  const regions = Array.from(
    new Set(
      initialItems
        .map((i) => i.region)
        .filter((r): r is string => typeof r === "string"),
    ),
  ).sort();

  return (
    <>
      <Navbar locale={locale} variant="compact" />
      <main id="top" className="relative z-[2] mb-[728px] min-h-[calc(100dvh-4rem)] bg-[#181818]">
       <div className="mx-auto w-full max-w-[1440px]">
        {/* ------------------------------------------------------- */}
        {/*  Hero strip                                             */}
        {/* ------------------------------------------------------- */}
        <section className="flex flex-col gap-6 px-5 pt-8 pb-6 sm:px-8 sm:pt-10 md:flex-row md:items-end md:justify-between md:gap-8 md:px-12 md:pt-12 md:pb-7 lg:gap-12 lg:px-20">
          <div className="flex grow shrink basis-0 flex-col gap-2.5">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <span className="font-mono text-[11px] leading-4 tracking-[0.04em] text-[#14F195A6] sm:text-xs">
                {COPY.eyebrow[locale]}
              </span>
              <span className="flex items-center gap-1.5 rounded-lg border border-solid border-[#14F19538] bg-[#14F1951A] px-2.5 py-1 sm:px-3 sm:py-1.25">
                <PulseDot size="xs" tone="live" />
                <span className="font-mono text-[10px] leading-[14px] font-medium text-[#14F195] sm:text-[11px]">
                  {COPY.pulse[locale]}
                </span>
              </span>
            </div>
            <h1 className="m-0 max-w-[640px] text-[28px] leading-[105%] tracking-[-0.025em] text-[#EFEFE4] font-medium sm:text-[34px] md:text-[42px]">
              {COPY.headline[locale]}
            </h1>
            <p className="m-0 max-w-[520px] text-[13px] leading-[155%] text-[#EFEFE48C] sm:text-sm">
              {COPY.subtitle[locale]}
            </p>
          </div>

          <LiveMetrics
            locale={locale}
            distributedTodayIdrz={distributedTodayIdrz}
            mustahikReachedToday={mustahikReachedToday}
            avgTimeToConfirmSeconds={avgTimeToConfirmSeconds}
            allTimeDistributedLabel="Rp 4.7B"
            allTimeDistributionCount={12_403}
          />
        </section>

        {/* ------------------------------------------------------- */}
        {/*  Filters + live list (client island)                    */}
        {/* ------------------------------------------------------- */}
        <FeedStream
          locale={locale}
          initialItems={initialItems}
          regions={regions}
        />
       </div>
      </main>
      <FooterReveal locale={locale} reveal />
    </>
  );
}
