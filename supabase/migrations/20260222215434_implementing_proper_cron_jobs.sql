-- ============================================================================
-- VAULT-BASED CRON SETUP
-- Replaces all previous cron migrations that used hardcoded URLs or
-- app.settings.* (which was never actually set and caused silent failures).
--
-- HOW VAULT WORKS HERE
-- Vault stores secrets encrypted at rest in your Supabase project.
-- pg_cron reads them at execution time via vault.decrypted_secrets.
-- Nothing sensitive is ever committed to git — only the secret *names*.
--
-- FIRST-TIME SETUP (run once after deploying this migration)
-- ─────────────────────────────────────────────────────────
-- Copy these two SQL statements into Dashboard → SQL Editor and fill in
-- your real values. DO NOT put real values in this file.
--
--   SELECT vault.create_secret(
--     '<YOUR_SUPABASE_PROJECT_URL>',          -- e.g. https://abcxyz.supabase.co
--     'supabase_project_url',
--     'Supabase project URL for pg_cron → edge function calls'
--   );
--
--   SELECT vault.create_secret(
--     '<YOUR_SERVICE_ROLE_KEY>',              -- Dashboard → Settings → API
--     'supabase_service_role_key',
--     'Service role key for pg_cron → edge function auth'
--   );
--
-- Verify (shows names, never values):
--   SELECT name, description FROM vault.secrets
--   WHERE name IN ('supabase_project_url', 'supabase_service_role_key');
--
-- If you need to update a value later:
--   SELECT vault.update_secret(id, '<NEW_VALUE>')
--   FROM vault.secrets WHERE name = 'supabase_project_url';
-- ============================================================================

-- ============================================================================
-- STEP 1: Extensions
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS supabase_vault;

-- ============================================================================
-- STEP 2: Internal helper schema + functions
-- These are the only place vault is read — cron jobs call these, not vault directly.
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS internal;

-- Returns the full edge function URL for a given function name.
-- e.g. internal.edge_fn_url('process-start-automation')
--   → 'https://abcxyz.supabase.co/functions/v1/process-start-automation'
CREATE OR REPLACE FUNCTION internal.edge_fn_url(fn_name TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_project_url')
    || '/functions/v1/'
    || fn_name
$$;

-- Returns 'Bearer <service_role_key>' ready to use as an Authorization header.
CREATE OR REPLACE FUNCTION internal.service_role_bearer()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 'Bearer ' ||
    (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_service_role_key')
$$;

-- Restrict vault-reading functions to postgres only (pg_cron runs as postgres)
REVOKE ALL ON FUNCTION internal.edge_fn_url(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION internal.service_role_bearer() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION internal.edge_fn_url(TEXT) TO postgres;
GRANT EXECUTE ON FUNCTION internal.service_role_bearer() TO postgres;

-- ============================================================================
-- STEP 3: Drop all old cron jobs
-- Covers every name that has been used across migration history.
-- cron.unschedule raises an error if the job doesn't exist, so we guard each.
-- ============================================================================

DO $$
DECLARE
  old_jobs TEXT[] := ARRAY[
    'process-project-automation',     -- original hardcoded URL
    'daily-start-automation-check',   -- app.settings v1 + v2
    'daily-start-automation',         -- previous vault draft
    'daily-absentee-report'           -- in case it was created manually
  ];
  job_name TEXT;
BEGIN
  FOREACH job_name IN ARRAY old_jobs LOOP
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = job_name) THEN
      PERFORM cron.unschedule(job_name);
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- STEP 4: process-start-automation — daily at 9:00 AM UTC
--
-- Checks for projects/classes whose semester is current:
--   - GitHub team creation
--   - Slack channel creation
--   - Member sync for both
-- ============================================================================

SELECT cron.schedule(
  'daily-start-automation',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url     := internal.edge_fn_url('process-start-automation'),
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', internal.service_role_bearer()
    ),
    timeout_milliseconds := 30000
  ) AS request_id;
  $$
);

-- ============================================================================
-- STEP 5: post-event-absentees — daily at 9:00 AM UTC
--
-- Processes all events from yesterday (UTC midnight-to-midnight window).
-- Called with no body → edge function enters batch mode automatically.
--
-- For RSVP events:  RSVPed but no attended_at → posted as absent
-- For open events:  all eligible-role users minus attended → posted as absent
--
-- Posts a Slack report to #admin-board (or SLACK_ADMIN_CHANNEL_NAME secret).
-- Board can also trigger this manually for a specific event from the portal.
-- ============================================================================

SELECT cron.schedule(
  'daily-absentee-report',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url     := internal.edge_fn_url('post-event-absentees'),
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', internal.service_role_bearer()
    ),
    timeout_milliseconds := 30000
  ) AS request_id;
  $$
);

-- ============================================================================
-- VERIFY
-- ============================================================================

SELECT jobid, jobname, schedule, active
FROM cron.job
ORDER BY jobname;