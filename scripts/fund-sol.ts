import "./_lib/load-env";

import { resolve } from "node:path";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

import { requireEnv } from "./_lib/env";
import { loadOrCreateKeypair } from "./_lib/keypair";

const LOG = "[mizaan/fund-sol]";
const PAYER_PATH = resolve(process.cwd(), "keypairs", "payer.json");

async function main() {
  const recipientArg = process.argv[2];
  const amountArg = process.argv[3] ?? "0.5";
  if (!recipientArg) {
    console.error(`${LOG} usage: tsx scripts/fund-sol.ts <wallet> [sol=0.5]`);
    process.exit(1);
  }

  const recipient = new PublicKey(recipientArg);
  const amountSol = Number(amountArg);
  const rpcUrl = requireEnv("NEXT_PUBLIC_SOLANA_RPC_URL");
  const connection = new Connection(rpcUrl, "confirmed");
  const { keypair: payer } = loadOrCreateKeypair(PAYER_PATH);

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: recipient,
      lamports: Math.floor(amountSol * LAMPORTS_PER_SOL),
    }),
  );
  const sig = await sendAndConfirmTransaction(connection, tx, [payer]);
  console.log(`${LOG} sent ${amountSol} SOL to ${recipient.toBase58()} — sig=${sig}`);
}

main().catch((e) => {
  console.error(`${LOG} fatal:`, e instanceof Error ? e.stack ?? e.message : e);
  process.exit(1);
});
