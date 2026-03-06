import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter } from
'./ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import {
  Store,
  Globe,
  CreditCard,
  ShieldCheck,
  Copy,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Building2 } from
'lucide-react';
export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [copied, setCopied] = useState(false);
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your store preferences, domains, and billing.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {[
          {
            id: 'general',
            label: 'General Details',
            icon: <Store className="h-4 w-4" />
          },
          {
            id: 'domain',
            label: 'Domains',
            icon: <Globe className="h-4 w-4" />
          },
          {
            id: 'payments',
            label: 'Payments',
            icon: <CreditCard className="h-4 w-4" />
          },
          {
            id: 'billing',
            label: 'Subscription',
            icon: <ShieldCheck className="h-4 w-4" />
          }].
          map((tab) =>
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>

              {tab.icon}
              {tab.label}
            </button>
          )}
        </div>

        {/* Settings Content */}
        <div className="flex-1 space-y-6">
          {/* General Tab */}
          {activeTab === 'general' &&
          <Card>
              <CardHeader>
                <CardTitle>Store Details</CardTitle>
                <CardDescription>
                  Basic information about your business.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Store Name
                  </label>
                  <Input defaultValue="Mama Mboga Store" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Store Description
                  </label>
                  <textarea
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  defaultValue="Fresh farm produce delivered to your doorstep in Nairobi." />

                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Contact Email
                    </label>
                    <Input type="email" defaultValue="hello@mamamboga.co.ke" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Phone Number
                    </label>
                    <Input type="tel" defaultValue="+254 712 345 678" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Business Address
                  </label>
                  <Input defaultValue="Westlands, Nairobi, Kenya" />
                </div>
              </CardContent>
              <CardFooter className="border-t border-border pt-6">
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          }

          {/* Domain Tab */}
          {activeTab === 'domain' &&
          <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>FEZZY Subdomain</CardTitle>
                  <CardDescription>
                    Your free default store address.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Input
                    readOnly
                    value="mamamboga.fezzy.com"
                    className="bg-muted/50 font-mono text-sm" />

                    <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy('mamamboga.fezzy.com')}>

                      {copied ?
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> :

                    <Copy className="h-4 w-4" />
                    }
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Custom Domain</CardTitle>
                  <CardDescription>
                    Connect your own domain (e.g., mamamboga.co.ke)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-amber-800">
                        Upgrade Required
                      </h4>
                      <p className="text-sm text-amber-700 mt-1">
                        Custom domains are available on the Basic and Pro plans.
                        Upgrade your plan to connect a custom domain.
                      </p>
                      <Button
                      size="sm"
                      className="mt-3 bg-amber-600 hover:bg-amber-700 text-white border-none"
                      onClick={() => setActiveTab('billing')}>

                        Upgrade Plan
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 opacity-50 pointer-events-none">
                    <label className="text-sm font-medium text-foreground">
                      Enter your domain
                    </label>
                    <div className="flex gap-2">
                      <Input placeholder="e.g. mystore.co.ke" />
                      <Button variant="secondary">Connect</Button>
                    </div>
                  </div>

                  <div className="opacity-50 pointer-events-none border border-border rounded-lg p-4 bg-muted/30">
                    <h4 className="text-sm font-medium mb-2">
                      DNS Instructions
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add the following A Record to your domain provider's DNS
                      settings:
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-sm font-mono bg-background p-3 rounded border border-border">
                      <div>
                        <span className="text-muted-foreground block text-xs mb-1">
                          Type
                        </span>
                        A
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs mb-1">
                          Name
                        </span>
                        @
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs mb-1">
                          Value
                        </span>
                        76.223.105.230
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          }

          {/* Payments Tab */}
          {activeTab === 'payments' &&
          <div className="space-y-6">
              <Card className="border-emerald-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <Badge className="bg-emerald-100 text-emerald-800 border-none">
                    Active
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-emerald-800">
                    <Smartphone className="h-5 w-5" /> M-Pesa Integration
                  </CardTitle>
                  <CardDescription>
                    Accept mobile money payments directly to your Till or
                    Paybill.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Business Shortcode (Till/Paybill)
                      </label>
                      <Input defaultValue="123456" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Type
                      </label>
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <option>Buy Goods (Till)</option>
                        <option>Paybill</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Daraja API Key (Consumer Key)
                    </label>
                    <Input
                    type="password"
                    defaultValue="************************" />

                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Daraja API Secret
                    </label>
                    <Input
                    type="password"
                    defaultValue="************************" />

                  </div>
                </CardContent>
                <CardFooter className="border-t border-emerald-100 bg-emerald-50/50 pt-6 flex justify-between">
                  <Button
                  variant="outline"
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-100">

                    Test Connection
                  </Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    Save M-Pesa Settings
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-600" /> Card
                    Payments (Stripe)
                  </CardTitle>
                  <CardDescription>
                    Accept Visa, Mastercard, and international payments.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg bg-muted/10">
                    <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                      Connect your Stripe account to start accepting card
                      payments from customers worldwide.
                    </p>
                    <Button
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50">

                      Connect Stripe Account
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-slate-600" /> Manual Bank
                    Transfer
                  </CardTitle>
                  <CardDescription>
                    Provide instructions for customers to pay via bank transfer.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">
                        Enable Bank Transfers
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Customers will see your bank details at checkout.
                      </p>
                    </div>
                    <div className="w-11 h-6 bg-primary rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Bank Instructions
                    </label>
                    <textarea
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    defaultValue="Bank: Equity Bank&#10;Account Name: Mama Mboga Ltd&#10;Account Number: 1234567890123&#10;Branch: Westlands" />

                  </div>
                </CardContent>
                <CardFooter className="border-t border-border pt-6">
                  <Button>Save Bank Details</Button>
                </CardFooter>
              </Card>
            </div>
          }

          {/* Billing Tab */}
          {activeTab === 'billing' &&
          <div className="space-y-6">
              <Card className="border-primary shadow-md">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">Free Plan</CardTitle>
                      <CardDescription>
                        You are currently on the free tier.
                      </CardDescription>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">
                      Current Plan
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-foreground">
                          Products Limit
                        </span>
                        <span className="text-muted-foreground">
                          15 / 20 used
                        </span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: '75%'
                        }}>
                      </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Upgrade to Basic or Pro to unlock custom domains, remove
                      FEZZY branding, and add more products.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <h3 className="text-lg font-bold text-foreground mt-8 mb-4">
                Upgrade Your Plan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle>Basic</CardTitle>
                    <div className="mt-2 flex items-baseline text-3xl font-bold">
                      KES 2,500
                      <span className="ml-1 text-sm font-medium text-muted-foreground">
                        /mo
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />{' '}
                        Up to 200 products
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />{' '}
                        Custom Domain
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />{' '}
                        Remove Branding
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Upgrade to Basic</Button>
                  </CardFooter>
                </Card>

                <Card className="flex flex-col bg-slate-900 text-slate-50 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-slate-50">Pro</CardTitle>
                    <div className="mt-2 flex items-baseline text-3xl font-bold">
                      KES 7,500
                      <span className="ml-1 text-sm font-medium text-slate-400">
                        /mo
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />{' '}
                        Unlimited products
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />{' '}
                        AI Features
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />{' '}
                        Priority Support
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-white text-slate-900 hover:bg-slate-200">
                      Upgrade to Pro
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="flex flex-col border-emerald-200 bg-emerald-50/30 dark:bg-emerald-950/30">
                  <CardHeader>
                    <CardTitle>Pay As You Go</CardTitle>
                    <div className="mt-2 flex items-baseline text-2xl font-bold">
                      2%
                      <span className="ml-1 text-sm font-medium text-muted-foreground">
                        /transaction
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />{' '}
                        Unlimited products
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />{' '}
                        Custom Domain
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />{' '}
                        No monthly fee
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                    className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-900"
                    variant="outline">

                      Switch to Pay As You Go
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          }
        </div>
      </div>
    </div>);

}