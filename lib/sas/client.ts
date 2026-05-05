/**
 * Thin wrapper exposing the Mizaan credential PDA + the 5 schema PDAs.
 *
 * All PDAs are sourced from public env vars provisioned by
 * `scripts/setup-devnet.ts` (SRS §6.7).
 */

import { PublicKey } from "@solana/web3.js";
import type { SasSchemaName } from "./schemas";

function readPda(envVar: string, label: string): PublicKey {
  const raw = process.env[envVar];
  if (!raw) {
    throw new Error(
      `${envVar} is not set — required to resolve the ${label} PDA. ` +
        `Run \`pnpm setup:devnet\` and copy outputs into .env.local.`,
    );
  }
  return new PublicKey(raw);
}

export function getCredentialPda(): PublicKey {
  return readPda("NEXT_PUBLIC_SAS_CREDENTIAL_PDA", "Mizaan credential");
}

export function getSchemaPda(schema: SasSchemaName): PublicKey {
  switch (schema) {
    case "MIZAAN_DONATION_V1":
      return readPda("NEXT_PUBLIC_SAS_DONATION_SCHEMA", "donation schema");
    case "MIZAAN_DISTRIBUTION_V1":
      return readPda("NEXT_PUBLIC_SAS_DISTRIBUTION_SCHEMA", "distribution schema");
    case "MIZAAN_RECEIPT_V1":
      return readPda("NEXT_PUBLIC_SAS_RECEIPT_SCHEMA", "receipt schema");
    case "MIZAAN_LAZ_IDENTITY_V1":
      return readPda("NEXT_PUBLIC_SAS_LAZ_IDENTITY_SCHEMA", "LAZ identity schema");
    case "MIZAAN_MUSTAHIK_V1":
      return readPda("NEXT_PUBLIC_SAS_MUSTAHIK_SCHEMA", "mustahik schema");
  }
}

/** Returns every schema PDA in one shot — handy for boot-time validation. */
export function getAllSchemaPdas(): Record<SasSchemaName, PublicKey> {
  return {
    MIZAAN_DONATION_V1: getSchemaPda("MIZAAN_DONATION_V1"),
    MIZAAN_DISTRIBUTION_V1: getSchemaPda("MIZAAN_DISTRIBUTION_V1"),
    MIZAAN_RECEIPT_V1: getSchemaPda("MIZAAN_RECEIPT_V1"),
    MIZAAN_LAZ_IDENTITY_V1: getSchemaPda("MIZAAN_LAZ_IDENTITY_V1"),
    MIZAAN_MUSTAHIK_V1: getSchemaPda("MIZAAN_MUSTAHIK_V1"),
  };
}

// TODO: install `sas-lib` — referenced by SRS §3.3.
// Once installed, expose a configured client factory here, e.g.:
//   import { createSasClient } from "sas-lib";
//   export function getSasClient(signer: KeyPairSigner) {
//     return createSasClient({
//       rpc: gillRpc,
//       credential: getCredentialPda().toBase58(),
//       authority: signer,
//     });
//   }
// See https://attest.solana.com for the canonical API surface.
