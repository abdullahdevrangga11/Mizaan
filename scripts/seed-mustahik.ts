import "dotenv/config";

import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

import { requireMany } from "./_lib/env";
import { loadOrCreateKeypair } from "./_lib/keypair";
import type {
  Database,
  LazRow,
  MustahikRow,
} from "@/lib/supabase/types";

type AsnafCategory = MustahikRow["asnaf_category"];
type AgeRange = MustahikRow["age_range"];

const LOG = "[mizaan/seed-mustahik]";
const KEYPAIR_DIR = resolve(process.cwd(), "keypairs", "mustahik");
const PER_LAZ = 10;

interface NameSeed {
  full: string;
  initials: string;
  honorific: "Pak" | "Bu" | "Mas" | "Mbak" | "Adik";
}

const ADULT_MEN: NameSeed[] = [
  { full: "Pak Yusuf Hidayat", initials: "P.Y.", honorific: "Pak" },
  { full: "Pak Slamet Riyadi", initials: "P.S.", honorific: "Pak" },
  { full: "Pak Hadi Suwarno", initials: "P.H.", honorific: "Pak" },
  { full: "Pak Ahmad Fauzi", initials: "P.A.", honorific: "Pak" },
  { full: "Pak Bambang Sutrisno", initials: "P.B.", honorific: "Pak" },
  { full: "Pak Rahmat Hidayat", initials: "P.R.", honorific: "Pak" },
  { full: "Pak Joko Widodo", initials: "P.J.", honorific: "Pak" },
  { full: "Pak Iwan Setiawan", initials: "P.I.", honorific: "Pak" },
  { full: "Pak Dedi Mulyadi", initials: "P.D.", honorific: "Pak" },
];

const ADULT_WOMEN: NameSeed[] = [
  { full: "Bu Siti Aminah", initials: "B.S.", honorific: "Bu" },
  { full: "Bu Ratna Sari", initials: "B.R.", honorific: "Bu" },
  { full: "Bu Tuti Hartati", initials: "B.T.", honorific: "Bu" },
  { full: "Bu Endang Wulandari", initials: "B.E.", honorific: "Bu" },
  { full: "Bu Ningsih Pratiwi", initials: "B.N.", honorific: "Bu" },
  { full: "Bu Lestari Handayani", initials: "B.L.", honorific: "Bu" },
  { full: "Bu Fatimah Az-Zahra", initials: "B.F.", honorific: "Bu" },
  { full: "Bu Marwah Salim", initials: "B.M.", honorific: "Bu" },
];

const TEEN: NameSeed[] = [
  { full: "Mas Rizky Pratama", initials: "M.R.", honorific: "Mas" },
  { full: "Mas Faisal Akbar", initials: "M.F.", honorific: "Mas" },
  { full: "Mbak Aisyah Nurhaliza", initials: "M.A.", honorific: "Mbak" },
  { full: "Mbak Zahra Salsabila", initials: "M.Z.", honorific: "Mbak" },
];

const ELDER_MEN: NameSeed[] = [
  { full: "Pak Mardi Sastrowijoyo", initials: "P.M.", honorific: "Pak" },
  { full: "Pak Subandi Hartono", initials: "P.S.", honorific: "Pak" },
];

const ELDER_WOMEN: NameSeed[] = [
  { full: "Bu Painem Wiryosumarto", initials: "B.P.", honorific: "Bu" },
  { full: "Bu Suparti Atmosudiro", initials: "B.S.", honorific: "Bu" },
];

const CHILD: NameSeed[] = [
  { full: "Adik Naufal Akbar", initials: "A.N.", honorific: "Adik" },
  { full: "Adik Khadijah Putri", initials: "A.K.", honorific: "Adik" },
];

interface MustahikPlan {
  asnafCategory: AsnafCategory;
  ageRange: AgeRange;
  pool: NameSeed[];
}

const PLAN: ReadonlyArray<MustahikPlan> = [
  { asnafCategory: "FAKIR", ageRange: "ELDER", pool: ELDER_MEN },
  { asnafCategory: "FAKIR", ageRange: "ELDER", pool: ELDER_WOMEN },
  { asnafCategory: "MISKIN", ageRange: "ADULT", pool: ADULT_WOMEN },
  { asnafCategory: "MISKIN", ageRange: "ADULT", pool: ADULT_MEN },
  { asnafCategory: "MISKIN", ageRange: "ADULT", pool: ADULT_WOMEN },
  { asnafCategory: "GHARIMIN", ageRange: "ADULT", pool: ADULT_MEN },
  { asnafCategory: "FISABILILLAH", ageRange: "TEEN", pool: TEEN },
  { asnafCategory: "FISABILILLAH", ageRange: "CHILD", pool: CHILD },
  { asnafCategory: "IBNU_SABIL", ageRange: "ADULT", pool: ADULT_MEN },
  { asnafCategory: "MUALLAF", ageRange: "ADULT", pool: ADULT_WOMEN },
];

