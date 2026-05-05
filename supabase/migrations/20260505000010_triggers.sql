-- 5.1 touch updated_at / last_updated
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER laz_touch_updated_at
  BEFORE UPDATE ON public.laz
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.touch_last_updated()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER mustahik_touch_last_updated
  BEFORE UPDATE ON public.mustahik
  FOR EACH ROW EXECUTE FUNCTION public.touch_last_updated();

-- 5.2 refresh donation aggregates from distributions
CREATE OR REPLACE FUNCTION public.refresh_donation_aggregates()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.donations_meta
  SET
    total_distributed_idrz = (
      SELECT COALESCE(SUM(amount_idrz), 0)
      FROM public.distributions_meta
      WHERE donation_commitment_pda = NEW.donation_commitment_pda
    ),
    distribution_count = (
      SELECT COUNT(*)
      FROM public.distributions_meta
      WHERE donation_commitment_pda = NEW.donation_commitment_pda
    ),
    confirmation_count = (
      SELECT COUNT(*)
      FROM public.distributions_meta
      WHERE donation_commitment_pda = NEW.donation_commitment_pda
        AND receipt_pda IS NOT NULL
    )
  WHERE donation_commitment_pda = NEW.donation_commitment_pda;
  RETURN NEW;
END;
$$;

CREATE TRIGGER distributions_refresh_donation_aggregates
  AFTER INSERT OR UPDATE OR DELETE ON public.distributions_meta
  FOR EACH ROW EXECUTE FUNCTION public.refresh_donation_aggregates();

-- 5.3 audit log on distribution created
CREATE OR REPLACE FUNCTION public.log_distribution_created()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.audit_log (
    event_type, actor_user_id, actor_role,
    laz_id, mustahik_id, donation_pda, distribution_pda,
    amount_idrz, category,
    mustahik_initials, region, laz_slug, purpose_short
  )
  SELECT
    'DISTRIBUTION_CREATED', NEW.amil_user_id, 'AMIL',
    NEW.laz_id, NEW.mustahik_id, NEW.donation_commitment_pda, NEW.distribution_decision_pda,
    NEW.amount_idrz, NEW.category,
    m.initials, m.region, l.slug, LEFT(NEW.purpose_description, 60)
  FROM public.mustahik m, public.laz l
  WHERE m.id = NEW.mustahik_id AND l.id = NEW.laz_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER distributions_log_create
  AFTER INSERT ON public.distributions_meta
  FOR EACH ROW EXECUTE FUNCTION public.log_distribution_created();

-- 5.3 (cont) audit log on receipt confirmed
CREATE OR REPLACE FUNCTION public.log_receipt_confirmed()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.receipt_pda IS NULL AND NEW.receipt_pda IS NOT NULL THEN
    INSERT INTO public.audit_log (
      event_type, actor_role,
      laz_id, mustahik_id, donation_pda, distribution_pda, receipt_pda,
      amount_idrz, category,
      mustahik_initials, region, laz_slug, purpose_short
    )
    SELECT
      'RECEIPT_CONFIRMED', 'MUSTAHIK',
      NEW.laz_id, NEW.mustahik_id, NEW.donation_commitment_pda,
      NEW.distribution_decision_pda, NEW.receipt_pda,
      NEW.amount_idrz, NEW.category,
      m.initials, m.region, l.slug, LEFT(NEW.purpose_description, 60)
    FROM public.mustahik m, public.laz l
    WHERE m.id = NEW.mustahik_id AND l.id = NEW.laz_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER distributions_log_receipt_confirmed
  AFTER UPDATE ON public.distributions_meta
  FOR EACH ROW EXECUTE FUNCTION public.log_receipt_confirmed();
