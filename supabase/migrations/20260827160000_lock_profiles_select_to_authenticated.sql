-- Lock the member directory: profiles were readable (incl. emails) by anon.
-- Landing page makes no DB calls, so anon needs no profile access at all.
do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and cmd = 'SELECT'
  loop
    execute format('drop policy %I on public.profiles', p.policyname);
  end loop;
end $$;

create policy "profiles_select_authenticated"
  on public.profiles
  for select
  to authenticated
  using (true);
