# Mizaan — local setup

Mizaan ships in two operational modes:

- **Mock mode (zero provisioning)** — landing page + `/donate` work end-to-end with in-memory state. Use for design review, demo recordings, screenshots. **This is the default if no env vars are set.**
- **Real mode (Supabase + Helius + Privy + devnet IDRZ + SAS)** — actually creates on-chain attestations, persists `donations_meta` to Postgres, sends mustahik magic links. Required for the live demo against Solana devnet.

If you only want to look at the UI, just run `pnpm dev` and stop reading.

---

## 1 — Provision external accounts (≈ 20 min, all free tiers)

| Service | What you need | Where |
|---|---|---|
| **Helius** | devnet RPC API key | <https://helius.dev> → New project → copy URL |
| **Supabase** | URL + anon key + service-role key | <https://supabase.com> → New project → API settings |
| **Privy** | App ID + app secret | <https://privy.io> → New app → Solana support enabled |
| **Resend** | API key (REUSE existing account) | <https://resend.com> → add `mizaan.id` as verified domain |

## 2 — Fill `.env.local`

```bash
cp .env.example .env.local
```

Paste the values from step 1 into the matching slots. Leave the `IDRZ_*` and `SAS_*` slots empty — `setup:devnet` fills them.

## 3 — Apply Supabase migrations

```bash
# Install Supabase CLI if you don't have it: brew install supabase/tap/supabase
supabase login
supabase link --project-ref <YOUR_PROJECT_REF>
supabase db push                    # applies supabase/migrations/*.sql
supabase gen types typescript --linked --schema public > lib/supabase/types.ts
```

The generated types replace the placeholder `Database` type and unblock the typecheck on `lib/db/*` and `scripts/seed-*.ts`.

## 4 — Mint IDRZ + register SAS schemas

```bash
pnpm setup:devnet
```

This:
- generates a payer keypair → `keypairs/payer.json` (gitignored)
- airdrops devnet SOL via Helius
- creates the IDRZ SPL token (mint authority keypair → `keypairs/`)
- creates the Mizaan SAS credential
- creates the 5 SAS schemas (`MIZAAN_DONATION_V1`, etc.)
- generates the LAZ authority keypair

It prints a block of env-var lines at the end. **Append those to `.env.local`.**

> **NOTE:** SAS schema creation is currently stubbed because `sas-lib` is not yet installed. The script logs `[skipped: sas-lib not installed]` for those steps. Add `sas-lib` to `package.json`, then re-run.

## 5 — Seed mock LAZ + mustahik

```bash
pnpm seed:laz       # 5 LAZ partners, wallets written to keypairs/laz/
pnpm seed:mustahik  # 10 per LAZ, wallets written to keypairs/mustahik/
```

## 6 — Start the dev server

```bash
pnpm dev
```

Visit <http://localhost:3000> — the landing page should render with real data flowing through.

---

## Mode detection

The app picks its mode at request-time by checking env vars:

| Has `NEXT_PUBLIC_SUPABASE_URL` + anon key? | Mode |
|---|---|
| no | **mock** — `MOCK_LAZ` from `lib/api/mock-laz.ts`, in-memory donations |
| yes | **real** — `lib/db/laz.ts`, real Postgres, but `/api/donations` POST still 501 until SAS wired |

The fallback path is intentional: it lets reviewers click through `/donate` without provisioning anything.

---

## Faucet for testing

```bash
pnpm tsx scripts/fund-wallet.ts <wallet-address>
```

Mints 5,000,000 IDRZ to that wallet's ATA. Useful for testing the donor signing flow with a fresh Phantom account.

---

## Outstanding integration work

These are tracked in source as `TODO:` comments — search for them when you start each:

- `app/api/donations/route.ts` — real-mode POST: build SAS payload, sign attestation + IDRZ transfer, persist
- `components/providers/privy-provider.tsx` — verify `embeddedWallets.solana.createOnLogin` works against the live Privy v3 SDK
- `lib/sas/donation.ts` / `distribution.ts` / `receipt.ts` — replace stubbed bodies with real `sas-lib` calls
- `scripts/setup-devnet.ts` — uncomment the SAS schema creation once `sas-lib` is in `package.json`
- `lib/supabase/types.ts` — regenerate via `supabase gen types` (currently a hand-written placeholder)
