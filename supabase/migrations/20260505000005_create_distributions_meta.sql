CREATE TABLE public.distributions_meta (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  distribution_decision_pda       TEXT NOT NULL UNIQUE,
  donation_commitment_pda         TEXT NOT NULL REFERENCES public.donations_meta(donation_commitment_pda),
  laz_id                          UUID NOT NULL REFERENCES public.laz(id),
  mustahik_id                     UUID NOT NULL REFERENCES public.mustahik(id),
  amil_user_id                    UUID NOT NULL REFERENCES auth.users(id),

  amount_idrz                     BIGINT NOT NULL CHECK (amount_idrz > 0),
  category                        TEXT NOT NULL,
  asnaf                           TEXT NOT NULL,
  purpose_description             TEXT NOT NULL,
  internal_notes                  TEXT,

  token_transfer_signature        TEXT NOT NULL,
  block_height                    BIGINT,

  receipt_pda                     TEXT,
  receipt_confirmed_at            TIMESTAMPTZ,
  thank_you_message_encrypted     TEXT,

  magic_link_sent_at              TIMESTAMPTZ,
  magic_link_clicked_at           TIMESTAMPTZ,

  created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
