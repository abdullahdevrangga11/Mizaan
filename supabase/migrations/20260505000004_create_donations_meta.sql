CREATE TABLE public.donations_meta (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  donation_commitment_pda     TEXT NOT NULL UNIQUE,
  donor_wallet                TEXT NOT NULL,
  laz_id                      UUID NOT NULL REFERENCES public.laz(id),

  donor_email                 TEXT,
  donor_display_name          TEXT,
  encrypted_message           TEXT,

  donation_type               TEXT NOT NULL CHECK (donation_type IN
                                ('ZAKAT_MAL','ZAKAT_FITRAH','SEDEKAH','INFAQ')),
  amount_idrz                 BIGINT NOT NULL CHECK (amount_idrz > 0),
  category_preference         TEXT[],

  token_transfer_signature    TEXT NOT NULL,
  block_height                BIGINT,

  status                      TEXT NOT NULL DEFAULT 'PENDING_DISTRIBUTION'
                                CHECK (status IN
                                  ('PENDING_DISTRIBUTION','PARTIALLY_DISTRIBUTED',
                                   'FULLY_DISTRIBUTED','FULLY_CONFIRMED')),

  total_distributed_idrz      BIGINT NOT NULL DEFAULT 0,
  distribution_count          INTEGER NOT NULL DEFAULT 0,
  confirmation_count          INTEGER NOT NULL DEFAULT 0,

  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fully_distributed_at        TIMESTAMPTZ,
  fully_confirmed_at          TIMESTAMPTZ
);
