# Mizaan — Software Requirements Specification

> **Companion to:** `PRD.md`
> **Audience:** Software engineers (human + AI agents) implementing Mizaan
> **Status:** Active build — Indonesia National Campus Hackathon submission
> **Target:** May 12, 2026 production-ready V1 ship

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture](#2-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Repository Structure](#4-repository-structure)
5. [Environment Variables](#5-environment-variables)
6. [SAS Schema Definitions](#6-sas-schema-definitions)
7. [IDRZ Token Setup](#7-idrz-token-setup)
8. [Data Models (TypeScript)](#8-data-models-typescript)
9. [Wallet & Authentication Strategy](#9-wallet--authentication-strategy)
10. [API Endpoints](#10-api-endpoints)
11. [Page Specifications](#11-page-specifications)
12. [Component Specifications](#12-component-specifications)
13. [Off-Chain Storage](#13-off-chain-storage)
14. [State Management](#14-state-management)
15. [Error Handling](#15-error-handling)
16. [Security Considerations](#16-security-considerations)
17. [Internationalization](#17-internationalization)
18. [Design System](#18-design-system)
19. [7-Day Implementation Timeline](#19-7-day-implementation-timeline)
20. [Testing Strategy](#20-testing-strategy)
21. [Deployment Plan](#21-deployment-plan)
22. [Demo Script](#22-demo-script)
23. [Pitch Deck Outline](#23-pitch-deck-outline)
24. [Submission Checklist](#24-submission-checklist)
25. [Code Conventions](#25-code-conventions)

---

## 1. System Overview

Mizaan is a Next.js 16 web application that interacts with Solana blockchain via the Solana Attestation Service (SAS) and a custom SPL token (IDRZ). It enables three roles — donor, LAZ administrator, mustahik — to participate in a 3-party multi-signature attestation flow that publicly tracks zakat distribution.

### 1.1 High-level data flow

```
┌────────────┐   ┌────────────┐   ┌────────────┐   ┌──────────┐
│  Donor     │──▶│    LAZ     │──▶│ Mustahik   │──▶│ Donor    │
│  (Phantom  │   │ (Email +   │   │ (SMS +     │   │ Dashboard│
│  or Privy) │   │ custodial) │   │ custodial) │   │ Updates  │
└────────────┘   └────────────┘   └────────────┘   └──────────┘
      │                │                │                ▲
      ▼                ▼                ▼                │
   SAS #1          SAS #2           SAS #3              │
 Donation       Distribution       Receipt              │
 Commitment     Decision           Confirmation         │
      │                │                │                │
      └────────────────┴────────────────┴────────────────┘
                          │
                  Solana Devnet
                  (via Helius RPC)
```

### 1.2 Three attestation types

| Attestation | Created by | Schema | Purpose |
|---|---|---|---|
| **DonationCommitment** | Donor | `MIZAAN_DONATION_V1` | Records donor's intent + amount + LAZ + category preference |
| **DistributionDecision** | LAZ | `MIZAAN_DISTRIBUTION_V1` | Records LAZ's allocation to specific mustahik with amount + category |
| **ReceiptConfirmation** | LAZ on mustahik's behalf, with mustahik's web confirmation | `MIZAAN_RECEIPT_V1` | Records mustahik's acknowledgement of receipt |

### 1.3 Token transfer separation

Token transfers (IDRZ) and attestations (SAS) are **separate concerns** but linked:
- Attestation references the transaction signature of the corresponding token transfer
- A donation = 1 IDRZ transfer + 1 SAS DonationCommitment
- A distribution = 1 IDRZ transfer (LAZ→mustahik) + 1 SAS DistributionDecision
- A receipt confirmation = 0 IDRZ transfers + 1 SAS ReceiptConfirmation

---

## 2. Architecture

### 2.1 Component diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Donor / LAZ / Mustahik)         │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐  ┌──────────────┐  │
│  │ Donor    │  │ LAZ      │  │ Mustahik   │  │ Public/Verify│  │
│  │ Pages    │  │ Pages    │  │ Pages      │  │ Pages        │  │
│  └─────┬────┘  └─────┬────┘  └──────┬─────┘  └──────┬───────┘  │
│        │             │              │                │          │
│        └─────────────┴──────────────┴────────────────┘          │
│                            │                                    │
│                  ┌─────────┴──────────┐                         │
│                  │  Wallet Adapter    │                         │
│                  │ (Phantom + Privy)  │                         │
│                  └─────────┬──────────┘                         │
└────────────────────────────┼────────────────────────────────────┘
                             │
                ┌────────────┴─────────────┐
                ▼                          ▼
      ┌──────────────────┐        ┌─────────────────┐
      │  Next.js Server  │        │  Solana Devnet  │
      │  (API Routes +   │        │  (via Helius    │
      │   Server Comp.)  │        │   RPC)          │
      └────────┬─────────┘        └────────┬────────┘
               │                           │
               │      ┌────────────────────┴────────┐
               │      ▼                             ▼
               │   ┌──────────────┐       ┌──────────────┐
               │   │ SAS Programs │       │ SPL Token    │
               │   │ (attestation)│       │ Program      │
               │   │ via sas-lib  │       │ (IDRZ)       │
               │   └──────────────┘       └──────────────┘
               │
               ▼
      ┌────────────────────────────┐
      │  SUPABASE                   │
      │  - Postgres (mustahik PII,  │
      │    LAZ metadata, donations) │
      │  - Auth (LAZ admin login,   │
      │    mustahik magic links)    │
      │  - Realtime (live feed)     │
      │  - Storage (LAZ logos)      │
      └────────────────────────────┘
```

### 2.2 Key architectural decisions

| Decision | Rationale |
|---|---|
| **Next.js 16 App Router** | Server components for SEO + streaming; client components for wallet interactions |
| **No backend server (just API routes)** | Hackathon simplicity; Vercel-native |
| **Off-chain DB only for PII (Supabase Postgres)** | UU PDP compliance; on-chain stores hashes only; RLS gives free authorization layer |
| **Custodial wallets for LAZ + mustahik** | UX: LAZ admin uses Supabase Auth (email/password); mustahik uses Supabase magic link via Resend |
| **Self-custody for donors** | Phantom or Privy embedded — donor sovereignty |
| **Sahih codebase reuse** | ~70% of components, design system, SAS infrastructure |
| **Helius RPC** | Reliable, free tier sufficient for hackathon, native DAS |
| **Custom IDRZ token** | $0 cost, full control, demonstrates SPL token usage |

---

## 3. Tech Stack

### 3.1 Core stack

| Layer | Technology | Version | Rationale |
|---|---|---|---|
| **Framework** | Next.js | 16.x | App Router, Turbopack, React Server Components |
| **Language** | TypeScript | 5.8+ | Strict mode, full type safety |
| **Runtime** | Node.js | 22+ | Latest LTS |
| **React** | React | 19+ | Latest stable |

### 3.2 Styling

| Tool | Version | Purpose |
|---|---|---|
| **Tailwind CSS** | v4.x | Utility-first CSS, `@theme` syntax |
| **`postcss`** | latest | PostCSS pipeline |
| **`@tailwindcss/postcss`** | latest | Tailwind PostCSS plugin |
| **Inline styles + CSS variables** | — | For dynamic values (Sahih convention) |

### 3.3 Solana / blockchain

| Package | Purpose |
|---|---|
| `@solana/web3.js` | Solana Web3 client (legacy compat) |
| `gill` | Modern Solana client (preferred for server-side) |
| `sas-lib` | Solana Attestation Service SDK |
| `@solana/spl-token` | SPL Token operations (IDRZ) |
| `@solana/wallet-adapter-react` | Wallet connection (Phantom, etc.) |
| `@solana/wallet-adapter-react-ui` | Pre-built wallet UI components |
| `@solana/wallet-adapter-wallets` | Wallet adapters bundle |
| `@privy-io/react-auth` | Embedded wallet for non-crypto users |

### 3.4 UI / interaction

| Package | Purpose |
|---|---|
| `sonner` | Toast notifications |
| `lucide-react` | Icon library |
| `clsx` | Conditional className utility |
| `tailwind-merge` | Tailwind class merging |
| `framer-motion` | Animations (sparingly, polish phase) |
| `qrcode` | QR code generation (mustahik confirmation links) |
| `@react-pdf/renderer` | Receipt PDF generation (V1.5, deferred) |

### 3.5 Internationalization

| Package | Purpose |
|---|---|
| `next-intl` | i18n routing + translations |
| Supported locales | `id` (default), `en`, `ar` (stretch) |

### 3.6 Off-chain storage (Supabase)

| Service | Purpose |
|---|---|
| **Supabase Postgres** | Relational store: `laz`, `mustahik`, `donations_meta`, `magic_links`, `audit_log` tables |
| **Supabase Storage** | File storage (LAZ logos, optional PDFs) |
| **Supabase Realtime** | Live activity feed pub/sub (replaces polling) |

> **Decision rationale:** Mustahik registry needs filterable queries (asnaf, region, age, status) that key-value stores can't handle cleanly. Postgres also gives free RLS, Realtime for free, and Indonesian fintech ecosystem familiarity. Single service for DB + Auth + Storage simplifies the stack.

### 3.7 Communication

| Service | Purpose |
|---|---|
| **Resend** | Transactional email — REUSING existing user account, just adds `mizaan.id` domain |
| **Twilio (or Vonage)** | SMS to mustahik (V1.1; for MVP, use email confirmation links) |

For MVP, we use email-only (mustahik notification via email instead of SMS). SMS deferred to V1.1.

**Resend setup:** No new account. Add `mizaan.id` as a verified domain in existing Resend account. Use same `RESEND_API_KEY`. Free tier (3,000 emails/month) is sufficient for hackathon and early production.

### 3.8 Auth (Supabase Auth)

| Tool | Used by |
|---|---|
| **Supabase Auth** — email/password | LAZ admin login |
| **Supabase Auth** — magic link | Mustahik receipt confirmation (replaces custom magic-link logic) |
| **Phantom / Solflare wallet** | Donor self-custody (orthogonal to Supabase) |
| **Privy embedded wallet** | Donor non-crypto onboarding (orthogonal to Supabase) |

> **Decision rationale:** Supabase Auth's magic-link flow is built-in and battle-tested. We avoid writing JWT/bcrypt/email-token plumbing manually. RLS policies attach to `auth.uid()` directly. Wallet auth (Phantom/Privy) is orthogonal — those handle donor signing on Solana, while Supabase handles LAZ admin + mustahik confirmation.

### 3.9 Dev tools

| Tool | Purpose |
|---|---|
| `tsx` | Run TypeScript scripts (`scripts/`) |
| `eslint` | Linting |
| `prettier` | Code formatting |
| `pnpm` (or npm) | Package management |

---

## 4. Repository Structure

```
mizaan/
├── app/
│   ├── layout.tsx                    # Root layout (fonts, providers)
│   ├── page.tsx                      # Landing / homepage (live feed)
│   ├── globals.css                   # Tailwind v4 + design tokens
│   ├── (donor)/
│   │   ├── donate/
│   │   │   ├── page.tsx              # Donation form
│   │   │   └── [donationId]/
│   │   │       └── page.tsx          # Donation success / status
│   │   ├── track/
│   │   │   └── [walletAddress]/
│   │   │       └── page.tsx          # Donor tracking dashboard
│   ├── (laz)/
│   │   ├── laz/
│   │   │   ├── page.tsx              # LAZ directory (public)
│   │   │   ├── [lazId]/
│   │   │   │   └── page.tsx          # LAZ profile (public)
│   │   │   ├── login/
│   │   │   │   └── page.tsx          # LAZ admin login
│   │   │   └── admin/
│   │   │       ├── page.tsx          # LAZ admin dashboard (auth)
│   │   │       ├── donations/
│   │   │       │   └── page.tsx      # Pending donations queue
│   │   │       ├── distribute/
│   │   │       │   └── [donationId]/
│   │   │       │       └── page.tsx  # Distribution form
│   │   │       └── mustahik/
│   │   │           └── page.tsx      # LAZ mustahik registry
│   ├── (mustahik)/
│   │   └── confirm/
│   │       └── [token]/
│   │           └── page.tsx          # Mustahik confirmation page
│   ├── (public)/
│   │   ├── verify/
│   │   │   └── page.tsx              # Public verifier
│   │   ├── feed/
│   │   │   └── page.tsx              # Live activity feed
│   │   └── about/
│   │       └── page.tsx              # About / mission
│   └── api/
│       ├── donations/
│       │   ├── route.ts              # POST: create donation, GET: list
│       │   └── [id]/route.ts         # GET: fetch donation chain
│       ├── distributions/
│       │   ├── route.ts              # POST: create distribution
│       │   └── [id]/route.ts         # GET: fetch distribution
│       ├── receipts/
│       │   ├── route.ts              # POST: confirm receipt
│       │   └── [token]/route.ts      # GET: validate magic link
│       ├── laz/
│       │   ├── route.ts              # GET: list LAZ
│       │   └── [id]/route.ts         # GET/PATCH: LAZ details
│       ├── mustahik/
│       │   ├── route.ts              # GET (LAZ-scoped): list mustahik
│       │   └── [id]/route.ts         # GET/PATCH: mustahik details
│       ├── feed/
│       │   └── route.ts              # GET: paginated public feed
│       ├── verify/
│       │   └── [identifier]/route.ts # GET: lookup by wallet/PDA
│       └── auth/
│           ├── login/route.ts        # POST: LAZ admin login
│           └── logout/route.ts       # POST: LAZ admin logout
├── components/
│   ├── navbar.tsx                    # Public top nav
│   ├── footer.tsx
│   ├── donation-card.tsx             # Shared card component
│   ├── distribution-flow.tsx         # 3-attestation visualization
│   ├── live-feed.tsx                 # Real-time donation feed
│   ├── laz-card.tsx                  # LAZ directory item
│   ├── mustahik-picker.tsx           # LAZ admin picker
│   ├── connect-wallet-button.tsx     # Wraps Phantom + Privy
│   ├── locale-switcher.tsx           # id/en/ar
│   ├── providers/
│   │   ├── solana-provider.tsx
│   │   ├── privy-provider.tsx
│   │   └── intl-provider.tsx
│   └── ui/
│       ├── button.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── badge.tsx
│       ├── card.tsx
│       └── dialog.tsx
├── lib/
│   ├── constants.ts                  # CATEGORY_LABELS, ASNAF, etc.
│   ├── types.ts                      # All TypeScript types
│   ├── utils.ts                      # cn, shortenAddress, formatRupiah
│   ├── sas/
│   │   ├── client.ts                 # SAS connection
│   │   ├── schemas.ts                # SAS schema definitions
│   │   ├── donation.ts               # createDonationCommitment
│   │   ├── distribution.ts           # createDistributionDecision
│   │   ├── receipt.ts                # createReceiptConfirmation
│   │   └── reads.ts                  # fetchAttestationsByWallet, etc.
│   ├── token/
│   │   ├── idrz.ts                   # IDRZ mint, transfer helpers
│   │   └── faucet.ts                 # Devnet faucet logic
│   ├── supabase/
│   │   ├── client.ts                 # Browser client (createBrowserClient)
│   │   ├── server.ts                 # Server client (createServerClient)
│   │   ├── admin.ts                  # Service-role client (server-only)
│   │   └── types.ts                  # Generated DB types via supabase gen types
│   ├── db/
│   │   ├── mustahik.ts               # Mustahik queries (RLS-scoped)
│   │   ├── laz.ts                    # LAZ queries
│   │   ├── donations.ts              # Donations meta queries
│   │   └── feed.ts                   # Realtime feed subscription
│   └── email/
│       └── send.ts                   # Resend wrapper
├── messages/
│   ├── id.json                       # Bahasa Indonesia
│   ├── en.json                       # English
│   └── ar.json                       # Arabic (stretch)
├── i18n/
│   ├── routing.ts
│   └── request.ts
├── scripts/
│   ├── setup-devnet.ts               # Initial setup: mint IDRZ, create LAZ schemas
│   ├── seed-laz.ts                   # Seed mock LAZ for demo
│   ├── seed-mustahik.ts              # Seed mock mustahik
│   └── fund-wallet.ts                # Devnet faucet helper
├── public/
│   ├── logos/
│   │   ├── mizaan-logo.svg
│   │   └── laz/                      # Mock LAZ logos
│   └── og/
│       └── default.png               # OG image
├── proxy.ts                          # Next.js 16 middleware (renamed)
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts (or via @theme)
├── postcss.config.mjs
├── package.json
├── .env.example
├── .env.local                        # gitignored
├── README.md
├── CLAUDE.md                         # AI agent context
└── docs/
    ├── PRD.md                        # Symlinked / referenced
    ├── SRS.md                        # This document
    └── DEMO_SCRIPT.md
```

---

## 5. Environment Variables

### 5.1 `.env.example`

```bash
# === Solana ===
# Helius devnet RPC URL (sign up at helius.dev)
NEXT_PUBLIC_SOLANA_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_HELIUS_KEY
NEXT_PUBLIC_SOLANA_NETWORK=devnet

# === IDRZ Custom SPL Token ===
# Generated by scripts/setup-devnet.ts
NEXT_PUBLIC_IDRZ_MINT=
IDRZ_MINT_AUTHORITY_KEYPAIR=

# === SAS Schemas (generated on first setup) ===
NEXT_PUBLIC_SAS_DONATION_SCHEMA=
NEXT_PUBLIC_SAS_DISTRIBUTION_SCHEMA=
NEXT_PUBLIC_SAS_RECEIPT_SCHEMA=
NEXT_PUBLIC_SAS_LAZ_IDENTITY_SCHEMA=
NEXT_PUBLIC_SAS_MUSTAHIK_SCHEMA=
NEXT_PUBLIC_SAS_CREDENTIAL_PDA=

# === LAZ admin keypair (issuing authority) ===
LAZ_AUTHORITY_KEYPAIR=

# === Privy (embedded wallet) ===
NEXT_PUBLIC_PRIVY_APP_ID=
PRIVY_APP_SECRET=

# === Supabase (Auth + Postgres + Storage + Realtime) ===
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=             # server-only, RLS-bypass key
SUPABASE_JWT_SECRET=                   # for verifying Supabase JWTs server-side

# === Email (Resend — REUSING existing account) ===
RESEND_API_KEY=                        # same key as your other SaaS — works across all verified domains
RESEND_FROM_EMAIL=noreply@mizaan.id    # add mizaan.id as a domain in your existing Resend account

# === App ===
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Mizaan
NEXT_PUBLIC_DEFAULT_LOCALE=id
```

### 5.2 Setup sequence (first-time developer)

```bash
# 1. Clone repo
git clone <repo-url> mizaan && cd mizaan

# 2. Install dependencies (now includes @supabase/supabase-js, @supabase/ssr)
pnpm install

# 3. Copy env template
cp .env.example .env.local

# 4. Get Helius API key from https://helius.dev (free tier)
#    Fill NEXT_PUBLIC_SOLANA_RPC_URL in .env.local

# 5. Get Privy app credentials from https://privy.io
#    Fill NEXT_PUBLIC_PRIVY_APP_ID and PRIVY_APP_SECRET

# 6. Reuse existing Resend account:
#    a. Login to your Resend dashboard
#    b. Add 'mizaan.id' as a verified domain (DNS records: SPF + DKIM)
#    c. Copy your existing API key into RESEND_API_KEY
#    No new billing — both SaaS apps share free tier (3K emails/month)

# 7. Provision Supabase project:
#    a. Create new project at https://supabase.com (free tier)
#    b. Copy URL + anon key + service role key into .env.local
#    c. Enable email auth: Auth → Providers → Email (magic link enabled)
#    d. Run migrations: pnpm supabase migration up
#    See SUPABASE_SCHEMA.md for full schema spec

# 8. Run setup script (creates IDRZ token, SAS schemas, LAZ authority keypair)
pnpm setup:devnet

# 9. Seed mock data into Supabase
pnpm seed:laz
pnpm seed:mustahik

# 11. Start dev server
pnpm dev
```

---

## 6. SAS Schema Definitions

### 6.1 Schema overview

Mizaan uses 5 SAS schemas:

| Schema | Authority | Purpose |
|---|---|---|
| `MIZAAN_DONATION_V1` | Donor wallet | Records donation commitment |
| `MIZAAN_DISTRIBUTION_V1` | LAZ wallet | Records distribution decision |
| `MIZAAN_RECEIPT_V1` | LAZ wallet (on mustahik's behalf) | Records mustahik receipt confirmation |
| `MIZAAN_LAZ_IDENTITY_V1` | Mizaan platform authority | Identifies registered LAZ |
| `MIZAAN_MUSTAHIK_V1` | LAZ wallet | Identifies registered mustahik (PII-free) |

### 6.2 `MIZAAN_DONATION_V1`

```typescript
interface MizaanDonationV1 {
  // Identity
  donorWallet: PublicKey;           // donor's wallet address
  lazWallet: PublicKey;             // selected LAZ's wallet
  
  // Amount
  amountIDRZ: bigint;               // amount in IDRZ smallest units (no decimals for MVP)
  
  // Type
  donationType: "ZAKAT_MAL" | "ZAKAT_FITRAH" | "SEDEKAH" | "INFAQ";
  
  // Preferences
  categoryPreference: Category | "ANY";
  
  // Optional metadata
  donorMessage?: string;            // optional message hash (not full text on-chain)
  donorMessageCID?: string;         // IPFS CID if message provided (V1.5+)
  
  // Timestamps
  createdAt: i64;                   // Unix timestamp
  
  // Linked transaction
  tokenTransferSignature: string;   // signature of the IDRZ transfer txn
}

type Category = 
  | "PENDIDIKAN"
  | "KESEHATAN"
  | "MODAL_USAHA"
  | "SANDANG_PANGAN"
  | "BIAYA_HIDUP"
  | "BENCANA"
  | "FAKIR_MISKIN"
  | "MUALLAF"
  | "RIQAB"
  | "GHARIMIN"
  | "FISABILILLAH"
  | "IBNU_SABIL";
```

### 6.3 `MIZAAN_DISTRIBUTION_V1`

```typescript
interface MizaanDistributionV1 {
  // References
  donationCommitmentPDA: PublicKey; // links to original donation
  lazWallet: PublicKey;             // LAZ admin's wallet
  mustahikWallet: PublicKey;        // mustahik's custodial wallet
  
  // Amount
  amountIDRZ: bigint;               // sub-allocation amount
  
  // Categorization
  category: Category;
  asnaf: AsnafCategory;             // 8 quranic categories
  
  // Off-chain reference
  mustahikIdHash: string;           // SHA-256 hash of mustahik's internal ID (no PII)
  purposeDescription: string;       // e.g., "biaya sekolah anak SMP semester 2"
                                    // No mustahik name in this field
  
  // Timestamps
  createdAt: i64;
  
  // Linked transaction
  tokenTransferSignature: string;   // LAZ → mustahik IDRZ transfer
}

type AsnafCategory = 
  | "FAKIR" | "MISKIN" | "AMIL" | "MUALLAF"
  | "RIQAB" | "GHARIMIN" | "FISABILILLAH" | "IBNU_SABIL";
```

### 6.4 `MIZAAN_RECEIPT_V1`

```typescript
interface MizaanReceiptV1 {
  // References
  distributionDecisionPDA: PublicKey;
  mustahikWallet: PublicKey;
  lazWallet: PublicKey;             // LAZ signs on mustahik's behalf
  
  // Confirmation
  confirmedAt: i64;
  confirmationMethod: "WEB" | "SMS" | "QR";
  
  // Optional thank-you message
  thankYouMessageHash?: string;     // hash of message
  thankYouMessageCID?: string;      // IPFS CID (V1.5+)
  
  // Verification proof (off-chain magic link clicked)
  magicLinkConsentHash: string;     // proves mustahik clicked confirmation
}
```

### 6.5 `MIZAAN_LAZ_IDENTITY_V1`

```typescript
interface MizaanLazIdentityV1 {
  lazWallet: PublicKey;             // LAZ's authoritative wallet
  
  // Identity (public info, minimal)
  lazNameHash: string;              // hash for verification
  lazSlug: string;                  // URL-safe identifier ("dompet-dhuafa-yogya")
  lazRegistrationNumber: string;    // government registration (BAZNAS)
  
  // Contact (public)
  websiteURL?: string;
  contactEmail?: string;
  
  // Geographic
  region: string;                   // e.g., "DI Yogyakarta"
  jurisdictionLevel: "NATIONAL" | "PROVINCIAL" | "REGENCY" | "MOSQUE";
  
  // Status
  status: "ACTIVE" | "PAUSED" | "SUSPENDED";
  registeredAt: i64;
  
  // Mizaan platform signature
  mizaanAuthority: PublicKey;       // who issued this attestation
}
```

### 6.6 `MIZAAN_MUSTAHIK_V1`

```typescript
interface MizaanMustahikV1 {
  mustahikWallet: PublicKey;        // custodial wallet
  lazWallet: PublicKey;             // LAZ that registered this mustahik
  
  // PII-free identity
  mustahikIdHash: string;           // hash of LAZ-internal ID (SHA-256)
  
  // Public attributes (no PII)
  asnafCategory: AsnafCategory;
  region: string;                   // e.g., "Bantul, DI Yogyakarta"
  initials: string;                 // "P.Y." for Pak Yusuf
  ageRange: "CHILD" | "TEEN" | "ADULT" | "ELDER";
  
  // Status
  status: "ACTIVE" | "GRADUATED" | "INACTIVE";
  registeredAt: i64;
}
```

### 6.7 SAS schema registration script

```typescript
// scripts/setup-devnet.ts (excerpt)
import { createSchema, createCredential } from "sas-lib";
import { generateKeyPairSigner } from "gill";

async function setupSchemas() {
  const platformAuthority = await generateKeyPairSigner();
  
  // Create credential (Mizaan platform identity)
  const credential = await createCredential({
    authority: platformAuthority,
    name: "Mizaan Platform",
  });
  
  // Create each schema
  const donationSchema = await createSchema({
    credential: credential.pda,
    name: "MIZAAN_DONATION_V1",
    layout: [
      { name: "donorWallet", type: "Pubkey" },
      { name: "lazWallet", type: "Pubkey" },
      { name: "amountIDRZ", type: "u64" },
      { name: "donationType", type: "u8" },           // enum
      { name: "categoryPreference", type: "u8" },     // enum
      { name: "donorMessageHash", type: "String" },
      { name: "createdAt", type: "i64" },
      { name: "tokenTransferSignature", type: "String" },
    ],
  });
  
  // Similarly for distribution, receipt, lazIdentity, mustahik
  
  // Output for .env.local
  console.log({
    NEXT_PUBLIC_SAS_CREDENTIAL_PDA: credential.pda,
    NEXT_PUBLIC_SAS_DONATION_SCHEMA: donationSchema.pda,
    // ... etc
  });
}
```

---

## 7. IDRZ Token Setup

### 7.1 Token specifications

| Property | Value |
|---|---|
| **Name** | Indonesian Rupiah Zakat Token |
| **Symbol** | IDRZ |
| **Decimals** | 0 (Rupiah is whole number) |
| **Initial supply** | 1,000,000,000,000 (1 trillion IDRZ = Rp 1 trillion equivalent) |
| **Mint authority** | Mizaan platform keypair |
| **Freeze authority** | None (immutable for hackathon) |
| **Network** | Solana Devnet |

### 7.2 Setup script

```typescript
// scripts/setup-devnet.ts (excerpt)
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { Keypair, Connection, clusterApiUrl } from "@solana/web3.js";

async function setupIDRZ() {
  const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!);
  const payer = Keypair.generate(); // funded via devnet faucet
  
  // Airdrop SOL for fees
  const airdropSig = await connection.requestAirdrop(payer.publicKey, 2 * 1e9);
  await connection.confirmTransaction(airdropSig);
  
  // Create IDRZ mint
  const mintAuthority = Keypair.generate();
  const idrzMint = await createMint(
    connection,
    payer,
    mintAuthority.publicKey,
    null, // no freeze authority
    0,    // 0 decimals
  );
  
  // Mint initial supply to authority
  const authorityAta = await getOrCreateAssociatedTokenAccount(
    connection, payer, idrzMint, mintAuthority.publicKey
  );
  
  await mintTo(
    connection, payer, idrzMint, authorityAta.address,
    mintAuthority, 1_000_000_000_000
  );
  
  console.log({
    NEXT_PUBLIC_IDRZ_MINT: idrzMint.toBase58(),
    IDRZ_MINT_AUTHORITY_KEYPAIR: JSON.stringify(Array.from(mintAuthority.secretKey)),
  });
}
```

### 7.3 Donor onboarding (faucet)

For demo, every new wallet gets airdropped 5,000,000 IDRZ (Rp 5M) via faucet:

```typescript
// app/api/faucet/route.ts
export async function POST(req: Request) {
  const { walletAddress } = await req.json();
  
  // Check rate limit (1 faucet per wallet per hour)
  if (await isRateLimited(walletAddress)) return error("rate_limited");
  
  // Transfer 5,000,000 IDRZ
  await transferIDRZ({
    from: PLATFORM_AUTHORITY,
    to: walletAddress,
    amount: 5_000_000n,
  });
  
  return success();
}
```

### 7.4 Display formatting

UI always displays IDRZ amounts as **Rupiah**:
```typescript
// lib/utils.ts
export function formatRupiah(amount: bigint): string {
  return `Rp ${Number(amount).toLocaleString("id-ID")}`;
}

// Examples:
formatRupiah(100_000n)     // "Rp 100,000"
formatRupiah(22_000_000n)  // "Rp 22,000,000"
```

### 7.5 Production migration plan (V1.1)

To migrate from IDRZ → IDRX:

1. Replace `NEXT_PUBLIC_IDRZ_MINT` with IDRX mint address
2. Update `lib/token/idrz.ts` to `lib/token/idrx.ts`
3. Add IDRX-specific compliance (KYC for amounts > Rp 100M)
4. Single-line config change in production app

---

## 8. Data Models (TypeScript)

### 8.1 Core types (`lib/types.ts`)

```typescript
import type { PublicKey } from "@solana/web3.js";

// ===== Enums =====

export type DonationType = "ZAKAT_MAL" | "ZAKAT_FITRAH" | "SEDEKAH" | "INFAQ";

export type Category = 
  | "PENDIDIKAN" | "KESEHATAN" | "MODAL_USAHA"
  | "SANDANG_PANGAN" | "BIAYA_HIDUP" | "BENCANA"
  | "FAKIR_MISKIN" | "MUALLAF" | "RIQAB" | "GHARIMIN"
  | "FISABILILLAH" | "IBNU_SABIL";

export type AsnafCategory = 
  | "FAKIR" | "MISKIN" | "AMIL" | "MUALLAF"
  | "RIQAB" | "GHARIMIN" | "FISABILILLAH" | "IBNU_SABIL";

export type DonationStatus = 
  | "PENDING_DISTRIBUTION"  // donor signed, awaiting LAZ
  | "PARTIALLY_DISTRIBUTED" // LAZ has distributed some
  | "FULLY_DISTRIBUTED"     // all funds allocated to mustahik
  | "FULLY_CONFIRMED";      // all mustahik confirmed receipt

export type AttestationKind = "DONATION" | "DISTRIBUTION" | "RECEIPT";

// ===== Domain models =====

export interface Donor {
  walletAddress: string;
  email?: string;          // off-chain only, encrypted
  totalDonated: bigint;
  donationCount: number;
  firstDonationAt?: Date;
  lastDonationAt?: Date;
}

export interface LAZ {
  walletAddress: string;
  identityPDA: string;     // MIZAAN_LAZ_IDENTITY_V1 PDA
  slug: string;
  name: string;            // off-chain (PII-light)
  registrationNumber: string;
  region: string;
  jurisdictionLevel: "NATIONAL" | "PROVINCIAL" | "REGENCY" | "MOSQUE";
  websiteURL?: string;
  contactEmail?: string;
  logoURL?: string;
  status: "ACTIVE" | "PAUSED" | "SUSPENDED";
  registeredAt: Date;
  // Aggregate stats (computed)
  totalReceived: bigint;
  totalDistributed: bigint;
  mustahikCount: number;
  donorCount: number;
}

export interface Mustahik {
  walletAddress: string;        // custodial
  identityPDA: string;          // MIZAAN_MUSTAHIK_V1 PDA
  lazWalletAddress: string;     // owning LAZ
  
  // Off-chain PII (UU PDP-protected)
  internalId: string;           // LAZ-internal ID
  fullName: string;             // off-chain only
  phone: string;                // off-chain only, for SMS
  region: string;               // public OK
  
  // Public attributes (on-chain)
  initials: string;             // "P.Y."
  asnafCategory: AsnafCategory;
  ageRange: "CHILD" | "TEEN" | "ADULT" | "ELDER";
  
  status: "ACTIVE" | "GRADUATED" | "INACTIVE";
  registeredAt: Date;
}

export interface Donation {
  id: string;                   // UUID
  donationCommitmentPDA: string;
  donorWallet: string;
  lazWallet: string;
  amountIDRZ: bigint;
  donationType: DonationType;
  categoryPreference: Category | "ANY";
  donorMessage?: string;        // off-chain encrypted
  status: DonationStatus;
  createdAt: Date;
  tokenTransferSignature: string;
  
  // Computed
  distributions?: Distribution[];
}

export interface Distribution {
  id: string;
  distributionDecisionPDA: string;
  donationCommitmentPDA: string;  // links to donation
  lazWallet: string;
  mustahikWallet: string;
  amountIDRZ: bigint;
  category: Category;
  asnaf: AsnafCategory;
  mustahikIdHash: string;
  purposeDescription: string;
  createdAt: Date;
  tokenTransferSignature: string;
  
  // Computed
  receipt?: Receipt;
}

export interface Receipt {
  id: string;
  receiptConfirmationPDA: string;
  distributionDecisionPDA: string;
  mustahikWallet: string;
  lazWallet: string;
  confirmedAt: Date;
  confirmationMethod: "WEB" | "SMS" | "QR";
  thankYouMessage?: string;     // off-chain encrypted
  magicLinkConsentHash: string;
}

// ===== Form / API types =====

export interface CreateDonationInput {
  amountIDRZ: bigint;
  donationType: DonationType;
  lazWallet: string;
  categoryPreference: Category | "ANY";
  donorMessage?: string;
}

export interface CreateDistributionInput {
  donationCommitmentPDA: string;
  mustahikWallet: string;
  amountIDRZ: bigint;
  category: Category;
  asnaf: AsnafCategory;
  purposeDescription: string;
}

export interface ConfirmReceiptInput {
  magicLinkToken: string;
  thankYouMessage?: string;
}

export interface DonationChainView {
  donation: Donation;
  distributions: Array<Distribution & { receipt?: Receipt }>;
  // Aggregates
  totalDistributed: bigint;
  totalConfirmed: bigint;
  confirmationRate: number;     // 0-1
}
```

### 8.2 Constants (`lib/constants.ts`)

```typescript
import { Category, AsnafCategory, DonationType } from "./types";

export const CATEGORY_LABELS: Record<Category, { id: string; en: string; ar: string }> = {
  PENDIDIKAN: { id: "Pendidikan", en: "Education", ar: "التعليم" },
  KESEHATAN: { id: "Kesehatan", en: "Healthcare", ar: "الصحة" },
  MODAL_USAHA: { id: "Modal Usaha", en: "Business Capital", ar: "رأس المال التجاري" },
  SANDANG_PANGAN: { id: "Sandang & Pangan", en: "Clothing & Food", ar: "الملابس والطعام" },
  BIAYA_HIDUP: { id: "Biaya Hidup", en: "Living Expenses", ar: "نفقات المعيشة" },
  BENCANA: { id: "Bencana Alam", en: "Disaster Relief", ar: "الإغاثة من الكوارث" },
  FAKIR_MISKIN: { id: "Fakir Miskin", en: "Poor & Needy", ar: "الفقراء والمساكين" },
  MUALLAF: { id: "Muallaf", en: "New Muslims", ar: "المؤلفة قلوبهم" },
  RIQAB: { id: "Riqab", en: "Captives", ar: "الرقاب" },
  GHARIMIN: { id: "Gharimin", en: "Debtors", ar: "الغارمين" },
  FISABILILLAH: { id: "Fisabilillah", en: "In God's Cause", ar: "في سبيل الله" },
  IBNU_SABIL: { id: "Ibnu Sabil", en: "Wayfarers", ar: "ابن السبيل" },
};

export const ASNAF_LABELS: Record<AsnafCategory, { id: string; en: string; ar: string }> = {
  FAKIR: { id: "Fakir", en: "Destitute", ar: "الفقراء" },
  MISKIN: { id: "Miskin", en: "Poor", ar: "المساكين" },
  AMIL: { id: "Amil", en: "Zakat administrator", ar: "العاملين عليها" },
  MUALLAF: { id: "Muallaf", en: "New Muslim convert", ar: "المؤلفة قلوبهم" },
  RIQAB: { id: "Riqab", en: "Slave (modern: trafficking victim)", ar: "الرقاب" },
  GHARIMIN: { id: "Gharimin", en: "Debtor", ar: "الغارمين" },
  FISABILILLAH: { id: "Fisabilillah", en: "In God's path", ar: "في سبيل الله" },
  IBNU_SABIL: { id: "Ibnu Sabil", en: "Wayfarer / stranded traveler", ar: "ابن السبيل" },
};

export const DONATION_TYPE_LABELS: Record<DonationType, { id: string; en: string; ar: string }> = {
  ZAKAT_MAL: { id: "Zakat Mal", en: "Wealth Zakat", ar: "زكاة المال" },
  ZAKAT_FITRAH: { id: "Zakat Fitrah", en: "Zakat Fitrah", ar: "زكاة الفطر" },
  SEDEKAH: { id: "Sedekah", en: "Sedekah / Charity", ar: "صدقة" },
  INFAQ: { id: "Infaq", en: "Infaq / Spending", ar: "إنفاق" },
};

export const NISAB_GOLD_GRAM = 85; // 85 grams of gold
export const NISAB_RATE_PERCENT = 2.5;

// IDRZ display
export const IDRZ_SYMBOL = "IDRZ";
export const FIAT_DISPLAY = "Rp";
```

---

## 9. Wallet & Authentication Strategy

### 9.1 Authentication matrix

| Role | Auth method | Wallet type | Persistence |
|---|---|---|---|
| **Donor (crypto-native)** | Phantom signature | Self-custody | Wallet adapter |
| **Donor (non-crypto)** | Email/SMS via Privy | Custodial (Privy) | Privy session |
| **LAZ admin** | **Supabase Auth** — email + password | Custodial (LAZ org account) | Supabase session cookie |
| **Mustahik** | **Supabase Auth** — magic link (built-in) | Custodial (LAZ-managed) | Per-link token |
| **Public verifier** | None | None | None |

### 9.2 Donor wallet flow

```typescript
// components/connect-wallet-button.tsx
"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { usePrivy } from "@privy-io/react-auth";

export function ConnectWalletButton() {
  const { connected, publicKey } = useWallet();
  const { authenticated, login } = usePrivy();
  
  // Two paths
  if (connected) return <PhantomConnected publicKey={publicKey!} />;
  if (authenticated) return <PrivyConnected />;
  
  return (
    <div>
      <button onClick={() => /* open Phantom */}>
        Connect Phantom
      </button>
      <button onClick={login}>
        Daftar dengan Email
      </button>
    </div>
  );
}
```

### 9.3 LAZ admin auth (Supabase)

```typescript
// app/(laz)/laz/login/page.tsx
"use client";
import { createBrowserClient } from "@supabase/ssr";

export default function LazLoginPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleLogin(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return showError(error);
    // Cookie auto-set by @supabase/ssr middleware
    router.push("/laz/admin");
  }
  // ...
}

// proxy.ts (Next.js 16 middleware) — protect /laz/admin/*
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const supabase = createServerClient(/* ... cookies */);
  const { data: { user } } = await supabase.auth.getUser();

  if (req.nextUrl.pathname.startsWith("/laz/admin") && !user) {
    return NextResponse.redirect(new URL("/laz/login", req.url));
  }
  return NextResponse.next();
}
```

**LAZ admin → wallet mapping:** stored in `laz_admins` table linking `auth.users.id` ↔ `laz.wallet_address`. Server-side queries scope to admin's own LAZ via RLS.

### 9.4 Mustahik magic link (Supabase Auth)

```typescript
// app/api/distributions/route.ts (server-side, after creating distribution)
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Issue magic link via Supabase Auth — Resend handles delivery
const { data, error } = await supabaseAdmin.auth.admin.generateLink({
  type: "magiclink",
  email: mustahik.email,
  options: {
    redirectTo: `${APP_URL}/confirm?distribution=${distributionPDA}`,
    data: { distributionPDA, mustahikWallet, role: "MUSTAHIK" },
  },
});

// Email auto-sent via Supabase + Resend SMTP integration
// (configured once in Supabase dashboard: Auth → Email Templates → SMTP)
```

**Why this is simpler:**
- No custom token generation, expiry, rate-limiting code (Supabase handles)
- No KV writes for magic link state (token state in `auth.flow_state` table)
- One-time-use enforced automatically
- 30-day expiry configurable in Supabase dashboard
- Resend integration via SMTP — Supabase sends, Resend delivers, your existing API key

When mustahik visits `/confirm/[token]`:

```typescript
// app/(mustahik)/confirm/[token]/page.tsx
export default async function ConfirmPage({ params }) {
  const data = await kv.get(`magic:${params.token}`);
  if (!data || Date.now() > data.expiresAt) return <ExpiredPage />;
  
  return <MustahikConfirmForm distributionPDA={data.distributionPDA} />;
}
```

---

## 10. API Endpoints

### 10.1 Endpoint summary

| Method | Path | Purpose | Auth |
|---|---|---|---|
| `POST` | `/api/donations` | Create donation commitment | Donor wallet |
| `GET` | `/api/donations` | List donations (paginated) | None |
| `GET` | `/api/donations/[id]` | Fetch full donation chain | None |
| `POST` | `/api/distributions` | Create distribution decision | LAZ admin JWT |
| `GET` | `/api/distributions/[id]` | Fetch distribution detail | None |
| `POST` | `/api/receipts` | Confirm mustahik receipt | Magic link token |
| `GET` | `/api/receipts/[token]` | Validate magic link | None |
| `GET` | `/api/laz` | List registered LAZ | None |
| `GET` | `/api/laz/[id]` | LAZ profile | None |
| `PATCH` | `/api/laz/[id]` | Update LAZ profile | LAZ admin JWT |
| `GET` | `/api/mustahik` | List mustahik (LAZ-scoped) | LAZ admin JWT |
| `GET` | `/api/mustahik/[id]` | Mustahik public profile (no PII) | None |
| `GET` | `/api/feed` | Live activity feed | None |
| `GET` | `/api/verify/[identifier]` | Lookup by wallet/PDA | None |
| `POST` | `/api/auth/login` | LAZ admin login | None |
| `POST` | `/api/auth/logout` | LAZ admin logout | LAZ admin JWT |
| `POST` | `/api/faucet` | IDRZ faucet (devnet only) | Wallet (rate-limited) |
| `GET` | `/api/track/[walletAddress]` | Donor tracking dashboard data | None |

### 10.2 Critical endpoint specs

#### `POST /api/donations`

**Request:**
```json
{
  "amountIDRZ": "22000000",
  "donationType": "ZAKAT_MAL",
  "lazWallet": "Lzy...abc",
  "categoryPreference": "PENDIDIKAN",
  "donorMessage": "optional",
  "donorWalletSignature": "...",
  "tokenTransferSignature": "5xK..."
}
```

**Response:**
```json
{
  "id": "uuid",
  "donationCommitmentPDA": "PDA...",
  "status": "PENDING_DISTRIBUTION",
  "createdAt": "2026-05-05T10:00:00Z"
}
```

**Behavior:**
1. Validate wallet signature
2. Verify token transfer signature on-chain (idempotent check)
3. Create SAS DonationCommitment attestation server-side
4. Store off-chain metadata (donor email if Privy, donor message encrypted)
5. Return PDA + status

#### `POST /api/distributions`

**Request (LAZ admin authed):**
```json
{
  "donationCommitmentPDA": "PDA...",
  "mustahikWallet": "Mst...xyz",
  "amountIDRZ": "800000",
  "category": "PENDIDIKAN",
  "asnaf": "MISKIN",
  "purposeDescription": "Biaya sekolah anak SMP semester 2"
}
```

**Response:**
```json
{
  "id": "uuid",
  "distributionDecisionPDA": "PDA...",
  "tokenTransferSignature": "5xK...",
  "magicLinkSent": true,
  "createdAt": "2026-05-06T08:00:00Z"
}
```

**Behavior:**
1. Validate JWT (LAZ admin role)
2. Check donation has remaining balance
3. Transfer IDRZ from LAZ wallet → mustahik wallet
4. Create SAS DistributionDecision attestation
5. Generate magic link for mustahik
6. Send notification email/SMS
7. Update donation status if fully distributed

#### `GET /api/feed?limit=20&cursor=...`

**Response:**
```json
{
  "items": [
    {
      "type": "RECEIPT_CONFIRMED",
      "amountIDRZ": "800000",
      "amountFormatted": "Rp 800,000",
      "category": "PENDIDIKAN",
      "categoryLabel": { "id": "Pendidikan", "en": "Education" },
      "lazSlug": "dompet-dhuafa-yogya",
      "lazName": "Dompet Dhuafa Yogya",
      "mustahikInitials": "P.Y.",
      "mustahikRegion": "Bantul",
      "occurredAt": "2026-05-06T12:30:00Z",
      "purposeShort": "biaya sekolah anak"
    }
  ],
  "nextCursor": "..."
}
```

---

## 11. Page Specifications

### 11.1 Page tree

```
/                                 # Homepage with hero + live feed
/donate                           # Donation form (step 1: type + amount)
/donate/[donationId]              # Post-donation confirmation
/track/[walletAddress]            # Donor tracking dashboard
/laz                              # Public LAZ directory
/laz/[lazId]                      # Public LAZ profile
/laz/login                        # LAZ admin login
/laz/admin                        # LAZ admin dashboard (auth)
/laz/admin/donations              # Pending donations queue
/laz/admin/distribute/[donationId] # Distribution form
/laz/admin/mustahik               # Mustahik registry
/confirm/[token]                  # Mustahik magic link confirmation
/verify                           # Public verifier
/feed                             # Live activity feed (full page)
/about                            # Mission + how it works
```

### 11.2 Page detail: `/` (Homepage)

**Goal:** Hook visitors with mission + live activity demonstration.

**Layout:**
```
[Navbar]
[Hero]
  H1: "Zakat dengan Transparansi Penuh"  
  H2: "Lacak hingga ke mustahik. Tanpa skim. Tanpa skala palsu."
  CTA primary: "Bayar Zakat Sekarang →"
  CTA secondary: "Lihat Demo →"
[Stats strip]
  [Total Tersalurkan: Rp 2.4M] [Donor: 47] [Mustahik: 89] [Konfirmasi: 100%]
[Live feed section]
  H2: "Aktivitas Live"
  [Auto-updating list, last 20 events]
[How it works]
  3-step infographic
[LAZ partners strip]
  Logos
[CTA repeat]
[Footer]
```

**Components:**
- `<Navbar variant="public" />`
- `<HomeHero />`
- `<LiveStatsStrip />`
- `<LiveFeed limit={20} />`
- `<HowItWorks />`
- `<LAZPartnersStrip />`
- `<Footer />`

### 11.3 Page detail: `/donate` (Donation form)

**Goal:** Convert visitor into donor.

**Steps (single page, multi-step):**

```
Step 1: Donation type
  [ Zakat Mal ] [ Zakat Fitrah ] [ Sedekah ] [ Infaq ]
  Default: Zakat Mal

Step 2: Amount
  IF Zakat Mal:
    Calculator: gold-equivalent nisab
    "Berapa total kekayaan Anda? [Rp ___]"
    Auto-calculate 2.5%
    Override allowed
  IF Sedekah/Infaq:
    Free amount input + suggested chips [Rp 50k] [Rp 100k] [Rp 500k]

Step 3: LAZ selection
  Searchable list with logos, region, ratings
  
Step 4: Category preference
  [Multi-select] Pendidikan / Kesehatan / Modal Usaha / Sandang / Apa Saja

Step 5: (Optional) Donor message
  Textarea (max 200 chars), encrypted

Step 6: Connect wallet
  Phantom OR Privy email

Step 7: Review + sign
  Summary card
  [Konfirmasi & Tanda Tangan] button
```

**State machine:**
- `formStep`: 1-7
- Validation per step
- "Back" button (state-preserved)
- Mobile-first design

### 11.4 Page detail: `/track/[walletAddress]` (Donor dashboard)

```
[Navbar]
[Header]
  Avatar + first 8 chars of wallet
  "Welcome back, donor 7xKX...bW2"
  [Disconnect button]
[Stats grid]
  Total Donated: Rp 22M
  Distributions: 27
  Confirmation Rate: 100%
  Categories: 4
[Filter tabs]
  [All] [Zakat Mal] [Zakat Fitrah] [Sedekah] [Infaq]
[Donation list]
  For each donation:
    - LAZ + amount + date + status pill
    - Expandable: shows distributions + receipts
    - Click any distribution: full chain view
[Pagination]
[Footer]
```

### 11.5 Page detail: `/laz/admin/distribute/[donationId]`

**Goal:** LAZ amil distributes a pending donation.

```
[LAZ Admin Header]
[Donation Detail Card]
  Donor: 7xKX (anonymized)
  Amount: Rp 22,000,000
  Type: Zakat Mal
  Category preference: Pendidikan
  Donor message: "..." (if any)
  Remaining: Rp 22,000,000

[Distribution Form (multi-row)]
  Row template:
    [Mustahik picker - searchable] | [Amount input] | [Category] | [Asnaf] | [Description]
  
  Add another row [+]
  
  Total allocated: Rp 22,000,000 / Rp 22,000,000 ✓
  
  [Process All Distributions] button (disabled if not 100%)

[Confirmation modal]
  "Anda akan menanda tangani 12 distribusi.
   Total: Rp 22,000,000.
   12 SMS akan dikirim ke mustahik untuk konfirmasi."
  [Batal] [Lanjut]
```

### 11.6 Page detail: `/confirm/[token]` (Mustahik)

**Mobile-first, lightweight (works on slow 3G).**

```
[Mizaan logo (small)]
[Greeting]
  Assalamualaikum Pak Yusuf,
[Detail]
  Anda menerima:
  Rp 800,000
  
  Dari: LAZ Dompet Dhuafa Yogya
  Untuk: biaya sekolah anak
  Donor: muzakki anonim
  
  Diterima pada: 5 Mei 2026, 14:30 WIB

[Two large buttons (mobile-friendly)]
  [✓ Terima & Konfirmasi]
  [Tolak Konfirmasi]

[After confirm]
  Optional thank-you message
  textarea (max 100 chars)
  "Bagian ini opsional. Donor akan menerima pesan Anda."
  
  [Kirim] [Lewati]

[Final state]
  ✓ Terkonfirmasi
  Terima kasih, Pak Yusuf.
  Donor akan menerima notifikasi konfirmasi Anda.
```

### 11.7 Page detail: `/verify` (Public verifier)

```
[Navbar]
[Hero]
  H1: "Verifikasi Donasi"
  Tagline: "Paste alamat wallet, attestation PDA, atau scan QR. 5 detik instant verification."
[Search input]
  [_________________________] [Cari]
  Examples: 7xKX...bW2 / 3xK7...f9Bm
[Result area (after search)]
  Wallet 7xKX...bW2:
    Total donations: Rp 22M
    Active LAZ: Dompet Dhuafa Yogya
    Distributions: 27
    Confirmations: 27/27
  
  [Show full chain] expandable list
[Footer]
```

---

## 12. Component Specifications

### 12.1 `<DonationCard />`

```typescript
interface DonationCardProps {
  donation: Donation;
  showFullChain?: boolean;
  variant?: "compact" | "full";
}
```

Visual:
- Card with green-tinted gradient (per design system)
- Header: amount, type, status badge
- LAZ name + region
- Category preference chip
- Distribution count + confirmation rate progress bar
- Expand: show distributions + receipts

### 12.2 `<DistributionFlow />`

```typescript
interface DistributionFlowProps {
  donation: Donation;
  distributions: Array<Distribution & { receipt?: Receipt }>;
}
```

Visual: 3-stage timeline
```
[● Donor] ───── [● LAZ] ───── [● Mustahik]
 ✓ signed       ✓ signed       ✓ confirmed
 5 May 14:00    6 May 08:00    6 May 12:30
```

### 12.3 `<MustahikPicker />` (LAZ admin)

```typescript
interface MustahikPickerProps {
  lazWallet: string;
  selected?: string;
  onSelect: (mustahikWallet: string) => void;
  filter?: { asnaf?: AsnafCategory; region?: string };
}
```

Behavior:
- Searchable dropdown (search by initials, region, asnaf)
- Lazy-load mustahik list from API
- Show: initials, age range, asnaf, region
- Never show full PII

### 12.4 `<ConnectWalletButton />`

Two-path component (covered in §9.2).

### 12.5 `<LiveFeed />`

```typescript
interface LiveFeedProps {
  limit?: number;
  filter?: { lazSlug?: string; category?: Category };
  refreshInterval?: number; // default 30000ms
}
```

Behavior:
- SWR or React Query polling
- Each item animates in (Framer Motion fade-up)
- Item shows: amount, category, LAZ, mustahik initials, time-ago
- Click to expand: full chain detail

### 12.6 `<LocaleSwitcher />`

```typescript
// Buttons: [ID | EN | AR]
// Persists to URL via next-intl routing
```

---

## 13. Off-Chain Storage (Supabase Postgres)

> See `SUPABASE_SCHEMA.md` for complete schema definitions including SQL DDL, indexes, RLS policies, triggers, and migration scripts.

### 13.1 Tables overview

| Table | Purpose | RLS owner |
|---|---|---|
| `laz` | LAZ partner registry — name, slug, region, logo URL, registration_number | public read · admin write |
| `laz_admins` | Maps `auth.users.id` ↔ `laz.id` for LAZ admin scoping | self read only |
| `mustahik` | Off-chain PII (name, phone, region, asnaf, status) — never on-chain | LAZ-scoped read/write |
| `donations_meta` | Donor email (Privy users), encrypted message blob, donation status cache | server only |
| `distributions_meta` | Distribution-level off-chain notes from amil (private) | LAZ-scoped |
| `audit_log` | Append-only log of admin actions (compliance) | server-write only |
| `feed_cache` | Materialized view of recent confirmed activity (5-min refresh) | public read |

### 13.2 RLS pattern

All tables enable Row-Level Security. Standard policies:

```sql
-- Mustahik table: LAZ admin can only see their own LAZ's mustahik
CREATE POLICY "laz_admin_can_read_own_mustahik"
ON public.mustahik FOR SELECT
USING (
  laz_id IN (
    SELECT laz_id FROM public.laz_admins
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "laz_admin_can_insert_own_mustahik"
ON public.mustahik FOR INSERT
WITH CHECK (
  laz_id IN (
    SELECT laz_id FROM public.laz_admins
    WHERE user_id = auth.uid()
  )
);
```

### 13.3 Realtime (live activity feed)

```typescript
// app/feed/page.tsx
import { createBrowserClient } from "@supabase/ssr";

const channel = supabase
  .channel("public:feed")
  .on("postgres_changes",
    { event: "INSERT", schema: "public", table: "audit_log",
      filter: "event_type=eq.RECEIPT_CONFIRMED" },
    (payload) => prependToFeed(payload.new))
  .subscribe();
```

Replaces polling-based feed. Server pushes new events to all connected clients.

### 13.4 Storage (Supabase Storage)

Buckets:
- `laz-logos/` — public read, LAZ admin write (their own LAZ only)
- `audit-pdfs/` — private, signed URL on-demand

### 13.5 Encryption strategy

**Mustahik PII (name, phone) is plaintext in Postgres** behind RLS — only the LAZ admin who owns the row can read it. UU PDP compliance achieved via:
1. RLS scoping (no cross-LAZ access)
2. TLS in transit (Supabase enforces)
3. Encryption at rest (Postgres default, Supabase managed)
4. Supabase audit log (built-in)
5. Right-to-erasure via DELETE cascade (UU PDP requirement)

**Donor messages** encrypted with mustahik's wallet public key (Solana Ed25519) before storage in `donations_meta.encrypted_message`. Only mustahik's wallet can decrypt off-chain via `box.open` from `tweetnacl`.

**No env-var encryption keys** — RLS + Postgres encryption-at-rest handle the threat model. Simpler, fewer keys to rotate.

---

## 14. State Management

### 14.1 Client-side state

| State | Tool | Scope |
|---|---|---|
| Wallet connection | `@solana/wallet-adapter-react` (built-in) | Global |
| Privy auth | `@privy-io/react-auth` (built-in) | Global |
| Form state | React `useState` + react-hook-form | Per-form |
| API data | SWR or `@tanstack/react-query` | Per-page |
| Toast notifications | `sonner` (global toaster) | Global |
| Locale | `next-intl` cookies | Global |

### 14.2 Server-side state

Stateless API routes. Persistence in:
- Solana on-chain (attestations, token balances)
- Vercel KV (off-chain metadata)
- Server cookies (LAZ admin session)

---

## 15. Error Handling

### 15.1 Error categories

| Category | Example | UX response |
|---|---|---|
| **User error** | Invalid wallet address input | Inline form error |
| **Network error** | RPC timeout | Toast + retry button |
| **Solana error** | Insufficient funds | Modal with action |
| **Auth error** | LAZ admin session expired | Redirect to login |
| **Validation error** | Distribution exceeds donation balance | Form-level error |
| **Server error** | Database write failure | Generic toast + log |

### 15.2 Error boundary structure

```typescript
// app/global-error.tsx — root boundary
// app/(donor)/error.tsx — donor section
// app/(laz)/error.tsx — LAZ section
// Per-page error.tsx where needed
```

### 15.3 Error logging

- Console.error in dev
- Sentry in production (post-hackathon, V1.1)

---

## 16. Security Considerations

### 16.1 Authentication

- **LAZ admin:** Supabase Auth session (JWT) — httpOnly cookie via `@supabase/ssr`, configurable expiry (default 1 hour, refresh token 30 days). Auto-refresh on the client.
- **Mustahik magic links:** Supabase-generated, configurable expiry (default 1 hour, configurable up to 30 days), single-use enforced by Supabase.
- **Donor wallets:** signature verification on every state-changing API call. Server validates `signMessage` payload before creating attestations.

### 16.2 Authorization (RLS + API)

Authorization is enforced at **two layers**:

**Layer 1: Supabase RLS** (database-level, can't be bypassed by API bugs)

```sql
-- Distribution writes scoped to LAZ admin's own LAZ
CREATE POLICY "laz_admin_writes_own_distributions"
ON public.distributions_meta FOR INSERT
WITH CHECK (
  laz_id IN (
    SELECT laz_id FROM laz_admins
    WHERE user_id = auth.uid()
  )
);
```

**Layer 2: API route guards** (defense in depth)

| Endpoint | Authorization rule |
|---|---|
| `POST /api/distributions` | Supabase session required + `auth.uid()` mapped to a `laz_admins` row matching donation's `laz_id` |
| `GET /api/mustahik` | Supabase session required + RLS auto-scopes to admin's LAZ |
| `POST /api/receipts` | Supabase magic-link token validates against `auth.flow_state`, matches distribution PDA |

### 16.3 Input validation

- Zod schemas for all API inputs
- SQL injection: N/A (using KV, not SQL)
- XSS: Next.js auto-escapes; sanitize HTML if rendering markdown
- CSRF: Same-site cookies + origin checks

### 16.4 PII protection

- Never on-chain
- Encrypted at rest in KV
- Logs redacted (no email, no phone)
- LAZ admin can view their own mustahik PII; cross-LAZ access denied

### 16.5 Rate limiting

- Faucet: 1 per wallet per hour
- API endpoints: 100 req/min per IP (Vercel built-in)
- Magic link generation: 1 per distribution per 30 days

---

## 17. Internationalization

### 17.1 Locale strategy

`next-intl` with route-prefix:
- `/id/donate` (default, redirect from `/donate` if no prefix)
- `/en/donate`
- `/ar/donate` (stretch)

### 17.2 Translation file structure

```
messages/
├── id.json
├── en.json
└── ar.json
```

Example structure:
```json
{
  "nav": {
    "home": "Beranda",
    "donate": "Donasi",
    "track": "Lacak",
    "laz": "LAZ",
    "verify": "Verifikasi",
    "about": "Tentang"
  },
  "donate": {
    "title": "Bayar Zakat",
    "subtitle": "Transparansi penuh dari donor ke mustahik",
    "step1Title": "Pilih jenis donasi",
    ...
  },
  ...
}
```

### 17.3 Pluralization

```typescript
const t = useTranslations("donate");
t("mustahikCount", { count: 27 });
// id.json: "{count, plural, one {# mustahik} other {# mustahik}}"
// en.json: "{count, plural, one {# recipient} other {# recipients}}"
```

---

## 18. Design System

### 18.1 Color tokens (`@theme` in `app/globals.css`)

```css
@theme {
  --color-bg:              #0A0A0A;
  --color-surface:         #101010;
  --color-card:            #141414;
  --color-card-hi:         #1A1A1A;

  --color-border:          rgba(255,255,255,0.06);
  --color-border-strong:   rgba(255,255,255,0.12);

  --color-primary:         #14F195; /* Solana green */
  --color-primary-hover:   #11D985;
  --color-primary-soft:    rgba(20,241,149,0.10);

  --color-text:            #FFFFFF;
  --color-text-secondary:  rgba(255,255,255,0.65);
  --color-text-muted:      rgba(255,255,255,0.40);
  --color-text-faint:      rgba(255,255,255,0.22);

  --color-success:         #4ADE80;
  --color-warning:         #FF9F0A;
  --color-danger:          #EF4444;

  --font-sans:    var(--font-dm-sans), "DM Sans", system-ui, sans-serif;
  --font-heading: var(--font-space-grotesk), "Space Grotesk", system-ui, sans-serif;
  --font-arabic:  var(--font-amiri), "Amiri", serif; /* stretch */

  --radius-card:  16px;
  --radius-md:    12px;
  --radius-input: 10px;
  --radius-btn:   9px;
  --radius-pill:  20px;

  --shadow-card:        0 4px 24px rgba(0,0,0,0.5);
  --shadow-card-hover:  0 8px 32px rgba(20,241,149,0.10);
  --shadow-glow-green:  0 0 0 3px rgba(20,241,149,0.22);
}
```

### 18.2 Card recipe (gradient + stroke)

```css
.card-mizaan {
  background: var(--color-card);
  background-image: linear-gradient(180deg, rgba(20,241,149,0.05) 0%, transparent 45%);
  border: 1px solid rgba(20,241,149,0.13);
  box-shadow: inset 0 1px 0 rgba(20,241,149,0.18), var(--shadow-card);
  border-radius: var(--radius-card);
}
```

### 18.3 Typography scale

| Use | Size | Font | Weight |
|---|---|---|---|
| Display H1 | 48px | Space Grotesk | 700 |
| H2 | 32px | Space Grotesk | 700 |
| H3 | 24px | Space Grotesk | 600 |
| Body | 14px | DM Sans | 400 |
| Body emphasized | 14px | DM Sans | 500 |
| Body small | 12px | DM Sans | 400 |
| Label | 11px | DM Sans | 600 (uppercase, tracking 0.06em) |
| Numbers / amounts | varies | Space Grotesk | 700 |

### 18.4 Component design references

Reuse from Sahih where possible:
- Navbar pattern (52px height, sticky)
- Card pattern with gradient + inset shadow
- Button primary: green pill with dark text
- Form inputs: 42px height, 10px radius
- Badge pills: 20px radius, semi-transparent backgrounds

---

## 19. 7-Day Implementation Timeline

### Day 1 (Monday) — Foundation + Outreach

**Morning (08:00–12:00):**
- [ ] 08:00–08:30 — Send 5 LAZ + 2 prof + 1 mosque + Dr. Habib outreach (templates ready)
- [ ] 08:30–09:00 — Create new GitHub repo `mizaan` (private until ready), set up Vercel project
- [ ] 09:00–10:00 — Initialize Next.js 16 project, copy Sahih design system + components
- [ ] 10:00–11:00 — Configure Tailwind v4, fonts (DM Sans + Space Grotesk), brand colors
- [ ] 11:00–12:00 — Run `setup-devnet.ts`: create IDRZ token + 5 SAS schemas, save PDAs to `.env.local`

**Afternoon (13:00–18:00):**
- [ ] 13:00–14:00 — Wire up Solana provider + wallet adapter (Phantom)
- [ ] 14:00–16:00 — Implement basic landing page (`/`) with hero
- [ ] 16:00–18:00 — Implement LAZ registry seed (`scripts/seed-laz.ts`) with 5 mock LAZ

**Evening (19:00–22:00):**
- [ ] 19:00–20:00 — Mustahik registry seed (10 mock mustahik per LAZ)
- [ ] 20:00–22:00 — Implement `lib/sas/donation.ts` — create donation attestation flow

**Day 1 deliverable:** Repo live, foundations set, mock data seeded, can sign first attestation.

---

### Day 2 (Tuesday) — Donor flow + LAZ admin scaffolding

**Morning:**
- [ ] 08:00–10:00 — Build `/donate` page (multi-step form, steps 1-3)
- [ ] 10:00–12:00 — Build `/donate` steps 4-7 (review + sign)

**Afternoon:**
- [ ] 13:00–15:00 — `POST /api/donations` endpoint
- [ ] 15:00–17:00 — `/donate/[donationId]` confirmation page

**Evening:**
- [ ] 18:00–20:00 — LAZ admin login page + JWT auth
- [ ] 20:00–22:00 — LAZ admin dashboard skeleton

**Day 2 deliverable:** Donor can complete a donation end-to-end (commitment + IDRZ transfer).

---

### Day 3 (Wednesday) — LAZ flow + mustahik confirmation

**Morning:**
- [ ] 08:00–10:00 — `/laz/admin/donations` queue page
- [ ] 10:00–12:00 — `/laz/admin/distribute/[donationId]` form

**Afternoon:**
- [ ] 13:00–15:00 — `POST /api/distributions` (creates DistributionDecision, transfers IDRZ to mustahik)
- [ ] 15:00–17:00 — Magic link generation + email send via Resend

**Evening:**
- [ ] 18:00–20:00 — `/confirm/[token]` mustahik page
- [ ] 20:00–22:00 — `POST /api/receipts` (creates ReceiptConfirmation)

**Day 3 deliverable:** Full E2E flow works (donor → LAZ → mustahik → confirmation).

---

### Day 4 (Thursday) — Tracking + verifier + polish

**Morning:**
- [ ] 08:00–11:00 — `/track/[walletAddress]` donor dashboard
- [ ] 11:00–12:00 — Donation aggregation logic

**Afternoon:**
- [ ] 13:00–15:00 — `/verify` public verifier page
- [ ] 15:00–17:00 — `/api/feed` + `/feed` page (live activity)

**Evening:**
- [ ] 18:00–20:00 — Privy embedded wallet integration (donor non-crypto path)
- [ ] 20:00–22:00 — Faucet endpoint + auto-airdrop on first donation

**Day 4 deliverable:** All major flows complete + accessible.

---

### Day 5 (Friday) — Polish + i18n + multilingual

**Morning:**
- [ ] 08:00–10:00 — Set up `next-intl` with id (default) + en
- [ ] 10:00–12:00 — Translate all UI copy to en

**Afternoon:**
- [ ] 13:00–15:00 — Polish all pages: animations (framer-motion), loading states, empty states
- [ ] 15:00–17:00 — Mobile responsiveness review across all pages

**Evening:**
- [ ] 18:00–20:00 — PWA manifest + service worker for offline cache
- [ ] 20:00–22:00 — Embeddable widget for LAZ websites (`<script src="mizaan.id/widget.js">`)

**Day 5 deliverable:** Polished, multilingual, mobile-PWA ready.

---

### Day 6 (Saturday) — QA + demo prep

**Morning:**
- [ ] 08:00–10:00 — Full E2E QA pass on staging Vercel
- [ ] 10:00–12:00 — Bug fixes from QA

**Afternoon:**
- [ ] 13:00–15:00 — Demo data refinement: realistic donations, mustahik names, LAZ data
- [ ] 15:00–17:00 — OG image generator + social share cards
- [ ] 17:00–18:00 — Lighthouse audit + performance optimization (target: 90+)

**Evening:**
- [ ] 18:00–22:00 — Demo video recording (3 min, Bahasa narration + EN subtitles)

**Day 6 deliverable:** Demo-ready production deployment + recorded video.

---

### Day 7 (Sunday) — Submit

**Morning:**
- [ ] 08:00–10:00 — Final polish + last-minute fixes
- [ ] 10:00–11:00 — Pitch deck final (Google Slides, 12 slides)
- [ ] 11:00–12:00 — README finalization for GitHub public release

**Afternoon:**
- [ ] 13:00–14:00 — University Declaration form filled
- [ ] 14:00–15:00 — Superteam Earn submission
- [ ] 15:00–16:00 — Colosseum Frontier submission (MANDATORY)
- [ ] 16:00–17:00 — Verify all submission requirements complete
- [ ] 17:00 — Submitted ✓

**Day 7 deliverable:** Submitted to both Superteam Earn + Colosseum Frontier before deadline.

---

### Buffer / contingency

- Reserve 4 hours total across the week for unexpected issues
- If Day 4 is incomplete, defer Privy integration to Day 5 (acceptable degradation)
- If Day 5 incomplete, ship without Arabic + widget (acceptable degradation)
- If Day 6 demo recording fails, re-record Day 7 morning

---

## 20. Testing Strategy

### 20.1 Test pyramid (hackathon-appropriate)

For a 7-day hackathon, full test coverage is not practical. Prioritize:

| Test type | Coverage target |
|---|---|
| Unit (utility functions) | Critical paths only (formatRupiah, address validation) |
| Integration (API routes) | All POST endpoints with happy path + 1 edge case |
| E2E (full flows) | 3 critical flows: donate, distribute, confirm |
| Manual QA | Full regression Day 6 |

### 20.2 Tools

- `vitest` for unit tests
- Playwright for E2E (optional, only if time permits)
- Manual QA Day 6

### 20.3 Critical test cases

- ✅ Valid wallet sign produces valid donation attestation
- ✅ Token transfer signature matches attestation
- ✅ Magic link expires correctly
- ✅ Donation cannot be over-distributed
- ✅ Mustahik PII never appears in API responses (publicly)
- ✅ LAZ A admin cannot access LAZ B's mustahik

---

## 21. Deployment Plan

### 21.1 Vercel deployment

```bash
# Day 3: First deploy
vercel --prod

# Day 7: Final production deploy
git push origin main # triggers auto-deploy
```

Domain: `mizaan.id` (purchase via Niagahoster or alternative)

### 21.2 Environment variables on Vercel

Set all `.env.local` variables in Vercel dashboard under Project Settings → Environment Variables.

Set for: Production, Preview, Development.

### 21.3 Build configuration

```typescript
// next.config.ts
const config = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    remotePatterns: [
      { hostname: "logo.clearbit.com" }, // LAZ logos
    ],
  },
};
export default config;
```

### 21.4 Performance optimization checklist

- [ ] Static pages where possible (SSG for `/`, `/about`)
- [ ] ISR for `/feed` (revalidate 30s)
- [ ] Image optimization via `next/image`
- [ ] Font optimization via `next/font`
- [ ] Code splitting (route-based default in Next.js)
- [ ] Lazy load heavy components (e.g., wallet adapter only on donate page)
- [ ] Edge runtime for API routes where possible

---

## 22. Demo Script

### 22.1 3-minute demo video

**0:00–0:25 — HOOK**

> [Newsroom-style stat overlay with statistics]
> Voiceover (Bahasa, EN subtitles):
> *"Indonesia. Potensi zakat: 327 triliun Rupiah per tahun. Realisasi: hanya 31 triliun. 9 persen. Kemana 296 triliun lainnya?"*
>
> [Cut to news headlines: BAZNAS scandals, kotak amal cases]
> *"Bukan masalah niat. Indonesia tahu zakat itu wajib. Masalahnya: trust deficit."*

**0:25–0:55 — SOLUTION**

> [Mizaan logo reveal]
> *"Mizaan. Lapisan transparansi zakat di blockchain Solana. Setiap zakat melalui tiga tanda tangan kriptografis: donor, LAZ, mustahik."*
>
> [Animated 3-step diagram]
> *"Donor sign. LAZ sign. Mustahik sign. Tidak ada satu pihak pun yang bisa fake distribusi."*

**0:55–2:10 — LIVE DEMO**

> [Screen recording, real Solana devnet transactions]
>
> *"Saya Sarah, diaspora Indonesia di Singapore. Saya bayar zakat 22 juta rupiah ke LAZ Dompet Dhuafa Yogya. Kategori: pendidikan."*
> [Sarah signs in Phantom — popup visible]
> *"Done. Attestation pertama tercatat di Solana."*
> [PDA shown on screen]
>
> [Switch tab to LAZ admin]
> *"Sekarang saya Bu Sri, amil di Dompet Dhuafa. Donasi Sarah masuk ke queue."*
> *"Saya assign 800,000 ke Pak Yusuf — biaya sekolah anaknya, kelas 8 SMP."*
> [LAZ admin signs — second popup]
> *"Attestation kedua tercatat. SMS terkirim ke Pak Yusuf."*
>
> [Switch to mobile screen]
> *"Pak Yusuf di Bantul terima SMS. Klik link konfirmasi."*
> [Tap "Terima & Konfirmasi"]
> *"Attestation ketiga tercatat. Tiga tanda tangan, satu zakat, fully verifiable."*
>
> [Switch back to Sarah's dashboard]
> *"Sarah lihat dashboard-nya. 'Zakat Anda sampai. Pak Y., biaya sekolah, Bandung. Konfirmasi 4 jam yang lalu.' Tiga tanda tangan kriptografis. Tidak ada kebohongan yang mungkin."*

**2:10–2:40 — REACH & ROADMAP**

> *"Mizaan untuk diaspora 12 juta orang Indonesia. Kirim zakat dari mana saja, lacak ke kampung halaman."*
> *"V1.1: real IDRX integration, mainnet, 50 LAZ partners."*
> *"Roadmap: wakaf vertical, BAZNAS official integration, cross-border verification dengan Malaysia dan Saudi."*
> *"Sebagai mahasiswa Muslim Indonesia, ini adalah misi pribadi. Konsep ini sebelumnya dibahas Dr. Farrukh Habib di Puskas BAZNAS. Tonight, I built the implementation."*

**2:40–3:00 — CTA + CREDITS**

> [Tech stack credits animation]
> *"Tech stack: Solana, SAS, Next.js 16, Helius, Privy. Live di mizaan.id. Repository: github.com/devrangga/mizaan. 1 founder, 7 hari."*
> [Final logo + tagline]
> *"Mizaan. Setiap zakat punya jejak. Setiap mustahik punya pengakuan."*
> [Fade out]

### 22.2 Recording setup

- Tool: OBS Studio (Mac)
- Resolution: 1920×1080
- Audio: external mic preferred (RØDE NT-USB+ if available)
- Browser: Chrome with no extensions (clean recording)
- Wallet: pre-funded with IDRZ
- Transactions: pre-tested, not first-attempt
- Subtitles: edited in DaVinci Resolve or CapCut

### 22.3 Submission video format

- MP4, H.264
- Max 100MB (for Superteam upload) or YouTube unlisted link
- Title format: "Mizaan — Indonesia National Campus Hackathon Submission"

---

## 23. Pitch Deck Outline

12 slides, Google Slides format.

| # | Slide | Content |
|---|---|---|
| 1 | Cover | Mizaan logo, tagline, "Indonesia National Campus Hackathon — May 2026" |
| 2 | Problem | "Rp 296T zakat hilang per tahun. Why? Trust deficit." Big-number visualization. |
| 3 | Failed solutions | Why BAZNAS dashboards, Kitabisa, LAZ private systems are insufficient |
| 4 | Solution | 3-party multi-signature attestation diagram |
| 5 | Why blockchain | Defense against "just use a database" critique (table) |
| 6 | Demo (live link) | Screenshots + QR to live demo |
| 7 | Tech stack | Solana, SAS, Next.js 16, Helius, Privy — 1-line per layer |
| 8 | Business model | Y1 revenue projection: Rp 2.85B, breakdown |
| 9 | GTM + traction | Outreach evidence, endorsements, Phase 1 plan |
| 10 | Roadmap | V1 → V1.1 → V2 (wakaf) → V3 (cross-border) |
| 11 | Why now / why us | Founder fit, Dr. Habib reference, market timing |
| 12 | CTA | Live demo URL, GitHub, contact, Solana network credits |

---

## 24. Submission Checklist

### 24.1 Superteam Earn submission

- [ ] Project title: "Mizaan — On-Chain Zakat Transparency for Indonesia"
- [ ] One-line description (max 280 chars)
- [ ] Long description (problem, solution, blockchain rationale)
- [ ] Live MVP URL: https://mizaan.id (or .vercel.app fallback)
- [ ] Demo video: YouTube unlisted link
- [ ] GitHub repo: public
- [ ] Pitch deck: Google Slides shareable link
- [ ] Tech stack list
- [ ] Team members (Devrangga + university affiliation)
- [ ] University Declaration form

### 24.2 Colosseum Frontier submission (MANDATORY)

- [ ] Account at arena.colosseum.org
- [ ] Project profile created
- [ ] All Superteam materials mirrored
- [ ] Contact info for at least one team member
- [ ] Indonesian National Campus Hackathon track selected

### 24.3 Pre-flight check (Day 7 morning)

- [ ] Demo video plays without errors
- [ ] Live URL loads in <2s
- [ ] No console errors on home page
- [ ] All locales work (id, en)
- [ ] Sample donation flow works on staging
- [ ] LAZ admin login works
- [ ] Mustahik confirmation works
- [ ] GitHub README has clear setup instructions
- [ ] All env vars documented in `.env.example`
- [ ] No keys committed to git

---

## 25. Code Conventions

### 25.1 TypeScript

- Strict mode (`strict: true` in tsconfig)
- No `any` (use `unknown` + narrow)
- Prefer `interface` for domain models, `type` for unions
- Explicit return types on exported functions

### 25.2 Naming

- Files: `kebab-case.ts`
- Components: `PascalCase`
- Variables/functions: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Types/interfaces: `PascalCase`
- Booleans: prefix with `is`/`has`/`can`

### 25.3 Imports

```typescript
// 1. Node built-ins
import { readFile } from "fs/promises";

// 2. External packages
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

// 3. Internal absolute (@/)
import { formatRupiah } from "@/lib/utils";

// 4. Internal relative
import { LocalComponent } from "./local-component";

// 5. Types last (or inline above)
import type { Donation } from "@/lib/types";
```

### 25.4 React component patterns

```typescript
// Server component (default)
export default async function Page() {
  const data = await fetchData();
  return <Layout>{...}</Layout>;
}

// Client component (interactive)
"use client";
export function InteractiveWidget() {
  const [state, setState] = useState();
  return <div>...</div>;
}

// Always type props
interface MyComponentProps {
  title: string;
  onSubmit: () => void;
}
export function MyComponent({ title, onSubmit }: MyComponentProps) {
  return <div>{title}</div>;
}
```

### 25.5 Error handling

```typescript
// API route pattern
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = schema.parse(body);
    const result = await doWork(validated);
    return Response.json(result);
  } catch (err) {
    if (err instanceof ZodError) {
      return Response.json({ error: "validation_failed", details: err.issues }, { status: 400 });
    }
    console.error("[POST /api/route]", err);
    return Response.json({ error: "internal_error" }, { status: 500 });
  }
}
```

### 25.6 Git commit conventions

```
feat: add donor wallet connection
fix: handle expired magic link gracefully
chore: bump dependencies
docs: update README setup instructions
refactor: extract distribution logic to lib/sas
style: format with prettier
test: add E2E test for donation flow
```

### 25.7 Branch strategy (hackathon-appropriate)

- `main`: deployed to production
- Direct commits to `main` for solo dev (no PR overhead)
- `git tag v0.1.0` after Day 3 (donor flow done)
- `git tag v0.5.0` after Day 5 (polish done)
- `git tag v1.0.0-hackathon` Day 7 final submission

---

## Appendix A — Solana Wallet Provider Setup

```typescript
// components/providers/solana-provider.tsx
"use client";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { useMemo } from "react";

export function SolanaProvider({ children }: { children: React.ReactNode }) {
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL!;
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
```

---

## Appendix B — Privy Provider Setup

```typescript
// components/providers/privy-provider.tsx
"use client";
import { PrivyProvider } from "@privy-io/react-auth";

export function MizaanPrivyProvider({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        loginMethods: ["email", "sms"],
        embeddedWallets: { createOnLogin: "users-without-wallets" },
        appearance: {
          theme: "dark",
          accentColor: "#14F195",
          logo: "/logos/mizaan-logo.svg",
        },
        defaultChain: { id: 0 /* Solana devnet placeholder */ },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
```

---

## Appendix C — Quick Reference: Day-by-Day Daily Standup Template

```
DAY N STANDUP (e.g., Day 3 = Wednesday)

✅ Completed yesterday:
   - [tick all from Day N-1 plan]

🚧 In progress:
   - [things from current Day plan]

🚨 Blockers:
   - [external dependency, bug, partner, etc.]

📝 Notes:
   - [decisions made, things deferred]

⏰ Time spent: X hours
```

---

*End of SRS. Companion to PRD.md.*
