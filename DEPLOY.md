# Mizaan — Vercel deployment

## One-time setup

### 1. Push code to GitHub

```bash
git add .
git commit -m "feat: real on-chain SAS attestation flow"
git push origin main
```

### 2. Import to Vercel

1. Go to https://vercel.com/new
2. Pick the `mizaan` repo
3. Framework: **Next.js** (auto-detected)
4. Root directory: leave as repo root
5. Build / install commands: leave default (vercel.json handles it)
6. **Do NOT click Deploy yet** — env vars must be set first

### 3. Paste env vars

In the Vercel project setup screen, expand **Environment Variables** and
paste these (Production + Preview + Development). The values come from
your local `.env.local`.

**App / RPC**

| Key | Value |
|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://mizaan.vercel.app` (or your custom domain) |
| `NEXT_PUBLIC_APP_NAME` | `Mizaan` |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | `id` |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | _copy from `.env.local`_ |
| `NEXT_PUBLIC_SOLANA_NETWORK` | `devnet` |

**IDRZ token (already minted on devnet)**

| Key | Value |
|---|---|
| `NEXT_PUBLIC_IDRZ_MINT` | _copy from `.env.local`_ |
| `IDRZ_MINT_AUTHORITY_KEYPAIR` | _copy 64-byte array from `.env.local`_ |

**SAS (Solana Attestation Service) — already created on devnet**

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SAS_CREDENTIAL_PDA` | _from `.env.local`_ |
| `NEXT_PUBLIC_SAS_DONATION_SCHEMA` | _from `.env.local`_ |
| `NEXT_PUBLIC_SAS_DISTRIBUTION_SCHEMA` | _from `.env.local`_ |
| `NEXT_PUBLIC_SAS_RECEIPT_SCHEMA` | _from `.env.local`_ |
| `NEXT_PUBLIC_SAS_LAZ_IDENTITY_SCHEMA` | _from `.env.local`_ |
| `NEXT_PUBLIC_SAS_MUSTAHIK_SCHEMA` | _from `.env.local`_ |
| `LAZ_AUTHORITY_KEYPAIR` | _64-byte JSON array from `.env.local`_ |

**Privy embedded wallet**

| Key | Value |
|---|---|
| `NEXT_PUBLIC_PRIVY_APP_ID` | _from `.env.local`_ |
| `PRIVY_APP_SECRET` | _from `.env.local`_ |

**Supabase**

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | _from `.env.local`_ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | _from `.env.local`_ |
| `SUPABASE_SERVICE_ROLE_KEY` | _from `.env.local`_ — server-only, mark as protected |
| `SUPABASE_JWT_SECRET` | _from `.env.local`_ — server-only |

**Email (Resend)**

| Key | Value |
|---|---|
| `RESEND_API_KEY` | _from `.env.local`_ — server-only |
| `RESEND_FROM_EMAIL` | `onboarding@resend.dev` (or `noreply@mizaan.id` once verified) |

### 4. Configure Supabase redirects

In the Supabase dashboard for project `tkosjlqmvcnnirsxesle`:

1. Authentication → URL Configuration
2. Add to **Redirect URLs**:
   - `https://mizaan.vercel.app/**` (production)
   - `https://*.vercel.app/**` (preview deploys)
3. Set **Site URL** to your production URL

### 5. Click Deploy

After Vercel's first build (~2 min), the public URL will work end-to-end:
- Real Supabase data
- Real SAS attestations on devnet
- Real live feed via Supabase Realtime

## Smoke test after deploy

```bash
# Replace mizaan.vercel.app with your URL
curl https://mizaan.vercel.app/api/laz | jq '.data | length'         # → 5
curl https://mizaan.vercel.app/api/feed | jq '.data | length'        # → some number > 0
# Try a donation roundtrip
curl -X POST https://mizaan.vercel.app/api/donations \
  -H 'content-type: application/json' \
  -d '{
    "donorWallet":"7xKXmRrFsHnL3eP2vTQbWzNcA5dM6sV9YpJg4kB8uH1F",
    "lazId":"445e6666-c693-4998-b420-82d85c802ad8",
    "donationType":"ZAKAT_MAL","amountIdrz":"1000000",
    "categoryPreference":["PENDIDIKAN"],
    "tokenTransferSignature":"YOUR_BASE58_HERE"
  }'
```

## What's NOT deployed

- `keypairs/*.json` — local-only signing keys. The relevant keypair bytes
  are embedded into env vars (`LAZ_AUTHORITY_KEYPAIR`,
  `IDRZ_MINT_AUTHORITY_KEYPAIR`). Setup scripts run **locally**, not in
  Vercel. Re-running `setup:devnet` after deploy is unnecessary — the
  mint + credential + schemas already exist on devnet.
- `.env.local` — never committed; values must be pasted into Vercel.

## Rollback

If a deploy goes bad, in Vercel dashboard:
1. Deployments → pick a previous Production
2. "Promote to Production"
