import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend } from
'recharts';
import {
  Download,
  Calendar,
  TrendingUp,
  Users,
  ShoppingBag,
  CreditCard } from
'lucide-react';
export function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('This Month');
  // Mock Data for Charts
  const revenueData = [
  {
    name: '1 Oct',
    total: 12000
  },
  {
    name: '5 Oct',
    total: 18000
  },
  {
    name: '10 Oct',
    total: 15000
  },
  {
    name: '15 Oct',
    total: 25000
  },
  {
    name: '20 Oct',
    total: 22000
  },
  {
    name: '25 Oct',
    total: 30000
  },
  {
    name: '30 Oct',
    total: 28000
  }];

  const ordersData = [
  {
    name: 'Mon',
    orders: 12
  },
  {
    name: 'Tue',
    orders: 19
  },
  {
    name: 'Wed',
    orders: 15
  },
  {
    name: 'Thu',
    orders: 22
  },
  {
    name: 'Fri',
    orders: 28
  },
  {
    name: 'Sat',
    orders: 35
  },
  {
    name: 'Sun',
    orders: 30
  }];

  const paymentData = [
  {
    name: 'M-Pesa',
    value: 65,
    color: '#10b981'
  },
  {
    name: 'Card',
    value: 25,
    color: '#3b82f6'
  },
  {
    name: 'Bank Transfer',
    value: 10,
    color: '#64748b'
  } // slate-500
  ];
  const topProducts = [
  {
    name: 'Premium Kikoy Fabric',
    sales: 145,
    revenue: 'KES 217,500',
    progress: 85
  },
  {
    name: 'Kenyan AA Coffee Beans',
    sales: 112,
    revenue: 'KES 201,600',
    progress: 65
  },
  {
    name: 'Handmade Maasai Necklace',
    sales: 89,
    revenue: 'KES 195,800',
    progress: 50
  },
  {
    name: 'Leather Sandals (Akala)',
    sales: 64,
    revenue: 'KES 76,800',
    progress: 35
  },
  {
    name: 'Woven Sisal Basket',
    sales: 42,
    revenue: 'KES 117,600',
    progress: 25
  }];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
          <p className="font-medium text-foreground mb-1">{label}</p>
          <p className="text-primary font-bold">
            {payload[0].name === 'total' ? 'KES ' : ''}
            {payload[0].value.toLocaleString()}
            {payload[0].name === 'orders' ? ' Orders' : ''}
          </p>
        </div>);

    }
    return null;
  };
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your store's performance and growth.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-muted p-1 rounded-lg">
            {['This Week', 'This Month', 'This Year'].map((range) =>
            <button
              key={range}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${dateRange === range ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setDateRange(range)}>

                {range}
              </button>
            )}
          </div>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              KES 150,000
            </div>
            <p className="text-xs text-emerald-500 mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">161</div>
            <p className="text-xs text-emerald-500 mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> +15% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversion Rate
            </CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">3.2%</div>
            <p className="text-xs text-emerald-500 mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> +0.4% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Order Value
            </CardTitle>
            <CreditCard className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">KES 931</div>
            <p className="text-xs text-amber-500 mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 rotate-180" /> -2% from last
              month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0
                  }}>

                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0.3} />

                      <stop
                        offset="95%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0} />

                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))" />

                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false} />

                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `K ${value / 1000}k`} />

                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTotal)" />

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
                <BarChart
                  data={ordersData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0
                  }}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))" />

                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false} />

                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false} />

                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{
                      fill: 'hsl(var(--muted))'
                    }} />

                  <Bar
                    dataKey="orders"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]} />

                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {topProducts.map((product, i) =>
              <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">
                      {product.name}
                    </span>
                    <span className="text-muted-foreground">
                      {product.sales} sales ({product.revenue})
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{
                      width: `${product.progress}%`
                    }} />

                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Sales by Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value">

                    {paymentData.map((entry, index) =>
                    <Cell key={`cell-${index}`} fill={entry.color} />
                    )}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    itemStyle={{
                      color: 'hsl(var(--foreground))'
                    }} />

                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              M-Pesa remains your most popular payment method, accounting for
              65% of all transactions.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>);

}