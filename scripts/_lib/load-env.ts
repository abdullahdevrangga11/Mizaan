// Load .env.local first (developer secrets), fall back to .env if present.
// Import this once at the top of any tsx-run script.
import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });
