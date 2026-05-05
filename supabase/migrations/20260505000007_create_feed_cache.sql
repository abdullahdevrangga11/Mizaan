CREATE MATERIALIZED VIEW public.feed_cache AS
SELECT
  id,
  event_type,
  amount_idrz,
  category,
  region,
  mustahik_initials,
  laz_slug,
  purpose_short,
  occurred_at
FROM public.audit_log
WHERE event_type IN ('RECEIPT_CONFIRMED','DISTRIBUTION_CREATED','DONATION_CREATED')
ORDER BY occurred_at DESC
LIMIT 100;

CREATE UNIQUE INDEX idx_feed_cache_id ON public.feed_cache (id);
