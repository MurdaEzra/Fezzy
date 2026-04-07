import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Crown,
  KeyRound,
  LoaderCircle,
  ShieldCheck,
  Store
} from 'lucide-react';
import { Button } from './ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from './ui/Card';
import { Input } from './ui/Input';
import type { PageType, SessionUser } from '../App';

interface AuthPageProps {
  initialTab: 'login' | 'signup';
  navigate: (page: PageType) => void;
  onAuthenticate: (user: SessionUser, targetPage: PageType) => void;
}

const demoAccounts: Array<
  SessionUser & { password: string; targetPage: PageType; accent: string }
> = [
  {
    name: 'James Kariuki',
    email: 'merchant@fezzy.co.ke',
    password: 'Store123!',
    role: 'merchant',
    title: 'Store Owner',
    plan: 'Growth Plan',
    storeName: 'Mama Mboga Market',
    storeSubdomain: 'mamamboga',
    targetPage: 'dashboard',
    accent: 'Merchant'
  },
  {
    name: 'Alice Wanjiru',
    email: 'ops@fezzy.co.ke',
    password: 'Admin123!',
    role: 'admin',
    title: 'Platform Admin',
    targetPage: 'admin',
    accent: 'Operations'
  },
  {
    name: 'David Otieno',
    email: 'root@fezzy.co.ke',
    password: 'Root123!',
    role: 'root-admin',
    title: 'Root Admin',
    targetPage: 'root-admin',
    accent: 'Owner'
  }
];

