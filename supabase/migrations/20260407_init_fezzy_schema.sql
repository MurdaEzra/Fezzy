begin;

create extension if not exists pgcrypto;

create type public.global_role as enum ('merchant', 'admin', 'root-admin');
create type public.user_status as enum ('active', 'invited', 'suspended');
create type public.store_status as enum ('draft', 'live', 'suspended');
create type public.verification_status as enum ('pending', 'verified', 'rejected');
create type public.store_member_role as enum ('owner', 'manager', 'staff', 'admin-viewer');
create type public.subscription_status as enum ('trialing', 'active', 'past_due', 'canceled');
create type public.domain_type as enum ('subdomain', 'custom');
create type public.domain_verification_status as enum ('pending', 'verified', 'failed');
create type public.product_status as enum ('draft', 'active', 'archived', 'out_of_stock');
create type public.inventory_change_type as enum ('manual', 'sale', 'return', 'restock', 'adjustment');
create type public.order_status as enum ('pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded');
create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');
create type public.fulfillment_status as enum ('unfulfilled', 'processing', 'shipped', 'delivered');
create type public.payment_method as enum ('mpesa', 'card', 'bank_transfer', 'cash');
create type public.support_priority as enum ('low', 'medium', 'high', 'critical');
create type public.support_status as enum ('open', 'in_progress', 'resolved', 'closed');
create type public.review_type as enum ('kyc', 'risk', 'domain', 'payout', 'plan_override');
create type public.review_status as enum ('pending', 'approved', 'rejected');
create type public.payout_status as enum ('pending', 'reviewing', 'held', 'released', 'paid');
create type public.asset_type as enum ('logo', 'hero', 'gallery', 'about', 'product');
create type public.page_type as enum ('home', 'shop', 'about', 'contact', 'custom');
create type public.account_type as enum ('bank', 'mobile_money');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.is_root_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and global_role = 'root-admin'
      and status = 'active'
  );
$$;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and global_role in ('admin', 'root-admin')
      and status = 'active'
  );
$$;

