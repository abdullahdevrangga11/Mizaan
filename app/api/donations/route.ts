import type { NextRequest } from "next/server";
import { z } from "zod";
import {
  fail,
  isSasConfigured,
  isSupabaseConfigured,
  ok,
} from "@/lib/api/responses";
import { MOCK_LAZ } from "@/lib/api/mock-laz";
import { getLazById } from "@/lib/db/laz";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DonationMeta } from "@/lib/types";

/**
 * Body schema for POST /api/donations.
 *
 * `bigint` fields arrive as strings (JSON can't carry BigInts) — zod coerces
 * them via `.transform`. Validation happens at the API boundary; downstream
 * code can trust the shapes.
 */
const createDonationSchema = z.object({
  donorWallet: z.string().min(32).max(64),
  lazId: z.string().uuid(),
  donationType: z.enum(["ZAKAT_MAL", "ZAKAT_FITRAH", "SEDEKAH", "INFAQ"]),
  amountIdrz: z
    .union([z.string(), z.number()])
    .transform((v) => BigInt(String(v)))
    .refine((v) => v > 0n, { message: "amountIdrz must be > 0" }),
  categoryPreference: z
    .array(
      z.enum([
        "PENDIDIKAN",
        "KESEHATAN",
        "MODAL_USAHA",
        "SANDANG_PANGAN",
        "BIAYA_HIDUP",
        "BENCANA",
        "FAKIR_MISKIN",
        "MUALLAF",
        "RIQAB",
        "GHARIMIN",
        "FISABILILLAH",
        "IBNU_SABIL",
      ]),
    )
    .max(6),
  donorEmail: z.string().email().nullable().optional(),
  donorDisplayName: z.string().max(80).nullable().optional(),
  // Browser-signed SPL token transfer (donor → LAZ wallet) that this
  // donation commits to. Required in real mode; optional in mock mode.
  tokenTransferSignature: z.string().min(32).max(128).optional(),
});

export type CreateDonationInput = z.infer<typeof createDonationSchema>;

/**
 * In-memory store for mock-mode donations. Persists across requests within
 * a single Node process — fine for dev/demo, lost on restart. Once Supabase
 * is wired this whole branch is replaced with real DB inserts.
 */
const mockDonations = new Map<string, DonationMeta>();

