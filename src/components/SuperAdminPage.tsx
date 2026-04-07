import React, { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowLeft, CreditCard, Headset, LoaderCircle, Search, ShieldAlert, Store, Users } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { PageType, SessionUser } from '../App';
import { supabase } from '../contexts/supabaseClient';
import { formatCurrency, formatShortDate } from '../lib/store';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Input } from './ui/Input';

interface SuperAdminPageProps {
  navigate: (page: PageType) => void;
  currentUser: SessionUser;
  onLogout: () => void;
}

export function SuperAdminPage({ navigate, currentUser, onLogout }: SuperAdminPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [stores, setStores] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');

      try {
        const [storesResult, ticketsResult, payoutsResult] = await Promise.all([
          supabase.from('stores').select('id, name, status, verification_status, created_at, profiles!stores_owner_user_id_fkey(full_name), plans(name)').order('created_at', { ascending: false }),
          supabase.from('support_tickets').select('id, subject, priority, status, created_at, stores(name)').order('created_at', { ascending: false }).limit(5),
          supabase.from('payouts').select('amount, created_at').order('created_at', { ascending: true }).limit(12)
        ]);

        if (storesResult.error) throw storesResult.error;
        if (ticketsResult.error) throw ticketsResult.error;
        if (payoutsResult.error) throw payoutsResult.error;

        setStores(storesResult.data ?? []);
        setTickets(ticketsResult.data ?? []);
        setPayouts(payoutsResult.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load admin console.');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const filteredStores = useMemo(
    () =>
      stores.filter((store) =>
        `${store.name} ${store.profiles?.full_name ?? ''} ${store.status}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      ),
    [searchTerm, stores]
  );

  const chartData = payouts.map((payout) => ({
    name: formatShortDate(payout.created_at),
    revenue: payout.amount ?? 0
  }));

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
        Loading admin console...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950 px-6 py-4 text-slate-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary p-2 text-primary-foreground">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">FEZZY Admin Console</h1>
              <p className="text-xs text-slate-400">Live operational data from Supabase</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser.role === 'root-admin' && (
              <Button variant="ghost" className="text-slate-300 hover:bg-slate-800 hover:text-white" onClick={() => navigate('root-admin')}>
                Open Root Admin
              </Button>
            )}
            <Button variant="ghost" className="text-slate-300 hover:bg-slate-800 hover:text-white" onClick={() => navigate('landing')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Exit
            </Button>
            <button type="button" onClick={onLogout} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold">
              {userInitials}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-6">
        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Active Merchants" value={String(stores.length)} description="Total stores in system" icon={<Store className="h-4 w-4 text-primary" />} />
          <StatCard title="Healthy Stores" value={String(stores.filter((store) => store.status === 'live').length)} description="Currently live storefronts" icon={<Activity className="h-4 w-4 text-emerald-500" />} />
          <StatCard title="Payout Volume" value={formatCurrency(payouts.reduce((sum, item) => sum + (item.amount ?? 0), 0))} description="From payout records" icon={<CreditCard className="h-4 w-4 text-sky-500" />} />
          <StatCard title="Open Cases" value={String(tickets.filter((ticket) => ticket.status !== 'closed').length)} description="Support queue items" icon={<Users className="h-4 w-4 text-amber-500" />} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
          <Card>
            <CardHeader>
              <CardTitle>Platform Payout Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Support Queue</CardTitle>
              <Headset className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
              {tickets.length === 0 ? (
                <div className="text-sm text-muted-foreground">No support tickets found.</div>
              ) : (
                tickets.map((ticket) => (
                  <div key={ticket.id} className="rounded-2xl border border-border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-foreground">{ticket.subject}</p>
                      <Badge variant="outline">{ticket.priority}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{ticket.stores?.name ?? 'No store attached'}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Merchant Stores</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Search stores from your live database.</p>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" placeholder="Search store or owner" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 font-medium">Store</th>
                    <th className="px-4 py-3 font-medium">Owner</th>
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
                      <td className="px-4 py-3">{store.profiles?.full_name ?? 'Unknown'}</td>
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
      </main>
    </div>
  );
}

function StatCard({ title, value, description, icon }: { title: string; value: string; description: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <p className="text-xs mt-1 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