create or replace function public.is_store_member(target_store_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.store_members sm
    where sm.store_id = target_store_id
      and sm.user_id = auth.uid()
      and sm.is_active = true
  );
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  phone text,
  avatar_url text,
  global_role public.global_role not null default 'merchant',
  status public.user_status not null default 'active',
  last_login_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text not null unique,
  price_monthly numeric(12,2) not null default 0,
  price_yearly numeric(12,2) not null default 0,
  product_limit integer,
  custom_domain_enabled boolean not null default false,
  analytics_enabled boolean not null default false,
  staff_limit integer,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles(id) on delete restrict,
  plan_id uuid references public.plans(id) on delete set null,
  name text not null,
  slug text not null unique,
  subdomain text not null unique,
  description text,
  contact_email text,
  contact_phone text,
  business_address text,
  country text default 'Kenya',
  currency_code text not null default 'KES',
  status public.store_status not null default 'draft',
  verification_status public.verification_status not null default 'pending',
  logo_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.store_members (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.store_member_role not null default 'staff',
  is_active boolean not null default true,
  invited_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (store_id, user_id)
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete restrict,
  provider text,
  provider_subscription_id text unique,
  status public.subscription_status not null default 'trialing',
  starts_at timestamptz,
  ends_at timestamptz,
  trial_ends_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.domains (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  domain text not null unique,
  type public.domain_type not null default 'custom',
  verification_status public.domain_verification_status not null default 'pending',
  dns_target text,
  ssl_status text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  parent_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (store_id, slug)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null,
  sku text,
  description text,
  price numeric(12,2) not null default 0,
  compare_at_price numeric(12,2),
  cost_price numeric(12,2),
  currency_code text not null default 'KES',
  stock_quantity integer not null default 0,
  low_stock_threshold integer not null default 0,
  status public.product_status not null default 'draft',
  featured boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (store_id, slug),
  unique (store_id, sku)
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  public_url text,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  change_type public.inventory_change_type not null,
  quantity_delta integer not null,
  note text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  label text,
  line1 text not null,
  line2 text,
  city text,
  region text,
  country text,
  postal_code text,
  is_default boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  shipping_address_id uuid references public.customer_addresses(id) on delete set null,
  order_number text not null unique,
  status public.order_status not null default 'pending',
  payment_status public.payment_status not null default 'pending',
  fulfillment_status public.fulfillment_status not null default 'unfulfilled',
  payment_method public.payment_method,
  subtotal numeric(12,2) not null default 0,
  shipping_amount numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  currency_code text not null default 'KES',
  notes text,
  placed_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  sku text,
  unit_price numeric(12,2) not null default 0,
  quantity integer not null check (quantity > 0),
  line_total numeric(12,2) not null default 0
);

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status public.order_status not null,
  note text,
  changed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  provider text,
  provider_reference text,
  method public.payment_method,
  status public.payment_status not null default 'pending',
  amount numeric(12,2) not null default 0,
  currency_code text not null default 'KES',
  paid_at timestamptz,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.store_themes (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null unique references public.stores(id) on delete cascade,
  template_code text not null,
  font text,
  primary_color text,
  accent_color text,
  tagline text,
  settings jsonb not null default '{}'::jsonb,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.store_pages (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  page_type public.page_type not null,
  title text not null,
  slug text not null,
  description text,
  content jsonb not null default '{}'::jsonb,
  show_in_nav boolean not null default true,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (store_id, slug)
);

create table public.store_assets (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  asset_type public.asset_type not null,
  related_id uuid,
  storage_path text not null,
  public_url text,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.store_payment_settings (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null unique references public.stores(id) on delete cascade,
  mpesa_shortcode text,
  mpesa_passkey text,
  mpesa_environment text,
  bank_name text,
  bank_account_name text,
  bank_account_number text,
  bank_branch text,
  card_payments_enabled boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.store_payout_accounts (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  account_type public.account_type not null,
  provider text,
  account_name text not null,
  account_number text not null,
  is_default boolean not null default false,
  is_verified boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references public.stores(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  assigned_to uuid references public.profiles(id) on delete set null,
  subject text not null,
  description text,
  priority public.support_priority not null default 'medium',
  status public.support_status not null default 'open',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.store_reviews (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  review_type public.review_type not null,
  status public.review_status not null default 'pending',
  reason text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  reviewed_at timestamptz
);

create table public.payouts (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  amount numeric(12,2) not null default 0,
  currency_code text not null default 'KES',
  status public.payout_status not null default 'pending',
  period_start date,
  period_end date,
  released_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles(id) on delete set null,
  store_id uuid references public.stores(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index idx_profiles_role on public.profiles(global_role);
create index idx_profiles_status on public.profiles(status);
create index idx_stores_owner_user_id on public.stores(owner_user_id);
create index idx_stores_plan_id on public.stores(plan_id);
create index idx_stores_status on public.stores(status);
create index idx_store_members_user_id on public.store_members(user_id);
create index idx_store_members_store_id on public.store_members(store_id);
create index idx_subscriptions_store_id on public.subscriptions(store_id);
create index idx_domains_store_id on public.domains(store_id);
create index idx_categories_store_id on public.categories(store_id);
create index idx_products_store_id on public.products(store_id);
create index idx_products_category_id on public.products(category_id);
create index idx_products_status on public.products(status);
create index idx_product_images_product_id on public.product_images(product_id);
create index idx_inventory_movements_product_id on public.inventory_movements(product_id);
create index idx_inventory_movements_store_id on public.inventory_movements(store_id);
create index idx_customers_store_id on public.customers(store_id);
create index idx_orders_store_id on public.orders(store_id);
create index idx_orders_customer_id on public.orders(customer_id);
create index idx_orders_status on public.orders(status);
create index idx_order_items_order_id on public.order_items(order_id);
create index idx_payments_order_id on public.payments(order_id);
create index idx_store_pages_store_id on public.store_pages(store_id);
create index idx_store_assets_store_id on public.store_assets(store_id);
create index idx_support_tickets_store_id on public.support_tickets(store_id);
create index idx_support_tickets_assigned_to on public.support_tickets(assigned_to);
create index idx_store_reviews_store_id on public.store_reviews(store_id);
create index idx_payouts_store_id on public.payouts(store_id);
create index idx_audit_logs_store_id on public.audit_logs(store_id);
create index idx_audit_logs_actor_user_id on public.audit_logs(actor_user_id);

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_plans_updated_at
before update on public.plans
for each row execute function public.set_updated_at();

create trigger set_stores_updated_at
before update on public.stores
for each row execute function public.set_updated_at();

create trigger set_store_members_updated_at
before update on public.store_members
for each row execute function public.set_updated_at();

create trigger set_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

create trigger set_domains_updated_at
before update on public.domains
for each row execute function public.set_updated_at();

create trigger set_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger set_customers_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

create trigger set_customer_addresses_updated_at
before update on public.customer_addresses
for each row execute function public.set_updated_at();

create trigger set_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create trigger set_payments_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

create trigger set_store_themes_updated_at
before update on public.store_themes
for each row execute function public.set_updated_at();

create trigger set_store_pages_updated_at
before update on public.store_pages
for each row execute function public.set_updated_at();

create trigger set_store_assets_updated_at
before update on public.store_assets
for each row execute function public.set_updated_at();

create trigger set_store_payment_settings_updated_at
before update on public.store_payment_settings
for each row execute function public.set_updated_at();

create trigger set_store_payout_accounts_updated_at
before update on public.store_payout_accounts
for each row execute function public.set_updated_at();

create trigger set_support_tickets_updated_at
before update on public.support_tickets
for each row execute function public.set_updated_at();

create trigger set_payouts_updated_at
before update on public.payouts
for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  metadata jsonb;
begin
  metadata := coalesce(new.raw_user_meta_data, '{}'::jsonb);

  insert into public.profiles (
    id,
    email,
    full_name,
    phone,
    avatar_url,
    global_role
  )
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(metadata ->> 'full_name', ''),
    nullif(metadata ->> 'phone', ''),
    nullif(metadata ->> 'avatar_url', ''),
    coalesce((metadata ->> 'role')::public.global_role, 'merchant')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        phone = coalesce(excluded.phone, public.profiles.phone),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
        global_role = coalesce(excluded.global_role, public.profiles.global_role),
        updated_at = timezone('utc', now());

  return new;
exception
  when invalid_text_representation then
    insert into public.profiles (id, email, full_name, phone, avatar_url, global_role)
    values (
      new.id,
      coalesce(new.email, ''),
      nullif(metadata ->> 'full_name', ''),
      nullif(metadata ->> 'phone', ''),
      nullif(metadata ->> 'avatar_url', ''),
      'merchant'
    )
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_auth_user();

insert into public.plans (
  name,
  code,
  price_monthly,
  price_yearly,
  product_limit,
  custom_domain_enabled,
  analytics_enabled,
  staff_limit
)
values
  ('Starter', 'starter', 0, 0, 50, false, false, 1),
  ('Growth', 'growth', 2500, 25000, 500, true, true, 5),
  ('Scale', 'scale', 7500, 75000, 5000, true, true, 25)
on conflict (code) do nothing;

alter table public.profiles enable row level security;
alter table public.stores enable row level security;
alter table public.store_members enable row level security;
alter table public.subscriptions enable row level security;
alter table public.domains enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.customers enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.payments enable row level security;
alter table public.store_themes enable row level security;
alter table public.store_pages enable row level security;
alter table public.store_assets enable row level security;
alter table public.store_payment_settings enable row level security;
alter table public.store_payout_accounts enable row level security;
alter table public.support_tickets enable row level security;
alter table public.store_reviews enable row level security;
alter table public.payouts enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles self or admin read"
on public.profiles
for select
using (id = auth.uid() or public.is_platform_admin());

create policy "profiles self update"
on public.profiles
for update
using (id = auth.uid() or public.is_platform_admin())
with check (id = auth.uid() or public.is_platform_admin());

create policy "profiles insert self"
on public.profiles
for insert
with check (id = auth.uid() or public.is_platform_admin());

create policy "stores member read"
on public.stores
for select
using (public.is_store_member(id) or public.is_platform_admin());

create policy "stores owner insert"
on public.stores
for insert
with check (owner_user_id = auth.uid() or public.is_platform_admin());

create policy "stores owner or admin update"
on public.stores
for update
using (owner_user_id = auth.uid() or public.is_platform_admin())
with check (owner_user_id = auth.uid() or public.is_platform_admin());

create policy "store members read"
on public.store_members
for select
using (user_id = auth.uid() or public.is_store_member(store_id) or public.is_platform_admin());

create policy "store members owner or admin manage"
on public.store_members
for all
using (
  public.is_platform_admin()
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
    from public.store_members sm
    where sm.store_id = store_members.store_id
      and sm.user_id = auth.uid()
      and sm.role = 'owner'
      and sm.is_active = true
  )
);

create policy "member or admin read subscriptions"
on public.subscriptions
for select
using (public.is_store_member(store_id) or public.is_platform_admin());

create policy "member or admin read domains"
on public.domains
for select
using (public.is_store_member(store_id) or public.is_platform_admin());

create policy "owner or admin manage domains"
on public.domains
for all
using (public.is_store_member(store_id) or public.is_platform_admin())
with check (public.is_store_member(store_id) or public.is_platform_admin());

create policy "member or admin read categories"
on public.categories
for select
using (public.is_store_member(store_id) or public.is_platform_admin());

create policy "member or admin manage categories"
on public.categories
for all
using (public.is_store_member(store_id) or public.is_platform_admin())
with check (public.is_store_member(store_id) or public.is_platform_admin());

create policy "member or admin read products"
on public.products
for select
using (public.is_store_member(store_id) or public.is_platform_admin());

create policy "member or admin manage products"
on public.products
for all
using (public.is_store_member(store_id) or public.is_platform_admin())
with check (public.is_store_member(store_id) or public.is_platform_admin());

create policy "product images via product membership read"
on public.product_images
for select
using (
  exists (
    select 1
    from public.products p
    where p.id = product_images.product_id
      and (public.is_store_member(p.store_id) or public.is_platform_admin())
  )
);

create policy "product images via product membership manage"
on public.product_images
for all
using (
  exists (
    select 1
    from public.products p
    where p.id = product_images.product_id
      and (public.is_store_member(p.store_id) or public.is_platform_admin())
  )
)
with check (
  exists (
    select 1
    from public.products p
    where p.id = product_images.product_id
      and (public.is_store_member(p.store_id) or public.is_platform_admin())
  )
);

create policy "member or admin read inventory"
on public.inventory_movements
for select
using (public.is_store_member(store_id) or public.is_platform_admin());

create policy "member or admin manage inventory"
on public.inventory_movements
for insert
with check (public.is_store_member(store_id) or public.is_platform_admin());

create policy "member or admin read customers"
on public.customers
for select
using (public.is_store_member(store_id) or public.is_platform_admin());

create policy "member or admin manage customers"
on public.customers
for all
using (public.is_store_member(store_id) or public.is_platform_admin())
with check (public.is_store_member(store_id) or public.is_platform_admin());

create policy "addresses via customer membership read"
on public.customer_addresses
for select
using (
  exists (
    select 1
    from public.customers c
    where c.id = customer_addresses.customer_id
      and (public.is_store_member(c.store_id) or public.is_platform_admin())
  )
);

create policy "addresses via customer membership manage"
on public.customer_addresses
for all
using (
  exists (
    select 1
    from public.customers c
    where c.id = customer_addresses.customer_id
      and (public.is_store_member(c.store_id) or public.is_platform_admin())
  )
)
with check (
  exists (
    select 1
    from public.customers c
    where c.id = customer_addresses.customer_id
      and (public.is_store_member(c.store_id) or public.is_platform_admin())
  )
);

create policy "member or admin read orders"
on public.orders
for select
using (public.is_store_member(store_id) or public.is_platform_admin());

create policy "member or admin manage orders"
on public.orders
for all
using (public.is_store_member(store_id) or public.is_platform_admin())
with check (public.is_store_member(store_id) or public.is_platform_admin());

create policy "order items via order membership read"
on public.order_items
for select
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and (public.is_store_member(o.store_id) or public.is_platform_admin())
  )
);

create policy "order items via order membership manage"
on public.order_items
for all
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and (public.is_store_member(o.store_id) or public.is_platform_admin())
  )
)
with check (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and (public.is_store_member(o.store_id) or public.is_platform_admin())
  )
);

create policy "order history via order membership read"
on public.order_status_history
for select
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_status_history.order_id
      and (public.is_store_member(o.store_id) or public.is_platform_admin())
  )
);

