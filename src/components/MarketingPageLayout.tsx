import React, { useEffect, useState } from 'react';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { Button } from './ui/Button';
import type { PageType, SessionUser } from '../App';

interface MarketingPageLayoutProps {
  children: React.ReactNode;
  navigate: (page: PageType) => void;
  sessionUser?: SessionUser | null;
  title?: string;
  subtitle?: string;
}

export function MarketingPageLayout({
  children,
  navigate,
  sessionUser,
  title,
  subtitle
}: MarketingPageLayoutProps) {
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const workspacePage =
    sessionUser?.role === 'root-admin' ?
      'root-admin' :
      sessionUser?.role === 'admin' ?
        'admin' :
        'dashboard';

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <button
            type="button"
            className="flex items-center gap-2"
            onClick={() => navigate('landing')}
          >
           <img
              src="https://res.cloudinary.com/dgfmhyebp/image/upload/v1775503932/Untitled_design_6_-Photoroom_qi5ng3.png"
              alt="Lashawn Driving & Computer College"
              className="h-16 md:h-36 lg:h-56 w-auto object-contain" />
          </button>

          <nav className="hidden md:flex items-center gap-8">
            <button
              type="button"
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => navigate('landing')}
            >
              Home
            </button>
            <button
              type="button"
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => navigate('pricing')}
            >
              Pricing
            </button>
            <button
              type="button"
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => navigate('faq')}
            >
              FAQs
            </button>
            <div className="flex items-center gap-4 ml-4 border-l border-border pl-6">
              <button
                onClick={toggleDarkMode}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              {sessionUser ? (
                <Button variant="ghost" onClick={() => navigate(workspacePage)}>
                  Open Workspace
                </Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate('login')}>
                    Log in
                  </Button>
                  <Button onClick={() => navigate('signup')}>Start Free Trial</Button>
                </>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleDarkMode}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button className="p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background p-4 flex flex-col gap-4">
            <button
              type="button"
              className="text-left text-sm font-semibold p-2"
              onClick={() => {
                navigate('landing');
                setIsMobileMenuOpen(false);
              }}
            >
              Home
            </button>
            <button
              type="button"
              className="text-left text-sm font-semibold p-2"
              onClick={() => {
                navigate('pricing');
                setIsMobileMenuOpen(false);
              }}
            >
              Pricing
            </button>
            <button
              type="button"
              className="text-left text-sm font-semibold p-2"
              onClick={() => {
                navigate('faq');
                setIsMobileMenuOpen(false);
              }}
            >
              FAQs
            </button>
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              {sessionUser ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(workspacePage)}
                >
                  Open Workspace
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('login')}
                  >
                    Log in
                  </Button>
                  <Button className="w-full" onClick={() => navigate('signup')}>
                    Start Free Trial
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {(title || subtitle) && (
          <section className="px-4 pt-16 pb-8">
            <div className="container mx-auto max-w-5xl text-center">
              {title && (
                <h1 className="text-4xl md:text-6xl font-extrabold text-foreground">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="mt-5 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                  {subtitle}
                </p>
              )}
            </div>
          </section>
        )}
        {children}
      </main>

      <footer className="bg-background border-t border-border py-12 px-4">
        <div className="container mx-auto flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <img
            src="https://res.cloudinary.com/dgfmhyebp/image/upload/v1775503932/Untitled_design_6_-Photoroom_qi5ng3.png"
            alt="FEZZY"
            className="h-12 md:h-16 w-auto object-contain"
          />
          <div className="flex flex-wrap gap-4 text-sm font-medium text-muted-foreground">
            <button type="button" onClick={() => navigate('pricing')}>
              Pricing
            </button>
            <button type="button" onClick={() => navigate('faq')}>
              FAQs
            </button>
            <button type="button" onClick={() => navigate('terms')}>
              Terms & Conditions
            </button>
            <button type="button" onClick={() => navigate('privacy')}>
              Privacy Policy
            </button>
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} FEZZY Technologies. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
