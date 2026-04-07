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
    setSessionUser(null);
    setCurrentPage('landing');
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const safePage = getAuthorizedPage(currentPage, sessionUser, accessMap);
    if (safePage !== currentPage) {
      setCurrentPage(safePage);
    }
  }, [accessMap, currentPage, sessionUser]);

  let content: React.ReactNode;

  if (currentPage === 'landing') {
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
    content = <LiveStorePage navigate={navigate} />;
  } else if (sessionUser) {
    content = (
      <DashboardLayout
        currentPage={currentPage}
        navigate={navigate}
        currentUser={sessionUser}
        onLogout={handleLogout}
      >
        {currentPage === 'dashboard' && <DashboardOverview navigate={navigate} />}
        {currentPage === 'products' && <ProductsPage />}
        {currentPage === 'orders' && <OrdersPage />}
        {currentPage === 'analytics' && <AnalyticsPage />}
        {currentPage === 'store-builder' && (
          <StoreBuilderPage navigate={navigate} />
        )}
        {currentPage === 'settings' && <SettingsPage />}
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
