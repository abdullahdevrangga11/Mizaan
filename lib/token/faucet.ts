/**
 * Server-side IDRZ faucet — mints 5,000,000 IDRZ to onboarding wallets.
 *
 * Must only be invoked from a Next.js Route Handler (server) because it uses
 * the platform mint authority keypair.
 */

import { PublicKey } from "@solana/web3.js";
import { getMintAuthorityKeypair, transferIDRZ } from "./idrz";

/** 5,000,000 IDRZ ≡ Rp 5,000,000 — enough for several demo donations. */
export const FAUCET_AMOUNT_IDRZ: bigint = 5_000_000n;

export interface FaucetResult {
  signature: string;
  amount: bigint;
}

export async function requestFaucet(
  wallet: PublicKey | string,
): Promise<FaucetResult> {
  // TODO: rate-limit via Supabase — out of scope for this layer.
  // The Route Handler that wraps this should:
  //   - check `faucet_drips(wallet, requested_at)` for a 1h cooldown
  //   - record a row on success
  // (See SRS §7.3.)

  const recipient = wallet instanceof PublicKey ? wallet : new PublicKey(wallet);
  const authority = getMintAuthorityKeypair();

  const signature = await transferIDRZ({
    from: authority,
    to: recipient,
    amount: FAUCET_AMOUNT_IDRZ,
  });

  return { signature, amount: FAUCET_AMOUNT_IDRZ };
}
