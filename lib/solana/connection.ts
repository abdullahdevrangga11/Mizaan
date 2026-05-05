/**
 * Solana RPC client singletons.
 *
 * Importable from server **and** client modules — only references public env
 * vars and contains no secrets. Server code that needs the IDRZ mint authority
 * keypair must import from `lib/token/idrz.ts` (server section).
 */

import { Connection, type Commitment } from "@solana/web3.js";

const DEFAULT_COMMITMENT: Commitment = "confirmed";

function readRpcUrl(): string {
  const url = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_SOLANA_RPC_URL is not set — required for the Solana RPC connection",
    );
  }
  return url;
}

let _connection: Connection | null = null;

/** Lazy singleton so module import doesn't throw when env is missing at build. */
export function getConnection(): Connection {
  if (_connection) return _connection;
  _connection = new Connection(readRpcUrl(), DEFAULT_COMMITMENT);
  return _connection;
}

/** Eagerly-evaluated alias for callers that prefer a value over a getter. */
export const connection: Connection = new Proxy({} as Connection, {
  get(_target, prop, receiver) {
    const real = getConnection();
    const value = Reflect.get(real, prop, receiver);
    return typeof value === "function" ? value.bind(real) : value;
  },
});

// ---------- gill (modern Solana client) ----------

// TODO: install `gill` — referenced by SRS §3.3.
// Once installed, replace this stub with:
//   import { createSolanaRpc } from "gill";
//   export const gillRpc = createSolanaRpc(readRpcUrl());
//
// `gill` is the preferred client for server-side SAS interactions because
// `sas-lib` is built against its `KeyPairSigner` / `Rpc` primitives.
export const gillRpc: unknown = null;