/**
 * POST /api/donations — create a donation commitment.
 *
 * In mock mode (Supabase unconfigured): generates a fake PDA + signature,
 * stores in-memory, returns the donation. Lets the donor flow demo
 * end-to-end without any real wiring.
 *
 * In real mode: TODO — sign SAS attestation + transfer IDRZ + persist.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("INVALID_JSON", "request body must be valid JSON", 400);
  }

  const parsed = createDonationSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      "VALIDATION",
      parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
      422,
    );
  }
  const input = parsed.data;

  // Verify referenced LAZ exists. Mock mode: check MOCK_LAZ. Real mode:
  // delegated to FK constraint on insert.
  if (!isSupabaseConfigured()) {
    const laz = MOCK_LAZ.find((l) => l.id === input.lazId);
    if (!laz) {
      return fail("NOT_FOUND", `laz ${input.lazId} not found`, 404);
    }
    const donation = mockCreateDonation(input, laz.walletAddress);
    mockDonations.set(donation.id, donation);
    mockDonations.set(donation.donationCommitmentPda, donation);
    return ok(donation, 201);
  }

  // ─── Real mode (Supabase configured) ───────────────────────────────
  // Look up LAZ; reject if missing or paused.
  const lazResult = await getLazById(input.lazId);
  if (lazResult.error) {
    if (lazResult.error.code === "NOT_FOUND") {
      return fail("NOT_FOUND", `laz ${input.lazId} not found`, 404);
    }
    return fail(lazResult.error.code, lazResult.error.message, 500);
  }
  const laz = lazResult.data;
  if (laz.status !== "ACTIVE") {
    return fail("LAZ_INACTIVE", `laz ${laz.slug} is not active`, 422);
  }

  // SAS attestation creation is best-effort: when SAS isn't provisioned yet
  // (running `setup:devnet` is the gating step), we still let the donation
  // be recorded with a synthetic PDA so the demo flow stays usable.
  let donationPda: string;
  let signature: string;
  if (isSasConfigured() && input.tokenTransferSignature) {
    try {
      const { createDonationAttestation } = await import("@/lib/sas/server");
      const result = await createDonationAttestation({
        donorWallet: input.donorWallet,
        lazWallet: laz.walletAddress,
        amountIDRZ: input.amountIdrz,
        donationType: input.donationType,
        // The donor form takes a multi-select; the attestation schema only
        // carries a single preferred category. We send "ANY" when the donor
        // didn't constrain or picked multiple — the LAZ decides the actual
        // category at distribution time.
        categoryPreference:
          input.categoryPreference.length === 1
            ? input.categoryPreference[0]
            : "ANY",
        createdAt: BigInt(Math.floor(Date.now() / 1000)),
        tokenTransferSignature: input.tokenTransferSignature,
      });
      donationPda = result.pda;
      signature = result.signature;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return fail("SAS_ERROR", `attestation failed: ${msg}`, 502);
    }
  } else {
    // Mock attestation values when SAS isn't ready yet. The donation row
    // still gets persisted so the rest of the UI flow exercises real DB.
    donationPda = mockBase58(44);
    signature = input.tokenTransferSignature ?? mockBase58(88);
  }

  // Persist the off-chain donation meta row via the service-role client.
  const supabase = createAdminClient();
  const insert = await supabase
    .from("donations_meta")
    .insert({
      donation_commitment_pda: donationPda,
      donor_wallet: input.donorWallet,
      laz_id: input.lazId,
      donor_email: input.donorEmail ?? null,
      donor_display_name: input.donorDisplayName ?? null,
      donation_type: input.donationType,
      // Postgres BIGINT — supabase-js types say number, but it serializes
      // strings safely and avoids Number.MAX_SAFE_INTEGER loss.
      amount_idrz: input.amountIdrz.toString() as unknown as number,
      category_preference: input.categoryPreference,
      token_transfer_signature: signature,
      status: "PENDING_DISTRIBUTION",
    })
    .select("*")
    .single();

  if (insert.error || !insert.data) {
    return fail(
      "DB_ERROR",
      insert.error?.message ?? "insert failed",
      500,
    );
  }

  // Audit log row drives the live feed.
  await supabase.from("audit_log").insert({
    event_type: "DONATION_CREATED",
    donation_pda: donationPda,
    actor_wallet: input.donorWallet,
    actor_role: "donor",
    laz_id: input.lazId,
    laz_slug: laz.slug,
    amount_idrz: input.amountIdrz.toString() as unknown as number,
    region: laz.region,
  });

  const row = insert.data;
  const donation: DonationMeta = {
    id: row.id,
    donationCommitmentPda: row.donation_commitment_pda,
    donorWallet: row.donor_wallet,
    lazId: row.laz_id,
    donorEmail: row.donor_email,
    donorDisplayName: row.donor_display_name,
    encryptedMessage: row.encrypted_message,
    donationType: input.donationType,
    amountIdrz: BigInt(row.amount_idrz),
    categoryPreference: input.categoryPreference,
    tokenTransferSignature: row.token_transfer_signature,
    blockHeight: row.block_height,
    status: "PENDING_DISTRIBUTION",
    totalDistributedIdrz: BigInt(row.total_distributed_idrz),
    distributionCount: row.distribution_count,
    confirmationCount: row.confirmation_count,
    createdAt: row.created_at,
    fullyDistributedAt: row.fully_distributed_at,
    fullyConfirmedAt: row.fully_confirmed_at,
  };
  return ok(donation, 201);
}

/**
 * GET /api/donations?donor=<wallet>&pda=<commitmentPda>
 * Returns a single donation when `pda` is set; an array of donor's donations
 * when `donor` is set. In mock mode, reads from the in-memory store.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const pda = url.searchParams.get("pda");
  const donor = url.searchParams.get("donor");

  if (!pda && !donor) {
    return fail("MISSING_PARAM", "pass either ?pda or ?donor", 400);
  }

  if (!isSupabaseConfigured()) {
    if (pda) {
      const donation = mockDonations.get(pda);
      if (!donation) return fail("NOT_FOUND", "donation not found", 404);
      return ok(donation);
    }
    const list = Array.from(mockDonations.values())
      .filter((d) => d.donorWallet === donor)
      // De-dup the dual-key store (id + pda both point to same object)
      .filter((d, i, arr) => arr.findIndex((x) => x.id === d.id) === i)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return ok(list);
  }

  const { getDonationByPda, listDonationsByDonorWallet } = await import(
    "@/lib/db/donations"
  );
  if (pda) {
    // `?pda=` accepts either the on-chain commitment PDA or the Supabase
    // UUID — donor-flow redirects use the UUID since that's what `id`
    // returns from POST. Try PDA first, then fall back to UUID.
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        pda,
      );
    if (isUuid) {
      const supabase = createAdminClient();
      const r = await supabase
        .from("donations_meta")
        .select("*")
        .eq("id", pda)
        .maybeSingle();
      if (r.error || !r.data) {
        return fail("NOT_FOUND", "donation not found", 404);
      }
      const row = r.data;
      const donation: DonationMeta = {
        id: row.id,
        donationCommitmentPda: row.donation_commitment_pda,
        donorWallet: row.donor_wallet,
        lazId: row.laz_id,
        donorEmail: row.donor_email,
        donorDisplayName: row.donor_display_name,
        encryptedMessage: row.encrypted_message,
        donationType: row.donation_type as DonationMeta["donationType"],
        amountIdrz: BigInt(row.amount_idrz),
        categoryPreference: (row.category_preference ?? []) as DonationMeta["categoryPreference"],
        tokenTransferSignature: row.token_transfer_signature,
        blockHeight: row.block_height,
        status: row.status as DonationMeta["status"],
        totalDistributedIdrz: BigInt(row.total_distributed_idrz),
        distributionCount: row.distribution_count,
        confirmationCount: row.confirmation_count,
        createdAt: row.created_at,
        fullyDistributedAt: row.fully_distributed_at,
        fullyConfirmedAt: row.fully_confirmed_at,
      };
      return ok(donation);
    }
    const result = await getDonationByPda(pda);
    if (result.error) {
      const status = result.error.code === "NOT_FOUND" ? 404 : 500;
      return fail(result.error.code, result.error.message, status);
    }
    return ok(result.data);
  }
  const result = await listDonationsByDonorWallet(donor!);
  if (result.error) {
    return fail(result.error.code, result.error.message, 500);
  }
  return ok(result.data);
}

/**
 * Build a fake donation that looks plausible enough for the success page.
 * Uses base58-ish character set so it visually matches real PDAs.
 */
function mockCreateDonation(
  input: CreateDonationInput,
  _lazWallet: string,
): DonationMeta {
  const donationCommitmentPda = mockBase58(44);
  const tokenTransferSignature = mockBase58(88);
  const id = `mizaan-${mockBase58(8).toLowerCase()}`;
  const now = new Date().toISOString();

  return {
    id,
    donationCommitmentPda,
    donorWallet: input.donorWallet,
    lazId: input.lazId,
    donorEmail: input.donorEmail ?? null,
    donorDisplayName: input.donorDisplayName ?? null,
    encryptedMessage: null,
    donationType: input.donationType,
    amountIdrz: input.amountIdrz,
    categoryPreference: input.categoryPreference,
    tokenTransferSignature,
    blockHeight: null,
    status: "PENDING_DISTRIBUTION",
    totalDistributedIdrz: 0n,
    distributionCount: 0,
    confirmationCount: 0,
    createdAt: now,
    fullyDistributedAt: null,
    fullyConfirmedAt: null,
  };
}

const BASE58_ALPHABET =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function mockBase58(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += BASE58_ALPHABET[Math.floor(Math.random() * BASE58_ALPHABET.length)];
  }
  return out;
}
