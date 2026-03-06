import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  Plus,
  Eye,
  LayoutTemplate,
  Share2,
  AlertCircle } from
'lucide-react';
import { motion } from 'framer-motion';
import type { PageType } from '../App';
interface DashboardOverviewProps {
  navigate: (page: PageType) => void;
}
export function DashboardOverview({ navigate }: DashboardOverviewProps) {
  const stats = [
  {
    title: 'Total Revenue',
    value: 'KES 125,400',
    trend: '+12.5%',
    icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
    positive: true
  },
  {
    title: 'Total Orders',
    value: '48',
    trend: '+8 this week',
    icon: <ShoppingBag className="h-4 w-4 text-muted-foreground" />,
    positive: true
  },
  {
    title: 'Products',
    value: '35',
    trend: '3 low stock',
    icon: <Package className="h-4 w-4 text-muted-foreground" />,
    positive: false
  },
  {
    title: 'Store Visits',
    value: '1,240',
    trend: '+22%',
    icon: <Users className="h-4 w-4 text-muted-foreground" />,
    positive: true
  }];

  const recentOrders = [
  {
    id: '#FZ-1005',
    customer: 'Wanjiku Njoroge',
    amount: 'KES 4,500',
    status: 'Paid',
    date: 'Today, 10:42 AM'
  },
  {
    id: '#FZ-1004',
    customer: 'Ochieng Odhiambo',
    amount: 'KES 12,000',
    status: 'Pending',
    date: 'Today, 09:15 AM'
  },
  {
    id: '#FZ-1003',
    customer: 'Amina Yusuf',
    amount: 'KES 2,800',
    status: 'Shipped',
    date: 'Yesterday'
  },
  {
    id: '#FZ-1002',
    customer: 'Kevin Mutua',
    amount: 'KES 8,500',
    status: 'Delivered',
    date: 'Oct 24, 2023'
  },
  {
    id: '#FZ-1001',
    customer: 'Sarah Kamau',
    amount: 'KES 1,200',
    status: 'Delivered',
    date: 'Oct 23, 2023'
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
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Good morning, James! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your store today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('store-builder')}>
            <Eye className="mr-2 h-4 w-4" /> View Store
          </Button>
          <Button onClick={() => navigate('products')}>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) =>
        <motion.div
          key={i}
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            duration: 0.3,
            delay: i * 0.1
          }}>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
                <p
                className={`text-xs mt-1 ${stat.positive ? 'text-emerald-500' : 'text-amber-500'}`}>

                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{
          opacity: 0,
          y: 20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        transition={{
          duration: 0.3,
          delay: 0.4
        }}>

        <h2 className="text-lg font-semibold text-foreground mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card
            className="hover:bg-muted/50 transition-colors cursor-pointer border-dashed"
            onClick={() => navigate('products')}>

            <CardContent className="flex flex-col items-center justify-center py-6 gap-2">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <Plus className="h-6 w-6" />
              </div>
              <span className="font-medium text-sm">Add Product</span>
            </CardContent>
          </Card>
          <Card
            className="hover:bg-muted/50 transition-colors cursor-pointer border-dashed"
            onClick={() => navigate('orders')}>

            <CardContent className="flex flex-col items-center justify-center py-6 gap-2">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <span className="font-medium text-sm">View Orders</span>
            </CardContent>
          </Card>
          <Card
            className="hover:bg-muted/50 transition-colors cursor-pointer border-dashed"
            onClick={() => navigate('store-builder')}>

            <CardContent className="flex flex-col items-center justify-center py-6 gap-2">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <LayoutTemplate className="h-6 w-6" />
              </div>
              <span className="font-medium text-sm">Customize Store</span>
            </CardContent>
          </Card>
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-6 gap-2">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <Share2 className="h-6 w-6" />
              </div>
              <span className="font-medium text-sm">Share Store</span>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      <motion.div
        className="grid gap-4 md:grid-cols-7"
        initial={{
          opacity: 0,
          y: 20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        transition={{
          duration: 0.3,
          delay: 0.5
        }}>

        {/* Recent Orders */}
        <Card className="md:col-span-5">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                You have 5 new orders today.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('orders')}>

              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 font-medium rounded-tl-md">
                      Order ID
                    </th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium rounded-tr-md">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentOrders.map((order, i) =>
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">
                        {order.id}
                      </td>
                      <td className="px-4 py-3">{order.customer}</td>
                      <td className="px-4 py-3 font-medium">{order.amount}</td>
                      <td className="px-4 py-3">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {order.date}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3">
              <div className="p-3 border border-amber-200 bg-amber-50 rounded-lg">
                <p className="text-sm font-medium text-amber-800">
                  Low Stock: Kikoy Fabric
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-amber-600">Only 2 left</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs border-amber-300 text-amber-700 hover:bg-amber-100">

                    Restock
                  </Button>
                </div>
              </div>
              <div className="p-3 border border-amber-200 bg-amber-50 rounded-lg">
                <p className="text-sm font-medium text-amber-800">
                  Low Stock: Maasai Beads
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-amber-600">
                    0 left (Out of stock)
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs border-amber-300 text-amber-700 hover:bg-amber-100">

                    Restock
                  </Button>
                </div>
              </div>
              <div className="p-3 border border-blue-200 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800">
                  Complete Setup
                </p>
                <p className="text-xs text-blue-600 mt-1 mb-2">
                  Connect your custom domain to build trust.
                </p>
                <Button
                  size="sm"
                  className="h-7 text-xs w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => navigate('settings')}>

                  Go to Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>);

}