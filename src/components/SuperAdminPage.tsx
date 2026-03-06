import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import {
  Store,
  Users,
  CreditCard,
  Activity,
  Search,
  MoreHorizontal,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  ArrowLeft } from
'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer } from
'recharts';
import type { PageType } from '../App';
interface SuperAdminPageProps {
  navigate: (page: PageType) => void;
}
export function SuperAdminPage({ navigate }: SuperAdminPageProps) {
  const [activeTab, setActiveTab] = useState('stores');
  const platformStats = [
  {
    title: 'Total Stores',
    value: '156',
    icon: <Store className="h-4 w-4 text-muted-foreground" />
  },
  {
    title: 'Active Stores',
    value: '89',
    icon: <Activity className="h-4 w-4 text-emerald-500" />
  },
  {
    title: 'Total Revenue',
    value: 'KES 2.4M',
    icon: <CreditCard className="h-4 w-4 text-muted-foreground" />
  },
  {
    title: 'MRR',
    value: 'KES 890K',
    icon: <Users className="h-4 w-4 text-primary" />
  }];

  const mockStores = [
  {
    id: 1,
    name: 'Mama Mboga Store',
    owner: 'James K.',
    plan: 'Free',
    products: 15,
    revenue: 'KES 125K',
    status: 'Active',
    date: 'Oct 12, 2023'
  },
  {
    id: 2,
    name: 'Shiku Styles',
    owner: 'Wanjiku N.',
    plan: 'Pro',
    products: 450,
    revenue: 'KES 850K',
    status: 'Active',
    date: 'Sep 05, 2023'
  },
  {
    id: 3,
    name: 'Lake View Electronics',
    owner: 'Ochieng O.',
    plan: 'Basic',
    products: 120,
    revenue: 'KES 420K',
    status: 'Active',
    date: 'Oct 01, 2023'
  },
  {
    id: 4,
    name: 'Amina Beauty',
    owner: 'Amina Y.',
    plan: 'Basic',
    products: 85,
    revenue: 'KES 210K',
    status: 'Active',
    date: 'Aug 15, 2023'
  },
  {
    id: 5,
    name: 'Nairobi Sneakers',
    owner: 'Kevin M.',
    plan: 'Free',
    products: 20,
    revenue: 'KES 45K',
    status: 'Suspended',
    date: 'Oct 20, 2023'
  },
  {
    id: 6,
    name: 'Organic Honey KE',
    owner: 'Sarah K.',
    plan: 'Pro',
    products: 12,
    revenue: 'KES 310K',
    status: 'Active',
    date: 'Jul 10, 2023'
  },
  {
    id: 7,
    name: 'Maasai Crafts',
    owner: 'Daniel L.',
    plan: 'Free',
    products: 8,
    revenue: 'KES 12K',
    status: 'Active',
    date: 'Oct 25, 2023'
  },
  {
    id: 8,
    name: 'Tech Gadgets',
    owner: 'Peter W.',
    plan: 'Basic',
    products: 195,
    revenue: 'KES 0',
    status: 'Suspended',
    date: 'Sep 28, 2023'
  }];

  const supportTickets = [
  {
    id: '#TK-092',
    store: 'Amina Beauty',
    subject: 'Custom domain SSL issue',
    status: 'Open',
    priority: 'High'
  },
  {
    id: '#TK-091',
    store: 'Tech Gadgets',
    subject: 'Account suspension appeal',
    status: 'Open',
    priority: 'High'
  },
  {
    id: '#TK-090',
    store: 'Mama Mboga Store',
    subject: 'How to add variants?',
    status: 'Resolved',
    priority: 'Low'
  },
  {
    id: '#TK-089',
    store: 'Shiku Styles',
    subject: 'M-Pesa Daraja API error',
    status: 'In Progress',
    priority: 'Critical'
  },
  {
    id: '#TK-088',
    store: 'Maasai Crafts',
    subject: 'Billing question',
    status: 'Resolved',
    priority: 'Medium'
  }];

  const revenueData = [
  {
    name: 'May',
    revenue: 450000
  },
  {
    name: 'Jun',
    revenue: 520000
  },
  {
    name: 'Jul',
    revenue: 610000
  },
  {
    name: 'Aug',
    revenue: 750000
  },
  {
    name: 'Sep',
    revenue: 820000
  },
  {
    name: 'Oct',
    revenue: 890000
  }];

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Admin Header */}
      <header className="bg-slate-900 text-slate-50 py-4 px-6 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">
                FEZZY Super Admin
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Platform Management Console
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-slate-300 hover:text-white hover:bg-slate-800"
              onClick={() => navigate('dashboard')}>

              <ArrowLeft className="h-4 w-4 mr-2" /> Exit Admin
            </Button>
            <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-medium">
              AD
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {platformStats.map((stat, i) =>
          <Card key={i}>
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
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content Area */}
        <Card>
          <CardHeader className="border-b border-border pb-0">
            <div className="flex space-x-6">
              {['stores', 'revenue', 'support', 'plans'].map((tab) =>
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>

                  {tab}
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Stores Tab */}
            {activeTab === 'stores' &&
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="relative w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                    placeholder="Search stores, owners..."
                    className="pl-9" />

                  </div>
                  <Button variant="outline">Export List</Button>
                </div>

                <div className="overflow-x-auto border border-border rounded-lg">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 font-medium">Store Name</th>
                        <th className="px-4 py-3 font-medium">Owner</th>
                        <th className="px-4 py-3 font-medium">Plan</th>
                        <th className="px-4 py-3 font-medium">Products</th>
                        <th className="px-4 py-3 font-medium">GMV</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Created</th>
                        <th className="px-4 py-3 font-medium text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {mockStores.map((store) =>
                    <tr key={store.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3 font-medium text-foreground">
                            {store.name}
                          </td>
                          <td className="px-4 py-3">{store.owner}</td>
                          <td className="px-4 py-3">
                            <Badge
                          variant={
                          store.plan === 'Pro' ?
                          'default' :
                          store.plan === 'Basic' ?
                          'secondary' :
                          'outline'
                          }>

                              {store.plan}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">{store.products}</td>
                          <td className="px-4 py-3 font-medium">
                            {store.revenue}
                          </td>
                          <td className="px-4 py-3">
                            {store.status === 'Active' ?
                        <span className="flex items-center text-emerald-600 text-xs font-medium">
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                              </span> :

                        <span className="flex items-center text-destructive text-xs font-medium">
                                <XCircle className="h-3 w-3 mr-1" /> Suspended
                              </span>
                        }
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {store.date}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8">

                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                    )}
                    </tbody>
                  </table>
                </div>
              </div>
            }

            {/* Revenue Tab */}
            {activeTab === 'revenue' &&
            <div className="space-y-6">
                <h3 className="text-lg font-medium text-foreground">
                  Platform MRR Growth
                </h3>
                <div className="h-[400px] w-full border border-border rounded-lg p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))" />

                      <XAxis
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))" />

                      <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(val) => `K ${val / 1000}k`} />

                      <Tooltip
                      cursor={{
                        fill: 'hsl(var(--muted))'
                      }} />

                      <Bar
                      dataKey="revenue"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]} />

                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            }

            {/* Support Tab */}
            {activeTab === 'support' &&
            <div className="space-y-4">
                <div className="overflow-x-auto border border-border rounded-lg">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 font-medium">Ticket ID</th>
                        <th className="px-4 py-3 font-medium">Store</th>
                        <th className="px-4 py-3 font-medium">Subject</th>
                        <th className="px-4 py-3 font-medium">Priority</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium text-right">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {supportTickets.map((ticket, i) =>
                    <tr key={i} className="hover:bg-muted/30">
                          <td className="px-4 py-3 font-medium">{ticket.id}</td>
                          <td className="px-4 py-3">{ticket.store}</td>
                          <td className="px-4 py-3">{ticket.subject}</td>
                          <td className="px-4 py-3">
                            <Badge
                          variant="outline"
                          className={
                          ticket.priority === 'Critical' ?
                          'border-red-200 text-red-700 bg-red-50' :
                          ticket.priority === 'High' ?
                          'border-orange-200 text-orange-700 bg-orange-50' :
                          'border-blue-200 text-blue-700 bg-blue-50'
                          }>

                              {ticket.priority}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                          variant="secondary"
                          className={
                          ticket.status === 'Resolved' ?
                          'bg-emerald-100 text-emerald-800' :
                          ''
                          }>

                              {ticket.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                          </td>
                        </tr>
                    )}
                    </tbody>
                  </table>
                </div>
              </div>
            }

            {/* Plans Tab */}
            {activeTab === 'plans' &&
            <div className="grid md:grid-cols-3 gap-6">
                {['Free', 'Basic', 'Pro'].map((plan) =>
              <Card key={plan} className="border-border">
                    <CardHeader>
                      <CardTitle>{plan} Plan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">
                          Price (KES)
                        </label>
                        <Input
                      defaultValue={
                      plan === 'Free' ?
                      '0' :
                      plan === 'Basic' ?
                      '2500' :
                      '7500'
                      } />

                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">
                          Product Limit
                        </label>
                        <Input
                      defaultValue={
                      plan === 'Free' ?
                      '20' :
                      plan === 'Basic' ?
                      '200' :
                      'Unlimited'
                      } />

                      </div>
                      <Button className="w-full mt-4" variant="secondary">
                        Update Plan
                      </Button>
                    </CardContent>
                  </Card>
              )}
              </div>
            }
          </CardContent>
        </Card>
      </main>
    </div>);

}