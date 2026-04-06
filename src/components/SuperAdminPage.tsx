import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Headset,
  LoaderCircle,
  Search,
  ShieldAlert,
  Store,
  Users,
  XCircle
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import type { PageType, SessionUser } from '../App';

interface SuperAdminPageProps {
  navigate: (page: PageType) => void;
  currentUser: SessionUser;
  onLogout: () => void;
}

const stores = [
  {
    id: 1,
    name: 'Mama Mboga Market',
    owner: 'James Kariuki',
    plan: 'Growth',
    products: 128,
    revenue: 'KES 452K',
    health: 'Healthy',
    issue: 'None',
    created: '12 Jan 2026'
  },
  {
    id: 2,
    name: 'Amina Beauty House',
    owner: 'Amina Yusuf',
    plan: 'Starter',
    products: 64,
    revenue: 'KES 188K',
    health: 'Needs Review',
    issue: 'Chargeback spike',
    created: '27 Feb 2026'
  },
  {
    id: 3,
    name: 'Lake View Electronics',
    owner: 'Ochieng Otieno',
    plan: 'Scale',
    products: 512,
    revenue: 'KES 1.2M',
    health: 'Healthy',
    issue: 'None',
    created: '06 Dec 2025'
  },
  {
    id: 4,
    name: 'Nairobi Sneakers',
    owner: 'Kevin Mwangi',
    plan: 'Growth',
    products: 206,
    revenue: 'KES 0',
    health: 'Suspended',
    issue: 'Failed KYC refresh',
    created: '05 Mar 2026'
  }
];

const revenueData = [
  { name: 'Nov', revenue: 820000 },
  { name: 'Dec', revenue: 960000 },
  { name: 'Jan', revenue: 1090000 },
  { name: 'Feb', revenue: 1210000 },
  { name: 'Mar', revenue: 1320000 },
  { name: 'Apr', revenue: 1480000 }
];

const supportQueue = [
  {
    ticket: '#OPS-114',
    merchant: 'Amina Beauty House',
    issue: 'Settlement delay after M-Pesa retries',
    priority: 'High',
    owner: 'Risk Team'
  },
  {
    ticket: '#OPS-109',
    merchant: 'Nairobi Sneakers',
    issue: 'KYC document mismatch',
    priority: 'Critical',
    owner: 'Compliance'
  },
  {
    ticket: '#OPS-101',
    merchant: 'Lake View Electronics',
    issue: 'Plan downgrade request',
    priority: 'Medium',
    owner: 'Billing'
  }
];

