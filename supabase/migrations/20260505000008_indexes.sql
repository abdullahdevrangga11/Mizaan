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
