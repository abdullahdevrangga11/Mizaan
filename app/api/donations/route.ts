import type { NextRequest } from "next/server";
import { z } from "zod";
import { fail, isSupabaseConfigured, ok } from "@/lib/api/responses";
import { MOCK_LAZ } from "@/lib/api/mock-laz";
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
  // TODO: full real-mode flow:
  //   1. Look up LAZ row to get the wallet, status check
  //   2. Build MIZAAN_DONATION_V1 payload (lib/sas/donation.ts)
  //   3. Caller (browser) must have already signed the IDRZ transfer +
  //      attestation. Server only persists the off-chain record.
  //   4. Insert into donations_meta via lib/db/donations.ts or admin client
  //   5. Audit log row
  // For now, return a real-mode-not-implemented error so the UI can
  // distinguish the path during early integration.
  return fail(
    "NOT_IMPLEMENTED",
    "real-mode /api/donations not wired yet — leave Supabase env unset to demo via mock mode",
    501,
  );
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

  return fail(
    "NOT_IMPLEMENTED",
    "real-mode GET /api/donations not wired yet",
    501,
  );
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
