import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { Keypair } from "@solana/web3.js";

const LOG_PREFIX = "[mizaan/keypair]";

export function saveKeypair(kp: Keypair, filepath: string): void {
  const abs = resolve(filepath);
  mkdirSync(dirname(abs), { recursive: true });
  const bytes: number[] = Array.from(kp.secretKey);
  writeFileSync(abs, JSON.stringify(bytes), { mode: 0o600 });
  console.log(`${LOG_PREFIX} wrote ${abs}`);
}

export function loadKeypair(filepath: string): Keypair {
  const abs = resolve(filepath);
  const raw = readFileSync(abs, "utf8");
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed) || !parsed.every((n) => typeof n === "number")) {
    throw new Error(`${filepath} is not a valid keypair byte-array JSON`);
  }
  return Keypair.fromSecretKey(Uint8Array.from(parsed as number[]));
}

export function loadOrCreateKeypair(filepath: string): {
  keypair: Keypair;
  created: boolean;
} {
  const abs = resolve(filepath);
  if (existsSync(abs)) {
    return { keypair: loadKeypair(abs), created: false };
  }
  const kp = Keypair.generate();
  saveKeypair(kp, abs);
  return { keypair: kp, created: true };
}

export function keypairToSecretJson(kp: Keypair): string {
  const bytes: number[] = Array.from(kp.secretKey);
  return JSON.stringify(bytes);
}

export function keypairFromSecretJson(json: string): Keypair {
  const parsed: unknown = JSON.parse(json);
  if (!Array.isArray(parsed) || !parsed.every((n) => typeof n === "number")) {
    throw new Error("invalid keypair JSON — expected number[]");
  }
  return Keypair.fromSecretKey(Uint8Array.from(parsed as number[]));
}
