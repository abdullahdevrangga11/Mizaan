-- 1. laz-logos (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('laz-logos', 'laz-logos', true)
ON CONFLICT (id) DO NOTHING;

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

-- 2. audit-pdfs (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('audit-pdfs', 'audit-pdfs', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "laz_admin_reads_own_audit_pdfs"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'audit-pdfs'
    AND (storage.foldername(name))[1] = (
      SELECT id::TEXT FROM public.laz
      WHERE id = public.current_laz_id()
    )
  );
