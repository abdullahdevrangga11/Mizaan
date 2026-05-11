// Shared @solana/kit RPC setup + keypair-loading helpers for SAS scripts.
//
// The rest of the project uses @solana/web3.js v1, but sas-lib is built
// against the newer @solana/kit v5. Both can target the same Helius endpoint;
// they just expose different abstractions. This module isolates the kit-side
// plumbing so other scripts don't have to know about it.

import { readFileSync } from "node:fs";
import {
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  sendAndConfirmTransactionFactory,
  type Rpc,
  type SolanaRpcApi,
  type RpcSubscriptions,
  type SolanaRpcSubscriptionsApi,
} from "@solana/kit";
import { createKeyPairSignerFromBytes, type KeyPairSigner } from "@solana/signers";

export interface KitClient {
  rpc: Rpc<SolanaRpcApi>;
  rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
  sendAndConfirm: ReturnType<typeof sendAndConfirmTransactionFactory>;
}

/**
 * Build an RPC+subscriptions client from NEXT_PUBLIC_SOLANA_RPC_URL.
 * Helius URLs use `https://...?api-key=...` for HTTP — convert to `wss://`
 * for the subscriptions endpoint.
 */
export function createKitClient(): KitClient {
  const httpsUrl = requireRpcUrl();
  const wssUrl = httpsUrl.replace(/^https:\/\//, "wss://");

  const rpc = createSolanaRpc(httpsUrl);
  const rpcSubscriptions = createSolanaRpcSubscriptions(wssUrl);
  const sendAndConfirm = sendAndConfirmTransactionFactory({
    rpc,
    rpcSubscriptions,
  });
  return { rpc, rpcSubscriptions, sendAndConfirm };
}

function requireRpcUrl(): string {
  const url = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_SOLANA_RPC_URL is required for SAS operations",
    );
  }
  return url;
}

/**
 * Load a web3.js-style 64-byte keypair JSON file as a @solana/kit signer.
 * Our `keypairs/*.json` files are produced by `loadOrCreateKeypair` and
 * contain a JSON array of 64 unsigned bytes (32-byte secret + 32-byte pubkey).
 */
export async function loadKeypairAsSigner(
  path: string,
): Promise<KeyPairSigner> {
  const raw = readFileSync(path, "utf8");
  const arr = JSON.parse(raw);
  if (!Array.isArray(arr) || arr.length !== 64) {
    throw new Error(`keypair file ${path} is not a 64-byte array`);
  }
  const bytes = new Uint8Array(arr);
  return createKeyPairSignerFromBytes(bytes);
}

/**
 * SAS layout type codes (from sas-lib/src/utils.js).
 * Subset that we actually use in Mizaan schemas.
 */
export const SAS_TYPE = {
  U8: 0,
  U16: 1,
  U32: 2,
  U64: 3,
  I8: 5,
  I32: 7,
  I64: 8,
  BOOL: 10,
  STRING: 12,
  VEC_STRING: 24,
} as const;
