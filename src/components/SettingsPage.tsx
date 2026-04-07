import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Copy,
  CreditCard,
  Globe,
  LoaderCircle,
  ShieldCheck,
  Smartphone,
  Store
} from 'lucide-react';
import type { SessionUser } from '../App';
import { supabase } from '../contexts/supabaseClient';
import {
  formatCurrency,
  formatShortDate,
  getCurrentStoreForUser,
  setupStoreCommerceDefaults,
  type StoreRecord
} from '../lib/store';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/Card';
import { Input } from './ui/Input';

type PlanRow = {
  id: string;
  name: string;
  code: string;
  price_monthly: number;
  product_limit: number | null;
  custom_domain_enabled: boolean;
  analytics_enabled: boolean;
  staff_limit: number | null;
};

type DomainRow = {
  id: string;
  domain: string;
  type: 'subdomain' | 'custom';
  verification_status: 'pending' | 'verified' | 'failed';
  dns_target: string | null;
  ssl_status: string | null;
  created_at: string;
};

type SubscriptionRow = {
  id: string;
  plan_id: string;
  provider: string | null;
  provider_subscription_id: string | null;
  status: 'trialing' | 'active' | 'past_due' | 'canceled';
  starts_at: string | null;
  ends_at: string | null;
  trial_ends_at: string | null;
};

interface SettingsPageProps {
  currentUser: SessionUser;
}

