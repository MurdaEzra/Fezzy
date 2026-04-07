begin;

create or replace function public.is_store_member(target_store_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.store_members sm
    where sm.store_id = target_store_id
      and sm.user_id = auth.uid()
      and sm.is_active = true
  );
$$;

create or replace function public.is_store_owner(target_store_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.stores s
    where s.id = target_store_id
      and s.owner_user_id = auth.uid()
  );
$$;

create or replace function public.is_store_owner_member(target_store_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.store_members sm
    where sm.store_id = target_store_id
      and sm.user_id = auth.uid()
      and sm.role = 'owner'
      and sm.is_active = true
  );
$$;

drop policy if exists "store members read" on public.store_members;
create policy "store members read"
on public.store_members
for select
using (
  user_id = auth.uid()
  or public.is_platform_admin()
  or public.is_store_owner(store_id)
  or public.is_store_member(store_id)
);

drop policy if exists "store members owner or admin manage" on public.store_members;
create policy "store members owner or admin manage"
on public.store_members
for all
using (
  public.is_platform_admin()
  or public.is_store_owner(store_id)
  or public.is_store_owner_member(store_id)
)
with check (
  public.is_platform_admin()
  or public.is_store_owner(store_id)
  or public.is_store_owner_member(store_id)
);

commit;
