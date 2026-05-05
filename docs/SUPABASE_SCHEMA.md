# Mizaan — Supabase Schema Specification

> Companion to `SRS.md` §13 (Off-Chain Storage) and §16 (Security).
> Audience: engineers running migrations + Claude Code sessions writing SQL/TypeScript.
> All schema designed to work with Supabase Auth (`auth.users`, `auth.uid()`).

---

## Table of Contents

1. [Schema Overview](#1-schema-overview)
2. [Table DDL](#2-table-ddl)
3. [Indexes](#3-indexes)
4. [RLS Policies](#4-rls-policies)
5. [Triggers & Functions](#5-triggers--functions)
6. [Storage Buckets](#6-storage-buckets)
7. [Realtime Configuration](#7-realtime-configuration)
8. [Migration Files](#8-migration-files)
9. [Seed Data](#9-seed-data)
10. [Type Generation](#10-type-generation)

---

## 1. Schema Overview

```
auth.users (Supabase managed)
  │
  ├── laz_admins ─────────► laz
  │                          │
  │                          ├── mustahik (LAZ-scoped via RLS)
  │                          │
  │                          └── distributions_meta (LAZ-scoped via RLS)
  │
  └── (no direct relation; donor wallets handled via Phantom/Privy)

donations_meta (server-managed, RLS bypass via service role)
audit_log (append-only, RLS read-only for non-admins)
feed_cache (materialized view, public read)
```

### Tables

| Table | Rows expected | RLS | Realtime |
|---|---|---|---|
| `laz` | 50-200 | Public read · Service write | No |
| `laz_admins` | 100-500 | Self read only · Service write | No |
| `mustahik` | 1,000-100,000 | LAZ-scoped via RLS | No |
| `donations_meta` | 10,000-1M | Server only (RLS deny all to anon) | No |
| `distributions_meta` | 50,000-5M | LAZ-scoped via RLS | No |
| `audit_log` | High volume | Read public (anonymized), write server | **Yes** (live feed) |
| `feed_cache` | 100 (latest) | Public read | No (refreshes) |

---

## 2. Table DDL

### 2.1 `laz` — LAZ partner registry

```sql
CREATE TABLE public.laz (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- On-chain reference
  wallet_address       TEXT NOT NULL UNIQUE,           -- LAZ's authoritative wallet
  identity_pda         TEXT,                            -- MIZAAN_LAZ_IDENTITY_V1 PDA

  -- Identity
  slug                 TEXT NOT NULL UNIQUE,            -- URL-safe ("dompet-dhuafa-yogya")
  name                 TEXT NOT NULL,                   -- Display name (PII-light)
  registration_number  TEXT NOT NULL,                   -- BAZNAS-LAZ-XXX

  -- Geographic
  region               TEXT NOT NULL,                   -- "DI Yogyakarta"
  jurisdiction_level   TEXT NOT NULL CHECK (jurisdiction_level IN
                         ('NATIONAL','PROVINCIAL','REGENCY','MOSQUE')),

  -- Public contact
  website_url          TEXT,
  contact_email        TEXT,
  logo_url             TEXT,                            -- Supabase Storage URL

  -- Status
  status               TEXT NOT NULL DEFAULT 'ACTIVE'
                         CHECK (status IN ('ACTIVE','PAUSED','SUSPENDED')),

  -- Aggregate stats (denormalized; refreshed by trigger)
  total_received_idrz  BIGINT NOT NULL DEFAULT 0,
  total_distributed_idrz BIGINT NOT NULL DEFAULT 0,
  mustahik_count       INTEGER NOT NULL DEFAULT 0,
  donor_count          INTEGER NOT NULL DEFAULT 0,

  -- Audit
  registered_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.2 `laz_admins` — Maps Supabase user → LAZ

```sql
CREATE TABLE public.laz_admins (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  laz_id        UUID NOT NULL REFERENCES public.laz(id) ON DELETE CASCADE,

  role          TEXT NOT NULL DEFAULT 'AMIL'
                  CHECK (role IN ('AMIL','HEAD_AMIL','OBSERVER')),
  display_name  TEXT,                                   -- e.g. "Bu Sri R."

  invited_by    UUID REFERENCES auth.users(id),
  invited_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  joined_at     TIMESTAMPTZ,

  UNIQUE (user_id, laz_id)
);
```

### 2.3 `mustahik` — Recipient registry (PII)

```sql
CREATE TABLE public.mustahik (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  laz_id          UUID NOT NULL REFERENCES public.laz(id) ON DELETE CASCADE,

  -- On-chain reference (custodial wallet)
  wallet_address  TEXT NOT NULL UNIQUE,
  identity_pda    TEXT,                                  -- MIZAAN_MUSTAHIK_V1 PDA
  internal_id     TEXT NOT NULL,                          -- LAZ-internal ID (e.g. "1247")
  internal_id_hash TEXT NOT NULL,                         -- SHA-256 of internal_id (on-chain version)

  -- PII (RLS-protected · UU PDP compliant)
  full_name       TEXT NOT NULL,                          -- never appears in attestation
  phone           TEXT,                                    -- for SMS (V1.1)
  email           TEXT,                                    -- for magic link

  -- Public attributes (also on-chain, no PII)
  initials        TEXT NOT NULL,                          -- "P.Y."
  asnaf_category  TEXT NOT NULL CHECK (asnaf_category IN
                    ('FAKIR','MISKIN','AMIL','MUALLAF',
                     'RIQAB','GHARIMIN','FISABILILLAH','IBNU_SABIL')),
  region          TEXT NOT NULL,
  age_range       TEXT NOT NULL CHECK (age_range IN
                    ('CHILD','TEEN','ADULT','ELDER')),

  -- Status
  status          TEXT NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE','GRADUATED','INACTIVE')),

  -- Audit
  registered_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  registered_by   UUID REFERENCES auth.users(id),         -- which amil added them
  last_updated    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (laz_id, internal_id)
);
```

### 2.4 `donations_meta` — Off-chain donation metadata

```sql
CREATE TABLE public.donations_meta (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- On-chain reference
  donation_commitment_pda     TEXT NOT NULL UNIQUE,
  donor_wallet                TEXT NOT NULL,
  laz_id                      UUID NOT NULL REFERENCES public.laz(id),

  -- Off-chain metadata
  donor_email                 TEXT,                        -- only for Privy users
  donor_display_name          TEXT,                        -- self-set in profile
  encrypted_message           TEXT,                        -- encrypted with mustahik pubkey

  -- Type & amount
  donation_type               TEXT NOT NULL CHECK (donation_type IN
                                ('ZAKAT_MAL','ZAKAT_FITRAH','SEDEKAH','INFAQ')),
  amount_idrz                 BIGINT NOT NULL CHECK (amount_idrz > 0),
  category_preference         TEXT[],                      -- multi-select

  -- Linked transactions
  token_transfer_signature    TEXT NOT NULL,               -- Solana signature
  block_height                BIGINT,

  -- Status
  status                      TEXT NOT NULL DEFAULT 'PENDING_DISTRIBUTION'
                                CHECK (status IN
                                  ('PENDING_DISTRIBUTION','PARTIALLY_DISTRIBUTED',
                                   'FULLY_DISTRIBUTED','FULLY_CONFIRMED')),

  -- Aggregates (computed by trigger from distributions_meta)
  total_distributed_idrz      BIGINT NOT NULL DEFAULT 0,
  distribution_count          INTEGER NOT NULL DEFAULT 0,
  confirmation_count          INTEGER NOT NULL DEFAULT 0,

  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fully_distributed_at        TIMESTAMPTZ,
  fully_confirmed_at          TIMESTAMPTZ
);
```

### 2.5 `distributions_meta` — LAZ distribution decisions (off-chain)

```sql
CREATE TABLE public.distributions_meta (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- On-chain reference
  distribution_decision_pda       TEXT NOT NULL UNIQUE,
  donation_commitment_pda         TEXT NOT NULL REFERENCES public.donations_meta(donation_commitment_pda),
  laz_id                          UUID NOT NULL REFERENCES public.laz(id),
  mustahik_id                     UUID NOT NULL REFERENCES public.mustahik(id),
  amil_user_id                    UUID NOT NULL REFERENCES auth.users(id),

  -- Distribution detail
  amount_idrz                     BIGINT NOT NULL CHECK (amount_idrz > 0),
  category                        TEXT NOT NULL,
  asnaf                           TEXT NOT NULL,
  purpose_description             TEXT NOT NULL,           -- "biaya sekolah anak..."
  internal_notes                  TEXT,                     -- private LAZ notes

  -- Linked transactions
  token_transfer_signature        TEXT NOT NULL,
  block_height                    BIGINT,

  -- Receipt status
  receipt_pda                     TEXT,                     -- set when mustahik confirms
  receipt_confirmed_at            TIMESTAMPTZ,
  thank_you_message_encrypted     TEXT,                     -- mustahik → donor

  -- Magic link tracking
  magic_link_sent_at              TIMESTAMPTZ,
  magic_link_clicked_at           TIMESTAMPTZ,

  created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.6 `audit_log` — Append-only audit trail (powers Realtime feed)

```sql
CREATE TABLE public.audit_log (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  event_type          TEXT NOT NULL CHECK (event_type IN (
                        'DONATION_CREATED',
                        'DISTRIBUTION_CREATED',
                        'RECEIPT_CONFIRMED',
                        'LAZ_REGISTERED',
                        'MUSTAHIK_REGISTERED',
                        'ADMIN_LOGIN',
                        'ADMIN_INVITED'
                      )),

  -- Actor (who did this)
  actor_user_id       UUID REFERENCES auth.users(id),     -- nullable (donor wallet might not have user)
  actor_wallet        TEXT,
  actor_role          TEXT,                                -- DONOR, AMIL, MUSTAHIK, SYSTEM

  -- Subject (what was affected)
  laz_id              UUID REFERENCES public.laz(id),
  mustahik_id         UUID REFERENCES public.mustahik(id),
  donation_pda        TEXT,
  distribution_pda    TEXT,
  receipt_pda         TEXT,

  -- Display fields (for live feed UI — anonymized)
  amount_idrz         BIGINT,
  category            TEXT,
  region              TEXT,
  mustahik_initials   TEXT,
  laz_slug            TEXT,
  purpose_short       TEXT,                                -- truncated for display

  -- Metadata
  metadata            JSONB,                               -- arbitrary extras

  occurred_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.7 `feed_cache` — Materialized view for fast feed

```sql
CREATE MATERIALIZED VIEW public.feed_cache AS
SELECT
  id,
  event_type,
  amount_idrz,
  category,
  region,
  mustahik_initials,
  laz_slug,
  purpose_short,
  occurred_at
FROM public.audit_log
WHERE event_type IN ('RECEIPT_CONFIRMED','DISTRIBUTION_CREATED','DONATION_CREATED')
ORDER BY occurred_at DESC
LIMIT 100;

-- Refresh on a schedule (every 30s) via pg_cron or via app-level trigger
```

---

## 3. Indexes

```sql
-- Hot-path queries
CREATE INDEX idx_mustahik_laz_id_status ON public.mustahik (laz_id, status);
CREATE INDEX idx_mustahik_laz_id_asnaf ON public.mustahik (laz_id, asnaf_category) WHERE status = 'ACTIVE';
CREATE INDEX idx_mustahik_laz_id_region ON public.mustahik (laz_id, region) WHERE status = 'ACTIVE';

CREATE INDEX idx_donations_meta_donor_wallet ON public.donations_meta (donor_wallet, created_at DESC);
CREATE INDEX idx_donations_meta_laz_id_status ON public.donations_meta (laz_id, status);

CREATE INDEX idx_distributions_meta_donation_pda ON public.distributions_meta (donation_commitment_pda);
CREATE INDEX idx_distributions_meta_laz_id ON public.distributions_meta (laz_id, created_at DESC);
CREATE INDEX idx_distributions_meta_mustahik_id ON public.distributions_meta (mustahik_id);

-- Audit log lookups
CREATE INDEX idx_audit_log_event_type_occurred ON public.audit_log (event_type, occurred_at DESC);
CREATE INDEX idx_audit_log_laz_id ON public.audit_log (laz_id, occurred_at DESC) WHERE laz_id IS NOT NULL;

-- LAZ admin lookups
CREATE INDEX idx_laz_admins_user_id ON public.laz_admins (user_id);
CREATE INDEX idx_laz_admins_laz_id ON public.laz_admins (laz_id);
```

---

## 4. RLS Policies

### 4.1 `laz` — Public read, service-only write

```sql
ALTER TABLE public.laz ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_can_read_active_laz"
  ON public.laz FOR SELECT
  USING (status = 'ACTIVE');

-- Writes via service role only (Mizaan team registers LAZ)
```

### 4.2 `laz_admins` — Self-read only

```sql
ALTER TABLE public.laz_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_laz_admin_record"
  ON public.laz_admins FOR SELECT
  USING (user_id = auth.uid());

-- Writes via service role only (admin invitations handled server-side)
```

### 4.3 `mustahik` — LAZ-scoped (the killer policy)

```sql
ALTER TABLE public.mustahik ENABLE ROW LEVEL SECURITY;

-- Helper function to get current admin's LAZ ID
CREATE OR REPLACE FUNCTION public.current_laz_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT laz_id FROM public.laz_admins
  WHERE user_id = auth.uid()
  LIMIT 1
$$;

CREATE POLICY "laz_admin_reads_own_mustahik"
  ON public.mustahik FOR SELECT
  USING (laz_id = public.current_laz_id());

CREATE POLICY "laz_admin_inserts_own_mustahik"
  ON public.mustahik FOR INSERT
  WITH CHECK (laz_id = public.current_laz_id());

CREATE POLICY "laz_admin_updates_own_mustahik"
  ON public.mustahik FOR UPDATE
  USING (laz_id = public.current_laz_id())
  WITH CHECK (laz_id = public.current_laz_id());

-- No DELETE policy — mustahik are soft-deleted via status='INACTIVE'
```

### 4.4 `donations_meta` — Server-only

```sql
ALTER TABLE public.donations_meta ENABLE ROW LEVEL SECURITY;

-- LAZ admin reads donations TO their LAZ (for distribution dashboard)
CREATE POLICY "laz_admin_reads_own_laz_donations"
  ON public.donations_meta FOR SELECT
  USING (laz_id = public.current_laz_id());

-- Donor can read their own donations (by wallet)
-- Note: requires custom JWT claim "donor_wallet" — set on Phantom/Privy login
-- For now, donor reads via API route with wallet sig verification

-- Writes via service role only (server-side after verifying tx)
```

### 4.5 `distributions_meta` — LAZ-scoped writes

```sql
ALTER TABLE public.distributions_meta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "laz_admin_reads_own_distributions"
  ON public.distributions_meta FOR SELECT
  USING (laz_id = public.current_laz_id());

CREATE POLICY "laz_admin_creates_own_distributions"
  ON public.distributions_meta FOR INSERT
  WITH CHECK (
    laz_id = public.current_laz_id()
    AND amil_user_id = auth.uid()
  );

CREATE POLICY "laz_admin_updates_own_distributions"
  ON public.distributions_meta FOR UPDATE
  USING (laz_id = public.current_laz_id())
  WITH CHECK (laz_id = public.current_laz_id());
```

### 4.6 `audit_log` — Public anonymized read, server write

```sql
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_reads_anonymized_audit_log"
  ON public.audit_log FOR SELECT
  USING (true);

-- All writes via service role; this is append-only (no UPDATE/DELETE policies)
```

### 4.7 `feed_cache` — Public read

```sql
ALTER MATERIALIZED VIEW public.feed_cache OWNER TO postgres;
GRANT SELECT ON public.feed_cache TO anon, authenticated;
```

---

## 5. Triggers & Functions

### 5.1 Auto-update `updated_at` on row change

```sql
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER laz_touch_updated_at
  BEFORE UPDATE ON public.laz
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Repeat for mustahik (last_updated), etc.
```

### 5.2 Auto-update donation aggregates when distribution created

```sql
CREATE OR REPLACE FUNCTION public.refresh_donation_aggregates()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.donations_meta
  SET
    total_distributed_idrz = (
      SELECT COALESCE(SUM(amount_idrz), 0)
      FROM public.distributions_meta
      WHERE donation_commitment_pda = NEW.donation_commitment_pda
    ),
    distribution_count = (
      SELECT COUNT(*)
      FROM public.distributions_meta
      WHERE donation_commitment_pda = NEW.donation_commitment_pda
    ),
    confirmation_count = (
      SELECT COUNT(*)
      FROM public.distributions_meta
      WHERE donation_commitment_pda = NEW.donation_commitment_pda
        AND receipt_pda IS NOT NULL
    )
  WHERE donation_commitment_pda = NEW.donation_commitment_pda;
  RETURN NEW;
END;
$$;

CREATE TRIGGER distributions_refresh_donation_aggregates
  AFTER INSERT OR UPDATE OR DELETE ON public.distributions_meta
  FOR EACH ROW EXECUTE FUNCTION public.refresh_donation_aggregates();
```

### 5.3 Audit log auto-insert on key events

```sql
CREATE OR REPLACE FUNCTION public.log_distribution_created()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.audit_log (
    event_type, actor_user_id, actor_role,
    laz_id, mustahik_id, donation_pda, distribution_pda,
    amount_idrz, category,
    mustahik_initials, region, laz_slug, purpose_short
  )
  SELECT
    'DISTRIBUTION_CREATED', NEW.amil_user_id, 'AMIL',
    NEW.laz_id, NEW.mustahik_id, NEW.donation_commitment_pda, NEW.distribution_decision_pda,
    NEW.amount_idrz, NEW.category,
    m.initials, m.region, l.slug, LEFT(NEW.purpose_description, 60)
  FROM public.mustahik m, public.laz l
  WHERE m.id = NEW.mustahik_id AND l.id = NEW.laz_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER distributions_log_create
  AFTER INSERT ON public.distributions_meta
  FOR EACH ROW EXECUTE FUNCTION public.log_distribution_created();

-- Similar trigger for receipt confirmation
CREATE OR REPLACE FUNCTION public.log_receipt_confirmed()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.receipt_pda IS NULL AND NEW.receipt_pda IS NOT NULL THEN
    INSERT INTO public.audit_log (
      event_type, actor_role,
      laz_id, mustahik_id, donation_pda, distribution_pda, receipt_pda,
      amount_idrz, category,
      mustahik_initials, region, laz_slug, purpose_short
    )
    SELECT
      'RECEIPT_CONFIRMED', 'MUSTAHIK',
      NEW.laz_id, NEW.mustahik_id, NEW.donation_commitment_pda,
      NEW.distribution_decision_pda, NEW.receipt_pda,
      NEW.amount_idrz, NEW.category,
      m.initials, m.region, l.slug, LEFT(NEW.purpose_description, 60)
    FROM public.mustahik m, public.laz l
    WHERE m.id = NEW.mustahik_id AND l.id = NEW.laz_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER distributions_log_receipt_confirmed
  AFTER UPDATE ON public.distributions_meta
  FOR EACH ROW EXECUTE FUNCTION public.log_receipt_confirmed();
```

---

## 6. Storage Buckets

```sql
-- Run in Supabase dashboard → Storage → New bucket

-- 1. laz-logos (public)
INSERT INTO storage.buckets (id, name, public) VALUES ('laz-logos', 'laz-logos', true);

CREATE POLICY "laz_admin_uploads_own_logo"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'laz-logos'
    AND (storage.foldername(name))[1] = (
      SELECT slug FROM public.laz
      WHERE id = public.current_laz_id()
    )
  );

CREATE POLICY "anyone_reads_laz_logos"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'laz-logos');

-- 2. audit-pdfs (private, signed URLs only)
INSERT INTO storage.buckets (id, name, public) VALUES ('audit-pdfs', 'audit-pdfs', false);

CREATE POLICY "laz_admin_reads_own_audit_pdfs"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'audit-pdfs'
    AND (storage.foldername(name))[1] = (
      SELECT id::TEXT FROM public.laz
      WHERE id = public.current_laz_id()
    )
  );
```

---

## 7. Realtime Configuration

Enable Realtime for live activity feed:

```sql
-- Supabase dashboard → Database → Replication → public.audit_log → enable

-- Or via SQL
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_log;
```

Client subscription pattern:

```typescript
// app/feed/page.tsx (client component)
const channel = supabase
  .channel("public:audit_log")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "audit_log",
      filter: "event_type=eq.RECEIPT_CONFIRMED",
    },
    (payload) => prependFeedItem(payload.new)
  )
  .subscribe();
```

---

## 8. Migration Files

Suggested file structure:

```
supabase/
├── migrations/
│   ├── 20260505000000_init_extensions.sql
│   ├── 20260505000001_create_laz.sql
│   ├── 20260505000002_create_laz_admins.sql
│   ├── 20260505000003_create_mustahik.sql
│   ├── 20260505000004_create_donations_meta.sql
│   ├── 20260505000005_create_distributions_meta.sql
│   ├── 20260505000006_create_audit_log.sql
│   ├── 20260505000007_create_feed_cache.sql
│   ├── 20260505000008_indexes.sql
│   ├── 20260505000009_rls_policies.sql
│   ├── 20260505000010_triggers.sql
│   ├── 20260505000011_storage_buckets.sql
│   └── 20260505000012_realtime_publications.sql
└── seed.sql
```

### `20260505000000_init_extensions.sql`

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_cron";  -- for feed_cache refresh schedule
```

---

## 9. Seed Data

`supabase/seed.sql` (run after migrations):

```sql
-- Mock LAZ partners (5)
INSERT INTO public.laz (wallet_address, slug, name, registration_number, region, jurisdiction_level, status) VALUES
  ('LzxDDY1...', 'dompet-dhuafa-yogya', 'Dompet Dhuafa Yogya', 'BAZNAS-LAZ-DIY-04', 'DI Yogyakarta', 'PROVINCIAL', 'ACTIVE'),
  ('LzxRZN1...', 'rumah-zakat', 'Rumah Zakat', 'BAZNAS-LAZ-NAT-12', 'Indonesia', 'NATIONAL', 'ACTIVE'),
  ('LzxIZI1...', 'izi-indonesia', 'Inisiatif Zakat Indonesia', 'BAZNAS-LAZ-NAT-08', 'Indonesia', 'NATIONAL', 'ACTIVE'),
  ('LzxBAY1...', 'baznas-yogya', 'BAZNAS Yogyakarta', 'BAZNAS-DIY-01', 'DI Yogyakarta', 'PROVINCIAL', 'ACTIVE'),
  ('LzxUGM1...', 'laz-ugm', 'LAZ UGM Yogyakarta', 'BAZNAS-LAZ-DIY-08', 'DI Yogyakarta', 'PROVINCIAL', 'ACTIVE');

-- Mock mustahik (10 per LAZ = 50 total)
-- See `scripts/seed-mustahik.ts` in repo
```

---

## 10. Type Generation

After migrations applied, generate TypeScript types:

```bash
# Install Supabase CLI
npm i -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref YOUR_PROJECT_REF

# Generate types
supabase gen types typescript --linked --schema public > lib/supabase/types.ts
```

This generates:

```typescript
// lib/supabase/types.ts (auto-generated, do not edit)
export interface Database {
  public: {
    Tables: {
      laz: { Row: { /* ... */ }, Insert: { /* ... */ }, Update: { /* ... */ } };
      mustahik: { /* ... */ };
      donations_meta: { /* ... */ };
      // etc.
    };
    Views: { feed_cache: { Row: { /* ... */ } } };
    Functions: { current_laz_id: { Args: {}, Returns: string } };
  };
}
```

Use in code:

```typescript
import type { Database } from "@/lib/supabase/types";
import { createServerClient } from "@/lib/supabase/server";

const supabase = createServerClient<Database>();

const { data: mustahik } = await supabase
  .from("mustahik")
  .select("*")
  .eq("status", "ACTIVE");
// Fully typed: mustahik is Mustahik[] | null
```

---

## Operational Notes

### Migration workflow

```bash
# Create new migration
supabase migration new add_some_field

# Apply locally
supabase db reset       # rebuilds local DB from all migrations

# Apply to remote
supabase db push
```

### RLS testing

Always test RLS policies as different users. Use Supabase dashboard → SQL Editor → "Run as user" feature.

### Audit log size management

`audit_log` will grow unbounded. Add a partitioning strategy at scale (V1.1):

```sql
-- Monthly partitioning
CREATE TABLE public.audit_log_2026_05 PARTITION OF public.audit_log
  FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
```

For hackathon: ignore. Audit log <1M rows easy.

### Feed cache refresh

Schedule via pg_cron:

```sql
SELECT cron.schedule(
  'refresh_feed_cache',
  '*/30 * * * * *',                      -- every 30 seconds
  'REFRESH MATERIALIZED VIEW public.feed_cache'
);
```

Or trigger from app layer when audit_log row inserted (simpler for hackathon).

---

*End of schema spec.*
