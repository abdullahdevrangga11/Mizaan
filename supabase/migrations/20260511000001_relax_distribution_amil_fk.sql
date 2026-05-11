-- Relax the amil_user_id FK for hackathon scope.
-- Real builds will tie distributions to a Supabase auth.users session,
-- but the demo flow doesn't have LAZ admin auth wired up yet.
-- Drop the FK + NOT NULL so server-side API calls can create distributions
-- without first creating an auth user.

ALTER TABLE public.distributions_meta
  DROP CONSTRAINT IF EXISTS distributions_meta_amil_user_id_fkey;

ALTER TABLE public.distributions_meta
  ALTER COLUMN amil_user_id DROP NOT NULL;
