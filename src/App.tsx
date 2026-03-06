import React, { useState } from 'react';
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
export type PageType =
'landing' |
'login' |
'signup' |
'dashboard' |
'products' |
'orders' |
'analytics' |
'store-builder' |
'settings' |
'admin' |
'live-store';
export function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('landing');
  const navigate = (page: PageType) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  if (currentPage === 'landing') {
    return <LandingPage navigate={navigate} />;
  }
  if (currentPage === 'login' || currentPage === 'signup') {
    return <AuthPage initialTab={currentPage} navigate={navigate} />;
  }
  if (currentPage === 'admin') {
    return <SuperAdminPage navigate={navigate} />;
  }
  if (currentPage === 'live-store') {
    return <LiveStorePage navigate={navigate} />;
  }
  // All other routes are wrapped in the DashboardLayout
  return (
    <DashboardLayout currentPage={currentPage} navigate={navigate}>
      {currentPage === 'dashboard' && <DashboardOverview navigate={navigate} />}
      {currentPage === 'products' && <ProductsPage />}
      {currentPage === 'orders' && <OrdersPage />}
      {currentPage === 'analytics' && <AnalyticsPage />}
      {currentPage === 'store-builder' &&
      <StoreBuilderPage navigate={navigate} />
      }
      {currentPage === 'settings' && <SettingsPage />}
    </DashboardLayout>);

}