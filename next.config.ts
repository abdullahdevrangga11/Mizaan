import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// `__dirname` isn't defined in ESM contexts (which Next 16 uses for config).
// Resolving via `import.meta.url` gives us the project root, which we pin
// for Turbopack so it stops climbing to the home directory's stray
// package-lock.json.
const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: projectRoot,
  },
  // Force these packages to load from node_modules at runtime instead of
  // being bundled into the serverless function. The @solana/* codec
  // packages contain a closure pattern (the "alphabet4" var) that Vercel's
  // bundler mangles into a ReferenceError. Externalising them sidesteps
  // the issue without changing any application code.
  serverExternalPackages: [
    "sas-lib",
    "@solana/kit",
    "@solana/signers",
    "@solana/transactions",
    "@solana/transaction-messages",
    "@solana/addresses",
    "@solana/codecs",
    "@solana/codecs-core",
    "@solana/codecs-strings",
    "@solana/codecs-numbers",
    "@solana/codecs-data-structures",
    "@solana/errors",
    "@solana/rpc",
    "@solana/rpc-subscriptions",
    "borsher",
    "borsh",
  ],
};

export default withNextIntl(nextConfig);
