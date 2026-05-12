<div align="center">

# Mizaan

**On-chain transparency for zakat, sedekah, and infaq distribution in Indonesia.**

[![Solana](https://img.shields.io/badge/Solana-Devnet-14F195?style=flat-square&logo=solana&logoColor=white)](https://solscan.io/account/CLDKtP943CebTrrRsU9SzshhcyNU4ViZNEJ1kUrzuRD4?cluster=devnet)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

[Live demo](https://mizaan-ivory.vercel.app) · [Demo video](https://youtu.be/EDV9nXaFyj8) · [Pitch video](https://youtu.be/zOLFxIUjsxE)

</div>

---

## What is Mizaan?

**Mizaan** (Arabic: *ميزان*, "scale" or "balance") is an on-chain transparency layer for zakat distribution in Indonesia, built on **Solana** via the **Solana Attestation Service (SAS)**.

Indonesians give over **$2B in zakat every year**. BAZNAS estimates the real potential is **$25B**. The gap is trust — donors have no way to prove a single Rupiah reached someone in need. Existing LAZ (zakat distribution agencies) publish PDF reports that are easy to fabricate and impossible to verify at the recipient level.

Mizaan fixes this at the credential layer. Every donation gets **three signed on-chain attestations**:

```
donor commits  →  laz amil distributes  →  mustahik confirms
       ↓                    ↓                       ↓
  signature 1          signature 2            signature 3
                  one cryptographic chain
```

Anyone can verify any chain in real time, end to end, from donor wallet to mustahik phone. Transparency becomes the artifact of the workflow — not a PDF generated after the fact.

---

## Try it on Solana Devnet right now

Open [`/verify`](https://mizaan-ivory.vercel.app/en/verify) and paste this PDA:

```
CLDKtP943CebTrrRsU9SzshhcyNU4ViZNEJ1kUrzuRD4
```

That's a **real on-chain donation commitment attestation** for Pak Subandi Hartono in Bantul, DI Yogyakarta. The full chain is verifiable on Solscan Devnet:

| Step | PDA | Solscan |
|---|---|---|
| Donation commitment | `CLDKtP9…uRD4` | [view](https://solscan.io/account/CLDKtP943CebTrrRsU9SzshhcyNU4ViZNEJ1kUrzuRD4?cluster=devnet) |
| Distribution decision | `2xE5DQg…4Ygy` | [view](https://solscan.io/account/2xE5DQgK3sSwQmmaoPGuV2WS2Fdam3Nuv46omK8Q4Ygy?cluster=devnet) |
| Receipt confirmation | `9aux7mq…1DZHf` | [view](https://solscan.io/account/9aux7mq9C3V4jVjCUz8nGKmM3yss2rV4czGny5y1DZHf?cluster=devnet) |

---

## Tech stack

| Layer | Technology |
| ----- | ---------- |
| Framework | **Next.js 16** (App Router · Turbopack · React 19) |
| Language | **TypeScript 5.8** strict mode |
| Styling | **Tailwind CSS v4** (`@theme` in `app/globals.css`) |
| i18n | **next-intl 4** — `id` (default) + `en` |
| Blockchain | **Solana Devnet** |
| Credential layer | **`sas-lib`** — Solana Attestation Service |
| Solana client | **`@solana/kit`** + **`@solana/web3.js`** |
| Wallet (crypto-native) | **`@solana/wallet-adapter-react`** (Phantom + Solflare) |
| Wallet (diaspora) | **`@privy-io/react-auth`** (email/SMS embedded wallets) |
| RPC | **Helius** |
| Database | **Supabase Postgres** (LAZ, mustahik, donation metadata) |
| Auth | **Supabase Auth** (LAZ admin + mustahik magic link) |
| Realtime | **Supabase Realtime** (live activity feed) |
| Hosting | **Vercel** |

---

## Routes

```
/                          landing
/donate                    6-step donation flow
/donate/[donationId]       donation success page
/track/[walletAddress]     donor receipt page ("zakat trail")
/verify                    public verifier — paste any wallet, PDA, or donation ID
/feed                      live activity stream (Supabase Realtime)
/laz                       LAZ directory
/laz/[lazId]               LAZ profile
/laz/admin/distribute/...  LAZ admin distribution console (auth-gated)
/confirm/[token]           mustahik mobile confirmation
```

All pages support `/id` (Bahasa Indonesia, default) and `/en` (English).

---

## Run it locally

```bash
# 1. Copy environment template and fill in your keys
cp .env.example .env.local

# 2. Install dependencies
npm install

# 3. Provision Solana Devnet — mints IDRZ, deploys 5 SAS schemas, creates LAZ authority
npm run setup:devnet

# 4. Seed demo data
npm run seed:laz        # 5 LAZ partners with on-chain identity attestations
npm run seed:mustahik   # 50 mustahik across all LAZ
npm run seed:demo       # 5 end-to-end donation chains (donor → laz → mustahik)

# 5. Start dev server
npm run dev
```

Visit `http://localhost:3000` and follow the demo URLs printed in the seed script output.

---

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────────┐
│   Donor UI  │     │   LAZ Admin  │     │   Mustahik Mobile   │
│  /donate    │     │ /laz/admin   │     │   /confirm/[token]  │
└──────┬──────┘     └──────┬───────┘     └──────────┬──────────┘
       │                   │                        │
       └─────────┬─────────┴────────────────────────┘
                 │
                 ▼
         ┌───────────────┐
         │  Next.js API  │
         │   /api/*      │
         └───────┬───────┘
                 │
       ┌─────────┴─────────────────────────────────┐
       │                                           │
       ▼                                           ▼
┌─────────────────┐                       ┌───────────────────┐
│ Solana Devnet   │                       │ Supabase Postgres │
│ - SAS attests   │                       │ - off-chain meta  │
│ - IDRZ transfer │                       │ - RLS policies    │
└─────────────────┘                       └───────────────────┘
       │                                           ▲
       └──────────────► /verify ◄──────────────────┘
                    (public read)
```

The chain itself lives on Solana. Supabase holds the off-chain metadata (mustahik PII, donor display names, encrypted messages) that doesn't belong on-chain. Both are joined at read time on `/verify` and `/track`.

---

## Hackathon submission

Built solo over 6 weeks for the **Indonesia National Campus Hackathon 2026** by Superteam Indonesia, in parallel to the **Colosseum Frontier Hackathon** (Consumer Apps track).

- **Founder:** [Devrangga Hazza Mahiswara](https://devrangga.dev) — Yogyakarta, Indonesia
- **GitHub:** [`github.com/abdullahdevrangga11/Mizaan`](https://github.com/abdullahdevrangga11/Mizaan)

---

## License

MIT