create policy "order history via order membership insert"
on public.order_status_history
for insert
with check (
  exists (
    select 1
    from public.orders o
    where o.id = order_status_history.order_id
      and (public.is_store_member(o.store_id) or public.is_platform_admin())
  )
);

create policy "member or admin read payments"
on public.payments
for select
using (public.is_store_member(store_id) or public.is_platform_admin());

create policy "member or admin manage payments"
on public.payments
for all
using (public.is_store_member(store_id) or public.is_platform_admin())
with check (public.is_store_member(store_id) or public.is_platform_admin());

create policy "member or admin read themes"
on public.store_themes
for select
using (public.is_store_member(store_id) or public.is_platform_admin());

create policy "member or admin manage themes"
on public.store_themes
for all
using (public.is_store_member(store_id) or public.is_platform_admin())
with check (public.is_store_member(store_id) or public.is_platform_admin());

create policy "member or admin read pages"
on public.store_pages
for select
using (public.is_store_member(store_id) or public.is_platform_admin());

create policy "member or admin manage pages"
on public.store_pages
for all
using (public.is_store_member(store_id) or public.is_platform_admin())
with check (public.is_store_member(store_id) or public.is_platform_admin());

create policy "member or admin read assets"
on public.store_assets
for select
using (public.is_store_member(store_id) or public.is_platform_admin());

