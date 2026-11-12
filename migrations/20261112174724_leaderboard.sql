CREATE TABLE public.leaderboard_runs (
  id uuid PRIMARY KEY,
  name text NOT NULL CHECK(char_length(name) BETWEEN 2 AND 24),
  elapsed_ms integer NOT NULL CHECK(elapsed_ms BETWEEN 1 AND 180000),
  ruleset text NOT NULL DEFAULT 'team-keys-v1' CHECK(ruleset='team-keys-v1'),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX leaderboard_fastest ON public.leaderboard_runs(elapsed_ms,created_at,id);
CREATE TABLE public.leaderboard_limits (
  bucket text PRIMARY KEY, hits integer NOT NULL, expires_at timestamptz NOT NULL
);
CREATE TABLE public.leaderboard_settings (
  singleton boolean PRIMARY KEY DEFAULT true CHECK(singleton),
  enabled boolean NOT NULL DEFAULT true
);
INSERT INTO public.leaderboard_settings VALUES(true,true);
ALTER TABLE public.leaderboard_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.leaderboard_runs,public.leaderboard_limits,public.leaderboard_settings FROM PUBLIC,anon,authenticated;

CREATE FUNCTION public.leaderboard_read(p_run uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SET search_path=public,pg_temp AS $$
DECLARE entries jsonb; position bigint; own public.leaderboard_runs;
BEGIN
  SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'name',name,'elapsedMs',elapsed_ms,'rank',rank) ORDER BY rank),'[]'::jsonb)
    INTO entries FROM (
      SELECT id,name,elapsed_ms,row_number() OVER(ORDER BY elapsed_ms,created_at,id) AS rank
      FROM public.leaderboard_runs ORDER BY elapsed_ms,created_at,id LIMIT 20
    ) fastest;
  SELECT * INTO own FROM public.leaderboard_runs WHERE id=p_run;
  IF FOUND THEN
    SELECT count(*)+1 INTO position FROM public.leaderboard_runs
      WHERE (elapsed_ms,created_at,id)<(own.elapsed_ms,own.created_at,own.id);
  END IF;
  RETURN jsonb_build_object('entries',entries,'rank',position,'ruleset','team-keys-v1');
END $$;

CREATE FUNCTION public.leaderboard_submit(p_id uuid,p_name text,p_elapsed integer)
RETURNS jsonb LANGUAGE plpgsql SET search_path=public,pg_temp AS $$
DECLARE previous public.leaderboard_runs; k text; n integer; t timestamptz:=now();
BEGIN
  PERFORM pg_advisory_xact_lock(5715580,2);
  IF NOT coalesce((SELECT enabled FROM public.leaderboard_settings WHERE singleton=true),false) THEN
    RETURN jsonb_build_object('status',503);
  END IF;
  IF char_length(p_name) NOT BETWEEN 2 AND 24 OR p_elapsed NOT BETWEEN 1 AND 180000 THEN
    RETURN jsonb_build_object('status',400);
  END IF;
  SELECT * INTO previous FROM public.leaderboard_runs WHERE id=p_id;
  IF FOUND THEN
    IF previous.name<>p_name OR previous.elapsed_ms<>p_elapsed THEN RETURN jsonb_build_object('status',409); END IF;
    RETURN public.leaderboard_read(p_id)||jsonb_build_object('status',200,'runId',p_id);
  END IF;
  DELETE FROM public.leaderboard_limits WHERE expires_at<t;
  k:='window:'||floor(extract(epoch FROM t)/600)::text;
  SELECT hits INTO n FROM public.leaderboard_limits WHERE bucket=k;
  IF coalesce(n,0)>=20 THEN RETURN jsonb_build_object('status',429,'retryAfter',600); END IF;
  k:='day:'||to_char(t AT TIME ZONE 'UTC','YYYY-MM-DD');
  SELECT hits INTO n FROM public.leaderboard_limits WHERE bucket=k;
  IF coalesce(n,0)>=1000 THEN RETURN jsonb_build_object('status',429,'retryAfter',86400); END IF;
  INSERT INTO public.leaderboard_runs(id,name,elapsed_ms) VALUES(p_id,p_name,p_elapsed);
  INSERT INTO public.leaderboard_limits VALUES(k,1,t+interval '24 hours')
    ON CONFLICT(bucket) DO UPDATE SET hits=leaderboard_limits.hits+1;
  k:='window:'||floor(extract(epoch FROM t)/600)::text;
  INSERT INTO public.leaderboard_limits VALUES(k,1,t+interval '24 hours')
    ON CONFLICT(bucket) DO UPDATE SET hits=leaderboard_limits.hits+1;
  RETURN public.leaderboard_read(p_id)||jsonb_build_object('status',201,'runId',p_id);
END $$;
REVOKE ALL ON FUNCTION public.leaderboard_read(uuid) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.leaderboard_submit(uuid,text,integer) FROM PUBLIC,anon,authenticated;
