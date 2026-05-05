import "dotenv/config";

import { resolve } from "node:path";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";

import { requireEnv } from "./_lib/env";
import { keypairFromSecretJson, loadOrCreateKeypair } from "./_lib/keypair";

const LOG = "[mizaan/fund-wallet]";
const FAUCET_AMOUNT: bigint = 5_000_000n;
const PAYER_PATH = resolve(process.cwd(), "keypairs", "payer.json");

function parseRecipient(): PublicKey {
  const arg = process.argv[2];
  if (!arg) {
    console.error(
      `${LOG} usage: tsx scripts/fund-wallet.ts <wallet-address>`,
    );
    process.exit(1);
  }
  try {
    return new PublicKey(arg);
  } catch {
    console.error(`${LOG} invalid pubkey: ${arg}`);
    process.exit(1);
  }
}

async function main(): Promise<void> {
  const recipient = parseRecipient();

  const rpcUrl = requireEnv("NEXT_PUBLIC_SOLANA_RPC_URL");
  const mintStr = requireEnv("NEXT_PUBLIC_IDRZ_MINT");
  const mintAuthorityJson = requireEnv("IDRZ_MINT_AUTHORITY_KEYPAIR");

  const connection = new Connection(rpcUrl, "confirmed");
  const mint = new PublicKey(mintStr);
  const mintAuthority = keypairFromSecretJson(mintAuthorityJson);

  const { keypair: payer } = loadOrCreateKeypair(PAYER_PATH);
  console.log(`${LOG} payer ${payer.publicKey.toBase58()}`);
  console.log(`${LOG} mint ${mint.toBase58()}`);
  console.log(`${LOG} recipient ${recipient.toBase58()}`);

  const recipientAta = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    recipient,
  );
  console.log(`${LOG} recipient ATA ${recipientAta.address.toBase58()}`);

  const sig = await mintTo(
    connection,
    payer,
    mint,
    recipientAta.address,
    mintAuthority,
    FAUCET_AMOUNT,
  );
  console.log(
    `${LOG} minted ${FAUCET_AMOUNT.toString()} IDRZ to ${recipient.toBase58()} — sig=${sig}`,
  );
}

main().catch((err) => {
  const msg = err instanceof Error ? err.stack ?? err.message : String(err);
  console.error(`${LOG} fatal: ${msg}`);
  process.exit(1);
});
