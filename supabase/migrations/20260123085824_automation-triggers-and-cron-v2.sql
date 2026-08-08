-- v2 automation + cron setup
-- This migration replaces the previous trigger/cron wiring to:
-- - point to the new process-application-update edge function
-- - standardize on app.settings.supabase_url + app.settings.supabase_service_role_key

-- 1) Ensure pg_net extension (for net.http_post used by cron).
-- pg_net creates and owns its own `net` schema. Passing WITH SCHEMA net (or
-- pre-creating that schema) makes the install collide on a fresh Supabase
-- project, so install it plainly and let it place its objects in `net`.
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2) (Re)create daily cron job for start-automation, using standardized settings
SELECT cron.schedule(
  'daily-start-automation-check',
  '0 9 * * *',
  $$
  SELECT
    net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/process-start-automation',
      headers := jsonb_build_object(
        'Authorization',
        'Bearer ' || current_setting('app.settings.supabase_service_role_key')
      )
    ) AS request_id;
  $$
);

-- 3) Indexes for performance (idempotent)
CREATE INDEX IF NOT EXISTS idx_projects_start_date ON projects(semester_id);
CREATE INDEX IF NOT EXISTS idx_classes_start_date ON classes(semester_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
