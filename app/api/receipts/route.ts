import { createHash } from "node:crypto";
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
 * Body schema for POST /api/receipts.
 *
 * The mustahik confirm flow accepts either:
 *   - magicLinkToken (the `t=` query param embedded in the SMS/email link), OR
 *   - distributionId directly (for testing without the magic-link gating)
 *
 * thankYouMessage is hashed on the server before being attested.
 */
const createReceiptSchema = z.object({
  distributionId: z.string().uuid().optional(),
  magicLinkToken: z.string().min(16).optional(),
  confirmationMethod: z.enum(["WEB", "SMS", "QR"]).default("WEB"),
  thankYouMessage: z.string().max(500).optional(),
});

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function mockBase58(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += BASE58[Math.floor(Math.random() * BASE58.length)];
  }
  return out;
}

function sha256Hex(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return fail("NOT_CONFIGURED", "receipts require Supabase configuration", 503);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("INVALID_JSON", "request body must be valid JSON", 400);
  }
  const parsed = createReceiptSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      "VALIDATION",
      parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
      422,
    );
  }
  const input = parsed.data;

  if (!input.distributionId && !input.magicLinkToken) {
    return fail(
      "MISSING_TARGET",
      "either distributionId or magicLinkToken is required",
      422,
    );
  }

  const supabase = createAdminClient();

  // Resolve distribution. For hackathon scope, magicLinkToken is treated as
  // a direct UUID alias rather than a separate token registry — real builds
  // would back this with a one-shot token table.
  const distributionId = input.distributionId ?? input.magicLinkToken;
  const distRes = await supabase
    .from("distributions_meta")
    .select(
      "id, distribution_decision_pda, donation_commitment_pda, laz_id, mustahik_id, amount_idrz, category, receipt_pda, laz:laz_id(slug, wallet_address, region), mustahik:mustahik_id(wallet_address, initials, region)",
    )
    .eq("id", distributionId!)
    .maybeSingle();

  if (distRes.error || !distRes.data) {
    return fail("NOT_FOUND", "distribution not found", 404);
  }
  const dist = distRes.data;
  const laz = Array.isArray(dist.laz) ? dist.laz[0] : dist.laz;
  const mustahik = Array.isArray(dist.mustahik) ? dist.mustahik[0] : dist.mustahik;

  if (dist.receipt_pda) {
    return fail("ALREADY_CONFIRMED", "receipt already exists for this distribution", 422);
  }

  const confirmedAt = Math.floor(Date.now() / 1000);
  const thankYouHash = input.thankYouMessage
    ? sha256Hex(input.thankYouMessage)
    : undefined;
  const magicLinkConsentHash = sha256Hex(
    `${dist.id}:${confirmedAt}:${input.confirmationMethod}`,
  );

  let receiptPda: string;
  let signature: string;
  if (isSasConfigured()) {
    try {
      const { createReceiptAttestation } = await import("@/lib/sas/server");
      const result = await createReceiptAttestation({
        distributionDecisionPDA: dist.distribution_decision_pda,
        mustahikWallet: mustahik.wallet_address,
        lazWallet: laz.wallet_address,
        confirmedAt: BigInt(confirmedAt),
        confirmationMethod: input.confirmationMethod,
        thankYouMessageHash: thankYouHash,
        magicLinkConsentHash,
      });
      receiptPda = result.pda;
      signature = result.signature;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return fail("SAS_ERROR", `attestation failed: ${msg}`, 502);
    }
  } else {
    receiptPda = mockBase58(44);
    signature = mockBase58(88);
  }

  // Mark the distribution as confirmed by stamping the receipt PDA +
  // timestamp. The schema treats "confirmed" as `receipt_pda IS NOT NULL`.
  const update = await supabase
    .from("distributions_meta")
    .update({
      receipt_pda: receiptPda,
      receipt_confirmed_at: new Date().toISOString(),
    })
    .eq("id", dist.id);

  if (update.error) {
    return fail("DB_ERROR", update.error.message, 500);
  }

  // donation confirmation_count + audit_log row are written by the
  // `log_receipt_confirmed` trigger (migration ...000010_triggers) when
  // `receipt_pda` transitions from NULL to non-NULL.
  // Reference unused select-column to satisfy linter.
  void laz;

  return ok(
    {
      distributionId: dist.id,
      receiptPda,
      confirmedAt: new Date(confirmedAt * 1000).toISOString(),
      confirmationMethod: input.confirmationMethod,
      signature,
    },
    201,
  );
}
