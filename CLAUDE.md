# Mizaan — CLAUDE.md

> AI context file for Claude Code sessions in the Mizaan repo.
> Copy this file to the root of the Mizaan codebase (`/Users/devranggahazzamahiswara/Documents/code/mizaan/CLAUDE.md`) once the repo is created.
> Read this first before touching any code.

---

## What is Mizaan?

**Mizaan** (Arabic: _ميزان_, "scale" or "balance") is an **on-chain transparency layer for zakat, sedekah, and infaq** distribution in Indonesia, built on Solana via the Solana Attestation Service (SAS).

**Core promise:** Every Rupiah of zakat has a cryptographic path from donor → LAZ → mustahik. No skim, no fake distribution, no missing accountability.

**Target:** Indonesia National Campus Hackathon (Superteam Indonesia)
**Deadline:** May 12, 2026, 11:59 AM UTC
**Track:** Consumer Apps
**Submission listings (BOTH required):**

- https://superteam.fun/earn/listing/indonesia-national-campus-hackathon
- https://arena.colosseum.org

---

## Tech Stack (CURRENT — post-Supabase migration)

| Layer            | Technology                                                                |
| ---------------- | ------------------------------------------------------------------------- |
| Framework        | **Next.js 16** (App Router · Turbopack · React 19)                        |
| Language         | **TypeScript 5.8** strict mode                                            |
| Styling          | **Tailwind CSS v4** (`@theme` syntax in `app/globals.css`)                |
| i18n             | **next-intl 4** — `id` (default) + `en`                                   |
| Routing helpers  | `i18n/routing.ts`                                                         |
| Middleware       | **`proxy.ts`** (Next.js 16 renamed `middleware.ts` → `proxy.ts`)          |
| Blockchain       | **Solana Devnet**                                                         |
| Credential layer | **`sas-lib`** — Solana Attestation Service                                |
| Solana client    | **`gill`** (server-side transactions)                                     |
| Wallet           | **`@solana/wallet-adapter-react`** (Phantom + Solflare)                   |
| Embedded wallet  | **`@privy-io/react-auth`** (diaspora donors via email/SMS)                |
| RPC              | **Helius** (`NEXT_PUBLIC_SOLANA_RPC_URL`)                                 |
| Database         | **Supabase Postgres** (LAZ, mustahik PII, donations meta)                 |
| Auth             | **Supabase Auth** (LAZ admin email/password + mustahik magic link)        |
| Realtime         | **Supabase Realtime** (live activity feed)                                |
| Storage          | **Supabase Storage** (LAZ logos)                                          |
| Email            | **Resend** (REUSING existing user account — just adds `mizaan.id` domain) |
| PDF (V1.5+)      | `@react-pdf/renderer` + `qrcode`                                          |
| OG images        | `next/og`                                                                 |
| Toasts           | `sonner`                                                                  |
| Icons            | `lucide-react` (rarely used; mostly inline SVG)                           |

**No KV, no Vercel Blob, no custom JWT, no manual magic-link plumbing.** Supabase consolidates all of those.

---

## Design system (CURRENT)

**Aesthetic:** paper.design lineage — dark mono editorial, lowercase headlines, generous whitespace, grid backdrops as blueprint texture, Solana green sparingly for verified states.

### Fonts (Google Fonts — free)

