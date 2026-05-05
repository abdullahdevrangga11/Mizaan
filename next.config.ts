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
};

export default withNextIntl(nextConfig);
