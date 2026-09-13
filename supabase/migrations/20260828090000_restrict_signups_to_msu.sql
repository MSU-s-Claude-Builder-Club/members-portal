-- Restrict new signups to MSU accounts (@msu.edu).
--
-- Implements Supabase's "Before User Created" auth hook as a Postgres function
-- (per https://supabase.com/docs/guides/auth/auth-hooks/before-user-created-hook).
-- GoTrue invokes it as supabase_auth_admin before persisting a new user, for
-- every signup path — email/password AND OAuth (Google) — so the frontend's
-- `hd: 'msu.edu'` account-chooser filter is advisory while this is the actual
-- enforcement.
--
-- IMPORTANT:
--   (1) This gates ONLY new-user creation. Existing users are unaffected and
--       keep signing in regardless of their email domain.
--   (2) The migration alone does NOT activate the hook. After pushing it, it
--       must be ENABLED in Dashboard -> Authentication -> Hooks ->
--       "Before User Created" -> Postgres function ->
--       select public.hook_restrict_signups_to_msu.

create or replace function public.hook_restrict_signups_to_msu(event jsonb)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  email text;
begin
  email := lower(event->'user'->>'email');

  -- Allow only @msu.edu addresses. A missing/null email (no non-MSU identity
  -- provider issues those today) fails the check and is rejected too.
  if email like '%@msu.edu' then
    return '{}'::jsonb;
  end if;

  return jsonb_build_object(
    'error', jsonb_build_object(
      'message', 'Only MSU accounts (@msu.edu) can register.',
      'http_code', 403
    )
  );
end;
$$;

-- Permissions per the auth-hooks docs: only GoTrue (supabase_auth_admin) may
-- execute the hook; API roles must not be able to call or introspect it.
grant usage on schema public to supabase_auth_admin;

grant execute
  on function public.hook_restrict_signups_to_msu
  to supabase_auth_admin;

revoke execute
  on function public.hook_restrict_signups_to_msu
  from authenticated, anon, public;
