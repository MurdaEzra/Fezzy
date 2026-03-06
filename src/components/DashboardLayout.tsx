import React, { useEffect, useState, useRef } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  LayoutTemplate,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Store,
  Sun,
  Moon,
  User,
  CreditCard,
  HelpCircle } from
'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Input } from './ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import type { PageType } from '../App';
interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage: PageType;
  navigate: (page: PageType) => void;
}
export function DashboardLayout({
  children,
  currentPage,
  navigate
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const handleClickOutside = (event: MouseEvent) => {
      if (
      notifRef.current &&
      !notifRef.current.contains(event.target as Node))
      {
        setShowNotifications(false);
      }
      if (
      profileRef.current &&
      !profileRef.current.contains(event.target as Node))
      {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };
  const navItems = [
  {
    id: 'dashboard',
    label: 'Overview',
    icon: <LayoutDashboard className="h-5 w-5" />
  },
  {
    id: 'products',
    label: 'Products',
    icon: <Package className="h-5 w-5" />
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: <ShoppingCart className="h-5 w-5" />
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <BarChart3 className="h-5 w-5" />
  },
  {
    id: 'store-builder',
    label: 'Store Builder',
    icon: <LayoutTemplate className="h-5 w-5" />
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="h-5 w-5" />
  }];

  const handleNavClick = (id: string) => {
    navigate(id as PageType);
    setIsSidebarOpen(false);
  };
  return (
    <div className="min-h-screen bg-muted/20 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen &&
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
        onClick={() => setIsSidebarOpen(false)} />

      }

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        <div className="h-16 flex items-center px-6 border-b border-border justify-between lg:justify-start">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('dashboard')}>

            <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
              <Store className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              FEZZY
            </span>
          </div>
          <button
            className="lg:hidden text-muted-foreground"
            onClick={() => setIsSidebarOpen(false)}>

            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              MM
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground leading-none">
                Mama Mboga Store
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                mamamboga.fezzy.com
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="w-full justify-center mt-2">
            Free Plan
          </Badge>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) =>
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors
                ${currentPage === item.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
              `}>

              {item.icon}
              {item.label}
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-border space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start text-muted-foreground"
            onClick={() => navigate('landing')}>

            <LogOut className="h-4 w-4 mr-2" />
            Log out
          </Button>
          <Button
            className="w-full bg-gradient-to-r from-primary to-primary/80"
            onClick={() => navigate('settings')}>

            Upgrade Plan
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:pl-64 min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-muted-foreground"
              onClick={() => setIsSidebarOpen(true)}>

              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden md:flex relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search orders, products..."
                className="pl-9 bg-muted/50 border-none" />

            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted">

              {isDark ?
              <Sun className="h-5 w-5" /> :

              <Moon className="h-5 w-5" />
              }
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
                onClick={() => setShowNotifications(!showNotifications)}>

                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center border-2 border-card">
                  3
                </span>
              </button>

              <AnimatePresence>
                {showNotifications &&
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10,
                    scale: 0.95
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1
                  }}
                  exit={{
                    opacity: 0,
                    y: 10,
                    scale: 0.95
                  }}
                  transition={{
                    duration: 0.2
                  }}
                  className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">

                    <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                      <h3 className="font-semibold text-sm">Notifications</h3>
                      <button className="text-xs text-primary hover:underline">
                        Mark all as read
                      </button>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      <div className="p-4 border-b border-border hover:bg-muted/30 transition-colors cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                            <ShoppingCart className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              New Order #FZ-1005
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Wanjiku Njoroge just placed an order for KES
                              4,500.
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-2">
                              10 minutes ago
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 border-b border-border hover:bg-muted/30 transition-colors cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                            <Package className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              Low Stock Alert
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Carved Wooden Elephant is running low (3 left).
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-2">
                              2 hours ago
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 hover:bg-muted/30 transition-colors cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                            <Store className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              Store Published
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Your latest changes have been published
                              successfully.
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-2">
                              Yesterday
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2 border-t border-border text-center bg-muted/10">
                      <button className="text-xs text-muted-foreground hover:text-foreground font-medium">
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
                }
              </AnimatePresence>
            </div>

            {/* Profile Menu */}
            <div className="relative" ref={profileRef}>
              <div
                className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                onClick={() => setShowProfileMenu(!showProfileMenu)}>

                J
              </div>

              <AnimatePresence>
                {showProfileMenu &&
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10,
                    scale: 0.95
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1
                  }}
                  exit={{
                    opacity: 0,
                    y: 10,
                    scale: 0.95
                  }}
                  transition={{
                    duration: 0.2
                  }}
                  className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">

                    <div className="p-4 border-b border-border">
                      <p className="font-medium text-sm">James Doe</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        james@mamamboga.co.ke
                      </p>
                    </div>
                    <div className="p-2">
                      <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate('settings');
                      }}>

                        <User className="h-4 w-4" /> My Profile
                      </button>
                      <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate('settings');
                      }}>

                        <CreditCard className="h-4 w-4" /> Billing
                      </button>
                      <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                        <HelpCircle className="h-4 w-4" /> Help & Support
                      </button>
                    </div>
                    <div className="p-2 border-t border-border">
                      <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                      onClick={() => navigate('landing')}>

                        <LogOut className="h-4 w-4" /> Log out
                      </button>
                    </div>
                  </motion.div>
                }
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>);

}