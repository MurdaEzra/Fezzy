import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  LoaderCircle,
  Phone,
  Store,
  Truck,
  Wallet
} from 'lucide-react';
import { Button } from './ui/Button';

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
    <div className="flex min-h-screen bg-slate-950 font-sans">
      {/* Left Premium Branding Section */}
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden p-10 lg:flex xl:p-14">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute -left-[20%] -top-[20%] h-[70%] w-[70%] rounded-full bg-orange-600/20 blur-[120px]" />
          <div className="absolute -bottom-[20%] -right-[20%] h-[70%] w-[70%] rounded-full bg-emerald-600/20 blur-[120px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        {/* Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 p-3 text-white shadow-lg shadow-orange-500/30">
              <Store className="h-7 w-7" />
            </div>
            <p className="text-3xl font-bold tracking-tight text-white">FEZZY</p>
          </div>
        </div>

        {/* Marketing Hero */}
        <div className="relative z-10 mb-10 space-y-8">
          <h1 className="text-5xl font-extrabold leading-[1.15] text-white">
            Scale your commerce operations <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">with elegance.</span>
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-slate-300">
            Join thousands of premium merchants who trust FEZZY to manage their digital storefronts, orchestrate deliveries, and process payments securely.
          </p>
          
          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                 <div key={i} className={`h-12 w-12 rounded-full border-2 border-slate-950 bg-slate-800 ${
                   i === 1 ? 'bg-[url("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop")]' : 
                   i === 2 ? 'bg-[url("https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop")]' : 
                   i === 3 ? 'bg-[url("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop")]' : 
                   'bg-[url("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop")]'
                 } bg-cover`} />
              ))}
            </div>
            <p className="text-sm font-medium text-slate-300">
              Join <span className="font-bold text-white">10,000+</span> merchants
            </p>
          </div>
        </div>
      </div>

      {/* Right Form Container */}
      <div className="relative flex w-full flex-col bg-white overflow-y-auto lg:w-[55%] lg:rounded-l-[40px] lg:shadow-[0_0_40px_rgba(0,0,0,0.2)]">
        
        {/* Mobile Header & Desktop Back Button */}
        <div className="flex items-center justify-between p-6 lg:absolute lg:right-10 lg:top-10 lg:p-0 lg:z-20">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="rounded-xl bg-primary p-2 text-primary-foreground">
              <Store className="h-5 w-5" />
            </div>
            <p className="text-xl font-bold tracking-tight text-slate-950">FEZZY</p>
          </div>
          <button
            onClick={() => navigate('landing')}
            className="group flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to home
          </button>
        </div>

        {/* Form Area */}
        <div className="flex flex-1 items-center justify-center p-6 sm:p-10 lg:p-16">
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait">
              {isLogin ? (
                /* --- LOGIN FLOW --- */
                <motion.div
                  key="login-flow"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-950">Welcome back</h2>
                    <p className="mt-2 text-slate-500">Sign in to your merchant workspace.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-slate-700">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@business.com"
                        required
                        className="h-12 w-full rounded-xl border-slate-200 bg-slate-50 px-4 text-base transition-colors focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="password" className="text-sm font-medium text-slate-700">
                          Password
                        </label>
                        <button type="button" className="text-sm font-medium text-primary hover:underline">
                          Forgot password?
                        </button>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="h-12 w-full rounded-xl border-slate-200 bg-slate-50 px-4 text-base transition-colors focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <AnimatePresence>
                      {success && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
                            {success}
                          </div>
                        </motion.div>
                      )}
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
                            {error}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Button type="submit" className="h-12 w-full rounded-xl text-base font-semibold shadow-xl shadow-primary/20 transition-all hover:shadow-primary/30" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                          Authenticating...
                        </>
                      ) : (
                        'Sign in'
                      )}
                    </Button>
                  </form>

                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="shrink-0 px-4 text-sm text-slate-400">New to Fezzy?</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  <p className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(false);
                        setSignupStep(0);
                        setError('');
                      }}
                      className="text-base font-semibold text-primary transition-colors hover:text-orange-700 hover:underline"
                    >
                      Create a merchant account
                    </button>
                  </p>
                </motion.div>
              ) : (
                /* --- SIGNUP FLOW --- */
                <motion.div
                  key="signup-flow"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div>
                    <div className="mb-6 flex justify-between gap-2">
                      {signupSteps.map((step) => (
                      <div key={step.id} className="group relative flex-1">
                          <div className={`h-1.5 w-full rounded-full transition-colors duration-300 ${
                            signupStep >= step.id ? 'bg-primary' : 'bg-slate-100'
                          }`} />
                          {signupStep === step.id && (
                            <motion.span
                              layoutId="activeStep"
                              className="absolute -top-1 left-0 right-0 h-3.5 w-full rounded-full border-2 border-white bg-primary shadow-sm"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                      {signupSteps[signupStep].title}
                    </h2>
                    <p className="mt-2 text-slate-500">
                      Step {signupStep + 1} of {signupSteps.length}: {signupSteps[signupStep].description}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="min-h-[300px]">
                      <AnimatePresence mode="wait">
                        {isStepTransitioning ? (
                          <motion.div
                            key="loading-step"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex h-[320px] flex-col items-center justify-center space-y-4 rounded-3xl border border-dashed border-slate-200 bg-slate-50/50"
                          >
                            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                            <p className="font-medium text-slate-600">Preparing next step...</p>
                          </motion.div>
                        ) : signupStep === 0 ? (
                          /* Step 0: Account */
                          <motion.div
                            key="step-0"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-5"
                          >
                            <div className="grid gap-5 sm:grid-cols-2">
                              <div className="space-y-2">
                                <label htmlFor="fullName" className="text-sm font-medium text-slate-700">Full Name</label>
                                <Input
                                  id="fullName"
                                  value={fullName}
                                  onChange={(e) => setFullName(e.target.value)}
                                  placeholder="John Doe"
                                  required
                                  className="h-11 rounded-xl bg-slate-50"
                                />
                              </div>
                              <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</label>
                                <Input
                                  id="email"
                                  type="email"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  placeholder="john@example.com"
                                  required
                                  className="h-11 rounded-xl bg-slate-50"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
                              <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a strong password"
                                required
                                className="h-11 rounded-xl bg-slate-50"
                              />
                            </div>

                            <div className="space-y-2">
                              <label htmlFor="storeName" className="text-sm font-medium text-slate-700">Store Name</label>
                              <div className="relative">
                                <Input
                                  id="storeName"
                                  value={storeName}
                                  onChange={(e) => setStoreName(e.target.value)}
                                  placeholder="My Awesome Store"
                                  required
                                  className="h-11 rounded-xl bg-slate-50 pl-10"
                                />
                                <Store className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                              </div>
                              {storeName && (
                                <p className="text-sm text-slate-500">
                                  Store URL: <span className="font-semibold text-primary">{subdomain}.fezzy.shop</span>
                                </p>
                              )}
                            </div>
                          </motion.div>
                        ) : signupStep === 1 ? (
                          /* Step 1: Wallet */
                          <motion.div
                            key="step-1"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-5"
                          >
                            <div className="space-y-2">
                              <label htmlFor="walletProvider" className="text-sm font-medium text-slate-700">Wallet Provider</label>
                              <Input
                                id="walletProvider"
                                value={walletProvider}
                                onChange={(e) => setWalletProvider(e.target.value)}
                                placeholder="M-Pesa"
                                className="h-11 rounded-xl bg-slate-50"
                              />
                            </div>

                            <div className="space-y-2">
                              <label htmlFor="walletAccountName" className="text-sm font-medium text-slate-700">Account Name</label>
                              <Input
                                id="walletAccountName"
                                value={walletAccountName}
                                onChange={(e) => setWalletAccountName(e.target.value)}
                                placeholder="John Doe"
                                className="h-11 rounded-xl bg-slate-50"
                              />
                            </div>

                            <div className="space-y-2">
                              <label htmlFor="walletAccountNumber" className="text-sm font-medium text-slate-700">Account Number</label>
                              <Input
                                id="walletAccountNumber"
                                value={walletAccountNumber}
                                onChange={(e) => setWalletAccountNumber(e.target.value)}
                                placeholder="0712345678"
                                className="h-11 rounded-xl bg-slate-50"
                              />
                            </div>
                            <div className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                              <Wallet className="mt-0.5 h-5 w-5 shrink-0 text-indigo-500" />
                              <p className="text-sm leading-relaxed text-indigo-900">
                                This wallet is securely saved as your primary payout destination for fast, automated withdrawals.
                              </p>
                            </div>
                          </motion.div>
                        ) : signupStep === 2 ? (
                          /* Step 2: Shipping & Details */
                          <motion.div
                            key="step-2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-5"
                          >
                            <div className="grid gap-5 sm:grid-cols-2">
                              <div className="space-y-2">
                                <label htmlFor="country" className="text-sm font-medium text-slate-700">Country</label>
                                <Input
                                  id="country"
                                  value={country}
                                  onChange={(e) => setCountry(e.target.value)}
                                  placeholder="Kenya"
                                  className="h-11 rounded-xl bg-slate-50"
                                />
                              </div>
                              <div className="space-y-2">
                                <label htmlFor="shippingZones" className="text-sm font-medium text-slate-700">Shipping Coverage</label>
                                <Input
                                  id="shippingZones"
                                  value={shippingZones}
                                  onChange={(e) => setShippingZones(e.target.value)}
                                  placeholder="Nairobi, Kiambu..."
                                  className="h-11 rounded-xl bg-slate-50"
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label htmlFor="shippingTimeline" className="text-sm font-medium text-slate-700">Expected Delivery Timeline</label>
                                <Input
                                  id="shippingTimeline"
                                  value={shippingTimeline}
                                  onChange={(e) => setShippingTimeline(e.target.value)}
                                  placeholder="Same day within Nairobi, 2 days elsewhere"
                                  className="h-11 rounded-xl bg-slate-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="shippingNotes" className="text-sm font-medium text-slate-700">Shipping Notes (Optional)</label>
                                <textarea
                                  id="shippingNotes"
                                  value={shippingNotes}
                                  onChange={(e) => setShippingNotes(e.target.value)}
                                  placeholder="Pickup times, dispatch times, etc."
                                  className="flex min-h-[80px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base transition-colors focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                              <div className="space-y-2">
                                  <label htmlFor="businessAddress" className="text-sm font-medium text-slate-700">Main Store Address</label>
                                  <Input
                                    id="businessAddress"
                                    value={businessAddress}
                                    onChange={(e) => setBusinessAddress(e.target.value)}
                                    placeholder="CBD, Next to Nation Centre"
                                    className="h-11 rounded-xl bg-slate-50"
                                  />
                              </div>
                              <div className="space-y-2">
                                  <label htmlFor="locationLandmark" className="text-sm font-medium text-slate-700">Landmark</label>
                                  <Input
                                    id="locationLandmark"
                                    value={locationLandmark}
                                    onChange={(e) => setLocationLandmark(e.target.value)}
                                    placeholder="Near the big tree"
                                    className="h-11 rounded-xl bg-slate-50"
                                  />
                              </div>
                            </div>

                             <div className="grid gap-3 sm:grid-cols-3 pt-2">
                              <FilePicker
                                label="Store Logo"
                                helper={logoFile?.name ?? 'Upload mark'}
                                onChange={setLogoFile}
                              />
                              <FilePicker
                                label="Storefront"
                                helper={storefrontPhoto?.name ?? 'Exterior shot'}
                                onChange={setStorefrontPhoto}
                              />
                              <FilePicker
                                label="Inside Store"
                                helper={interiorPhoto?.name ?? 'Interior shot'}
                                onChange={setInteriorPhoto}
                              />
                            </div>
                          </motion.div>
                        ) : (
                          /* Step 3: Verification */
                          <motion.div
                            key="step-3"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                          >
                            <div className="space-y-2">
                              <label htmlFor="phone" className="text-sm font-medium text-slate-700">Phone Number</label>
                              <Input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+254 712 345 678"
                                required={verificationMethod === 'phone'}
                                className="h-11 rounded-xl bg-slate-50"
                              />
                            </div>

                            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">Verification Channel</p>
                                <p className="text-sm text-slate-500">How should we verify your identity?</p>
                              </div>
                              <div className="grid gap-3 sm:grid-cols-2">
                                <VerificationOption
                                  title="Email Link"
                                  description="Verify via email"
                                  active={verificationMethod === 'email'}
                                  onClick={() => setVerificationMethod('email')}
                                />
                                <VerificationOption
                                  title="SMS OTP"
                                  description="Verify via text"
                                  active={verificationMethod === 'phone'}
                                  onClick={() => setVerificationMethod('phone')}
                                />
                              </div>
                            </div>

                            <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                              <input
                                type="checkbox"
                                className="mt-0.5 h-5 w-5 rounded border-slate-300 text-primary transition focus:ring-primary"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                              />
                              <span className="text-sm text-slate-600">
                                I agree to the <button type="button" onClick={() => navigate('terms')} className="font-semibold text-primary hover:underline">Terms & Conditions</button> and <button type="button" onClick={() => navigate('privacy')} className="font-semibold text-primary hover:underline">Privacy Policy</button>.
                              </span>
                            </label>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
                            {error}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100">
                       <Button
                        type="button"
                        variant="ghost"
                        className="text-slate-600 hover:bg-slate-100"
                        disabled={isStepTransitioning || isSubmitting}
                        onClick={() =>
                          signupStep === 0
                            ? setIsLogin(true)
                            : setSignupStep((current) => Math.max(current - 1, 0) as SignupStep)
                        }
                      >
                        {signupStep === 0 ? 'Log in instead' : 'Back'}
                      </Button>

                      {signupStep < signupSteps.length - 1 ? (
                        <Button 
                          type="button" 
                          onClick={() => void handleNextSignupStep()} 
                          disabled={isStepTransitioning}
                          className="h-11 px-8 rounded-xl font-semibold shadow-lg shadow-primary/20"
                        >
                          Continue
                        </Button>
                      ) : (
                        <Button 
                          type="submit" 
                          disabled={isSubmitting || isStepTransitioning}
                          className="h-11 px-8 rounded-xl font-semibold shadow-lg shadow-primary/20"
                        >
                          {isSubmitting ? (
                            <>
                              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            'Create Store'
                          )}
                        </Button>
                      )}
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
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
