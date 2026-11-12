ALTER TABLE public.feedback_submissions ADD COLUMN last_checked_at timestamptz;
CREATE FUNCTION public.feedback_maintenance()
RETURNS jsonb LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
DECLARE result jsonb;
BEGIN
  DELETE FROM public.feedback_limits WHERE expires_at < now();
  DELETE FROM public.feedback_submissions WHERE created_at < now() - interval '7 days';
  WITH candidates AS (
    SELECT id FROM public.feedback_submissions WHERE state='uncertain'
    ORDER BY last_checked_at NULLS FIRST, created_at LIMIT 20 FOR UPDATE SKIP LOCKED
  ), checked AS (
    UPDATE public.feedback_submissions s SET last_checked_at=now()
    FROM candidates c WHERE s.id=c.id RETURNING s.id,s.created_at
  )
  SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'createdAt',created_at)), '[]'::jsonb)
    INTO result FROM checked;
  RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.feedback_maintenance() FROM PUBLIC, anon, authenticated;
