import "dotenv/config";

import { resolve } from "node:path";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";

import { isEnvSet, optionalEnv, requireEnv } from "./_lib/env";
import {
  keypairToSecretJson,
  loadOrCreateKeypair,
} from "./_lib/keypair";

// TODO: install sas-lib / gill — referenced by SRS §3.3
// Once available, replace the stubbed SAS section below with real calls.
// import { createCredential, createSchema } from "sas-lib";
// import { generateKeyPairSigner } from "gill";

const LOG = "[mizaan/setup]";
const KEYPAIR_DIR = resolve(process.cwd(), "keypairs");
const PAYER_PATH = resolve(KEYPAIR_DIR, "payer.json");
const MINT_AUTHORITY_PATH = resolve(KEYPAIR_DIR, "idrz-mint-authority.json");
const LAZ_AUTHORITY_PATH = resolve(KEYPAIR_DIR, "laz-authority.json");
const SAS_PLATFORM_AUTHORITY_PATH = resolve(
  KEYPAIR_DIR,
  "sas-platform-authority.json",
);

const IDRZ_INITIAL_SUPPLY: bigint = 1_000_000_000_000n;
const IDRZ_DECIMALS = 0;
const MIN_PAYER_BALANCE_SOL = 2;

interface OutputEnv {
  NEXT_PUBLIC_IDRZ_MINT?: string;
  IDRZ_MINT_AUTHORITY_KEYPAIR?: string;
  NEXT_PUBLIC_SAS_CREDENTIAL_PDA?: string;
  NEXT_PUBLIC_SAS_DONATION_SCHEMA?: string;
  NEXT_PUBLIC_SAS_DISTRIBUTION_SCHEMA?: string;
  NEXT_PUBLIC_SAS_RECEIPT_SCHEMA?: string;
  NEXT_PUBLIC_SAS_LAZ_IDENTITY_SCHEMA?: string;
  NEXT_PUBLIC_SAS_MUSTAHIK_SCHEMA?: string;
  LAZ_AUTHORITY_KEYPAIR?: string;
}

const out: OutputEnv = {};

interface SchemaDef {
  envKey: keyof OutputEnv;
  name: string;
  layout: ReadonlyArray<{ name: string; type: string }>;
}

const SAS_SCHEMAS: ReadonlyArray<SchemaDef> = [
  {
    envKey: "NEXT_PUBLIC_SAS_DONATION_SCHEMA",
    name: "MIZAAN_DONATION_V1",
    layout: [
      { name: "donorWallet", type: "Pubkey" },
      { name: "lazWallet", type: "Pubkey" },
      { name: "amountIDRZ", type: "u64" },
      { name: "donationType", type: "u8" },
      { name: "categoryPreference", type: "u8" },
      { name: "donorMessageHash", type: "String" },
      { name: "createdAt", type: "i64" },
      { name: "tokenTransferSignature", type: "String" },
    ],
  },
  {
    envKey: "NEXT_PUBLIC_SAS_DISTRIBUTION_SCHEMA",
    name: "MIZAAN_DISTRIBUTION_V1",
    layout: [
      { name: "donationCommitmentPDA", type: "Pubkey" },
      { name: "lazWallet", type: "Pubkey" },
      { name: "mustahikWallet", type: "Pubkey" },
      { name: "amountIDRZ", type: "u64" },
      { name: "category", type: "u8" },
      { name: "asnaf", type: "u8" },
      { name: "mustahikIdHash", type: "String" },
      { name: "purposeDescription", type: "String" },
      { name: "createdAt", type: "i64" },
      { name: "tokenTransferSignature", type: "String" },
    ],
  },
  {
    envKey: "NEXT_PUBLIC_SAS_RECEIPT_SCHEMA",
    name: "MIZAAN_RECEIPT_V1",
    layout: [
      { name: "distributionDecisionPDA", type: "Pubkey" },
      { name: "mustahikWallet", type: "Pubkey" },
      { name: "lazWallet", type: "Pubkey" },
      { name: "confirmedAt", type: "i64" },
      { name: "confirmationMethod", type: "u8" },
      { name: "thankYouMessageHash", type: "String" },
      { name: "magicLinkConsentHash", type: "String" },
    ],
  },
  {
    envKey: "NEXT_PUBLIC_SAS_LAZ_IDENTITY_SCHEMA",
    name: "MIZAAN_LAZ_IDENTITY_V1",
    layout: [
      { name: "lazWallet", type: "Pubkey" },
      { name: "lazNameHash", type: "String" },
      { name: "lazSlug", type: "String" },
      { name: "lazRegistrationNumber", type: "String" },
      { name: "websiteURL", type: "String" },
      { name: "contactEmail", type: "String" },
      { name: "region", type: "String" },
      { name: "jurisdictionLevel", type: "u8" },
      { name: "status", type: "u8" },
      { name: "registeredAt", type: "i64" },
      { name: "mizaanAuthority", type: "Pubkey" },
    ],
  },
  {
    envKey: "NEXT_PUBLIC_SAS_MUSTAHIK_SCHEMA",
    name: "MIZAAN_MUSTAHIK_V1",
    layout: [
      { name: "mustahikWallet", type: "Pubkey" },
      { name: "lazWallet", type: "Pubkey" },
      { name: "mustahikIdHash", type: "String" },
      { name: "asnafCategory", type: "u8" },
      { name: "region", type: "String" },
      { name: "initials", type: "String" },
      { name: "ageRange", type: "u8" },
      { name: "status", type: "u8" },
      { name: "registeredAt", type: "i64" },
    ],
  },
];