create policy "member or admin manage assets"
on public.store_assets
for all
using (public.is_store_member(store_id) or public.is_platform_admin())
with check (public.is_store_member(store_id) or public.is_platform_admin());

create policy "member or admin read payment settings"
on public.store_payment_settings
for select
using (public.is_store_member(store_id) or public.is_platform_admin());

create policy "member or admin manage payment settings"
on public.store_payment_settings
for all
using (public.is_store_member(store_id) or public.is_platform_admin())
with check (public.is_store_member(store_id) or public.is_platform_admin());

create policy "member or admin read payout accounts"
on public.store_payout_accounts
for select
using (public.is_store_member(store_id) or public.is_platform_admin());

create policy "member or admin manage payout accounts"
on public.store_payout_accounts
for all
using (public.is_store_member(store_id) or public.is_platform_admin())
with check (public.is_store_member(store_id) or public.is_platform_admin());

create policy "member or admin read support tickets"
on public.support_tickets
for select
using (
  public.is_platform_admin()
  or (store_id is not null and public.is_store_member(store_id))
  or created_by = auth.uid()
  or assigned_to = auth.uid()
);

create policy "member or admin manage support tickets"
on public.support_tickets
for all
using (
  public.is_platform_admin()
  or (store_id is not null and public.is_store_member(store_id))
  or created_by = auth.uid()
  or assigned_to = auth.uid()
)
with check (
  public.is_platform_admin()
  or (store_id is not null and public.is_store_member(store_id))
  or created_by = auth.uid()
);

create policy "admins read store reviews"
on public.store_reviews
for select
using (public.is_platform_admin() or public.is_store_member(store_id));

create policy "admins manage store reviews"
on public.store_reviews
for all
using (public.is_platform_admin())
with check (public.is_platform_admin());

create policy "member or admin read payouts"
on public.payouts
for select
using (public.is_store_member(store_id) or public.is_platform_admin());

create policy "admins manage payouts"
on public.payouts
for all
using (public.is_platform_admin())
with check (public.is_platform_admin());

create policy "admins read audit logs"
on public.audit_logs
for select
using (public.is_platform_admin());

create policy "system or admin insert audit logs"
on public.audit_logs
for insert
with check (actor_user_id = auth.uid() or public.is_platform_admin());

commit;
