-- Enable Realtime on audit_log so the live feed receives INSERT events.
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_log;