async function step<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
  console.log(`\n${LOG} >>> ${label}`);
  try {
    const result = await fn();
    console.log(`${LOG} <<< ${label} OK`);
    return result;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`${LOG} <<< ${label} FAILED: ${msg}`);
    return null;
  }
}

async function checkConnection(connection: Connection): Promise<void> {
  const slot = await connection.getSlot();
  const version = await connection.getVersion();
  console.log(
    `${LOG} connected — slot=${slot} solana-core=${version["solana-core"]}`,
  );
}

async function ensurePayerFunded(
  connection: Connection,
  payer: Keypair,
): Promise<void> {
  const balance = await connection.getBalance(payer.publicKey);
  const balSol = balance / LAMPORTS_PER_SOL;
  console.log(
    `${LOG} payer ${payer.publicKey.toBase58()} balance=${balSol.toFixed(4)} SOL`,
  );

  if (balSol >= MIN_PAYER_BALANCE_SOL) {
    return;
  }

  console.log(`${LOG} balance below ${MIN_PAYER_BALANCE_SOL} SOL — airdropping`);

  const heliusOk = await tryHeliusAirdrop(connection, payer.publicKey);
  if (heliusOk) {
    return;
  }

  try {
    const sig = await connection.requestAirdrop(
      payer.publicKey,
      2 * LAMPORTS_PER_SOL,
    );
    const latest = await connection.getLatestBlockhash();
    await connection.confirmTransaction(
      { signature: sig, ...latest },
      "confirmed",
    );
    console.log(`${LOG} requestAirdrop confirmed: ${sig}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(
      `${LOG} airdrop failed (${msg}). If devnet is rate-limiting, fund manually:`,
    );
    console.warn(
      `${LOG}   solana airdrop 2 ${payer.publicKey.toBase58()} --url devnet`,
    );
  }
}

async function tryHeliusAirdrop(
  connection: Connection,
  pubkey: PublicKey,
): Promise<boolean> {
  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "";
  if (!rpcUrl.includes("helius")) return false;

  try {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "mizaan-airdrop",
        method: "requestAirdrop",
        params: [pubkey.toBase58(), 2 * LAMPORTS_PER_SOL],
      }),
    });
    if (!res.ok) return false;
    const json = (await res.json()) as { result?: string; error?: unknown };
    if (typeof json.result === "string") {
      const latest = await connection.getLatestBlockhash();
      await connection.confirmTransaction(
        { signature: json.result, ...latest },
        "confirmed",
      );
      console.log(`${LOG} Helius airdrop confirmed: ${json.result}`);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

async function setupIdrzMint(
  connection: Connection,
  payer: Keypair,
): Promise<void> {
  if (isEnvSet("NEXT_PUBLIC_IDRZ_MINT")) {
    const existing = optionalEnv("NEXT_PUBLIC_IDRZ_MINT");
    console.warn(
      `${LOG} NEXT_PUBLIC_IDRZ_MINT already set (${existing}). Skipping mint creation.`,
    );
    out.NEXT_PUBLIC_IDRZ_MINT = existing;
    return;
  }

  const { keypair: mintAuthority } = loadOrCreateKeypair(MINT_AUTHORITY_PATH);
  console.log(
    `${LOG} mint authority ${mintAuthority.publicKey.toBase58()}`,
  );

  const mint = await createMint(
    connection,
    payer,
    mintAuthority.publicKey,
    null,
    IDRZ_DECIMALS,
  );
  console.log(`${LOG} created IDRZ mint ${mint.toBase58()}`);

  const ata = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    mintAuthority.publicKey,
  );
  console.log(`${LOG} mint authority ATA ${ata.address.toBase58()}`);

  const sig = await mintTo(
    connection,
    payer,
    mint,
    ata.address,
    mintAuthority,
    IDRZ_INITIAL_SUPPLY,
  );
  console.log(
    `${LOG} minted ${IDRZ_INITIAL_SUPPLY.toString()} IDRZ to authority ATA — sig=${sig}`,
  );

  out.NEXT_PUBLIC_IDRZ_MINT = mint.toBase58();
  out.IDRZ_MINT_AUTHORITY_KEYPAIR = keypairToSecretJson(mintAuthority);
}

async function setupSasCredential(): Promise<void> {
  if (isEnvSet("NEXT_PUBLIC_SAS_CREDENTIAL_PDA")) {
    const existing = optionalEnv("NEXT_PUBLIC_SAS_CREDENTIAL_PDA");
    console.warn(
      `${LOG} NEXT_PUBLIC_SAS_CREDENTIAL_PDA already set (${existing}). Skipping credential creation.`,
    );
    out.NEXT_PUBLIC_SAS_CREDENTIAL_PDA = existing;
    return;
  }

  const { keypair: platformAuthority } = loadOrCreateKeypair(
    SAS_PLATFORM_AUTHORITY_PATH,
  );
  console.log(
    `${LOG} platform authority ${platformAuthority.publicKey.toBase58()}`,
  );

  // TODO: install sas-lib — referenced by SRS §3.3.
  // Replace with:
  //   const credential = await createCredential({
  //     authority: <gill KeyPairSigner from platformAuthority>,
  //     name: "Mizaan Platform",
  //   });
  //   out.NEXT_PUBLIC_SAS_CREDENTIAL_PDA = credential.pda.toString();
  console.log(`${LOG} [skipped: sas-lib not installed] credential creation`);
}

async function setupSasSchemas(): Promise<void> {
  for (const schema of SAS_SCHEMAS) {
    if (isEnvSet(schema.envKey)) {
      const existing = optionalEnv(schema.envKey);
      console.warn(
        `${LOG} ${schema.envKey} already set (${existing}). Skipping ${schema.name}.`,
      );
      out[schema.envKey] = existing;
      continue;
    }

    // TODO: install sas-lib — referenced by SRS §3.3.
    // Replace with:
    //   const result = await createSchema({
    //     credential: <credential.pda from setupSasCredential>,
    //     name: schema.name,
    //     layout: schema.layout,
    //   });
    //   out[schema.envKey] = result.pda.toString();
    console.log(
      `${LOG} [skipped: sas-lib not installed] ${schema.name} (${schema.layout.length} fields)`,
    );
  }
}

async function setupLazAuthority(): Promise<void> {
  if (isEnvSet("LAZ_AUTHORITY_KEYPAIR")) {
    console.warn(
      `${LOG} LAZ_AUTHORITY_KEYPAIR already set in env. Skipping generation.`,
    );
    return;
  }

  const { keypair: lazAuthority, created } = loadOrCreateKeypair(
    LAZ_AUTHORITY_PATH,
  );
  console.log(
    `${LOG} LAZ authority ${lazAuthority.publicKey.toBase58()} (${created ? "new" : "loaded"})`,
  );
  out.LAZ_AUTHORITY_KEYPAIR = keypairToSecretJson(lazAuthority);
}

function printEnvBlock(): void {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(out)) {
    if (value === undefined) continue;
    lines.push(`${key}=${value}`);
  }
  console.log("\n=====================================================");
  console.log("# Add to .env.local:");
  console.log("=====================================================");
  if (lines.length === 0) {
    console.log("# (no values produced — check errors above)");
  } else {
    for (const l of lines) console.log(l);
  }
  console.log("=====================================================\n");
}

async function main(): Promise<void> {
  console.log(`${LOG} starting Mizaan devnet bootstrap`);

  const rpcUrl = requireEnv("NEXT_PUBLIC_SOLANA_RPC_URL");
  const connection = new Connection(rpcUrl, "confirmed");

  await step("connection check", () => checkConnection(connection));

  const { keypair: payer, created: payerCreated } = loadOrCreateKeypair(
    PAYER_PATH,
  );
  console.log(
    `${LOG} payer ${payer.publicKey.toBase58()} (${payerCreated ? "new" : "loaded"})`,
  );

  await step("airdrop / fund payer", () =>
    ensurePayerFunded(connection, payer),
  );

  await step("create IDRZ SPL token mint", () =>
    setupIdrzMint(connection, payer),
  );

  await step("create SAS Mizaan credential", () => setupSasCredential());

  await step("create SAS schemas", () => setupSasSchemas());

  await step("generate LAZ authority keypair", () => setupLazAuthority());

  printEnvBlock();
  console.log(`${LOG} done.`);
}

main().catch((err) => {
  const msg = err instanceof Error ? err.stack ?? err.message : String(err);
  console.error(`${LOG} fatal: ${msg}`);
  process.exit(1);
});
