-- One-off cleanup: remove the seed `demo.eboard@msu.edu` admin account.
--
-- A plaintext password for this account leaked in an earlier commit (since
-- scrubbed from history); deleting the account neutralizes that credential.
-- Direct deletion is blocked because the account authored club content whose
-- author foreign keys are NOT NULL / no-cascade (e.g. events.created_by,
-- classes.created_by). Rather than hardcode column names (they vary), this
-- discovers EVERY foreign key that references auth.users(id) and would block a
-- delete (NO ACTION / RESTRICT), reassigns exactly those columns to a surviving
-- admin, then deletes the account. CASCADE / SET NULL references clean up on
-- their own. Runs atomically (any error rolls back); idempotent (no-op if gone).
do $$
declare
  demo_id uuid;
  keep_id uuid;
  r record;
begin
  select id into demo_id from auth.users where lower(email) = 'demo.eboard@msu.edu';
  if demo_id is null then
    raise notice 'demo.eboard@msu.edu not present — nothing to do';
    return;
  end if;

  select ur.user_id into keep_id
  from public.user_roles ur
  where ur.role = 'admin' and ur.user_id <> demo_id
  order by ur.created_at asc
  limit 1;

  if keep_id is null then
    raise exception 'no surviving admin to reassign content to — aborting delete of demo.eboard';
  end if;

  -- Reassign every single-column FK to auth.users(id) whose ON DELETE action
  -- would block the delete (a = NO ACTION, r = RESTRICT).
  for r in
    select n.nspname as sch, c.relname as tbl, a.attname as col
    from pg_constraint con
    join pg_class     c  on c.oid  = con.conrelid
    join pg_namespace n  on n.oid  = c.relnamespace
    join pg_class     fc on fc.oid = con.confrelid
    join pg_namespace fn on fn.oid = fc.relnamespace
    join pg_attribute a  on a.attrelid = con.conrelid and a.attnum = con.conkey[1]
    where con.contype = 'f'
      and fn.nspname = 'auth'
      and fc.relname = 'users'
      and con.confdeltype in ('a', 'r')
      and array_length(con.conkey, 1) = 1
  loop
    execute format('update %I.%I set %I = $1 where %I = $2', r.sch, r.tbl, r.col, r.col)
      using keep_id, demo_id;
  end loop;

  -- Cascade / set-null references (profiles, user_roles, memberships) resolve here.
  delete from auth.users where id = demo_id;

  raise notice 'demo.eboard@msu.edu removed; blocking references reassigned to admin %', keep_id;
end $$;