const REGION_BY_LAZ: Record<string, string[]> = {
  "dompet-dhuafa-yogya": [
    "Bantul, DI Yogyakarta",
    "Sleman, DI Yogyakarta",
    "Kota Yogyakarta, DI Yogyakarta",
  ],
  "rumah-zakat": [
    "Bandung, Jawa Barat",
    "Surabaya, Jawa Timur",
    "Medan, Sumatera Utara",
  ],
  "izi-indonesia": [
    "Jakarta Selatan, DKI Jakarta",
    "Bekasi, Jawa Barat",
    "Tangerang, Banten",
  ],
  "baznas-yogya": [
    "Kulon Progo, DI Yogyakarta",
    "Gunungkidul, DI Yogyakarta",
    "Sleman, DI Yogyakarta",
  ],
  "laz-ugm": [
    "Sleman, DI Yogyakarta",
    "Kota Yogyakarta, DI Yogyakarta",
    "Bantul, DI Yogyakarta",
  ],
};

const PHONE_PREFIXES = ["0812", "0813", "0821", "0852", "0856", "0877", "0895"];

function pseudoRandom(seedStr: string): () => number {
  let state = 0;
  for (const ch of seedStr) state = (state * 31 + ch.charCodeAt(0)) >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x1_0000_0000;
  };
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function sha256Hex(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function fakePhone(rng: () => number): string {
  const prefix = pick(PHONE_PREFIXES, rng);
  let suffix = "";
  for (let i = 0; i < 8; i++) suffix += Math.floor(rng() * 10).toString();
  return `${prefix}${suffix}`;
}

function fakeEmail(slug: string, internalId: string): string {
  return `mustahik+${slug}-${internalId}@mizaan.test`;
}

interface BuiltMustahik {
  internal_id: string;
  internal_id_hash: string;
  full_name: string;
  initials: string;
  asnaf_category: AsnafCategory;
  age_range: AgeRange;
  region: string;
  phone: string;
  email: string;
  wallet_address: string;
}

async function buildForLaz(
  lazSlug: string,
  count: number,
): Promise<BuiltMustahik[]> {
  const rng = pseudoRandom(lazSlug);
  const regions = REGION_BY_LAZ[lazSlug] ?? ["Indonesia"];
  const out: BuiltMustahik[] = [];

  for (let i = 0; i < count; i++) {
    const plan = PLAN[i % PLAN.length];
    const name = pick(plan.pool, rng);
    const internalId = `${lazSlug.toUpperCase().replace(/-/g, "")}-${String(
      i + 1,
    ).padStart(4, "0")}`;
    const internalIdHash = sha256Hex(`${lazSlug}:${internalId}`);
    const region = pick(regions, rng);

    const kpPath = resolve(KEYPAIR_DIR, lazSlug, `${internalId}.json`);
    const { keypair } = loadOrCreateKeypair(kpPath);

    out.push({
      internal_id: internalId,
      internal_id_hash: internalIdHash,
      full_name: name.full,
      initials: name.initials,
      asnaf_category: plan.asnafCategory,
      age_range: plan.ageRange,
      region,
      phone: fakePhone(rng),
      email: fakeEmail(lazSlug, internalId),
      wallet_address: keypair.publicKey.toBase58(),
    });
  }

  return out;
}

async function main(): Promise<void> {
  console.log(`${LOG} seeding ${PER_LAZ} mustahik per LAZ`);

  const env = requireMany([
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
  ]);

  const supabase = createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const { data: lazRows, error: lazErr } = await supabase
    .from("laz")
    .select("id, slug")
    .eq("status", "ACTIVE");

  if (lazErr) {
    console.error(`${LOG} could not fetch LAZ list: ${lazErr.message}`);
    process.exit(1);
  }
  if (!lazRows || lazRows.length === 0) {
    console.error(
      `${LOG} no LAZ rows found — run \`pnpm seed:laz\` first.`,
    );
    process.exit(1);
  }

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const laz of lazRows as Pick<LazRow, "id" | "slug">[]) {
    console.log(`${LOG} --- ${laz.slug} (${laz.id}) ---`);

    let built: BuiltMustahik[];
    try {
      built = await buildForLaz(laz.slug, PER_LAZ);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`${LOG} build failed for ${laz.slug}: ${msg}`);
      failed++;
      continue;
    }

    for (const m of built) {
      try {
        const { data: existing, error: selErr } = await supabase
          .from("mustahik")
          .select("id")
          .eq("laz_id", laz.id)
          .eq("internal_id", m.internal_id)
          .maybeSingle();

        if (selErr) {
          console.error(
            `${LOG} ${laz.slug}/${m.internal_id} select failed: ${selErr.message}`,
          );
          failed++;
          continue;
        }
        if (existing) {
          skipped++;
          continue;
        }

        const { error: insErr } = await supabase.from("mustahik").insert({
          laz_id: laz.id,
          wallet_address: m.wallet_address,
          internal_id: m.internal_id,
          internal_id_hash: m.internal_id_hash,
          full_name: m.full_name,
          phone: m.phone,
          email: m.email,
          initials: m.initials,
          asnaf_category: m.asnaf_category,
          region: m.region,
          age_range: m.age_range,
          status: "ACTIVE",
        });

        if (insErr) {
          console.error(
            `${LOG} ${laz.slug}/${m.internal_id} insert failed: ${insErr.message}`,
          );
          failed++;
          continue;
        }
        inserted++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`${LOG} ${laz.slug}/${m.internal_id} threw: ${msg}`);
        failed++;
      }
    }
  }

  console.log(
    `${LOG} done — inserted=${inserted} skipped=${skipped} failed=${failed}`,
  );
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  const msg = err instanceof Error ? err.stack ?? err.message : String(err);
  console.error(`${LOG} fatal: ${msg}`);
  process.exit(1);
});
