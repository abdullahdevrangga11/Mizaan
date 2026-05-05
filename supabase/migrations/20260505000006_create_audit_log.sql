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

  actor_user_id       UUID REFERENCES auth.users(id),
  actor_wallet        TEXT,
  actor_role          TEXT,

  laz_id              UUID REFERENCES public.laz(id),
  mustahik_id         UUID REFERENCES public.mustahik(id),
  donation_pda        TEXT,
  distribution_pda    TEXT,
  receipt_pda         TEXT,

  amount_idrz         BIGINT,
  category            TEXT,
  region              TEXT,
  mustahik_initials   TEXT,
  laz_slug            TEXT,
  purpose_short       TEXT,

  metadata            JSONB,

  occurred_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
