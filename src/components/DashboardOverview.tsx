import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Eye,
  LayoutTemplate,
  LoaderCircle,
  Package,
  Plus,
  Share2,
  ShoppingBag,
  TrendingUp,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { PageType, SessionUser } from '../App';
import { supabase } from '../contexts/supabaseClient';
import { formatCurrency, formatDateTime, getCurrentStoreForUser } from '../lib/store';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

interface DashboardOverviewProps {
  navigate: (page: PageType) => void;
  currentUser: SessionUser;
}

type DashboardOrder = {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  placed_at: string;
  customers?: { full_name: string } | null;
};

export function DashboardOverview({ navigate, currentUser }: DashboardOverviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [storeName, setStoreName] = useState(currentUser.storeName || 'Your Store');
  const [currencyCode, setCurrencyCode] = useState('KES');
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    products: 0,
    visits: 0
  });
  const [recentOrders, setRecentOrders] = useState<DashboardOrder[]>([]);
  const [alerts, setAlerts] = useState<Array<{ id: string; title: string; body: string }>>([]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');

      try {
        const store = await getCurrentStoreForUser(currentUser);

        if (!store) {
          setRecentOrders([]);
          setAlerts([]);
          return;
        }

        setStoreName(store.name);
        setCurrencyCode(store.currency_code);

        const [productsResult, ordersResult] = await Promise.all([
          supabase
            .from('products')
            .select('id, stock_quantity, low_stock_threshold', { count: 'exact' })
            .eq('store_id', store.id),
          supabase
            .from('orders')
            .select('id, order_number, total_amount, status, placed_at, customers(full_name)', {
              count: 'exact'
            })
            .eq('store_id', store.id)
            .order('placed_at', { ascending: false })
            .limit(5)
        ]);

        if (productsResult.error) {
          throw productsResult.error;
        }

        if (ordersResult.error) {
          throw ordersResult.error;
        }

        const productRows = productsResult.data ?? [];
        const orderRows = (ordersResult.data ?? []) as DashboardOrder[];

        const lowStock = productRows.filter(
          (product) => product.stock_quantity <= Math.max(product.low_stock_threshold ?? 0, 1)
        );

        const revenue = orderRows.reduce((sum, order) => sum + (order.total_amount ?? 0), 0);

        setStats({
          revenue,
          orders: ordersResult.count ?? orderRows.length,
          products: productsResult.count ?? productRows.length,
          visits: 0
        });
        setRecentOrders(orderRows);
        setAlerts([
          ...lowStock.slice(0, 2).map((product) => ({
            id: product.id,
            title: 'Low Stock Alert',
            body: 'One of your products needs restocking soon.'
          })),
          {
            id: 'settings-link',
            title: 'Review Store Settings',
            body: 'Check your payment and domain settings before publishing updates.'
          }
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [currentUser]);

  const greetingName = useMemo(
    () => currentUser.name.split(' ')[0] || 'there',
    [currentUser.name]
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 py-16 text-muted-foreground">
        <LoaderCircle className="h-5 w-5 animate-spin" />
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {greetingName}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with {storeName} today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('store-builder')}>
            <LayoutTemplate className="mr-2 h-4 w-4" /> Build Website
          </Button>
          <Button variant="outline" onClick={() => navigate('live-store')}>
            <Eye className="mr-2 h-4 w-4" /> View Store
          </Button>
          <Button variant="outline" onClick={() => navigate('products')}>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      <Card className="border-primary/20 bg-gradient-to-r from-orange-50 via-white to-amber-50">
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
              Website Builder
            </p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">
              Shape your online store visually
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Open the builder to customize the homepage, upload store photos, refine contact and
              shipping details, and generate a first website draft with the AI assistant.
            </p>
          </div>
          <Button onClick={() => navigate('store-builder')}>
            <LayoutTemplate className="mr-2 h-4 w-4" /> Open Website Builder
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: 'Total Revenue',
            value: formatCurrency(stats.revenue, currencyCode),
            trend: 'Based on latest orders',
            icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />
          },
          {
            title: 'Total Orders',
            value: String(stats.orders),
            trend: 'Synced from order records',
            icon: <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          },
          {
            title: 'Products',
            value: String(stats.products),
            trend: 'Active catalog rows',
            icon: <Package className="h-4 w-4 text-muted-foreground" />
          },
          {
            title: 'Store Visits',
            value: stats.visits ? String(stats.visits) : 'No data yet',
            trend: 'Add analytics events later',
            icon: <Users className="h-4 w-4 text-muted-foreground" />
          }
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs mt-1 text-muted-foreground">{stat.trend}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ActionCard icon={<Plus className="h-6 w-6" />} label="Add Product" onClick={() => navigate('products')} />
          <ActionCard icon={<ShoppingBag className="h-6 w-6" />} label="View Orders" onClick={() => navigate('orders')} />
          <ActionCard icon={<LayoutTemplate className="h-6 w-6" />} label="Build Website" onClick={() => navigate('store-builder')} />
          <ActionCard icon={<Share2 className="h-6 w-6" />} label="Share Store" onClick={() => navigate('live-store')} />
        </div>
      </motion.div>

      <motion.div
        className="grid gap-4 md:grid-cols-7"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <Card className="md:col-span-5">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Latest orders synced from the database.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('orders')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                No orders have been placed yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 font-medium rounded-tl-md">Order ID</th>
                      <th className="px-4 py-3 font-medium">Customer</th>
                      <th className="px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium rounded-tr-md">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">
                          {order.order_number}
                        </td>
                        <td className="px-4 py-3">{order.customers?.full_name ?? 'Guest'}</td>
                        <td className="px-4 py-3 font-medium">
                          {formatCurrency(order.total_amount, currencyCode)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDateTime(order.placed_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.length === 0 ? (
              <div className="text-sm text-muted-foreground">No alerts right now.</div>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className="p-3 border rounded-lg bg-muted/20">
                  <p className="text-sm font-medium text-foreground">{alert.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.body}</p>
                  {alert.id === 'settings-link' && (
                    <Button
                      size="sm"
                      className="h-7 text-xs mt-3 w-full"
                      onClick={() => navigate('settings')}
                    >
                      Go to Settings
                    </Button>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function ActionCard({
  icon,
  label,
  onClick
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Card className="hover:bg-muted/50 transition-colors cursor-pointer border-dashed" onClick={onClick}>
      <CardContent className="flex flex-col items-center justify-center py-6 gap-2">
        <div className="p-3 bg-primary/10 rounded-full text-primary">{icon}</div>
        <span className="font-medium text-sm">{label}</span>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'paid') {
    return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none">Paid</Badge>;
  }
  if (status === 'pending') {
    return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-none">Pending</Badge>;
  }
  if (status === 'shipped') {
    return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-none">Shipped</Badge>;
  }
  if (status === 'delivered') {
    return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">Delivered</Badge>;
  }
  return <Badge variant="outline">{status}</Badge>;
}
