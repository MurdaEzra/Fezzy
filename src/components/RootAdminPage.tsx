import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Crown, DollarSign, LoaderCircle, Search, ShieldCheck, Store, UserCog, Wallet } from 'lucide-react';
import type { PageType, SessionUser } from '../App';
import { supabase } from '../contexts/supabaseClient';
import { formatCurrency, formatShortDate } from '../lib/store';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Input } from './ui/Input';

interface RootAdminPageProps {
  navigate: (page: PageType) => void;
  currentUser: SessionUser;
  onLogout: () => void;
}

export function RootAdminPage({ navigate, currentUser, onLogout }: RootAdminPageProps) {
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [stores, setStores] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');

      try {
        const [storesResult, reviewsResult, payoutsResult, logsResult] = await Promise.all([
          supabase.from('stores').select('id, name, status, verification_status, created_at, plans(name)').order('created_at', { ascending: false }),
          supabase.from('store_reviews').select('id, review_type, status, reason, created_at, stores(name)').order('created_at', { ascending: false }).limit(8),
          supabase.from('payouts').select('id, amount, status, created_at, stores(name)').order('created_at', { ascending: false }).limit(8),
          supabase.from('audit_logs').select('id, action, entity_type, created_at, stores(name)').order('created_at', { ascending: false }).limit(8)
        ]);

        if (storesResult.error) throw storesResult.error;
        if (reviewsResult.error) throw reviewsResult.error;
        if (payoutsResult.error) throw payoutsResult.error;
        if (logsResult.error) throw logsResult.error;

        setStores(storesResult.data ?? []);
        setReviews(reviewsResult.data ?? []);
        setPayouts(payoutsResult.data ?? []);
        setAuditLogs(logsResult.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load root admin data.');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const filteredStores = useMemo(
    () =>
      stores.filter((store) =>
        `${store.name} ${store.status} ${store.verification_status}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [search, stores]
  );

  const metrics = useMemo(() => {
    const managedCount = stores.length;
    const liveCount = stores.filter((store) => store.status === 'live').length;
    const pendingApprovals = reviews.filter((item) => item.status === 'pending').length;
    const heldPayouts = payouts.filter((item) => item.status === 'held').length;
    const payoutTotal = payouts.reduce((sum, payout) => sum + (payout.amount ?? 0), 0);
    return { managedCount, liveCount, pendingApprovals, heldPayouts, payoutTotal };
  }, [payouts, reviews, stores]);

  const userInitials = currentUser.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-3 text-muted-foreground">
        <LoaderCircle className="h-5 w-5 animate-spin" />
        Loading root admin...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_rgba(15,23,42,1)_0%,_rgba(30,41,59,0.96)_18%,_rgba(248,250,252,1)_18%,_rgba(248,250,252,1)_100%)]">
      <header className="px-6 py-5 text-slate-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-400 p-2 text-slate-950 shadow-lg shadow-amber-400/20">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">FEZZY Root Admin</h1>
              <p className="text-xs text-slate-300">Platform governance from live Supabase records</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-slate-200 hover:bg-white/10 hover:text-white" onClick={() => navigate('admin')}>
              Open Admin Console
            </Button>
            <Button variant="ghost" className="text-slate-200 hover:bg-white/10 hover:text-white" onClick={() => navigate('landing')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Exit
            </Button>
            <button type="button" onClick={onLogout} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">
              {userInitials}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 pb-8">
        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric title="Managed Stores" value={String(metrics.managedCount)} note={`${metrics.liveCount} currently live`} icon={<Store className="h-4 w-4 text-primary" />} />
          <Metric title="Payout Volume" value={formatCurrency(metrics.payoutTotal)} note="Across recent payout records" icon={<DollarSign className="h-4 w-4 text-emerald-500" />} />
          <Metric title="Pending Approvals" value={String(metrics.pendingApprovals)} note="Awaiting review" icon={<ShieldCheck className="h-4 w-4 text-amber-500" />} />
          <Metric title="Held Payouts" value={String(metrics.heldPayouts)} note="Require attention" icon={<UserCog className="h-4 w-4 text-sky-500" />} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <Card className="overflow-hidden border-none shadow-xl shadow-slate-200/70">
            <CardHeader className="border-b border-border bg-background/90">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <CardTitle>Store control center</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">Search stores, statuses, and verification state.</p>
                </div>
                <div className="relative w-full lg:w-80">
                  <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" placeholder="Search store" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 font-medium">Store</th>
                      <th className="px-4 py-3 font-medium">Plan</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Verification</th>
                      <th className="px-4 py-3 font-medium">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredStores.map((store) => (
                      <tr key={store.id}>
                        <td className="px-4 py-3 font-medium text-foreground">{store.name}</td>
                        <td className="px-4 py-3">{store.plans?.name ?? 'No plan'}</td>
                        <td className="px-4 py-3 capitalize">{store.status}</td>
                        <td className="px-4 py-3 capitalize">{store.verification_status}</td>
                        <td className="px-4 py-3">{formatShortDate(store.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-none shadow-lg shadow-slate-200/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Approval Queue
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {reviews.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No approvals queued.</div>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="rounded-2xl border border-border p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-foreground capitalize">{review.review_type}</p>
                        <Badge variant="outline">{review.status}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{review.stores?.name ?? 'No store linked'}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-none bg-slate-950 text-slate-50 shadow-lg shadow-slate-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-emerald-300" />
                  Audit Trail
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {auditLogs.length === 0 ? (
                  <div className="text-sm text-slate-300">No audit entries found.</div>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <p className="text-sm font-medium">{log.action}</p>
                      <p className="mt-1 text-xs text-slate-300">{log.stores?.name ?? log.entity_type}</p>
                      <p className="mt-2 text-[11px] text-slate-400">{formatShortDate(log.created_at)}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="border-none shadow-lg shadow-slate-200/60">
          <CardHeader>
            <CardTitle>Payout Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {payouts.length === 0 ? (
              <div className="text-sm text-muted-foreground">No payouts found.</div>
            ) : (
              payouts.map((payout) => (
                <div key={payout.id} className="flex items-center justify-between rounded-2xl border border-border p-4">
                  <div>
                    <p className="font-medium text-foreground">{payout.stores?.name ?? 'Unknown store'}</p>
                    <p className="text-sm text-muted-foreground">{formatShortDate(payout.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{formatCurrency(payout.amount)}</p>
                    <Badge variant="outline">{payout.status}</Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function Metric({ title, value, note, icon }: { title: string; value: string; note: string; icon: React.ReactNode }) {
  return (
    <Card className="border-none shadow-lg shadow-slate-200/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <p className="text-xs mt-1 text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  );
}