export function SettingsPage({ currentUser }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'domain' | 'payments' | 'billing'>(
    'general'
  );
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [store, setStore] = useState<StoreRecord | null>(null);
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [domains, setDomains] = useState<DomainRow[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [paymentSettingsId, setPaymentSettingsId] = useState<string | null>(null);
  const [customDomain, setCustomDomain] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    business_address: '',
    mpesa_shortcode: '',
    mpesa_environment: 'sandbox',
    bank_name: '',
    bank_account_name: '',
    bank_account_number: '',
    bank_branch: '',
    card_payments_enabled: false
  });

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');

      try {
        const currentStore = await getCurrentStoreForUser(currentUser);
        setStore(currentStore);

        const [plansResult, paymentSettingsResult, domainsResult, subscriptionResult] =
          await Promise.all([
            supabase
              .from('plans')
              .select(
                'id, name, code, price_monthly, product_limit, custom_domain_enabled, analytics_enabled, staff_limit'
              )
              .order('price_monthly'),
            currentStore
              ? supabase.from('store_payment_settings').select('*').eq('store_id', currentStore.id).maybeSingle()
              : Promise.resolve({ data: null, error: null } as any),
            currentStore
              ? supabase
                  .from('domains')
                  .select('id, domain, type, verification_status, dns_target, ssl_status, created_at')
                  .eq('store_id', currentStore.id)
                  .order('created_at')
              : Promise.resolve({ data: [], error: null } as any),
            currentStore
              ? supabase
                  .from('subscriptions')
                  .select('*')
                  .eq('store_id', currentStore.id)
                  .order('created_at', { ascending: false })
                  .limit(1)
                  .maybeSingle()
              : Promise.resolve({ data: null, error: null } as any)
          ]);

        if (plansResult.error) throw plansResult.error;
        if (paymentSettingsResult.error) throw paymentSettingsResult.error;
        if (domainsResult.error) throw domainsResult.error;
        if (subscriptionResult.error) throw subscriptionResult.error;

        setPlans((plansResult.data ?? []) as PlanRow[]);
        setDomains((domainsResult.data ?? []) as DomainRow[]);
        setSubscription((subscriptionResult.data ?? null) as SubscriptionRow | null);

        if (currentStore && domainsResult.data?.length === 0) {
          await setupStoreCommerceDefaults({
            storeId: currentStore.id,
            subdomain: currentStore.subdomain,
            planId: currentStore.plan_id
          });

          const refreshedDomains = await supabase
            .from('domains')
            .select('id, domain, type, verification_status, dns_target, ssl_status, created_at')
            .eq('store_id', currentStore.id)
            .order('created_at');

          if (refreshedDomains.error) throw refreshedDomains.error;
          setDomains((refreshedDomains.data ?? []) as DomainRow[]);
        }

        if (currentStore) {
          setForm({
            name: currentStore.name ?? '',
            description: currentStore.description ?? '',
            contact_email: currentStore.contact_email ?? '',
            contact_phone: currentStore.contact_phone ?? '',
            business_address: currentStore.business_address ?? '',
            mpesa_shortcode: paymentSettingsResult.data?.mpesa_shortcode ?? '',
            mpesa_environment: paymentSettingsResult.data?.mpesa_environment ?? 'sandbox',
            bank_name: paymentSettingsResult.data?.bank_name ?? '',
            bank_account_name: paymentSettingsResult.data?.bank_account_name ?? '',
            bank_account_number: paymentSettingsResult.data?.bank_account_number ?? '',
            bank_branch: paymentSettingsResult.data?.bank_branch ?? '',
            card_payments_enabled: paymentSettingsResult.data?.card_payments_enabled ?? false
          });
          setPaymentSettingsId(paymentSettingsResult.data?.id ?? null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings.');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [currentUser]);

  const currentPlan = useMemo(
    () => plans.find((plan) => plan.id === store?.plan_id) ?? null,
    [plans, store?.plan_id]
  );

  const defaultDomain = useMemo(
    () => domains.find((domain) => domain.type === 'subdomain') ?? null,
    [domains]
  );

  const customDomains = useMemo(
    () => domains.filter((domain) => domain.type === 'custom'),
    [domains]
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const saveGeneral = async () => {
    if (!store) return;

    setIsSaving(true);
    setError('');
    setSuccess('');

    const { error: updateError } = await supabase
      .from('stores')
      .update({
        name: form.name,
        description: form.description,
        contact_email: form.contact_email,
        contact_phone: form.contact_phone,
        business_address: form.business_address
      })
      .eq('id', store.id);

    setIsSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setStore((current) =>
      current
        ? {
            ...current,
            name: form.name,
            description: form.description,
            contact_email: form.contact_email,
            contact_phone: form.contact_phone,
            business_address: form.business_address
          }
        : current
    );
    setSuccess('Store settings saved.');
  };

  const savePayments = async () => {
    if (!store) return;

    setIsSaving(true);
    setError('');
    setSuccess('');

    const payload = {
      id: paymentSettingsId ?? undefined,
      store_id: store.id,
      mpesa_shortcode: form.mpesa_shortcode || null,
      mpesa_environment: form.mpesa_environment || null,
      bank_name: form.bank_name || null,
      bank_account_name: form.bank_account_name || null,
      bank_account_number: form.bank_account_number || null,
      bank_branch: form.bank_branch || null,
      card_payments_enabled: form.card_payments_enabled
    };

    const { data, error: paymentError } = await supabase
      .from('store_payment_settings')
      .upsert(payload)
      .select('id')
      .single();

    if (!paymentError && store) {
      const payoutProvider = form.bank_account_number ? 'bank' : 'mobile_money';
      const payoutName = form.bank_account_name || form.name;
      const payoutNumber = form.bank_account_number || form.contact_phone;

      if (payoutName && payoutNumber) {
        const existingPayout = await supabase
          .from('store_payout_accounts')
          .select('id')
          .eq('store_id', store.id)
          .eq('account_number', payoutNumber)
          .maybeSingle();

        const payoutPayload = {
          store_id: store.id,
          account_type: payoutProvider === 'bank' ? 'bank' : 'mobile_money',
          provider: payoutProvider === 'bank' ? form.bank_name || 'Bank' : 'M-Pesa',
          account_name: payoutName,
          account_number: payoutNumber,
          is_default: true,
          is_verified: false
        };

        if (existingPayout.data?.id) {
          await supabase
            .from('store_payout_accounts')
            .update(payoutPayload)
            .eq('id', existingPayout.data.id);
        } else {
          await supabase.from('store_payout_accounts').insert(payoutPayload);
        }
      }
    }

    setIsSaving(false);

    if (paymentError) {
      setError(paymentError.message);
      return;
    }

    setPaymentSettingsId(data.id);
    setSuccess('Payment settings saved.');
  };

  const addCustomDomain = async () => {
    if (!store) return;
    if (!customDomain.trim()) {
      setError('Enter a custom domain first.');
      return;
    }
    if (!currentPlan?.custom_domain_enabled) {
      setError('Upgrade to a plan with custom domain support before adding one.');
      return;
    }

    const normalizedDomain = customDomain.trim().toLowerCase();

    setIsSaving(true);
    setError('');
    setSuccess('');

    const { data, error: domainError } = await supabase
      .from('domains')
      .insert({
        store_id: store.id,
        domain: normalizedDomain,
        type: 'custom',
        verification_status: 'pending',
        dns_target: `${store.subdomain}.fezzy.shop`,
        ssl_status: 'pending'
      })
      .select('id, domain, type, verification_status, dns_target, ssl_status, created_at')
      .single();

    setIsSaving(false);

    if (domainError) {
      setError(domainError.message);
      return;
    }

    setDomains((current) => [...current, data as DomainRow]);
    setCustomDomain('');
    setSuccess('Custom domain added. Point your CNAME to the FEZZY target and wait for verification.');
  };

  const activatePlan = async (plan: PlanRow) => {
    if (!store) return;

    setIsSaving(true);
    setError('');
    setSuccess('');

    const [storeUpdate, subscriptionUpdate] = await Promise.all([
      supabase.from('stores').update({ plan_id: plan.id }).eq('id', store.id),
      supabase
        .from('subscriptions')
        .upsert(
          {
            store_id: store.id,
            plan_id: plan.id,
            provider: 'fezzy',
            provider_subscription_id: `plan-${store.id}`,
            status: plan.price_monthly > 0 ? 'active' : 'trialing',
            starts_at: new Date().toISOString(),
            trial_ends_at:
              plan.price_monthly > 0
                ? null
                : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          },
          { onConflict: 'provider_subscription_id' }
        )
        .select('*')
        .single()
    ]);

    setIsSaving(false);

    if (storeUpdate.error) {
      setError(storeUpdate.error.message);
      return;
    }

    if (subscriptionUpdate.error) {
      setError(subscriptionUpdate.error.message);
      return;
    }

    setStore((current) => (current ? { ...current, plan_id: plan.id } : current));
    setSubscription(subscriptionUpdate.data as SubscriptionRow);
    setSuccess(`${plan.name} plan is now active for this store.`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 py-16 text-muted-foreground">
        <LoaderCircle className="h-5 w-5 animate-spin" />
        Loading settings...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your store preferences, domains, payments, and subscription.
        </p>
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        <div className="w-full shrink-0 space-y-1 md:w-64">
          {[
            { id: 'general', label: 'General Details', icon: <Store className="h-4 w-4" /> },
            { id: 'domain', label: 'Domains', icon: <Globe className="h-4 w-4" /> },
            { id: 'payments', label: 'Payments', icon: <CreditCard className="h-4 w-4" /> },
            { id: 'billing', label: 'Subscription', icon: <ShieldCheck className="h-4 w-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-6">
          {activeTab === 'general' && (
            <Card>
              <CardHeader>
                <CardTitle>Store Details</CardTitle>
                <CardDescription>Basic information about your business.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field label="Store Name">
                  <Input value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} />
                </Field>
                <Field label="Store Description">
                  <textarea
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.description}
                    onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
                  />
                </Field>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Contact Email">
                    <Input type="email" value={form.contact_email} onChange={(e) => setForm((c) => ({ ...c, contact_email: e.target.value }))} />
                  </Field>
                  <Field label="Phone Number">
                    <Input type="tel" value={form.contact_phone} onChange={(e) => setForm((c) => ({ ...c, contact_phone: e.target.value }))} />
                  </Field>
                </div>
                <Field label="Business Address">
                  <Input value={form.business_address} onChange={(e) => setForm((c) => ({ ...c, business_address: e.target.value }))} />
                </Field>
              </CardContent>
              <CardFooter className="border-t border-border pt-6">
                <Button onClick={() => void saveGeneral()} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === 'domain' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Default FEZZY Domain</CardTitle>
                  <CardDescription>
                    This subdomain is created automatically when the store is provisioned.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={defaultDomain?.domain ?? (store?.subdomain ? `${store.subdomain}.fezzy.shop` : 'No subdomain assigned')}
                      className="bg-muted/50 font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy(defaultDomain?.domain ?? '')}
                      disabled={!defaultDomain?.domain}
                    >
                      {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                    <p>Status: {defaultDomain?.verification_status ?? 'verified'}</p>
                    <p>SSL: {defaultDomain?.ssl_status ?? 'active'}</p>
                    <p>DNS target: {defaultDomain?.dns_target ?? 'stores.fezzy.shop'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Custom Domains</CardTitle>
                  <CardDescription>
                    Add your own domain and point it to your FEZZY storefront.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-3 md:flex-row">
                    <Input
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      placeholder="shop.yourbrand.com"
                      disabled={!currentPlan?.custom_domain_enabled}
                    />
                    <Button onClick={() => void addCustomDomain()} disabled={isSaving || !currentPlan?.custom_domain_enabled}>
                      Add Domain
                    </Button>
                  </div>
                  {!currentPlan?.custom_domain_enabled && (
                    <p className="text-sm text-amber-700">
                      Your current plan does not include custom domains. Upgrade below to enable this.
                    </p>
                  )}

                  {customDomains.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
                      No custom domain added yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {customDomains.map((domain) => (
                        <div key={domain.id} className="rounded-2xl border border-border p-4">
                          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="font-medium text-foreground">{domain.domain}</p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                CNAME this domain to {domain.dns_target ?? `${store?.subdomain}.fezzy.shop`}
                              </p>
                            </div>
                            <Badge variant={domain.verification_status === 'verified' ? 'default' : 'secondary'}>
                              {domain.verification_status}
                            </Badge>
                          </div>
                          <p className="mt-3 text-xs text-muted-foreground">
                            SSL: {domain.ssl_status ?? 'pending'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-emerald-800">
                    <Smartphone className="h-5 w-5" />
                    M-Pesa Integration
                  </CardTitle>
                  <CardDescription>Store your payment settings in Supabase.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Business Shortcode">
                      <Input value={form.mpesa_shortcode} onChange={(e) => setForm((c) => ({ ...c, mpesa_shortcode: e.target.value }))} />
                    </Field>
                    <Field label="Environment">
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={form.mpesa_environment}
                        onChange={(e) => setForm((c) => ({ ...c, mpesa_environment: e.target.value }))}
                      >
                        <option value="sandbox">Sandbox</option>
                        <option value="production">Production</option>
                      </select>
                    </Field>
                  </div>
                  <label className="flex items-center gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm">
                    <input
                      type="checkbox"
                      checked={form.card_payments_enabled}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          card_payments_enabled: e.target.checked
                        }))
                      }
                    />
                    Enable card payments on checkout
                  </label>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Manual Bank Transfer</CardTitle>
                  <CardDescription>Provide your bank details for manual payments.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Field label="Bank Name">
                    <Input value={form.bank_name} onChange={(e) => setForm((c) => ({ ...c, bank_name: e.target.value }))} />
                  </Field>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Account Name">
                      <Input value={form.bank_account_name} onChange={(e) => setForm((c) => ({ ...c, bank_account_name: e.target.value }))} />
                    </Field>
                    <Field label="Account Number">
                      <Input value={form.bank_account_number} onChange={(e) => setForm((c) => ({ ...c, bank_account_number: e.target.value }))} />
                    </Field>
                  </div>
                  <Field label="Branch">
                    <Input value={form.bank_branch} onChange={(e) => setForm((c) => ({ ...c, bank_branch: e.target.value }))} />
                  </Field>
                  <Field label="Last Payment Reference">
                    <Input
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="Optional internal ref for reconciliation"
                    />
                  </Field>
                </CardContent>
                <CardFooter className="border-t border-border pt-6">
                  <Button onClick={() => void savePayments()} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Payment Settings'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <Card className="border-primary shadow-md">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{currentPlan?.name ?? 'No Plan'}</CardTitle>
                      <CardDescription>Current billing configuration for your store.</CardDescription>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">Current Plan</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Monthly price: {currentPlan ? formatCurrency(currentPlan.price_monthly, store?.currency_code) : 'N/A'}</p>
                    <p>Subscription status: {subscription?.status ?? 'Not started'}</p>
                    <p>Billing starts: {formatShortDate(subscription?.starts_at)}</p>
                    <p>Trial ends: {formatShortDate(subscription?.trial_ends_at)}</p>
                    <p>Product limit: {currentPlan?.product_limit ?? 'Unlimited'}</p>
                    <p>Custom domain: {currentPlan?.custom_domain_enabled ? 'Enabled' : 'Not included'}</p>
                    <p>Analytics: {currentPlan?.analytics_enabled ? 'Enabled' : 'Not included'}</p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {plans.map((plan) => (
                  <Card key={plan.id} className={plan.id === store?.plan_id ? 'border-primary' : ''}>
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <div className="mt-2 flex items-baseline text-3xl font-bold">
                        {formatCurrency(plan.price_monthly, store?.currency_code)}
                        <span className="ml-1 text-sm font-medium text-muted-foreground">/mo</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                      <p>{plan.product_limit ?? 'Unlimited'} products</p>
                      <p>{plan.staff_limit ?? 'Unlimited'} staff accounts</p>
                      <p>{plan.custom_domain_enabled ? 'Custom domain included' : 'No custom domain'}</p>
                      <p>{plan.analytics_enabled ? 'Analytics included' : 'Basic reporting only'}</p>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button
                        className="w-full"
                        variant={plan.id === store?.plan_id ? 'outline' : 'default'}
                        disabled={isSaving || plan.id === store?.plan_id}
                        onClick={() => void activatePlan(plan)}
                      >
                        {plan.id === store?.plan_id ? 'Current Plan' : `Activate ${plan.name}`}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}
