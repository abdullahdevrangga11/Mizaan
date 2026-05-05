import "dotenv/config";

import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

import { requireMany } from "./_lib/env";
import { loadOrCreateKeypair } from "./_lib/keypair";
import type { Database, LazRow } from "@/lib/supabase/types";

const LOG = "[mizaan/seed-laz]";
const KEYPAIR_DIR = resolve(process.cwd(), "keypairs", "laz");

interface SeedLaz {
  slug: string;
  name: string;
  registration_number: string;
  region: string;
  jurisdiction_level: LazRow["jurisdiction_level"];
  status: LazRow["status"];
  website_url: string | null;
  contact_email: string | null;
}

const SEED_LAZ: ReadonlyArray<SeedLaz> = [
  {
    slug: "dompet-dhuafa-yogya",
    name: "Dompet Dhuafa Yogya",
    registration_number: "BAZNAS-LAZ-DIY-04",
    region: "DI Yogyakarta",
    jurisdiction_level: "PROVINCIAL",
    status: "ACTIVE",
    website_url: "https://yogya.dompetdhuafa.org",
    contact_email: "yogya@dompetdhuafa.org",
  },
  {
    slug: "rumah-zakat",
    name: "Rumah Zakat",
    registration_number: "BAZNAS-LAZ-NAT-12",
    region: "Indonesia",
    jurisdiction_level: "NATIONAL",
    status: "ACTIVE",
    website_url: "https://www.rumahzakat.org",
    contact_email: "info@rumahzakat.org",
  },
  {
    slug: "izi-indonesia",
    name: "Inisiatif Zakat Indonesia",
    registration_number: "BAZNAS-LAZ-NAT-08",
    region: "Indonesia",
    jurisdiction_level: "NATIONAL",
    status: "ACTIVE",
    website_url: "https://izi.or.id",
    contact_email: "info@izi.or.id",
  },
  {
    slug: "baznas-yogya",
    name: "BAZNAS Yogyakarta",
    registration_number: "BAZNAS-DIY-01",
    region: "DI Yogyakarta",
    jurisdiction_level: "PROVINCIAL",
    status: "ACTIVE",
    website_url: "https://baznas.jogjaprov.go.id",
    contact_email: "info@baznas-diy.id",
  },
  {
    slug: "laz-ugm",
    name: "LAZ UGM Yogyakarta",
    registration_number: "BAZNAS-LAZ-DIY-08",
    region: "DI Yogyakarta",
    jurisdiction_level: "PROVINCIAL",
    status: "ACTIVE",
    website_url: "https://laz.ugm.ac.id",
    contact_email: "laz@ugm.ac.id",
  },
];

async function main(): Promise<void> {
  console.log(`${LOG} seeding ${SEED_LAZ.length} LAZ partners`);

  const env = requireMany([
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
  ]);

  const supabase = createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const seed of SEED_LAZ) {
    try {
      const kpPath = resolve(KEYPAIR_DIR, `${seed.slug}.json`);
      const { keypair, created } = loadOrCreateKeypair(kpPath);
      const wallet = keypair.publicKey.toBase58();
      console.log(
        `${LOG} ${seed.slug} wallet=${wallet} (${created ? "new" : "loaded"})`,
      );

      const { data: existing, error: selErr } = await supabase
        .from("laz")
        .select("id, wallet_address")
        .eq("slug", seed.slug)
        .maybeSingle();

      if (selErr) {
        console.error(`${LOG} ${seed.slug} select failed: ${selErr.message}`);
        failed++;
        continue;
      }

      if (existing) {
        console.warn(
          `${LOG} ${seed.slug} already exists (id=${existing.id}). Skipping.`,
        );
        skipped++;
        continue;
      }

      const { error: insErr } = await supabase.from("laz").insert({
        wallet_address: wallet,
        slug: seed.slug,
        name: seed.name,
        registration_number: seed.registration_number,
        region: seed.region,
        jurisdiction_level: seed.jurisdiction_level,
        status: seed.status,
        website_url: seed.website_url,
        contact_email: seed.contact_email,
      });

      if (insErr) {
        console.error(`${LOG} ${seed.slug} insert failed: ${insErr.message}`);
        failed++;
        continue;
      }

      console.log(`${LOG} ${seed.slug} inserted`);
      inserted++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`${LOG} ${seed.slug} threw: ${msg}`);
      failed++;
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
