import type { SessionUser } from '../App';
import { supabase } from '../contexts/supabaseClient';

export type StoreRecord = {
  id: string;
  owner_user_id: string;
  plan_id: string | null;
  name: string;
  slug: string;
  subdomain: string;
  description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  business_address: string | null;
  country: string | null;
  currency_code: string;
  status: string;
  verification_status: string;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
  plans?: {
    id: string;
    name: string;
    code: string;
    price_monthly: number;
    price_yearly: number;
    product_limit: number | null;
    custom_domain_enabled: boolean;
    analytics_enabled: boolean;
    staff_limit: number | null;
  } | null;
};

export async function getCurrentStoreForUser(user: SessionUser | null) {
  if (!user) {
    return null;
  }

  const ownerQuery = await supabase
    .from('stores')
    .select(
      'id, owner_user_id, plan_id, name, slug, subdomain, description, contact_email, contact_phone, business_address, country, currency_code, status, verification_status, logo_url, created_at, updated_at, plans(id, name, code, price_monthly, price_yearly, product_limit, custom_domain_enabled, analytics_enabled, staff_limit)'
    )
    .eq('owner_user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (ownerQuery.error) {
    throw ownerQuery.error;
  }

  if (ownerQuery.data) {
    return ownerQuery.data as StoreRecord;
  }

  const membershipQuery = await supabase
    .from('store_members')
    .select(
      'stores(id, owner_user_id, plan_id, name, slug, subdomain, description, contact_email, contact_phone, business_address, country, currency_code, status, verification_status, logo_url, created_at, updated_at, plans(id, name, code, price_monthly, price_yearly, product_limit, custom_domain_enabled, analytics_enabled, staff_limit))'
    )
    .eq('user_id', user.id)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  if (membershipQuery.error) {
    throw membershipQuery.error;
  }

  return (membershipQuery.data?.stores ?? null) as StoreRecord | null;
}

export async function ensureStoreForUser(user: SessionUser | null) {
  if (!user) {
    return null;
  }

  const existingStore = await getCurrentStoreForUser(user);
  if (existingStore || user.role !== 'merchant') {
    return existingStore;
  }

  const {
    data: { user: authUser }
  } = await supabase.auth.getUser();

  const metadata = {
    ...(authUser?.app_metadata ?? {}),
    ...(authUser?.user_metadata ?? {})
  } as Record<string, unknown>;

  const storeName =
    getMetadataString(metadata.store_name) || user.storeName || `${user.name}'s Store`;
  const requestedSubdomain =
    getMetadataString(metadata.store_subdomain) ||
    user.storeSubdomain ||
    slugify(storeName) ||
    slugify(user.email.split('@')[0] || 'store');
  const storeSubdomain = await getAvailableStoreSlug(requestedSubdomain, user.id);
  const starterDescription =
    getMetadataString(metadata.shipping_notes) ||
    `${storeName} on FEZZY`;

  const { data: starterPlan } = await supabase
    .from('plans')
    .select('id')
    .eq('code', 'starter')
    .maybeSingle();

  const { data: createdStore, error: storeError } = await supabase
    .from('stores')
    .insert({
      owner_user_id: user.id,
      plan_id: starterPlan?.id ?? null,
      name: storeName,
      slug: storeSubdomain,
      subdomain: storeSubdomain,
      description: starterDescription,
      contact_email: user.email || null,
      contact_phone: getMetadataString(metadata.phone),
      business_address: getMetadataString(metadata.business_address),
      country: getMetadataString(metadata.country) || 'Kenya',
      status: 'draft',
      verification_status: 'pending'
    })
    .select('id')
    .single();

  if (storeError) {
    throw storeError;
  }

  const { error: memberError } = await supabase.from('store_members').upsert({
    store_id: createdStore.id,
    user_id: user.id,
    role: 'owner',
    is_active: true
  });

  if (memberError) {
    throw memberError;
  }

  await supabase.from('store_themes').upsert({
    store_id: createdStore.id,
    template_code: 'market-fresh',
    font: 'Plus Jakarta Sans',
    primary_color: '#b45309',
    accent_color: '#14532d',
    tagline: `${storeName} on FEZZY`,
    settings: {
      announcement_text: 'Welcome to our online store',
      hero_eyebrow: 'Live storefront',
      hero_title: storeName,
      hero_subtitle: starterDescription,
      hero_cta: 'Shop Collection',
      featured_title: 'Featured picks',
      featured_description: 'Edit your storefront and start selling online.',
      about_heading: 'Our story',
      about_body: starterDescription,
      contact_heading: 'Talk to our team',
      footer_tagline: `${storeName} on FEZZY`
    },
    is_published: false
  });

  await supabase.from('store_pages').upsert([
    {
      store_id: createdStore.id,
      page_type: 'home',
      title: 'Home',
      slug: '/',
      description: 'Homepage',
      content: {},
      show_in_nav: true,
      sort_order: 0,
      is_published: true
    },
    {
      store_id: createdStore.id,
      page_type: 'shop',
      title: 'Shop',
      slug: '/shop',
      description: 'Shop page',
      content: {},
      show_in_nav: true,
      sort_order: 1,
      is_published: true
    },
    {
      store_id: createdStore.id,
      page_type: 'about',
      title: 'About',
      slug: '/about',
      description: 'About page',
      content: {},
      show_in_nav: true,
      sort_order: 2,
      is_published: true
    },
    {
      store_id: createdStore.id,
      page_type: 'contact',
      title: 'Contact',
      slug: '/contact',
      description: 'Contact page',
      content: {},
      show_in_nav: true,
      sort_order: 3,
      is_published: true
    }
  ]);

  await supabase.from('store_payment_settings').upsert({
    store_id: createdStore.id,
    mpesa_environment: 'sandbox'
  });

  await setupStoreCommerceDefaults({
    storeId: createdStore.id,
    subdomain: storeSubdomain,
    planId: starterPlan?.id ?? null
  });

  return getCurrentStoreForUser(user);
}

export async function setupStoreCommerceDefaults({
  storeId,
  subdomain,
  planId
}: {
  storeId: string;
  subdomain: string;
  planId: string | null;
}) {
  await supabase.from('domains').upsert({
    store_id: storeId,
    domain: `${subdomain}.fezzy.shop`,
    type: 'subdomain',
    verification_status: 'verified',
    dns_target: 'stores.fezzy.shop',
    ssl_status: 'active'
  }, { onConflict: 'domain' });

  if (planId) {
    await supabase.from('subscriptions').upsert(
      {
        store_id: storeId,
        plan_id: planId,
        provider: 'fezzy',
        provider_subscription_id: `starter-${storeId}`,
        status: 'trialing',
        starts_at: new Date().toISOString(),
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      { onConflict: 'provider_subscription_id' }
    );
  }
}

async function getAvailableStoreSlug(baseValue: string, userId: string) {
  const normalizedBase = slugify(baseValue) || `store-${userId.slice(0, 6)}`;

  const { data: existing } = await supabase
    .from('stores')
    .select('id')
    .eq('subdomain', normalizedBase)
    .maybeSingle();

  if (!existing) {
    return normalizedBase;
  }

  return `${normalizedBase}-${userId.slice(0, 6)}`;
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getMetadataString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function formatCurrency(amount: number | null | undefined, currencyCode = 'KES') {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0
  }).format(amount ?? 0);
}

export function formatShortDate(value: string | null | undefined) {
  if (!value) {
    return 'N/A';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-KE', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return 'N/A';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-KE', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}
