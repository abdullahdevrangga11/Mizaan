import type { NextRequest } from "next/server";
import { z } from "zod";
import {
  fail,
  isSasConfigured,
  isSupabaseConfigured,
  ok,
} from "@/lib/api/responses";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Body schema for POST /api/distributions.
 *
 * Each call creates one distribution attestation (one donation → one mustahik).
 * The LAZ admin form may issue several in a row when splitting a donation
 * across recipients; the UI fires N requests in parallel.
 */
const createDistributionSchema = z.object({
  donationId: z.string().uuid(),
  mustahikId: z.string().uuid(),
  amountIdrz: z
    .union([z.string(), z.number()])
    .transform((v) => BigInt(String(v)))
    .refine((v) => v > 0n, { message: "amountIdrz must be > 0" }),
  category: z.enum([
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
  asnaf: z.enum([
    "FAKIR",
    "MISKIN",
    "AMIL",
    "MUALLAF",
    "RIQAB",
    "GHARIMIN",
    "FISABILILLAH",
    "IBNU_SABIL",
  ]),
  purposeDescription: z.string().min(1).max(280),
  // Optional internal LAZ note for the donor-facing track page.
  amilUserId: z.string().uuid().nullable().optional(),
});

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function mockBase58(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += BASE58[Math.floor(Math.random() * BASE58.length)];
  }
  return out;
}

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return fail(
      "NOT_CONFIGURED",
      "distributions require Supabase configuration",
      503,
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("INVALID_JSON", "request body must be valid JSON", 400);
  }
  const parsed = createDistributionSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      "VALIDATION",
      parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
      422,
    );
  }
  const input = parsed.data;

  const supabase = createAdminClient();

  // Look up donation + LAZ + mustahik in parallel.
  const [donationRes, mustahikRes] = await Promise.all([
    supabase
      .from("donations_meta")
      .select(
        "id, donation_commitment_pda, laz_id, amount_idrz, total_distributed_idrz, status, laz:laz_id(slug, wallet_address, region)",
      )
      .eq("id", input.donationId)
      .maybeSingle(),
    supabase
      .from("mustahik")
      .select(
        "id, laz_id, wallet_address, internal_id_hash, initials, region, status",
      )
      .eq("id", input.mustahikId)
      .maybeSingle(),
  ]);

  if (donationRes.error || !donationRes.data) {
    return fail("NOT_FOUND", "donation not found", 404);
  }
  if (mustahikRes.error || !mustahikRes.data) {
    return fail("NOT_FOUND", "mustahik not found", 404);
  }

  const donation = donationRes.data;
  const mustahik = mustahikRes.data;
  const laz = Array.isArray(donation.laz) ? donation.laz[0] : donation.laz;

  if (mustahik.status !== "ACTIVE") {
    return fail("MUSTAHIK_INACTIVE", `mustahik ${mustahik.id} is not active`, 422);
  }
  if (donation.laz_id !== mustahik.laz_id) {
    return fail("LAZ_MISMATCH", "mustahik belongs to a different LAZ", 422);
  }
  if (donation.status === "FULLY_DISTRIBUTED") {
    return fail("ALREADY_DISTRIBUTED", "donation is fully distributed", 422);
  }

  // Guard against over-allocation.
  const remaining =
    BigInt(donation.amount_idrz) - BigInt(donation.total_distributed_idrz);
  if (input.amountIdrz > remaining) {
    return fail(
      "OVER_ALLOCATED",
      `amount ${input.amountIdrz} exceeds remaining ${remaining}`,
      422,
    );
  }

  // Issue SAS distribution attestation when on-chain is provisioned.
  let distributionPda: string;
  let tokenTransferSignature: string;
  if (isSasConfigured()) {
    try {
      const { createDistributionAttestation } = await import(
        "@/lib/sas/server"
      );
      const result = await createDistributionAttestation({
        donationCommitmentPDA: donation.donation_commitment_pda,
        lazWallet: laz.wallet_address,
        mustahikWallet: mustahik.wallet_address,
        amountIDRZ: input.amountIdrz,
        category: input.category,
        asnaf: input.asnaf,
        mustahikIdHash: mustahik.internal_id_hash,
        purposeDescription: input.purposeDescription,
        createdAt: BigInt(Math.floor(Date.now() / 1000)),
        // For hackathon scope the actual IDRZ token transfer is deferred —
        // the SAS attestation itself is the proof of decision. A real
        // production flow would invoke an SPL transfer here and inline the
        // signature; the demo just uses the attestation tx signature.
        tokenTransferSignature: "",
      });
      distributionPda = result.pda;
      tokenTransferSignature = result.signature;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return fail("SAS_ERROR", `attestation failed: ${msg}`, 502);
    }
  } else {
    distributionPda = mockBase58(44);
    tokenTransferSignature = mockBase58(88);
  }

  // Insert the distribution row. The schema links back via the donation
  // commitment PDA (TEXT FK) rather than donation UUID — see migration
  // 20260505000005. amil_user_id is required but for the hackathon demo
  // we mint a synthetic uuid when the caller didn't supply one (no auth
  // session). Real builds would tie this to the LAZ admin's Supabase auth.
  const insertDist = await supabase
    .from("distributions_meta")
    .insert({
      distribution_decision_pda: distributionPda,
      donation_commitment_pda: donation.donation_commitment_pda,
      laz_id: donation.laz_id,
      mustahik_id: mustahik.id,
      amil_user_id: input.amilUserId ?? null,
      amount_idrz: input.amountIdrz.toString() as unknown as number,
      category: input.category,
      asnaf: input.asnaf,
      purpose_description: input.purposeDescription,
      token_transfer_signature: tokenTransferSignature,
    })
    .select("*")
    .single();

  if (insertDist.error || !insertDist.data) {
    return fail(
      "DB_ERROR",
      insertDist.error?.message ?? "distribution insert failed",
      500,
    );
  }
  const distRow = insertDist.data;

  // Donation aggregates (total_distributed_idrz, distribution_count,
  // confirmation_count) + audit_log are handled by the
  // `distributions_refresh_donation_aggregates` and
  // `distributions_log_create` triggers — see migration ...000010_triggers.
  // Donation `status` isn't automated yet though, so we flip it here.
  const newTotalDistributed =
    BigInt(donation.total_distributed_idrz) + input.amountIdrz;
  const fullyDistributed = newTotalDistributed >= BigInt(donation.amount_idrz);
  await supabase
    .from("donations_meta")
    .update({
      status: fullyDistributed ? "FULLY_DISTRIBUTED" : "PARTIALLY_DISTRIBUTED",
      fully_distributed_at: fullyDistributed ? new Date().toISOString() : null,
    })
    .eq("id", donation.id);

  return ok(
    {
      id: distRow.id,
      distributionDecisionPda: distributionPda,
      donationId: donation.id,
      mustahikId: mustahik.id,
      amountIdrz: input.amountIdrz.toString(),
      category: input.category,
      asnaf: input.asnaf,
      purposeDescription: input.purposeDescription,
      tokenTransferSignature,
      status: fullyDistributed ? "FULLY_DISTRIBUTED" : "PENDING_CONFIRMATION",
      createdAt: distRow.created_at,
    },
    201,
  );
}