export function AuthPage({
  initialTab,
  navigate,
  onAuthenticate
}: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(initialTab === 'login');
  const [fullName, setFullName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subdomain = useMemo(
    () => storeName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'storename',
    [storeName]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    await new Promise((resolve) => window.setTimeout(resolve, 1100));

    if (isLogin) {
      const account = demoAccounts.find(
        (entry) =>
          entry.email.toLowerCase() === email.trim().toLowerCase() &&
          entry.password === password
      );

      if (!account) {
        setError('Use one of the FEZZY demo credentials below to open a workspace.');
        setIsSubmitting(false);
        return;
      }

      const { password: _unused, targetPage, accent: _accent, ...user } = account;
      onAuthenticate(user, targetPage);
      return;
    }

    if (!agreedToTerms) {
      setError('Accept the terms first so we can create your store workspace.');
      setIsSubmitting(false);
      return;
    }

    onAuthenticate(
      {
        name: fullName || 'New Merchant',
        email: email.toLowerCase(),
        role: 'merchant',
        title: 'Store Owner',
        plan: 'Free Trial',
        storeName: storeName || 'New Store',
        storeSubdomain: subdomain
      },
      'dashboard'
    );
  };

  const fillDemoLogin = (account: (typeof demoAccounts)[number]) => {
    setIsLogin(true);
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.2),_transparent_35%),linear-gradient(180deg,_#fff8f5_0%,_#ffffff_48%,_#f8fafc_100%)] px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.section
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-[32px] border border-white/60 bg-slate-950 px-7 py-8 text-slate-50 shadow-2xl shadow-orange-200/40 lg:px-10 lg:py-12"
        >
          <button
            onClick={() => navigate('landing')}
            className="mb-10 inline-flex items-center text-sm text-slate-300 transition-colors hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </button>

          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-2xl bg-primary p-3 text-primary-foreground shadow-lg shadow-primary/30">
              <Store className="h-7 w-7" />
            </div>
            <div>
              <p className="text-3xl font-bold tracking-tight">FEZZY</p>
              <p className="text-sm text-slate-300">
                Merchant, admin, and root admin access
              </p>
            </div>
          </div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.08
                }
              }
            }}
            className="space-y-5"
          >
            <motion.div
              variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
            >
              <p className="mb-3 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-orange-200">
                Role Based Login
              </p>
              <h1 className="max-w-xl text-4xl font-bold leading-tight text-white">
                FEZZY now includes a Root Admin login for platform-wide store management.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
                Sign in as a merchant, platform admin, or root admin and land in the
                correct workspace with polished motion and realistic loading states.
              </p>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-3">
              <FeatureCard
                icon={<Store className="h-5 w-5 text-emerald-300" />}
                title="Merchant Workspace"
                body="Manage products, orders, and storefront content."
              />
              <FeatureCard
                icon={<ShieldCheck className="h-5 w-5 text-amber-300" />}
                title="Admin Console"
                body="Oversee store health, billing, and support operations."
              />
              <FeatureCard
                icon={<Crown className="h-5 w-5 text-sky-300" />}
                title="Root Admin"
                body="Control payouts, approvals, and platform-wide store governance."
              />
            </div>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
              className="rounded-[28px] border border-white/10 bg-white/5 p-5"
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">Demo credentials</p>
                  <p className="text-sm text-slate-300">
                    Click any account to prefill the login form.
                  </p>
                </div>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                  local demo
                </span>
              </div>

              <div className="space-y-3">
                {demoAccounts.map((account) => (
                  <motion.button
                    key={account.email}
                    type="button"
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => fillDemoLogin(account)}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-left transition-colors hover:border-orange-300/40 hover:bg-slate-900"
                  >
                    <div>
                      <p className="font-medium text-white">{account.title}</p>
                      <p className="text-sm text-slate-300">{account.email}</p>
                    </div>
                    <div className="text-right text-xs text-slate-300">
                      <p>{account.password}</p>
                      <p className="mt-1 uppercase tracking-[0.16em] text-slate-400">
                        {account.accent}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.section>

        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? 'login' : 'signup'}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.28 }}
          >
            <Card className="border-border/60 shadow-2xl shadow-slate-200/70">
              <CardHeader className="space-y-4">
                <div className="flex rounded-full bg-muted p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(true);
                      setError('');
                    }}
                    className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-all ${isLogin ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(false);
                      setError('');
                    }}
                    className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-all ${!isLogin ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Sign up
                  </button>
                </div>

                <div className="text-center">
                  <CardTitle className="text-3xl">
                    {isLogin ? 'Access your workspace' : 'Create your store'}
                  </CardTitle>
                  <CardDescription className="mt-2 text-base">
                    {isLogin ?
                      'Use a merchant, admin, or root admin login to enter the right console.' :
                      'Create a merchant account and launch with a branded FEZZY store.'}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div className="space-y-2">
                      <label htmlFor="fullName" className="text-sm font-medium text-foreground">
                        Full name
                      </label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Amina Yusuf"
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={isLogin ? 'root@fezzy.co.ke' : 'amina@brand.co.ke'}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-foreground">
                      Password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isLogin ? 'Use demo password' : 'Choose a secure password'}
                      required
                    />
                  </div>

                  {!isLogin && (
                    <>
                      <div className="space-y-2">
                        <label htmlFor="storeName" className="text-sm font-medium text-foreground">
                          Store name
                        </label>
                        <Input
                          id="storeName"
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          placeholder="Amina Beauty House"
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Your store URL: <span className="font-semibold text-foreground">{subdomain}.fezzy.shop</span>
                        </p>
                      </div>

                      <label className="flex items-start gap-3 rounded-2xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                        />
                        <span>
                          I agree to the{' '}
                          <button
                            type="button"
                            className="font-semibold text-primary hover:underline"
                            onClick={() => navigate('terms')}
                          >
                            Terms & Conditions
                          </button>{' '}
                          and{' '}
                          <button
                            type="button"
                            className="font-semibold text-primary hover:underline"
                            onClick={() => navigate('privacy')}
                          >
                            Privacy Policy
                          </button>{' '}
                          so this store can be provisioned.
                        </span>
                      </label>
                    </>
                  )}

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ?
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        {isLogin ? 'Authenticating...' : 'Creating store...'}
                      </> :
                      <>
                        <KeyRound className="mr-2 h-4 w-4" />
                        {isLogin ? 'Access workspace' : 'Create store and continue'}
                      </>
                    }
                  </Button>
                </form>
              </CardContent>

              <CardFooter className="border-t border-border/60 pt-6">
                <p className="w-full text-center text-sm text-muted-foreground">
                  {isLogin ? 'Need a merchant account? ' : 'Already have an account? '}
                  <button
                    type="button"
                    className="font-semibold text-primary hover:underline"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError('');
                    }}
                  >
                    {isLogin ? 'Create a store' : 'Log in'}
                  </button>
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
      className="rounded-3xl border border-white/10 bg-white/5 p-4"
    >
      <div className="mb-4">{icon}</div>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
    </motion.div>
  );
}
