-- Make `demo.eboard@msu.edu` permanently unusable as an account.
--
-- Migration 20260828120000 deleted the account. Deletion alone does not stop it
-- coming back: a signup, an admin "Add user" in the dashboard, or an admin-API
-- call would recreate it, resurrecting a seed account whose plaintext password
-- was published in a public commit.
--
-- Two independent guards, because they cover different paths:
--
--   1. The Before-User-Created auth hook (already wired in the dashboard to
--      public.hook_restrict_signups_to_msu) covers every GoTrue signup path --
--      email/password and OAuth alike. Extended below to consult a denylist.
--   2. A trigger on auth.users covers everything that does NOT go through that
--      hook: direct SQL and dashboard/admin-API user creation. The hook can be
--      switched off in the dashboard; this trigger cannot.
--
-- The denylist is a table rather than a hardcoded literal so that blocking a
-- future address is an INSERT, not a schema change.

create table if not exists public.blocked_signup_emails (
  email      text primary key,
  reason     text not null,
  created_at timestamptz not null default now()
);

comment on table public.blocked_signup_emails is
  'Addresses that must never own an auth.users row. Enforced on signup paths by '
  'public.hook_restrict_signups_to_msu and on every other path by the auth.users '
  'trigger trg_block_denylisted_emails. Store addresses lowercased.';

-- A denylist naming a compromised account should not be enumerable through the
-- API. RLS denies the PostgREST roles by default; the hook role gets an explicit
-- read policy because it runs as supabase_auth_admin, which does not bypass RLS.
alter table public.blocked_signup_emails enable row level security;
revoke all on table public.blocked_signup_emails from anon, authenticated;
grant select on table public.blocked_signup_emails to supabase_auth_admin;

drop policy if exists "auth admin reads denylist" on public.blocked_signup_emails;
create policy "auth admin reads denylist"
  on public.blocked_signup_emails
  for select
  to supabase_auth_admin
  using (true);

insert into public.blocked_signup_emails (email, reason)
values (
  'demo.eboard@msu.edu',
  'Seed admin account; its plaintext password was published in a public commit. '
  'Deleted by migration 20260828120000 and must never be recreated.'
)
on conflict (email) do nothing;

-- Guard 1: the signup hook. Same function name so the existing dashboard wiring
-- keeps working. Note the variable is v_email, not email: with search_path = ''
-- and a column of the same name, an unqualified `email` is an ambiguous
-- reference and plpgsql would raise at runtime.
create or replace function public.hook_restrict_signups_to_msu(event jsonb)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_email text;
begin
  v_email := lower(event->'user'->>'email');

  -- Denylisted addresses are refused even when they are @msu.edu.
  if exists (
    select 1 from public.blocked_signup_emails b where b.email = v_email
  ) then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'message', 'This address cannot be registered.',
        'http_code', 403
      )
    );
  end if;

  if v_email like '%@msu.edu' then
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

-- Repeated from 20260828090000 so this migration stands on its own.
grant usage on schema public to supabase_auth_admin;
grant execute on function public.hook_restrict_signups_to_msu to supabase_auth_admin;
revoke execute on function public.hook_restrict_signups_to_msu from authenticated, anon, public;

-- Guard 2: the backstop trigger. security definer so it reads the denylist as
-- the table owner regardless of who is inserting.
create or replace function public.block_denylisted_auth_users()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is not null and exists (
    select 1 from public.blocked_signup_emails b where b.email = lower(new.email)
  ) then
    raise exception 'Address % is permanently blocked and cannot own an account', lower(new.email)
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

revoke execute on function public.block_denylisted_auth_users() from anon, authenticated, public;

drop trigger if exists trg_block_denylisted_emails on auth.users;
create trigger trg_block_denylisted_emails
  before insert or update of email on auth.users
  for each row
  execute function public.block_denylisted_auth_users();

-- The account should already be gone (20260828120000 runs earlier in this chain
-- and is idempotent). Warn loudly rather than fail the deploy if it is not.
do $$
begin
  if exists (select 1 from auth.users where lower(email) = 'demo.eboard@msu.edu') then
    raise warning 'demo.eboard@msu.edu STILL EXISTS - re-run migration 20260828120000 to remove it; creation is now blocked but the existing row remains';
  else
    raise notice 'demo.eboard@msu.edu absent and now permanently blocked';
  end if;
end $$;
