import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  LoaderCircle,
  MapPin,
  Phone,
  ShieldCheck,
  Store,
  Truck,
  Wallet
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
import { supabase } from '../contexts/supabaseClient';
import { uploadImageToCloudinary } from '../lib/cloudinary';
import { getSessionFromSupabaseUser } from '../lib/auth';
import { getCurrentStoreForUser, setupStoreCommerceDefaults } from '../lib/store';

interface AuthPageProps {
  initialTab: 'login' | 'signup';
  navigate: (page: PageType) => void;
  onAuthenticate: (user: SessionUser, targetPage: PageType) => void;
}

type VerificationMethod = 'email' | 'phone';
type SignupStep = 0 | 1 | 2 | 3;

const signupSteps: Array<{
  id: SignupStep;
  title: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    id: 0,
    title: 'Account',
    description: 'Create the merchant owner account and store name.',
    icon: <Store className="h-4 w-4" />
  },
  {
    id: 1,
    title: 'Wallet',
    description: 'Set the payout wallet for collections and withdrawals.',
    icon: <Wallet className="h-4 w-4" />
  },
  {
    id: 2,
    title: 'Shipping',
    description: 'Add location, delivery details, and store photos.',
    icon: <Truck className="h-4 w-4" />
  },
  {
    id: 3,
    title: 'Verification',
    description: 'Choose how the merchant should be verified.',
    icon: <Phone className="h-4 w-4" />
  }
];

