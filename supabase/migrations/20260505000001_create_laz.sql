CREATE TABLE public.laz (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  wallet_address       TEXT NOT NULL UNIQUE,
  identity_pda         TEXT,

  slug                 TEXT NOT NULL UNIQUE,
  name                 TEXT NOT NULL,
  registration_number  TEXT NOT NULL,

  region               TEXT NOT NULL,
  jurisdiction_level   TEXT NOT NULL CHECK (jurisdiction_level IN
                         ('NATIONAL','PROVINCIAL','REGENCY','MOSQUE')),

  website_url          TEXT,
  contact_email        TEXT,
  logo_url             TEXT,

  status               TEXT NOT NULL DEFAULT 'ACTIVE'
                         CHECK (status IN ('ACTIVE','PAUSED','SUSPENDED')),

  total_received_idrz    BIGINT NOT NULL DEFAULT 0,
  total_distributed_idrz BIGINT NOT NULL DEFAULT 0,
  mustahik_count         INTEGER NOT NULL DEFAULT 0,
  donor_count            INTEGER NOT NULL DEFAULT 0,

  registered_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