export function SuperAdminPage({
  navigate,
  currentUser,
  onLogout
}: SuperAdminPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 850);
    return () => window.clearTimeout(timer);
  }, []);

  const visibleStores = useMemo(
    () =>
      stores.filter((store) =>
        `${store.name} ${store.owner} ${store.issue}`.
          toLowerCase().
          includes(searchTerm.toLowerCase())
      ),
    [searchTerm]
  );

  const userInitials = currentUser.name.
    split(' ').
    map((part) => part[0]).
    join('').
    slice(0, 2).
    toUpperCase();

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
              <p className="text-xs text-slate-400">
                Store operations, billing, and merchant support
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser.role === 'root-admin' &&
            <Button
              variant="ghost"
              className="text-slate-300 hover:bg-slate-800 hover:text-white"
              onClick={() => navigate('root-admin')}>

                Open Root Admin
              </Button>
            }
            <Button
              variant="ghost"
              className="text-slate-300 hover:bg-slate-800 hover:text-white"
              onClick={() => navigate('landing')}>

              <ArrowLeft className="mr-2 h-4 w-4" />
              Exit
            </Button>
            <button
              type="button"
              onClick={onLogout}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold">

              {userInitials}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-6">
        <AnimatePresence mode="wait">
          {isLoading ?
          <motion.div
            key="loading"
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0
            }}
            className="space-y-6">

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) =>
              <div
                key={index}
                className="h-32 animate-pulse rounded-lg border border-border bg-card" />
              )}
              </div>
              <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
                <div className="h-[380px] animate-pulse rounded-lg border border-border bg-card" />
                <div className="h-[380px] animate-pulse rounded-lg border border-border bg-card" />
              </div>
              <div className="h-[380px] animate-pulse rounded-lg border border-border bg-card" />
            </motion.div> :
          <motion.div
            key="loaded"
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            exit={{
              opacity: 0
            }}
            transition={{
              duration: 0.35
            }}
            className="space-y-6">

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Active Merchants"
                  value="214"
                  description="17 joined this month"
                  icon={<Store className="h-4 w-4 text-primary" />} />
                <StatCard
                  title="Healthy Stores"
                  value="189"
                  description="88% passing daily checks"
                  icon={<Activity className="h-4 w-4 text-emerald-500" />} />
                <StatCard
                  title="Monthly Platform GMV"
                  value="KES 14.8M"
                  description="Up 12.4% from March"
                  icon={<CreditCard className="h-4 w-4 text-sky-500" />} />
                <StatCard
                  title="Open Cases"
                  value="23"
                  description="6 require escalation"
                  icon={<Users className="h-4 w-4 text-amber-500" />} />
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
                <motion.div whileHover={{ y: -2 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Platform revenue trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[320px] rounded-3xl border border-border bg-muted/30 p-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={revenueData}>
                            <defs>
                              <linearGradient id="opsRevenue" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                            <YAxis
                              stroke="hsl(var(--muted-foreground))"
                              tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                            <Tooltip />
                            <Area
                              dataKey="revenue"
                              type="monotone"
                              stroke="hsl(var(--primary))"
                              fill="url(#opsRevenue)"
                              strokeWidth={3} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div whileHover={{ y: -2 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Operations queue</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {supportQueue.map((ticket) =>
                    <motion.div
                      key={ticket.ticket}
                      initial={{
                        opacity: 0,
                        y: 14
                      }}
                      animate={{
                        opacity: 1,
                        y: 0
                      }}
                      className="rounded-3xl border border-border bg-background p-4">

                          <div className="mb-2 flex items-center justify-between gap-3">
                            <p className="font-semibold text-foreground">{ticket.ticket}</p>
                            <Badge
                              variant={ticket.priority === 'Critical' ? 'destructive' : 'warning'}>

                              {ticket.priority}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-foreground">{ticket.merchant}</p>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">{ticket.issue}</p>
                          <p className="mt-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                            Owner: {ticket.owner}
                          </p>
                        </motion.div>
                    )}

                      <Button className="w-full" variant="outline">
                        <Headset className="mr-2 h-4 w-4" />
                        Open support cases
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <motion.div whileHover={{ y: -2 }}>
                <Card>
                  <CardHeader className="gap-4 border-b border-border">
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                      <div>
                        <CardTitle>Store health board</CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Search stores and identify accounts that need action.
                        </p>
                      </div>
                      <div className="relative w-full lg:w-80">
                        <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9"
                          placeholder="Search merchant, store, or issue" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="overflow-x-auto rounded-3xl border border-border">
                      <table className="w-full min-w-[860px] text-left text-sm">
                        <thead className="bg-muted/50 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          <tr>
                            <th className="px-4 py-3 font-medium">Store</th>
                            <th className="px-4 py-3 font-medium">Owner</th>
                            <th className="px-4 py-3 font-medium">Plan</th>
                            <th className="px-4 py-3 font-medium">Products</th>
                            <th className="px-4 py-3 font-medium">Revenue</th>
                            <th className="px-4 py-3 font-medium">Health</th>
                            <th className="px-4 py-3 font-medium">Issue</th>
                            <th className="px-4 py-3 font-medium">Created</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {visibleStores.map((store) =>
                        <motion.tr
                          key={store.id}
                          initial={{
                            opacity: 0,
                            y: 12
                          }}
                          animate={{
                            opacity: 1,
                            y: 0
                          }}
                          className="bg-background transition-colors hover:bg-muted/20">

                              <td className="px-4 py-4 font-semibold text-foreground">{store.name}</td>
                              <td className="px-4 py-4">{store.owner}</td>
                              <td className="px-4 py-4">
                                <Badge variant="outline">{store.plan}</Badge>
                              </td>
                              <td className="px-4 py-4">{store.products}</td>
                              <td className="px-4 py-4 font-medium">{store.revenue}</td>
                              <td className="px-4 py-4">
                                {store.health === 'Healthy' &&
                            <span className="inline-flex items-center text-emerald-600">
                                    <CheckCircle2 className="mr-1 h-4 w-4" />
                                    Healthy
                                  </span>
                            }
                                {store.health === 'Needs Review' &&
                            <span className="inline-flex items-center text-amber-600">
                                    <Activity className="mr-1 h-4 w-4" />
                                    Needs Review
                                  </span>
                            }
                                {store.health === 'Suspended' &&
                            <span className="inline-flex items-center text-red-600">
                                    <XCircle className="mr-1 h-4 w-4" />
                                    Suspended
                                  </span>
                            }
                              </td>
                              <td className="px-4 py-4 text-muted-foreground">{store.issue}</td>
                              <td className="px-4 py-4 text-muted-foreground">{store.created}</td>
                            </motion.tr>
                        )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          }
        </AnimatePresence>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <motion.div whileHover={{ y: -3 }}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{value}</div>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
