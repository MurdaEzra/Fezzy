import React, { Fragment, useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  CreditCard,
  Download,
  LoaderCircle,
  MapPin,
  MessageCircle,
  Package,
  Search
} from 'lucide-react';
import type { SessionUser } from '../App';
import { supabase } from '../contexts/supabaseClient';
import { formatCurrency, formatDateTime, getCurrentStoreForUser } from '../lib/store';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Input } from './ui/Input';

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  fulfillment_status: string;
  payment_method: string | null;
  subtotal: number;
  shipping_amount: number;
  total_amount: number;
  currency_code: string;
  placed_at: string;
  customers?: {
    full_name: string;
    phone: string | null;
    email: string | null;
  } | null;
  customer_addresses?: {
    line1: string;
    city: string | null;
    region: string | null;
  } | null;
  order_items?: Array<{
    product_name: string;
    quantity: number;
  }>;
};

interface OrdersPageProps {
  currentUser: SessionUser;
}

export function OrdersPage({ currentUser }: OrdersPageProps) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currencyCode, setCurrencyCode] = useState('KES');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');

      try {
        const store = await getCurrentStoreForUser(currentUser);

        if (!store) {
          setOrders([]);
          return;
        }

        setCurrencyCode(store.currency_code);

        const { data, error: ordersError } = await supabase
          .from('orders')
          .select(
            'id, order_number, status, payment_status, fulfillment_status, payment_method, subtotal, shipping_amount, total_amount, currency_code, placed_at, customers(full_name, phone, email), customer_addresses(line1, city, region), order_items(product_name, quantity)'
          )
          .eq('store_id', store.id)
          .order('placed_at', { ascending: false });

        if (ordersError) {
          throw ordersError;
        }

        setOrders((data ?? []) as OrderRow[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orders.');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [currentUser]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return orders;
    }

    return orders.filter((order) =>
      `${order.order_number} ${order.customers?.full_name ?? ''} ${order.payment_method ?? ''}`
        .toLowerCase()
        .includes(query)
    );
  }, [orders, search]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Orders</h1>
          <p className="text-muted-foreground mt-1">
            Manage and fulfill your customer orders from Supabase.
          </p>
        </div>
        <Button variant="outline" disabled>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card>
        <CardHeader className="pb-0">
          <div className="flex flex-col sm:flex-row gap-4 justify-between mb-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by order ID, customer..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground flex items-center">
              {filteredOrders.length} order{filteredOrders.length === 1 ? '' : 's'}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="flex items-center gap-3 py-16 text-muted-foreground">
              <LoaderCircle className="h-5 w-5 animate-spin" />
              Loading orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              No orders found yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-4 py-4 font-medium rounded-tl-md w-8"></th>
                    <th className="px-4 py-4 font-medium">Order ID</th>
                    <th className="px-4 py-4 font-medium">Customer</th>
                    <th className="px-4 py-4 font-medium">Items</th>
                    <th className="px-4 py-4 font-medium">Total</th>
                    <th className="px-4 py-4 font-medium">Payment</th>
                    <th className="px-4 py-4 font-medium">Status</th>
                    <th className="px-4 py-4 font-medium rounded-tr-md">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredOrders.map((order) => (
                    <Fragment key={order.id}>
                      <tr
                        className={`hover:bg-muted/30 transition-colors cursor-pointer ${
                          expandedOrder === order.id ? 'bg-muted/30' : ''
                        }`}
                        onClick={() =>
                          setExpandedOrder((current) => (current === order.id ? null : order.id))
                        }
                      >
                        <td className="px-4 py-4 text-muted-foreground">
                          {expandedOrder === order.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </td>
                        <td className="px-4 py-4 font-medium text-foreground">
                          {order.order_number}
                        </td>
                        <td className="px-4 py-4">{order.customers?.full_name ?? 'Guest'}</td>
                        <td className="px-4 py-4">{order.order_items?.length ?? 0} items</td>
                        <td className="px-4 py-4 font-medium">
                          {formatCurrency(order.total_amount, order.currency_code)}
                        </td>
                        <td className="px-4 py-4 capitalize">{order.payment_method ?? 'N/A'}</td>
                        <td className="px-4 py-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">
                          {formatDateTime(order.placed_at)}
                        </td>
                      </tr>

                      {expandedOrder === order.id && (
                        <tr className="bg-muted/10 border-b border-border">
                          <td colSpan={8} className="p-0">
                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="space-y-3">
                                <h4 className="font-semibold flex items-center gap-2 text-foreground">
                                  <Package className="h-4 w-4 text-muted-foreground" />
                                  Order Items
                                </h4>
                                <ul className="space-y-2 text-sm">
                                  {(order.order_items ?? []).map((item, idx) => (
                                    <li
                                      key={`${order.id}-${idx}`}
                                      className="flex items-start gap-2 text-muted-foreground"
                                    >
                                      <div className="h-1.5 w-1.5 rounded-full bg-primary/50 mt-1.5 flex-shrink-0"></div>
                                      {item.product_name} x{item.quantity}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="space-y-3">
                                <h4 className="font-semibold flex items-center gap-2 text-foreground">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  Shipping Details
                                </h4>
                                <div className="text-sm text-muted-foreground space-y-1">
                                  <p className="font-medium text-foreground">
                                    {order.customers?.full_name ?? 'Guest'}
                                  </p>
                                  <p>
                                    {[
                                      order.customer_addresses?.line1,
                                      order.customer_addresses?.city,
                                      order.customer_addresses?.region
                                    ]
                                      .filter(Boolean)
                                      .join(', ') || 'No address provided'}
                                  </p>
                                  <p>{order.customers?.phone ?? order.customers?.email ?? 'N/A'}</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="mt-2 w-full sm:w-auto"
                                  disabled
                                >
                                  <MessageCircle className="mr-2 h-4 w-4" />
                                  Send Update
                                </Button>
                              </div>

                              <div className="space-y-3">
                                <h4 className="font-semibold flex items-center gap-2 text-foreground">
                                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                                  Payment Summary
                                </h4>
                                <div className="text-sm space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{formatCurrency(order.subtotal, currencyCode)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>{formatCurrency(order.shipping_amount, currencyCode)}</span>
                                  </div>
                                  <div className="flex justify-between font-bold text-foreground pt-2 border-t border-border">
                                    <span>Total</span>
                                    <span>{formatCurrency(order.total_amount, currencyCode)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
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
