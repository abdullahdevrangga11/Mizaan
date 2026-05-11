/**
 * Creates a handful of beautiful end-to-end donation chains for the demo.
 * Each chain: donation → distribution(s) → receipt(s), all real on-chain
 * SAS attestations on devnet plus the matching Supabase rows.
 *
 * Run AFTER `setup:devnet`, `seed:laz`, and `seed:mustahik`.
 *
 * Usage:
 *   npm run seed:demo
 */
import "./_lib/load-env";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

const LOG = "[mizaan/seed-demo]";

const HOST = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Donor "wallets" used for the demo. These are real-looking base58 strings —
// they don't need to be live wallets, just unique identifiers in the donor
// column. Mizaan stamps them into the attestation payload.
const DEMO_DONORS = [
  {
    wallet: "7xKXmRrFsHnL3eP2vTQbWzNcA5dM6sV9YpJg4kB8uH1F",
    name: "Sarah Y.",
    email: "sarah.diaspora@example.com",
  },
  {
    wallet: "9aHj2mTfDqRzXvKnPYsLoEcUu5RtJbN7gWxMkB4dV6Cf",
    name: "Ahmad R.",
    email: null,
  },
  {
    wallet: "4cMnPpKwXaDhJeFsRgT2zQyVuB8mLkNoYrJiHc6vAbS9",
    name: "Anonymous",
    email: null,
  },
];

const PURPOSES_BY_CATEGORY: Record<string, string[]> = {
  PENDIDIKAN: [
    "biaya sekolah anak SMP semester 2",
    "biaya kuliah semester 4 · UGM Sastra",
    "seragam dan buku tahun ajaran baru",
  ],
  KESEHATAN: [
    "biaya berobat darah tinggi rutin",
    "kontrol diabetes bulanan",
    "operasi katarak",
  ],
  MODAL_USAHA: [
    "modal awal warung kelontong",
    "renovasi gerobak bakso",
    "stok bahan baku jahit",
  ],
  SANDANG_PANGAN: [
    "beras dan sembako bulanan",
    "pakaian musim hujan",
    "perlengkapan dapur",
  ],
};

const PICKABLE_CATEGORIES = ["PENDIDIKAN", "KESEHATAN", "MODAL_USAHA"] as const;
const PICKABLE_ASNAFS = ["FAKIR", "MISKIN", "FISABILILLAH"] as const;

interface SeededChain {
  donationPda: string;
  distributionPdas: string[];
  receiptPdas: string[];
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${HOST}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as
    | { data: T; error: null }
    | { data: null; error: { code: string; message: string } };
  if (!res.ok || json.error || !json.data) {
    throw new Error(
      `${path} → HTTP ${res.status}: ${json.error?.code ?? "?"} ${json.error?.message ?? ""}`,
    );
  }
  return json.data;
}

async function seedChain(
  laz: { id: string; slug: string },
  mustahik: { id: string; asnaf_category: string }[],
  donor: (typeof DEMO_DONORS)[number],
  amountIdrz: bigint,
  category: (typeof PICKABLE_CATEGORIES)[number],
): Promise<SeededChain> {
  console.log(`${LOG} ── chain: ${donor.name} → ${laz.slug} → ${category}`);

  // 1) donation
  const donation = await postJson<{
    id: string;
    donationCommitmentPda: string;
  }>("/api/donations", {
    donorWallet: donor.wallet,
    lazId: laz.id,
    donationType: "ZAKAT_MAL",
    amountIdrz: amountIdrz.toString(),
    categoryPreference: [category],
    donorEmail: donor.email,
    donorDisplayName: donor.name === "Anonymous" ? null : donor.name,
    tokenTransferSignature: mockBase58(88),
  });
  console.log(`${LOG}   donation pda: ${donation.donationCommitmentPda}`);

  // 2) distribute across 2 mustahik (or 1 if pool is small)
  const splitCount = Math.min(2, mustahik.length);
  const splits = splitAmount(amountIdrz, splitCount);
  const distributionPdas: string[] = [];
  const receiptPdas: string[] = [];

  for (let i = 0; i < splitCount; i++) {
    const m = mustahik[i];
    const purpose = pick(PURPOSES_BY_CATEGORY[category] ?? ["distribusi rutin"]);

    const dist = await postJson<{
      id: string;
      distributionDecisionPda: string;
    }>("/api/distributions", {
      donationId: donation.id,
      mustahikId: m.id,
      amountIdrz: splits[i].toString(),
      category,
      asnaf: m.asnaf_category,
      purposeDescription: purpose,
    });
    console.log(
      `${LOG}   distribution #${i + 1} pda: ${dist.distributionDecisionPda}`,
    );
    distributionPdas.push(dist.distributionDecisionPda);

    // 3) confirm receipt for first distribution only — leaves a "pending
    // confirmation" state on the second so the live feed shows variety
    if (i === 0) {
      const receipt = await postJson<{ receiptPda: string }>(
        "/api/receipts",
        {
          distributionId: dist.id,
          confirmationMethod: "WEB",
          thankYouMessage:
            "Terima kasih banyak, semoga Allah balas kebaikan donatur.",
        },
      );
      console.log(`${LOG}   receipt pda: ${receipt.receiptPda}`);
      receiptPdas.push(receipt.receiptPda);
    }
  }

  return {
    donationPda: donation.donationCommitmentPda,
    distributionPdas,
    receiptPdas,
  };
}

