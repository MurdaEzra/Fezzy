import React, { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { CreditCard, Download, LoaderCircle, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import type { SessionUser } from '../App';
import { supabase } from '../contexts/supabaseClient';
import { formatCurrency, getCurrentStoreForUser } from '../lib/store';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

interface AnalyticsPageProps {
  currentUser: SessionUser;
}

type OrderAnalyticsRow = {
  total_amount: number;
  payment_method: string | null;
  placed_at: string;
};

export function AnalyticsPage({ currentUser }: AnalyticsPageProps) {
  const [range, setRange] = useState<'This Week' | 'This Month' | 'This Year'>('This Month');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currencyCode, setCurrencyCode] = useState('KES');
  const [orders, setOrders] = useState<OrderAnalyticsRow[]>([]);
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');

      try {
        const store = await getCurrentStoreForUser(currentUser);

        if (!store) {
          setOrders([]);
          setProductCount(0);
          return;
        }

        setCurrencyCode(store.currency_code);

        const startDate = getStartDate(range);
        const [ordersResult, productsResult] = await Promise.all([
          supabase
            .from('orders')
            .select('total_amount, payment_method, placed_at')
            .eq('store_id', store.id)
            .gte('placed_at', startDate.toISOString())
            .order('placed_at', { ascending: true }),
          supabase.from('products').select('id', { count: 'exact', head: true }).eq('store_id', store.id)
        ]);

        if (ordersResult.error) {
          throw ordersResult.error;
        }

        if (productsResult.error) {
          throw productsResult.error;
        }

        setOrders((ordersResult.data ?? []) as OrderAnalyticsRow[]);
        setProductCount(productsResult.count ?? 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics.');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [currentUser, range]);

  const summary = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount ?? 0), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

    const revenueData = buildRevenueData(orders, range);
    const ordersData = buildOrdersByDay(orders);
    const paymentData = buildPaymentBreakdown(orders);

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      revenueData,
      ordersData,
      paymentData
    };
  }, [orders, range]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 py-16 text-muted-foreground">
        <LoaderCircle className="h-5 w-5 animate-spin" />
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track store performance from your live order data.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-muted p-1 rounded-lg">
            {(['This Week', 'This Month', 'This Year'] as const).map((item) => (
              <button
                key={item}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  range === item ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setRange(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <Button variant="outline" size="icon" disabled>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Revenue" value={formatCurrency(summary.totalRevenue, currencyCode)} icon={<TrendingUp className="h-4 w-4 text-emerald-500" />} />
        <MetricCard title="Total Orders" value={String(summary.totalOrders)} icon={<ShoppingBag className="h-4 w-4 text-blue-500" />} />
        <MetricCard title="Products" value={String(productCount)} icon={<Users className="h-4 w-4 text-purple-500" />} />
        <MetricCard title="Avg. Order Value" value={formatCurrency(summary.avgOrderValue, currencyCode)} icon={<CreditCard className="h-4 w-4 text-amber-500" />} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary.revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Orders by Day</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.ordersData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.paymentData.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              No payment data yet.
            </div>
          ) : (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={summary.paymentData} dataKey="value" nameKey="name" outerRadius={110} label>
                    {summary.paymentData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
      </CardContent>
    </Card>
  );
}

function getStartDate(range: 'This Week' | 'This Month' | 'This Year') {
  const now = new Date();

  if (range === 'This Week') {
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1;
    const start = new Date(now);
    start.setDate(now.getDate() - diff);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (range === 'This Year') {
    return new Date(now.getFullYear(), 0, 1);
  }

  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function buildRevenueData(orders: OrderAnalyticsRow[], range: 'This Week' | 'This Month' | 'This Year') {
  const grouped = new Map<string, number>();

  orders.forEach((order) => {
    const date = new Date(order.placed_at);
    const key =
      range === 'This Year' ?
        new Intl.DateTimeFormat('en-KE', { month: 'short' }).format(date) :
        new Intl.DateTimeFormat('en-KE', { month: 'short', day: 'numeric' }).format(date);
    grouped.set(key, (grouped.get(key) ?? 0) + (order.total_amount ?? 0));
  });

  return Array.from(grouped.entries()).map(([name, total]) => ({ name, total }));
}

function buildOrdersByDay(orders: OrderAnalyticsRow[]) {
  const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const grouped = new Map(names.map((name) => [name, 0]));

  orders.forEach((order) => {
    const day = new Date(order.placed_at).getDay();
    const normalized = names[(day + 6) % 7];
    grouped.set(normalized, (grouped.get(normalized) ?? 0) + 1);
  });

  return names.map((name) => ({ name, orders: grouped.get(name) ?? 0 }));
}

function buildPaymentBreakdown(orders: OrderAnalyticsRow[]) {
  const colors: Record<string, string> = {
    mpesa: '#10b981',
    card: '#3b82f6',
    bank_transfer: '#64748b',
    cash: '#f59e0b'
  };

  const grouped = new Map<string, number>();
  orders.forEach((order) => {
    const key = order.payment_method || 'unknown';
    grouped.set(key, (grouped.get(key) ?? 0) + 1);
  });

  return Array.from(grouped.entries()).map(([name, value]) => ({
    name: name.replace('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
    value,
    color: colors[name] ?? '#94a3b8'
  }));
}