| Role             | Font                                  | Why                                                                                                               |
| ---------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Display + body   | **Plus Jakarta Sans** 400/500/600/700 | Made in Jakarta by Tokotype. Geometric premium feel like Matter (paper.design's commercial choice). Cultural fit. |
| Mono / technical | **JetBrains Mono** 400/500/600        | PDA addresses, signatures, code, technical labels                                                                 |

Loaded via `next/font/google`:

```tsx
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";

const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});
```

### Color tokens (`@theme` in `app/globals.css`)

```
--color-bg:              #181818     /* near-black with breathing room */
--color-surface:         #1a1a1a
--color-card:            #1a1a1a
--color-card-hi:         #222222

--color-primary:         #14F195     /* Solana Green — single accent */
--color-primary-hover:   #11D985
--color-primary-soft:    rgba(20,241,149,0.10)

--color-text:            #efefe4     /* warm cream-white, NOT pure white */
--color-text-secondary:  rgba(239,239,228,0.65)
--color-text-muted:      rgba(239,239,228,0.42)
--color-text-faint:      rgba(239,239,228,0.30)

--color-border:          rgba(255,255,255,0.06)
--color-border-strong:   rgba(255,255,255,0.10)
--color-border-accent:   rgba(20,241,149,0.18)
```

### Card recipe (gradient + inset stroke)

Every primary card uses this pattern:

```css
.card-mizaan {
  background: var(--color-card);
  background-image: linear-gradient(
    180deg,
    rgba(20, 241, 149, 0.05) 0%,
    transparent 45%
  );
  border: 1px solid rgba(20, 241, 149, 0.13);
  box-shadow: inset 0 1px 0 rgba(20, 241, 149, 0.18);
  border-radius: 16px;
}
```

For neutral cards: replace green `(20,241,149)` with white `(255,255,255)`.

### Grid backdrop (paper.design signature)

```css
.grid-backdrop {
  background-image:
    linear-gradient(to right, rgba(239, 239, 228, 0.06) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(239, 239, 228, 0.06) 1px, transparent 1px);
  background-size: 10px 10px; /* paper.design exact */
  pointer-events: none;
}
```

Apply to: footer reveal area, CTV section, roadmap section. Subtle (0.025-0.06 alpha) on regular sections.

### Border radius scale

- Cards: `rounded-[16px]`
- Sub-cards / inputs: `rounded-[10px]`
- Buttons: `rounded-[9px]`
- Pills/badges: `rounded-full` (or `rounded-[20px]`)

### Typography rules

- **All display headlines lowercase** (paper.design signature)
- Letter-spacing: -0.025em on headings
- Eyebrow labels: lowercase, JetBrains Mono, 12px, `// prefix style` is encouraged
- No italics for body (only Plus Jakarta Sans regular/medium/semibold/bold)
- Numbers and amounts in Plus Jakarta Sans 500 (medium weight) for that "fintech serious" feel

---

## App structure

```
app/
├── page.tsx                              # Landing (paper.design style)
├── (donor)/
│   ├── donate/page.tsx                   # 6-step donation form
│   ├── donate/[donationId]/page.tsx      # Success / status
│   └── track/[walletAddress]/page.tsx    # Donor tracking dashboard
├── (laz)/laz/
│   ├── page.tsx                          # Public LAZ directory
│   ├── [lazId]/page.tsx                  # LAZ profile
│   ├── login/page.tsx                    # Supabase Auth login
│   └── admin/
│       ├── page.tsx                      # LAZ admin dashboard
│       ├── donations/page.tsx            # Pending queue
│       ├── distribute/[donationId]/page.tsx  # Distribution form
│       └── mustahik/page.tsx             # Registry
├── (mustahik)/confirm/[token]/page.tsx   # Mustahik mobile confirm
├── (public)/
│   ├── verify/page.tsx                   # Public verifier
│   ├── feed/page.tsx                     # Live feed
│   └── about/page.tsx
└── api/
    ├── donations/route.ts                # POST: create commitment, GET: list
    ├── distributions/route.ts            # POST: create distribution
    ├── receipts/route.ts                 # POST: confirm receipt
    ├── laz/route.ts                      # GET: list LAZ
    ├── mustahik/route.ts                 # GET (LAZ-scoped)
    ├── feed/route.ts                     # GET: paginated feed
    └── verify/[identifier]/route.ts

components/
├── navbar.tsx                            # Top nav (public + app variants)
├── footer-reveal.tsx                     # paper.design sticky footer pattern
├── donation-card.tsx
├── distribution-flow.tsx                 # 3-attestation visualization
├── live-feed.tsx                         # Realtime via Supabase channel
├── connect-wallet-button.tsx             # Phantom + Privy 2-path
└── ui/                                   # button, input, select, badge, card

lib/
├── constants.ts                          # CATEGORY_LABELS, ASNAF, DONATION_TYPE_LABELS
├── types.ts                              # All TypeScript types (BigInt amounts)
├── utils.ts                              # cn, shortenAddress, formatRupiah
├── sas/                                  # SAS attestation helpers
│   ├── client.ts
│   ├── schemas.ts                        # 5 schema definitions
│   ├── donation.ts                       # createDonationCommitment
│   ├── distribution.ts                   # createDistributionDecision
│   ├── receipt.ts                        # createReceiptConfirmation
│   └── reads.ts                          # fetchAttestationsByWallet, etc.
├── supabase/                             # NEW — replaces lib/db/kv.ts
│   ├── client.ts                         # Browser client
│   ├── server.ts                         # Server client (SSR)
│   ├── admin.ts                          # Service-role (server-only)
│   └── types.ts                          # Generated via `supabase gen types typescript`
├── db/                                   # Typed query helpers (use Supabase clients)
│   ├── mustahik.ts                       # RLS-scoped to current LAZ admin
│   ├── laz.ts                            # Public reads + admin writes
│   ├── donations.ts                      # off-chain donation metadata
│   └── feed.ts                           # Realtime feed subscription
└── token/
    ├── idrz.ts                           # IDRZ mint, transfer helpers
    └── faucet.ts                         # Devnet faucet (rate-limited via Supabase)
```

---

## Environment variables (`.env.example`)

```bash
# === Solana ===
NEXT_PUBLIC_SOLANA_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_HELIUS_KEY
NEXT_PUBLIC_SOLANA_NETWORK=devnet

# === IDRZ Custom SPL Token ===
NEXT_PUBLIC_IDRZ_MINT=
IDRZ_MINT_AUTHORITY_KEYPAIR=

# === SAS Schemas ===
NEXT_PUBLIC_SAS_DONATION_SCHEMA=
NEXT_PUBLIC_SAS_DISTRIBUTION_SCHEMA=
NEXT_PUBLIC_SAS_RECEIPT_SCHEMA=
NEXT_PUBLIC_SAS_LAZ_IDENTITY_SCHEMA=
NEXT_PUBLIC_SAS_MUSTAHIK_SCHEMA=
NEXT_PUBLIC_SAS_CREDENTIAL_PDA=

# === LAZ authority keypair (issuing identity) ===
LAZ_AUTHORITY_KEYPAIR=

# === Privy embedded wallet ===
NEXT_PUBLIC_PRIVY_APP_ID=
PRIVY_APP_SECRET=

# === Supabase (auth + db + realtime + storage) ===
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=

# === Email (REUSING existing Resend account — add mizaan.id domain) ===
RESEND_API_KEY=                    # same key as your other SaaS
RESEND_FROM_EMAIL=noreply@mizaan.id

# === App ===
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Mizaan
NEXT_PUBLIC_DEFAULT_LOCALE=id
```

---

## First-time setup

```bash
# 1. Provision Supabase project (free tier)
#    a. Create at https://supabase.com
#    b. Copy URL + anon key + service role key
#    c. Enable Email auth (magic link) in dashboard
#    d. Configure SMTP: Auth → Email Templates → SMTP → use existing Resend API key

# 2. Run Supabase migrations (see SUPABASE_SCHEMA.md in vault)
pnpm supabase migration up

# 3. Generate TypeScript types from schema
pnpm supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts

# 4. Add mizaan.id as verified domain in your existing Resend account

# 5. Setup Solana devnet (mints IDRZ, creates SAS schemas, LAZ authority keypair)
pnpm setup:devnet

# 6. Seed mock data
pnpm seed:laz       # 5 mock LAZ partners
pnpm seed:mustahik  # 10 mustahik per LAZ

# 7. Start dev
pnpm dev
```

---

## Key conventions

- **Lowercase display copy** everywhere except brand names ("Mizaan" capitalized in nav only as wordmark)
- **All display amounts in `Rp X,XXX,XXX` format** via `formatRupiah(bigint)` helper
- **Use `BigInt` for all monetary values** — never `number` (precision)
- **PDA addresses always shown shortened** via `shortenAddress(pda, 6)` → `7xKX...bW2`
- **JetBrains Mono for any cryptographic / technical value** (PDA, signature, schema name, block height)
- **Plus Jakarta Sans for everything else** — body, headlines, buttons, etc.
- **Server components default**, `"use client"` only when wallet/state interactive
- **No `any` types** — generate Supabase types via `supabase gen types`
- **All API routes return JSON Zod-validated** with consistent `{ data, error }` shape
- **RLS enforced at DB level** — API guards are defense in depth, not primary auth
- **Inline styles for one-offs** is OK; Tailwind utilities for repeating patterns

---

## Pending tasks (post-design phase)

- [ ] Create `mizaan` repo (separate from `sahih`)
- [ ] Initialize Next.js 16 + Tailwind v4 + TypeScript
- [ ] Set up Supabase project + run migrations
- [ ] Add `mizaan.id` domain to existing Resend account
- [ ] Get Helius devnet API key
- [ ] Get Privy app credentials
- [ ] Run `setup:devnet` for IDRZ + SAS schemas
- [ ] Implement landing page (Paper artboard `NDO-0`)
- [ ] Implement /donate flow (Paper artboards `OKD-0` overview + `O16-0` step 6 detail)
- [ ] Implement /track (Paper artboard `O50-0`)
- [ ] Implement /confirm mobile (Paper artboard `OAB-0`)
- [ ] Implement /verify (Paper artboard `OBP-0`)
- [ ] Implement /laz/admin/distribute (Paper artboard `OFG-0`)
- [ ] Deploy to Vercel
- [ ] Record demo video
- [ ] Submit to Superteam + Colosseum

---

## Reference documents

Always read these before guessing — they are the source of truth.

- **PRD** — `docs/PRD.md` (product strategy, personas, business model, GTM)
- **SRS** — `docs/SRS.md` (technical spec, schemas, env vars, API contracts, auth flows)
- **Supabase schema** — `docs/SUPABASE_SCHEMA.md` (full DDL, RLS policies, triggers, type generation)
- **Paper design canvas** — `https://app.paper.design/file/01KPWR8ZY24MGPAEYQRWKRKT7K/4-0`

  **App pages (1440px desktop unless noted):**
  - Landing v1 (fit-content, full sections + footer reveal): `NDO-0`
  - Footer reveal pattern annotation: `NUV-0`
  - Donation flow 6-step overview: `OKD-0`
  - `/donate` review & sign: `O16-0`
  - `/donate/[id]` success: `OR5-0`
  - `/track` donor dashboard: `O50-0`
  - `/confirm` mustahik (390×844 mobile): `OAB-0`
  - `/verify` public verifier: `OBP-0`
  - `/laz` directory: `OSV-0`
  - `/laz/admin/distribute`: `OFG-0`
  - `/feed` live activity stream: `OYO-0`
