CREATE TABLE public.mustahik (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  laz_id          UUID NOT NULL REFERENCES public.laz(id) ON DELETE CASCADE,

  wallet_address  TEXT NOT NULL UNIQUE,
  identity_pda    TEXT,
  internal_id     TEXT NOT NULL,
  internal_id_hash TEXT NOT NULL,

  full_name       TEXT NOT NULL,
  phone           TEXT,
  email           TEXT,

  initials        TEXT NOT NULL,
  asnaf_category  TEXT NOT NULL CHECK (asnaf_category IN
                    ('FAKIR','MISKIN','AMIL','MUALLAF',
                     'RIQAB','GHARIMIN','FISABILILLAH','IBNU_SABIL')),
  region          TEXT NOT NULL,
  age_range       TEXT NOT NULL CHECK (age_range IN
                    ('CHILD','TEEN','ADULT','ELDER')),

  status          TEXT NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE','GRADUATED','INACTIVE')),

  registered_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  registered_by   UUID REFERENCES auth.users(id),
  last_updated    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (laz_id, internal_id)
);
