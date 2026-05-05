CREATE TABLE public.laz_admins (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  laz_id        UUID NOT NULL REFERENCES public.laz(id) ON DELETE CASCADE,

  role          TEXT NOT NULL DEFAULT 'AMIL'
                  CHECK (role IN ('AMIL','HEAD_AMIL','OBSERVER')),
  display_name  TEXT,

  invited_by    UUID REFERENCES auth.users(id),
  invited_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  joined_at     TIMESTAMPTZ,

  UNIQUE (user_id, laz_id)
);
