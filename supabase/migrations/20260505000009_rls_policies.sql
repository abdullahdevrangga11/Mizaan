-- Helper: get current admin's LAZ ID
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

-- 4.1 laz: public read, service-only write
ALTER TABLE public.laz ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_can_read_active_laz"
  ON public.laz FOR SELECT
  USING (status = 'ACTIVE');

-- 4.2 laz_admins: self read only
ALTER TABLE public.laz_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_laz_admin_record"
  ON public.laz_admins FOR SELECT
  USING (user_id = auth.uid());

-- 4.3 mustahik: LAZ-scoped
ALTER TABLE public.mustahik ENABLE ROW LEVEL SECURITY;

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

-- 4.4 donations_meta: LAZ admin read; writes via service role only
ALTER TABLE public.donations_meta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "laz_admin_reads_own_laz_donations"
  ON public.donations_meta FOR SELECT
  USING (laz_id = public.current_laz_id());

-- 4.5 distributions_meta: LAZ-scoped
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

-- 4.6 audit_log: public anonymized read, server write
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_reads_anonymized_audit_log"
  ON public.audit_log FOR SELECT
  USING (true);

-- 4.7 feed_cache: public read
ALTER MATERIALIZED VIEW public.feed_cache OWNER TO postgres;
GRANT SELECT ON public.feed_cache TO anon, authenticated;
