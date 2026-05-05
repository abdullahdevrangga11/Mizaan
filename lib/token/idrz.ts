/**
 * IDRZ (Indonesian Rupiah Zakat Token) helpers.
 *
 * Browser-safe surface (top of file):
 *   - `getIDRZMint()`          — public mint address from env
 *   - `getIDRZBalance()`       — read-only RPC call
 *   - `getOrCreateIDRZAccount()` for browser callers (uses wallet adapter signer)
 *
 * SERVER-ONLY surface (below the marker):
 *   - `getMintAuthorityKeypair()` — loads the platform secret key
 *   - `transferIDRZ()` — currently signs with the mint authority for faucet/
 *     LAZ disbursement flows; donor-side transfers should be issued from the
 *     donor's wallet via `wallet-adapter` and not go through this function.
 *
 * The SERVER section is fenced behind a runtime guard so accidental imports
 * from a "use client" module fail loudly instead of leaking the keypair into
 * the bundle.
 */

import {
  PublicKey,
  type Connection,
  type Keypair,
  type Signer,
} from "@solana/web3.js";
import {
  createTransferInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { getConnection } from "@/lib/solana/connection";

// ---------- Browser-safe ----------

export function getIDRZMint(): PublicKey {
  const raw = process.env.NEXT_PUBLIC_IDRZ_MINT;
  if (!raw) {
    throw new Error(
      "NEXT_PUBLIC_IDRZ_MINT is not set — required to resolve the IDRZ mint",
    );
  }
  return new PublicKey(raw);
}

/** Returns 0n if the wallet has no IDRZ ATA yet. */
export async function getIDRZBalance(wallet: PublicKey | string): Promise<bigint> {
  const owner = wallet instanceof PublicKey ? wallet : new PublicKey(wallet);
  const ata = await getAssociatedTokenAddress(getIDRZMint(), owner);
  try {
    const account = await getAccount(getConnection(), ata);
    return account.amount;
  } catch {
    return 0n;
  }
}

export interface GetOrCreateAccountArgs {
  owner: PublicKey;
  payer: Signer;
}

/**
 * Browser-side: ensure the wallet has an IDRZ ATA. The caller must supply a
 * `payer` that can sign — typically the same wallet via `wallet-adapter`.
 * Server-side flows use the `getOrCreateIDRZAccountServer` variant below.
 */
export async function getOrCreateIDRZAccount(
  args: GetOrCreateAccountArgs,
): Promise<PublicKey> {
  const account = await getOrCreateAssociatedTokenAccount(
    getConnection(),
    args.payer,
    getIDRZMint(),
    args.owner,
  );
  return account.address;
}

// =========================================================================
// SERVER-ONLY BELOW THIS LINE — DO NOT IMPORT FROM `"use client"` MODULES.
// =========================================================================

function assertServer(label: string): void {
  if (typeof window !== "undefined") {
    throw new Error(
      `${label} is server-only — it must never run in the browser bundle`,
    );
  }
}

let _mintAuthority: Keypair | null = null;

export function getMintAuthorityKeypair(): Keypair {
  assertServer("getMintAuthorityKeypair");
  if (_mintAuthority) return _mintAuthority;

  const raw = process.env.IDRZ_MINT_AUTHORITY_KEYPAIR;
  if (!raw) {
    throw new Error(
      "IDRZ_MINT_AUTHORITY_KEYPAIR is not set — server-only secret required " +
        "for faucet + LAZ disbursement flows",
    );
  }
  // Lazy-load so the @solana/web3.js Keypair import doesn't bloat the
  // browser bundle if this file is mistakenly imported client-side.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Keypair: KeypairCtor } = require("@solana/web3.js") as typeof import("@solana/web3.js");
  const secret = Uint8Array.from(JSON.parse(raw) as number[]);
  _mintAuthority = KeypairCtor.fromSecretKey(secret);
  return _mintAuthority;
}

export interface TransferIDRZInput {
  from: Signer;
  to: PublicKey;
  amount: bigint;
  connection?: Connection;
}

/**
 * Server-side IDRZ transfer using a known signer.
 *
 * Donor-initiated transfers should NOT go through this — those build a
 * transaction client-side and sign with `wallet-adapter` / Privy, then submit
 * via `connection.sendTransaction`.
 */
export async function transferIDRZ(input: TransferIDRZInput): Promise<string> {
  assertServer("transferIDRZ");
  const conn = input.connection ?? getConnection();
  const mint = getIDRZMint();

  const fromAta = await getOrCreateAssociatedTokenAccount(
    conn,
    input.from,
    mint,
    input.from.publicKey,
  );
  const toAta = await getOrCreateAssociatedTokenAccount(
    conn,
    input.from,
    mint,
    input.to,
  );

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Transaction, sendAndConfirmTransaction } = require("@solana/web3.js") as typeof import("@solana/web3.js");

  const tx = new Transaction().add(
    createTransferInstruction(
      fromAta.address,
      toAta.address,
      input.from.publicKey,
      input.amount,
      [],
      TOKEN_PROGRAM_ID,
    ),
  );

  return sendAndConfirmTransaction(conn, tx, [input.from]);
}
