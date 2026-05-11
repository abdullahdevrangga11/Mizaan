import type { NextRequest } from "next/server";
import { fail, isSupabaseConfigured, ok } from "@/lib/api/responses";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/verify/[identifier]
 *
 * Public lookup. `identifier` can be a donor wallet, donation commitment PDA,
 * donation UUID, distribution PDA, or receipt PDA. Returns the full chain.
 */
function looksLikeUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

type DonationLookup = {
  id: string;
  donation_commitment_pda: string;
  donor_wallet: string;
  amount_idrz: number | string;
  donation_type: string;
  category_preference: string[] | null;
  token_transfer_signature: string;
  status: string;
  distribution_count: number;
  confirmation_count: number;
  created_at: string;
  laz: {
    slug: string;
    name: string;
    region: string;
    wallet_address: string;
  };
};

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ identifier: string }> },
) {
  if (!isSupabaseConfigured()) {
    return fail("NOT_CONFIGURED", "verify requires Supabase configuration", 503);
  }

  const { identifier } = await ctx.params;
  const id = identifier.trim();
  if (!id) {
    return fail("MISSING_PARAM", "identifier is required", 400);
  }

  const supabase = createAdminClient();

  const donationSelect =
    "*, laz:laz_id(slug, name, region, wallet_address)";

  let donation: DonationLookup | null = null;

  if (looksLikeUuid(id)) {
    const r = await supabase
      .from("donations_meta")
      .select(donationSelect)
      .eq("id", id)
      .maybeSingle();
    donation = (r.data ?? null) as DonationLookup | null;
  }
  if (!donation) {
    const r = await supabase
      .from("donations_meta")
      .select(donationSelect)
      .eq("donation_commitment_pda", id)
      .maybeSingle();
    donation = (r.data ?? null) as DonationLookup | null;
  }
  if (!donation) {
    const r = await supabase
      .from("donations_meta")
      .select(donationSelect)
      .eq("donor_wallet", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    donation = (r.data ?? null) as DonationLookup | null;
  }
  if (!donation) {
    const distR = await supabase
      .from("distributions_meta")
      .select("donation_commitment_pda")
      .eq("distribution_decision_pda", id)
      .maybeSingle();
    if (distR.data) {
      const r = await supabase
        .from("donations_meta")
        .select(donationSelect)
        .eq("donation_commitment_pda", distR.data.donation_commitment_pda)
        .maybeSingle();
      donation = (r.data ?? null) as DonationLookup | null;
    }
  }
  if (!donation) {
    const distR = await supabase
      .from("distributions_meta")
      .select("donation_commitment_pda")
      .eq("receipt_pda", id)
      .maybeSingle();
    if (distR.data) {
      const r = await supabase
        .from("donations_meta")
        .select(donationSelect)
        .eq("donation_commitment_pda", distR.data.donation_commitment_pda)
        .maybeSingle();
      donation = (r.data ?? null) as DonationLookup | null;
    }
  }

  if (!donation) {
    return fail("NOT_FOUND", `no chain found for identifier ${id}`, 404);
  }

  const distsR = await supabase
    .from("distributions_meta")
    .select(
      "*, mustahik:mustahik_id(initials, region, age_range, asnaf_category)",
    )
    .eq("donation_commitment_pda", donation.donation_commitment_pda)
    .order("created_at", { ascending: false });

  type DistRow = {
    id: string;
    distribution_decision_pda: string;
    laz_id: string;
    mustahik_id: string;
    amount_idrz: number | string;
    category: string;
    asnaf: string;
    purpose_description: string;
    token_transfer_signature: string;
    receipt_pda: string | null;
    receipt_confirmed_at: string | null;
    created_at: string;
    mustahik: {
      initials: string;
      region: string;
      age_range: string;
      asnaf_category: string;
    } | null;
  };

  const distributions = (distsR.data ?? []) as DistRow[];

  return ok({
    donation: {
      id: donation.id,
      donationCommitmentPda: donation.donation_commitment_pda,
      donorWallet: donation.donor_wallet,
      amountIdrz: donation.amount_idrz.toString(),
      donationType: donation.donation_type,
      categoryPreference: donation.category_preference,
      tokenTransferSignature: donation.token_transfer_signature,
      status: donation.status,
      distributionCount: donation.distribution_count,
      confirmationCount: donation.confirmation_count,
      createdAt: donation.created_at,
      laz: donation.laz,
    },
    distributions: distributions.map((x) => {
      const m = Array.isArray(x.mustahik) ? x.mustahik[0] : x.mustahik;
      return {
        id: x.id,
        distributionDecisionPda: x.distribution_decision_pda,
        mustahikInitials: m?.initials ?? null,
        mustahikRegion: m?.region ?? null,
        mustahikAgeRange: m?.age_range ?? null,
        amountIdrz: x.amount_idrz.toString(),
        category: x.category,
        asnaf: x.asnaf,
        purposeDescription: x.purpose_description,
        tokenTransferSignature: x.token_transfer_signature,
        receiptPda: x.receipt_pda,
        receiptConfirmedAt: x.receipt_confirmed_at,
        createdAt: x.created_at,
      };
    }),
  });
}
