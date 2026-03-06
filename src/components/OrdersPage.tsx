import React, { useState, Fragment } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import {
  Search,
  Filter,
  Download,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  CreditCard,
  Package } from
'lucide-react';
export function OrdersPage() {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const mockOrders = [
  {
    id: '#FZ-1005',
    customer: 'Wanjiku Njoroge',
    items: 3,
    total: 'KES 4,500',
    payment: 'M-Pesa',
    status: 'Paid',
    date: 'Today, 10:42 AM',
    details: {
      phone: '+254 712 345 678',
      address: 'Westlands, Nairobi',
      itemsList: ['Premium Kikoy Fabric x2', 'Handmade Maasai Necklace x1']
    }
  },
  {
    id: '#FZ-1004',
    customer: 'Ochieng Odhiambo',
    items: 1,
    total: 'KES 12,000',
    payment: 'Card',
    status: 'Pending',
    date: 'Today, 09:15 AM',
    details: {
      phone: '+254 723 456 789',
      address: 'Kisumu CBD',
      itemsList: ['Carved Wooden Elephant x1']
    }
  },
  {
    id: '#FZ-1003',
    customer: 'Amina Yusuf',
    items: 2,
    total: 'KES 2,800',
    payment: 'M-Pesa',
    status: 'Shipped',
    date: 'Yesterday, 14:30 PM',
    details: {
      phone: '+254 734 567 890',
      address: 'Nyali, Mombasa',
      itemsList: ['Organic Macadamia Nuts x2']
    }
  },
  {
    id: '#FZ-1002',
    customer: 'Kevin Mutua',
    items: 5,
    total: 'KES 8,500',
    payment: 'Bank Transfer',
    status: 'Delivered',
    date: 'Oct 24, 2023',
    details: {
      phone: '+254 745 678 901',
      address: 'Machakos Town',
      itemsList: [
      'Kitenge Print Dress x1',
      'Leather Sandals x2',
      'Woven Sisal Basket x2']

    }
  },
  {
    id: '#FZ-1001',
    customer: 'Sarah Kamau',
    items: 1,
    total: 'KES 1,200',
    payment: 'M-Pesa',
    status: 'Delivered',
    date: 'Oct 23, 2023',
    details: {
      phone: '+254 756 789 012',
      address: 'Thika Road, Nairobi',
      itemsList: ['Leather Sandals x1']
    }
  }];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none">
            Paid
          </Badge>);

      case 'Pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-none">
            Pending
          </Badge>);

      case 'Shipped':
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-none">
            Shipped
          </Badge>);

      case 'Delivered':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">
            Delivered
          </Badge>);

      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  const toggleOrder = (id: string) => {
    if (expandedOrder === id) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(id);
    }
  };
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Orders
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and fulfill your customer orders.
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <div className="flex flex-col sm:flex-row gap-4 justify-between mb-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by order ID, customer..."
                className="pl-9" />

            </div>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="mr-2 h-4 w-4" /> Filters
            </Button>
          </div>

          <div className="flex space-x-6 border-b border-border overflow-x-auto">
            {['All Orders', 'Pending', 'Paid', 'Shipped', 'Delivered'].map(
              (tab, i) =>
              <button
                key={i}
                className={`pb-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${i === 0 ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>

                  {tab}
                </button>

            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
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
                {mockOrders.map((order) =>
                <Fragment key={order.id}>
                    <tr
                    className={`hover:bg-muted/30 transition-colors cursor-pointer ${expandedOrder === order.id ? 'bg-muted/30' : ''}`}
                    onClick={() => toggleOrder(order.id)}>

                      <td className="px-4 py-4 text-muted-foreground">
                        {expandedOrder === order.id ?
                      <ChevronUp className="h-4 w-4" /> :

                      <ChevronDown className="h-4 w-4" />
                      }
                      </td>
                      <td className="px-4 py-4 font-medium text-foreground">
                        {order.id}
                      </td>
                      <td className="px-4 py-4">{order.customer}</td>
                      <td className="px-4 py-4">{order.items} items</td>
                      <td className="px-4 py-4 font-medium">{order.total}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          {order.payment === 'M-Pesa' &&
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        }
                          {order.payment === 'Card' &&
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        }
                          {order.payment === 'Bank Transfer' &&
                        <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                        }
                          {order.payment}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {order.date}
                      </td>
                    </tr>

                    {/* Expanded Row Details */}
                    {expandedOrder === order.id &&
                  <tr className="bg-muted/10 border-b border-border">
                        <td colSpan={8} className="p-0">
                          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-200">
                            {/* Order Items */}
                            <div className="space-y-3">
                              <h4 className="font-semibold flex items-center gap-2 text-foreground">
                                <Package className="h-4 w-4 text-muted-foreground" />{' '}
                                Order Items
                              </h4>
                              <ul className="space-y-2 text-sm">
                                {order.details.itemsList.map((item, idx) =>
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-muted-foreground">

                                    <div className="h-1.5 w-1.5 rounded-full bg-primary/50 mt-1.5 flex-shrink-0"></div>
                                    {item}
                                  </li>
                            )}
                              </ul>
                            </div>

                            {/* Customer Details */}
                            <div className="space-y-3">
                              <h4 className="font-semibold flex items-center gap-2 text-foreground">
                                <MapPin className="h-4 w-4 text-muted-foreground" />{' '}
                                Shipping Details
                              </h4>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <p className="font-medium text-foreground">
                                  {order.customer}
                                </p>
                                <p>{order.details.address}</p>
                                <p>{order.details.phone}</p>
                              </div>
                              <Button
                            size="sm"
                            variant="outline"
                            className="mt-2 w-full sm:w-auto border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800">

                                <MessageCircle className="mr-2 h-4 w-4 text-green-600" />{' '}
                                Send WhatsApp Update
                              </Button>
                            </div>

                            {/* Payment & Actions */}
                            <div className="space-y-3">
                              <h4 className="font-semibold flex items-center gap-2 text-foreground">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />{' '}
                                Payment & Actions
                              </h4>
                              <div className="text-sm space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Subtotal
                                  </span>
                                  <span>{order.total}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Shipping
                                  </span>
                                  <span>KES 300</span>
                                </div>
                                <div className="flex justify-between font-bold text-foreground pt-2 border-t border-border">
                                  <span>Total Paid</span>
                                  <span>
                                    KES{' '}
                                    {(
                                parseInt(order.total.replace(/\D/g, '')) +
                                300).
                                toLocaleString()}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                                <Button size="sm" className="flex-1">
                                  Mark as Shipped
                                </Button>
                                <Button
                              size="sm"
                              variant="outline"
                              className="flex-1">

                                  Print Invoice
                                </Button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                  }
                  </Fragment>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>);

}