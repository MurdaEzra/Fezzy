begin;

drop policy if exists "stores member read" on public.stores;
create policy "stores owner member or admin read"
on public.stores
for select
using (
  owner_user_id = auth.uid()
  or public.is_store_member(id)
  or public.is_platform_admin()
);

drop policy if exists "store members read" on public.store_members;
create policy "store members read"
on public.store_members
for select
using (
  user_id = auth.uid()
  or public.is_platform_admin()
  or exists (
    select 1
    from public.stores s
    where s.id = store_members.store_id
      and s.owner_user_id = auth.uid()
  )
  or public.is_store_member(store_id)
);

drop policy if exists "store members owner or admin manage" on public.store_members;
create policy "store members owner or admin manage"
on public.store_members
for all
using (
  public.is_platform_admin()
  or exists (
    select 1
    from public.stores s
    where s.id = store_members.store_id
      and s.owner_user_id = auth.uid()
  )
  or exists (
    select 1
    from public.store_members sm
    where sm.store_id = store_members.store_id
      and sm.user_id = auth.uid()
      and sm.role = 'owner'
      and sm.is_active = true
  )
)
with check (
  public.is_platform_admin()
  or exists (
    select 1
    from public.stores s
    where s.id = store_members.store_id
      and s.owner_user_id = auth.uid()
  )
  or exists (
    select 1
    from public.store_members sm
    where sm.store_id = store_members.store_id
      and sm.user_id = auth.uid()
      and sm.role = 'owner'
      and sm.is_active = true
  )
);

commit;
