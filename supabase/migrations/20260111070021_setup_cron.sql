-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- NOTE: The original cron job defined here pointed at a hardcoded Supabase
-- project URL and used app.settings.service_role_key (which was never set,
-- so it silently failed). It has been fully superseded by the vault-based
-- setup in 20260222215434_implementing_proper_cron_jobs.sql, which unschedules
-- this job and re-creates it correctly against secrets stored in Supabase Vault.
-- Intentionally left as a no-op so the migration history stays valid and
-- points at no external backend on a fresh `supabase db push`.