export function AuthPage({
  initialTab,
  navigate,
  onAuthenticate
}: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(initialTab === 'login');
  const [signupStep, setSignupStep] = useState<SignupStep>(0);
  const [isStepTransitioning, setIsStepTransitioning] = useState(false);
  const [fullName, setFullName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>('email');
  const [walletProvider, setWalletProvider] = useState('M-Pesa');
  const [walletAccountName, setWalletAccountName] = useState('');
  const [walletAccountNumber, setWalletAccountNumber] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [country, setCountry] = useState('Kenya');
  const [shippingZones, setShippingZones] = useState('');
  const [shippingTimeline, setShippingTimeline] = useState('');
  const [shippingNotes, setShippingNotes] = useState('');
  const [locationLandmark, setLocationLandmark] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [storefrontPhoto, setStorefrontPhoto] = useState<File | null>(null);
  const [interiorPhoto, setInteriorPhoto] = useState<File | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subdomain = useMemo(
    () => storeName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'storename',
    [storeName]
  );

  const handleNextSignupStep = async () => {
    if (signupStep === 0) {
      const passwordError = getSupabasePasswordError(password);
      if (passwordError) {
        setError(passwordError);
        return;
      }
    }

    const stepError = getSignupStepError(signupStep, {
      fullName,
      storeName,
      email,
      password,
      phone,
      verificationMethod,
      walletAccountName,
      walletAccountNumber,
      businessAddress,
      country,
      shippingZones,
      shippingTimeline,
      agreedToTerms
    });

    if (stepError) {
      setError(stepError);
      return;
    }

    setError('');
    setIsStepTransitioning(true);

    await new Promise((resolve) => window.setTimeout(resolve, 650));

    setSignupStep((current) => Math.min(current + 1, signupSteps.length - 1) as SignupStep);
    setIsStepTransitioning(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !password.trim()) {
      setError('Enter your email and password to continue.');
      return;
    }

    if (!isLogin) {
      const finalStepError = getSignupStepError(3, {
        fullName,
        storeName,
        email,
        password,
        phone,
        verificationMethod,
        walletAccountName,
        walletAccountNumber,
        businessAddress,
        country,
        shippingZones,
        shippingTimeline,
        agreedToTerms
      });

      if (finalStepError) {
        setError(finalStepError);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password
        });

        if (signInError) {
          throw signInError;
        }

        if (!data.user) {
          throw new Error('No user was returned from Supabase.');
        }

        const session = getSessionFromSupabaseUser(data.user);
        onAuthenticate(session.user, session.targetPage);
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPhone = phone.trim();

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: normalizedPhone,
            role: 'merchant',
            title: 'Store Owner',
            store_name: storeName.trim(),
            store_subdomain: subdomain,
            preferred_verification_method: verificationMethod,
            wallet_provider: walletProvider.trim(),
            wallet_account_name: walletAccountName.trim(),
            wallet_account_number: walletAccountNumber.trim(),
            business_address: businessAddress.trim(),
            country: country.trim(),
            shipping_zones: shippingZones.trim(),
            shipping_timeline: shippingTimeline.trim(),
            shipping_notes: shippingNotes.trim(),
            location_landmark: locationLandmark.trim()
          }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.user && data.session) {
        const { data: starterPlan } = await supabase
          .from('plans')
          .select('id')
          .eq('code', 'starter')
          .maybeSingle();

        const { data: createdStore, error: storeError } = await supabase
          .from('stores')
          .insert({
            owner_user_id: data.user.id,
            plan_id: starterPlan?.id ?? null,
            name: storeName.trim(),
            slug: subdomain,
            subdomain,
            description: `${storeName.trim()} delivers ${shippingZones.trim().toLowerCase() || 'with care and speed'}.`,
            contact_email: normalizedEmail,
            contact_phone: normalizedPhone || null,
            business_address: businessAddress.trim() || null,
            country: country.trim() || 'Kenya',
            status: 'draft',
            verification_status: 'pending'
          })
          .select('id, name, slug')
          .single();

        if (storeError) {
          throw storeError;
        }

        const { error: memberError } = await supabase.from('store_members').insert({
          store_id: createdStore.id,
          user_id: data.user.id,
          role: 'owner',
          is_active: true
        });

        if (memberError) {
          throw memberError;
        }

        const uploadedAssets: Array<{
          asset_type: 'logo' | 'hero' | 'gallery' | 'about';
          storage_path: string;
          public_url: string;
          alt_text: string;
          sort_order: number;
        }> = [];

        let logoUrl: string | null = null;

        if (logoFile) {
          const uploaded = await uploadImageToCloudinary(logoFile, `fezzy/${createdStore.slug}/brand`);
          logoUrl = uploaded.url;
          uploadedAssets.push({
            asset_type: 'logo',
            storage_path: uploaded.publicId,
            public_url: uploaded.url,
            alt_text: `${storeName.trim()} logo`,
            sort_order: 0
          });
        }

        if (storefrontPhoto) {
          const uploaded = await uploadImageToCloudinary(
            storefrontPhoto,
            `fezzy/${createdStore.slug}/location`
          );
          uploadedAssets.push({
            asset_type: 'hero',
            storage_path: uploaded.publicId,
            public_url: uploaded.url,
            alt_text: `${storeName.trim()} storefront`,
            sort_order: 0
          });
        }

        if (interiorPhoto) {
          const uploaded = await uploadImageToCloudinary(
            interiorPhoto,
            `fezzy/${createdStore.slug}/location`
          );
          uploadedAssets.push({
            asset_type: 'gallery',
            storage_path: uploaded.publicId,
            public_url: uploaded.url,
            alt_text: `${storeName.trim()} store interior`,
            sort_order: 1
          });
          uploadedAssets.push({
            asset_type: 'about',
            storage_path: uploaded.publicId,
            public_url: uploaded.url,
            alt_text: `${storeName.trim()} inside the store`,
            sort_order: 0
          });
        }

        if (uploadedAssets.length) {
          const { error: assetError } = await supabase.from('store_assets').insert(
            uploadedAssets.map((asset) => ({
              store_id: createdStore.id,
              ...asset
            }))
          );

          if (assetError) {
            throw assetError;
          }
        }

        await supabase.from('store_themes').upsert({
          store_id: createdStore.id,
          template_code: 'market-fresh',
          font: 'Plus Jakarta Sans',
          primary_color: '#b45309',
          accent_color: '#14532d',
          tagline: `${shippingTimeline.trim() || 'Fast delivery'} across ${country.trim() || 'Kenya'}`,
          settings: {
            announcement_text: 'Now taking orders online',
            hero_eyebrow: 'New merchant store',
            hero_title: storeName.trim(),
            hero_subtitle:
              shippingNotes.trim() ||
              `${storeName.trim()} is ready for shoppers with delivery to ${shippingZones.trim() || 'your preferred locations'}.`,
            hero_cta: 'Shop Collection',
            featured_title: 'Shop our latest picks',
            featured_description:
              shippingTimeline.trim() || 'Pickup and dispatch timelines are available on request.',
            about_heading: 'Visit our store',
            about_body:
              locationLandmark.trim() ||
              `${storeName.trim()} is located at ${businessAddress.trim() || 'our physical store address'}.`,
            contact_heading: 'Talk to our team',
            footer_tagline: `${storeName.trim()} on FEZZY`
          }
        });

        await supabase.from('store_pages').upsert([
          {
            store_id: createdStore.id,
            page_type: 'home',
            title: 'Home',
            slug: '/',
            description: `${storeName.trim()} storefront`,
            content: {
              intro_badge: 'Freshly launched',
              promo_title: `${storeName.trim()} is open online`,
              promo_body:
                shippingNotes.trim() || 'Discover new arrivals, featured products, and direct ordering.'
            },
            show_in_nav: true,
            sort_order: 0,
            is_published: true
          },
          {
            store_id: createdStore.id,
            page_type: 'shop',
            title: 'Shop',
            slug: '/shop',
            description: `Browse products from ${storeName.trim()}.`,
            content: {
              collection_badge: 'Available now',
              collection_intro:
                shippingTimeline.trim() || 'Order online and get delivery updates from the merchant.'
            },
            show_in_nav: true,
            sort_order: 1,
            is_published: true
          },
          {
            store_id: createdStore.id,
            page_type: 'about',
            title: 'About',
            slug: '/about',
            description: locationLandmark.trim() || 'Learn more about this merchant.',
            content: {
              story_heading: 'Built around your local customers',
              story_body:
                `${storeName.trim()} serves customers from ${businessAddress.trim() || country.trim()}.`,
              location_landmark: locationLandmark.trim()
            },
            show_in_nav: true,
            sort_order: 2,
            is_published: true
          },
          {
            store_id: createdStore.id,
            page_type: 'contact',
            title: 'Contact',
            slug: '/contact',
            description: 'Get in touch and ask about deliveries.',
            content: {
              shipping_zones: shippingZones.trim(),
              shipping_timeline: shippingTimeline.trim(),
              shipping_notes: shippingNotes.trim(),
              location_landmark: locationLandmark.trim(),
              wallet_provider: walletProvider.trim()
            },
            show_in_nav: true,
            sort_order: 3,
            is_published: true
          }
        ]);

        await supabase.from('store_payment_settings').upsert({
          store_id: createdStore.id,
          mpesa_environment: 'sandbox'
        });

        await setupStoreCommerceDefaults({
          storeId: createdStore.id,
          subdomain,
          planId: starterPlan?.id ?? null
        });

        if (walletAccountName.trim() && walletAccountNumber.trim()) {
          const { error: payoutError } = await supabase.from('store_payout_accounts').insert({
            store_id: createdStore.id,
            account_type: 'mobile_money',
            provider: walletProvider.trim() || 'M-Pesa',
            account_name: walletAccountName.trim(),
            account_number: walletAccountNumber.trim(),
            is_default: true,
            is_verified: false
          });

          if (payoutError) {
            throw payoutError;
          }
        }

        if (logoUrl) {
          const { error: logoError } = await supabase
            .from('stores')
            .update({ logo_url: logoUrl })
            .eq('id', createdStore.id);

          if (logoError) {
            throw logoError;
          }
        }

        const session = getSessionFromSupabaseUser(data.user);
        const hydratedStore = await getCurrentStoreForUser(session.user);
        onAuthenticate(
          {
            ...session.user,
            storeName: hydratedStore?.name ?? session.user.storeName,
            storeSubdomain: hydratedStore?.subdomain ?? session.user.storeSubdomain,
            plan: hydratedStore?.plans?.name ?? 'Starter'
          },
          session.user.role === 'merchant' ? 'store-builder' : session.targetPage
        );
        return;
      }

      setSuccess(
        verificationMethod === 'phone'
          ? 'Account created. Your onboarding details were saved in signup metadata. Verify with the email link until Supabase phone OTP is enabled for your project.'
          : 'Account created. Check your email to confirm your account, then sign in to continue.'
      );
      setIsLogin(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.16),_transparent_35%),linear-gradient(180deg,_#fff8f5_0%,_#ffffff_48%,_#f8fafc_100%)] px-4 py-8">
      {isLogin ? (
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="w-full rounded-[36px] border border-white/60 bg-white/85 p-6 shadow-2xl shadow-orange-200/40 backdrop-blur lg:p-10"
          >
            <button
              onClick={() => navigate('landing')}
              className="inline-flex items-center text-sm text-slate-500 transition-colors hover:text-slate-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </button>

            <div className="mt-8 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-primary p-3 text-primary-foreground shadow-lg shadow-primary/30">
                    <Store className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold tracking-tight text-slate-950">FEZZY</p>
                    <p className="text-sm text-slate-500">Secure commerce access for merchants</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-orange-700">
                    Login
                  </p>
                  <h1 className="max-w-lg text-4xl font-bold leading-tight text-slate-950">
                    Sign in from one simple workspace.
                  </h1>
                  <p className="max-w-md text-base leading-7 text-slate-600">
                    Sign in with your Supabase-backed account to access your FEZZY workspace.
                  </p>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-900">Quick access</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Use your account email and password to open your merchant, admin, or root
                    admin workspace.
                  </p>
                </div>
              </div>

              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 lg:p-8">
                <div className="mb-6 text-center">
                  <h2 className="text-3xl font-semibold text-slate-950">Welcome back</h2>
                  <p className="mt-2 text-base text-slate-600">
                    Sign in with your account email and password to access your workspace.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@business.com"
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
                      placeholder="Enter your password"
                      required
                    />
                  </div>

                  <AnimatePresence>
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                      >
                        {success}
                      </motion.div>
                    )}
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
                    {isSubmitting ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <KeyRound className="mr-2 h-4 w-4" />
                        Sign in
                      </>
                    )}
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Need a merchant account?{' '}
                  <button
                    type="button"
                    className="font-semibold text-primary hover:underline"
                    onClick={() => {
                      setIsLogin(false);
                      setSignupStep(0);
                      setError('');
                    }}
                  >
                    Create a store
                  </button>
                </p>
              </div>
            </div>
          </motion.section>
        </div>
      ) : (
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">
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
                  Guided merchant onboarding for commerce teams
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="mb-3 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-orange-200">
                  Merchant Setup
                </p>
                <h1 className="max-w-xl text-4xl font-bold leading-tight text-white">
                  Launch the store in guided steps instead of one long form.
                </h1>
                <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
                  We’ll capture verification details, payout wallet info, shipping coverage, store
                  location, and brand photos before the merchant lands in the dashboard.
                </p>
              </div>

              <div className="space-y-3">
                {signupSteps.map((step, index) => {
                  const isActive = step.id === signupStep;
                  const isComplete = signupStep > step.id;

                  return (
                    <div
                      key={step.id}
                      className={`rounded-[24px] border px-4 py-4 transition ${
                        isActive
                          ? 'border-orange-300 bg-white/10'
                          : 'border-white/10 bg-white/5'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-full ${
                            isComplete
                              ? 'bg-emerald-500/20 text-emerald-200'
                              : isActive
                                ? 'bg-orange-400/20 text-orange-200'
                                : 'bg-white/10 text-slate-300'
                          }`}
                        >
                          {isComplete ? <CheckCircle2 className="h-4 w-4" /> : step.icon}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {index + 1}. {step.title}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-slate-300">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FeatureCard
                  icon={<ShieldCheck className="h-5 w-5 text-emerald-300" />}
                  title="Verification-ready onboarding"
                  body="Capture email or phone verification preference while collecting merchant contact details."
                />
                <FeatureCard
                  icon={<MapPin className="h-5 w-5 text-amber-300" />}
                  title="Location-aware storefront"
                  body="Use address, delivery zones, and store imagery to prepare the storefront from day one."
                />
              </div>
            </div>
          </motion.section>

          <AnimatePresence mode="wait">
            <motion.div
              key="signup"
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
                      className="flex-1 rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-all hover:text-foreground"
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(false);
                        setError('');
                      }}
                      className="flex-1 rounded-full bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-all"
                    >
                      Sign up
                    </button>
                  </div>

                  <div className="text-center">
                    <CardTitle className="text-3xl">Create your merchant account</CardTitle>
                    <CardDescription className="mt-2 text-base">
                      Step {signupStep + 1} of {signupSteps.length}: {signupSteps[signupStep].title}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {isStepTransitioning ? (
                      <motion.div
                        key={`loading-step-${signupStep}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex min-h-[340px] flex-col items-center justify-center rounded-[28px] border border-border bg-muted/20 px-6 text-center"
                      >
                        <div className="relative flex h-16 w-16 items-center justify-center">
                          <span className="absolute inset-0 rounded-full border-4 border-primary/15" />
                          <span className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary border-r-primary" />
                          <Store className="h-6 w-6 text-primary" />
                        </div>
                        <p className="mt-6 text-lg font-semibold text-foreground">
                          Preparing {signupSteps[Math.min(signupStep + 1, signupSteps.length - 1)].title}
                        </p>
                        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                          We&apos;re getting the next setup step ready so the merchant onboarding feels
                          smooth from start to finish.
                        </p>
                      </motion.div>
                    ) : signupStep === 0 ? (
                      <div className="space-y-4">
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

                        <div className="space-y-2">
                          <label htmlFor="email" className="text-sm font-medium text-foreground">
                            Email
                          </label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="owner@brand.co.ke"
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
                            placeholder="Create a secure password"
                            required
                          />
                          <p className="text-xs leading-5 text-muted-foreground">
                            Use at least 8 characters with uppercase, lowercase, a number, and a
                            special character before continuing.
                          </p>
                        </div>

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
                            Your store URL:{' '}
                            <span className="font-semibold text-foreground">
                              {subdomain}.fezzy.shop
                            </span>
                          </p>
                        </div>
                      </div>
                    ) : null}

                    {!isStepTransitioning && signupStep === 1 && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label
                            htmlFor="walletProvider"
                            className="text-sm font-medium text-foreground"
                          >
                            Wallet provider
                          </label>
                          <Input
                            id="walletProvider"
                            value={walletProvider}
                            onChange={(e) => setWalletProvider(e.target.value)}
                            placeholder="M-Pesa"
                          />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <label
                              htmlFor="walletAccountName"
                              className="text-sm font-medium text-foreground"
                            >
                              Wallet account name
                            </label>
                            <Input
                              id="walletAccountName"
                              value={walletAccountName}
                              onChange={(e) => setWalletAccountName(e.target.value)}
                              placeholder="Amina Yusuf"
                            />
                          </div>

                          <div className="space-y-2">
                            <label
                              htmlFor="walletAccountNumber"
                              className="text-sm font-medium text-foreground"
                            >
                              Wallet account number
                            </label>
                            <Input
                              id="walletAccountNumber"
                              value={walletAccountNumber}
                              onChange={(e) => setWalletAccountNumber(e.target.value)}
                              placeholder="0712345678"
                            />
                          </div>
                        </div>

                        <p className="rounded-2xl border border-border bg-muted/40 px-4 py-3 text-xs leading-5 text-muted-foreground">
                          This wallet is saved as the merchant payout account so withdrawals and
                          settlement setup can start immediately.
                        </p>
                      </div>
                    )}

                    {!isStepTransitioning && signupStep === 2 && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label
                            htmlFor="businessAddress"
                            className="text-sm font-medium text-foreground"
                          >
                            Store location
                          </label>
                          <Input
                            id="businessAddress"
                            value={businessAddress}
                            onChange={(e) => setBusinessAddress(e.target.value)}
                            placeholder="Kimathi House, Nairobi CBD"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="country" className="text-sm font-medium text-foreground">
                            Country
                          </label>
                          <Input
                            id="country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            placeholder="Kenya"
                          />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <label
                              htmlFor="shippingZones"
                              className="text-sm font-medium text-foreground"
                            >
                              Shipping coverage
                            </label>
                            <Input
                              id="shippingZones"
                              value={shippingZones}
                              onChange={(e) => setShippingZones(e.target.value)}
                              placeholder="Nairobi, Kiambu, Nakuru"
                            />
                          </div>
                          <div className="space-y-2">
                            <label
                              htmlFor="shippingTimeline"
                              className="text-sm font-medium text-foreground"
                            >
                              Delivery timeline
                            </label>
                            <Input
                              id="shippingTimeline"
                              value={shippingTimeline}
                              onChange={(e) => setShippingTimeline(e.target.value)}
                              placeholder="Same day in Nairobi, 1-2 days outside town"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="shippingNotes"
                            className="text-sm font-medium text-foreground"
                          >
                            Shipping notes
                          </label>
                          <textarea
                            id="shippingNotes"
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={shippingNotes}
                            onChange={(e) => setShippingNotes(e.target.value)}
                            placeholder="Pickup, dispatch times, and customer delivery guidance."
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="locationLandmark"
                            className="text-sm font-medium text-foreground"
                          >
                            Landmark
                          </label>
                          <Input
                            id="locationLandmark"
                            value={locationLandmark}
                            onChange={(e) => setLocationLandmark(e.target.value)}
                            placeholder="Next to Nation Centre"
                          />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                          <FilePicker
                            label="Store logo"
                            helper={logoFile?.name ?? 'Upload a brand mark'}
                            onChange={setLogoFile}
                          />
                          <FilePicker
                            label="Storefront photo"
                            helper={storefrontPhoto?.name ?? 'Upload the exterior'}
                            onChange={setStorefrontPhoto}
                          />
                          <FilePicker
                            label="Inside store"
                            helper={interiorPhoto?.name ?? 'Upload an interior shot'}
                            onChange={setInteriorPhoto}
                          />
                        </div>

                      </div>
                    )}

                    {!isStepTransitioning && signupStep === 3 && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="phone" className="text-sm font-medium text-foreground">
                            Phone number
                          </label>
                          <Input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+254 712 345 678"
                            required={verificationMethod === 'phone'}
                          />
                        </div>

                        <div className="space-y-3 rounded-2xl border border-border bg-muted/30 p-4">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              Verification channel
                            </p>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                              Pick the preferred verification path for the merchant owner account.
                            </p>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <VerificationOption
                              title="Email verification"
                              description="Send the verification link to the merchant email address."
                              active={verificationMethod === 'email'}
                              onClick={() => setVerificationMethod('email')}
                            />
                            <VerificationOption
                              title="Phone OTP"
                              description="Use the saved phone number when phone OTP is enabled in Supabase."
                              active={verificationMethod === 'phone'}
                              onClick={() => setVerificationMethod('phone')}
                            />
                          </div>

                          {verificationMethod === 'phone' && (
                            <p className="text-xs leading-5 text-muted-foreground">
                              Phone OTP needs Supabase phone auth to be enabled in your project.
                              Until then, the number is saved as the preferred verification channel
                              while email confirmation remains available.
                            </p>
                          )}
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
                      </div>
                    )}

                    <AnimatePresence>
                      {success && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                        >
                          {success}
                        </motion.div>
                      )}
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

                    <div className="flex items-center justify-between gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isStepTransitioning}
                        onClick={() =>
                          signupStep === 0
                            ? setIsLogin(true)
                            : setSignupStep((current) => Math.max(current - 1, 0) as SignupStep)
                        }
                      >
                        {signupStep === 0 ? 'Back to login' : 'Previous step'}
                      </Button>

                      {signupStep < signupSteps.length - 1 ? (
                        <Button type="button" onClick={() => void handleNextSignupStep()} disabled={isStepTransitioning}>
                          {isStepTransitioning ? (
                            <>
                              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                              Loading next step...
                            </>
                          ) : (
                            'Continue'
                          )}
                        </Button>
                      ) : (
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                              Creating account...
                            </>
                          ) : (
                            <>
                              <KeyRound className="mr-2 h-4 w-4" />
                              Create account
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>

                <CardFooter className="border-t border-border/60 pt-6">
                  <p className="w-full text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <button
                      type="button"
                      className="font-semibold text-primary hover:underline"
                      onClick={() => {
                        setIsLogin(true);
                        setError('');
                      }}
                    >
                      Log in
                    </button>
                  </p>
                </CardFooter>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
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

function VerificationOption({
  title,
  description,
  active,
  onClick
}: {
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3 text-left transition ${
        active
          ? 'border-primary bg-primary/5 text-foreground'
          : 'border-border bg-background text-muted-foreground hover:border-primary/40'
      }`}
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs leading-5">{description}</p>
    </button>
  );
}

function FilePicker({
  label,
  helper,
  onChange
}: {
  label: string;
  helper: string;
  onChange: (file: File | null) => void;
}) {
  return (
    <label className="flex cursor-pointer flex-col gap-2 rounded-2xl border border-dashed border-border bg-background px-4 py-4">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs leading-5 text-muted-foreground">{helper}</p>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      <span className="text-xs font-semibold text-primary">Choose image</span>
    </label>
  );
}

function getSignupStepError(
  step: SignupStep,
  values: {
    fullName: string;
    storeName: string;
    email: string;
    password: string;
    phone: string;
    verificationMethod: VerificationMethod;
    walletAccountName: string;
    walletAccountNumber: string;
    businessAddress: string;
    country: string;
    shippingZones: string;
    shippingTimeline: string;
    agreedToTerms: boolean;
  }
) {
  if (step >= 0) {
    if (!values.fullName.trim()) return 'Add the merchant full name to continue.';
    if (!values.email.trim()) return 'Add the merchant email to continue.';
    if (!values.password.trim()) return 'Create a password to continue.';
    if (!values.storeName.trim()) return 'Add the store name to continue.';
  }

  if (step >= 1) {
    if (!values.walletAccountName.trim()) {
      return 'Add the wallet account name to continue.';
    }
    if (!values.walletAccountNumber.trim()) {
      return 'Add the wallet account number to continue.';
    }
  }

  if (step >= 2) {
    if (!values.businessAddress.trim()) {
      return 'Add the physical store location to continue.';
    }
    if (!values.country.trim()) {
      return 'Add the store country to continue.';
    }
    if (!values.shippingZones.trim()) {
      return 'Describe where the store can ship orders.';
    }
    if (!values.shippingTimeline.trim()) {
      return 'Add a delivery timeline to continue.';
    }
  }

  if (step >= 3) {
    if (values.verificationMethod === 'phone' && !values.phone.trim()) {
      return 'Add a phone number so the account can use phone verification.';
    }
    if (!values.agreedToTerms) {
      return 'Accept the terms first so we can create your store workspace.';
    }
  }

  return null;
}

function getSupabasePasswordError(password: string) {
  if (!password.trim()) {
    return 'Create a password to continue.';
  }

  if (password.length < 8) {
    return 'Use at least 8 characters before proceeding to the next step.';
  }

  if (!/[a-z]/.test(password)) {
    return 'Add at least one lowercase letter to match the password requirements.';
  }

  if (!/[A-Z]/.test(password)) {
    return 'Add at least one uppercase letter to match the password requirements.';
  }

  if (!/\d/.test(password)) {
    return 'Add at least one number to match the password requirements.';
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Add at least one special character to match the password requirements.';
  }

  return null;
}