function splitAmount(total: bigint, parts: number): bigint[] {
  if (parts === 1) return [total];
  // Bias toward larger first split so the chain row reads naturally.
  const first = (total * 60n) / 100n;
  const second = total - first;
  return parts === 2 ? [first, second] : [first, second, 0n];
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function mockBase58(len: number): string {
  let s = "";
  for (let i = 0; i < len; i++)
    s += BASE58[Math.floor(Math.random() * BASE58.length)];
  return s;
}

async function main(): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error(`${LOG} Supabase env vars are missing; aborting`);
    process.exit(1);
  }
  const supabase = createClient<Database>(supabaseUrl, serviceKey);

  // Pull live LAZs + mustahik so the seeded data refers to real rows.
  const lazRes = await supabase
    .from("laz")
    .select("id, slug")
    .eq("status", "ACTIVE")
    .limit(3);
  if (lazRes.error || !lazRes.data?.length) {
    console.error(`${LOG} no ACTIVE laz; run seed:laz first`);
    process.exit(1);
  }

  const chains: SeededChain[] = [];

  // Three demo chains across 3 LAZs × 3 donors.
  for (let i = 0; i < 3; i++) {
    const laz = lazRes.data[i % lazRes.data.length];
    const mustahikRes = await supabase
      .from("mustahik")
      .select("id, asnaf_category")
      .eq("laz_id", laz.id)
      .eq("status", "ACTIVE")
      .limit(5);
    if (mustahikRes.error || !mustahikRes.data?.length) {
      console.warn(`${LOG} laz ${laz.slug} has no mustahik; skipping`);
      continue;
    }

    const amount = BigInt(1_000_000 * (i + 2)); // 2M, 3M, 4M IDRZ
    const category = PICKABLE_CATEGORIES[i % PICKABLE_CATEGORIES.length];
    const donor = DEMO_DONORS[i % DEMO_DONORS.length];

    try {
      const chain = await seedChain(
        laz,
        mustahikRes.data.slice(0, 2),
        donor,
        amount,
        category,
      );
      chains.push(chain);
    } catch (err) {
      console.error(
        `${LOG} chain ${i + 1} failed:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  console.log("");
  console.log("=====================================================");
  console.log(`# Seeded ${chains.length} demo chains. Verify on-chain:`);
  console.log("=====================================================");
  for (const c of chains) {
    console.log(
      `donation:     https://solscan.io/account/${c.donationPda}?cluster=devnet`,
    );
    for (const d of c.distributionPdas) {
      console.log(
        `distribution: https://solscan.io/account/${d}?cluster=devnet`,
      );
    }
    for (const r of c.receiptPdas) {
      console.log(`receipt:      https://solscan.io/account/${r}?cluster=devnet`);
    }
    console.log("");
  }
}

main().catch((e) => {
  console.error(`${LOG} fatal:`, e instanceof Error ? e.stack : e);
  process.exit(1);
});
