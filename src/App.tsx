import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { DashboardLayout } from './components/DashboardLayout';
import { DashboardOverview } from './components/DashboardOverview';
import { ProductsPage } from './components/ProductsPage';
import { OrdersPage } from './components/OrdersPage';
import { AnalyticsPage } from './components/AnalyticsPage';
import { StoreBuilderPage } from './components/StoreBuilderPage';
import { SettingsPage } from './components/SettingsPage';
import { SuperAdminPage } from './components/SuperAdminPage';
import { LiveStorePage } from './components/LiveStorePage';
import { RootAdminPage } from './components/RootAdminPage';
import { PricingPage } from './components/PricingPage';
import { FaqPage } from './components/FaqPage';
import { TermsPage } from './components/TermsPage';
import { PrivacyPage } from './components/PrivacyPage';
import { supabase } from './contexts/supabaseClient';
import { getSessionFromSupabaseUser } from './lib/auth';
import { ensureStoreForUser } from './lib/store';

export type PageType =
  | 'landing'
  | 'login'
  | 'signup'
  | 'dashboard'
  | 'products'
  | 'orders'
  | 'analytics'
  | 'store-builder'
  | 'settings'
  | 'admin'
  | 'root-admin'
  | 'pricing'
  | 'faq'
  | 'terms'
  | 'privacy'
  | 'live-store';

export type UserRole = 'merchant' | 'admin' | 'root-admin';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  title: string;
  plan?: string;
  storeName?: string;
  storeSubdomain?: string;
}

const merchantPages: PageType[] = [
  'dashboard',
  'products',
  'orders',
  'analytics',
  'store-builder',
  'settings'
];

export function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('landing');
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const accessMap = useMemo(
    () => ({
      admin: ['admin', 'root-admin'] as UserRole[],
      'root-admin': ['root-admin'] as UserRole[],
      merchant: ['merchant'] as UserRole[]
    }),
    []
  );

  const navigate = (page: PageType) => {
    setCurrentPage(getAuthorizedPage(page, sessionUser, accessMap));
    window.scrollTo(0, 0);
  };

  const handleAuthenticate = (user: SessionUser, page: PageType) => {
    setSessionUser(user);
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    void supabase.auth.signOut();
    setSessionUser(null);
    setCurrentPage('landing');
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    let isMounted = true;

    const initializeSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (error) {
        console.error('Failed to restore Supabase session:', error.message);
        setSessionUser(null);
        setIsAuthReady(true);
        return;
      }

      if (data.session?.user) {
        const nextSession = getSessionFromSupabaseUser(data.session.user);
        const currentStore = await ensureStoreForUser(nextSession.user);
        setSessionUser(nextSession.user);
        if (currentStore) {
          setSessionUser({
            ...nextSession.user,
            storeName: currentStore.name,
            storeSubdomain: currentStore.subdomain,
            plan: currentStore.plans?.name ?? nextSession.user.plan
          });
        } else {
          setSessionUser(nextSession.user);
        }
        setCurrentPage((current) =>
          current === 'landing' || current === 'login' || current === 'signup' ?
            nextSession.targetPage :
            current
        );
      } else {
        setSessionUser(null);
      }

      setIsAuthReady(true);
    };

    void initializeSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void (async () => {
        if (session?.user) {
          const nextSession = getSessionFromSupabaseUser(session.user);
          const currentStore = await ensureStoreForUser(nextSession.user);
          setSessionUser(
            currentStore ?
              {
                ...nextSession.user,
                storeName: currentStore.name,
                storeSubdomain: currentStore.subdomain,
                plan: currentStore.plans?.name ?? nextSession.user.plan
              } :
              nextSession.user
          );
        } else {
          setSessionUser(null);
        }
      })();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    const safePage = getAuthorizedPage(currentPage, sessionUser, accessMap);
    if (safePage !== currentPage) {
      setCurrentPage(safePage);
    }
  }, [accessMap, currentPage, isAuthReady, sessionUser]);

  let content: React.ReactNode;

  if (!isAuthReady) {
    content = null;
  } else if (currentPage === 'landing') {
    content = <LandingPage navigate={navigate} sessionUser={sessionUser} />;
  } else if (currentPage === 'pricing') {
    content = <PricingPage navigate={navigate} sessionUser={sessionUser} />;
  } else if (currentPage === 'faq') {
    content = <FaqPage navigate={navigate} sessionUser={sessionUser} />;
  } else if (currentPage === 'terms') {
    content = <TermsPage navigate={navigate} sessionUser={sessionUser} />;
  } else if (currentPage === 'privacy') {
    content = <PrivacyPage navigate={navigate} sessionUser={sessionUser} />;
  } else if (currentPage === 'login' || currentPage === 'signup') {
    content = (
      <AuthPage
        initialTab={currentPage}
        navigate={navigate}
        onAuthenticate={handleAuthenticate}
      />
    );
  } else if (currentPage === 'admin' && sessionUser) {
    content = (
      <SuperAdminPage
        navigate={navigate}
        currentUser={sessionUser}
        onLogout={handleLogout}
      />
    );
  } else if (currentPage === 'root-admin' && sessionUser) {
    content = (
      <RootAdminPage
        navigate={navigate}
        currentUser={sessionUser}
        onLogout={handleLogout}
      />
    );
  } else if (currentPage === 'live-store') {
    content = <LiveStorePage navigate={navigate} currentUser={sessionUser} />;
  } else if (sessionUser) {
    content = (
      <DashboardLayout
        currentPage={currentPage}
        navigate={navigate}
        currentUser={sessionUser}
        onLogout={handleLogout}
      >
        {currentPage === 'dashboard' && (
          <DashboardOverview navigate={navigate} currentUser={sessionUser} />
        )}
        {currentPage === 'products' && <ProductsPage currentUser={sessionUser} />}
        {currentPage === 'orders' && <OrdersPage currentUser={sessionUser} />}
        {currentPage === 'analytics' && <AnalyticsPage currentUser={sessionUser} />}
        {currentPage === 'store-builder' && (
          <StoreBuilderPage navigate={navigate} currentUser={sessionUser} />
        )}
        {currentPage === 'settings' && <SettingsPage currentUser={sessionUser} />}
      </DashboardLayout>
    );
  } else {
    content = (
      <AuthPage
        initialTab="login"
        navigate={navigate}
        onAuthenticate={handleAuthenticate}
      />
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPage}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
        {content}
      </motion.div>
    </AnimatePresence>
  );
}

function getAuthorizedPage(
  page: PageType,
  user: SessionUser | null,
  accessMap: {
    admin: UserRole[];
    'root-admin': UserRole[];
    merchant: UserRole[];
  }
) {
  if (page === 'admin') {
    return user && accessMap.admin.includes(user.role) ? page : 'login';
  }

  if (page === 'root-admin') {
    return user && accessMap['root-admin'].includes(user.role) ? page : 'login';
  }

  if (merchantPages.includes(page)) {
    return user && accessMap.merchant.includes(user.role) ? page : 'login';
  }

  return page;
}
