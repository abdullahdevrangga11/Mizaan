const LOG_PREFIX = "[mizaan/env]";

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    console.error(
      `${LOG_PREFIX} missing required env var ${name}. Add it to .env.local then re-run.`,
    );
    process.exit(1);
  }
  return value;
}

export function optionalEnv(name: string): string | undefined {
  const value = process.env[name];
  if (!value || value.trim() === "") return undefined;
  return value;
}

export function isEnvSet(name: string): boolean {
  return optionalEnv(name) !== undefined;
}

export function requireMany(names: readonly string[]): Record<string, string> {
  const missing: string[] = [];
  const out: Record<string, string> = {};
  for (const n of names) {
    const v = process.env[n];
    if (!v || v.trim() === "") missing.push(n);
    else out[n] = v;
  }
  if (missing.length > 0) {
    console.error(
      `${LOG_PREFIX} missing required env vars: ${missing.join(", ")}.`,
    );
    console.error(`${LOG_PREFIX} populate .env.local then re-run.`);
    process.exit(1);
  }
  return out;
}

export function envFlag(name: string, fallback = false): boolean {
  const v = process.env[name];
  if (v === undefined) return fallback;
  return /^(1|true|yes|on)$/i.test(v.trim());
}
