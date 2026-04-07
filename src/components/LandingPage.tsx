import React, { useEffect, useState } from 'react';
import { Button } from './ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle } from
'./ui/Card';
import {
  Store,
  Smartphone,
  Globe,
  Package,
  Sparkles,
  MessageCircle,
  Check,
  Star,
  Menu,
  X,
  ArrowRight,
  Sun,
  Moon } from
'lucide-react';
import { motion } from 'framer-motion';
import type { PageType, SessionUser } from '../App';
interface LandingPageProps {
  navigate: (page: PageType) => void;
  sessionUser?: SessionUser | null;
}
export function LandingPage({ navigate, sessionUser }: LandingPageProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
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
  const features = [
  {
    icon: <Store className="h-6 w-6 text-primary" />,
    title: 'No-Code Store Builder',
    desc: 'Drag-and-drop templates to build your store in minutes.'
  },
  {
    icon: <Smartphone className="h-6 w-6 text-primary" />,
    title: 'M-Pesa Integration',
    desc: 'Accept mobile money instantly from your customers.'
  },
  {
    icon: <Globe className="h-6 w-6 text-primary" />,
    title: 'Custom Domains',
    desc: 'Connect your .co.ke, .com, or .africa domain easily.'
  },
  {
    icon: <Package className="h-6 w-6 text-primary" />,
    title: 'Order Management',
    desc: 'Track orders, inventory, and fulfillment in real-time.'
  },
  {
    icon: <Sparkles className="h-6 w-6 text-primary" />,
    title: 'AI Product Descriptions',
    desc: 'Generate compelling product descriptions with AI.'
  },
  {
    icon: <MessageCircle className="h-6 w-6 text-primary" />,
    title: 'WhatsApp Orders',
    desc: 'Receive and manage orders directly via WhatsApp.'
  }];

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Left Accent Line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary z-50 hidden md:block"></div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('landing')}>
              <img
              src="https://res.cloudinary.com/dgfmhyebp/image/upload/v1775503932/Untitled_design_6_-Photoroom_qi5ng3.png"
              alt="Lashawn Driving & Computer College"
              className="h-16 md:h-36 lg:h-56 w-auto object-contain" />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">

              Features
            </a>
            <button
              type="button"
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => navigate('pricing')}>

              Pricing
            </button>
            <button
              type="button"
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => navigate('faq')}>

              FAQs
            </button>
            <div className="flex items-center gap-4 ml-4 border-l border-border pl-6">
              <button
                onClick={toggleDarkMode}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
                aria-label="Toggle dark mode">

                {isDark ?
                <Sun className="h-5 w-5" /> :

                <Moon className="h-5 w-5" />
                }
              </button>
              {sessionUser ?
              <Button variant="ghost" onClick={() => navigate(workspacePage)}>
                  Open Workspace
                </Button> :
              <>
                  <Button variant="ghost" onClick={() => navigate('login')}>
                    Log in
                  </Button>
                  <Button onClick={() => navigate('signup')}>
                    Start Free Trial
                  </Button>
                </>
              }
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleDarkMode}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted">

              {isDark ?
              <Sun className="h-5 w-5" /> :

              <Moon className="h-5 w-5" />
              }
            </button>
            <button
              className="p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>

              {isMobileMenuOpen ?
              <X className="h-6 w-6" /> :

              <Menu className="h-6 w-6" />
              }
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen &&
        <div className="md:hidden border-t border-border bg-background p-4 flex flex-col gap-4">
            <a
            href="#features"
            className="text-sm font-semibold p-2"
            onClick={() => setIsMobileMenuOpen(false)}>

              Features
            </a>
            <button
            type="button"
            className="text-left text-sm font-semibold p-2"
            onClick={() => {
              navigate('pricing');
              setIsMobileMenuOpen(false);
            }}>

              Pricing
            </button>
            <button
            type="button"
            className="text-left text-sm font-semibold p-2"
            onClick={() => {
              navigate('faq');
              setIsMobileMenuOpen(false);
            }}>

              FAQs
            </button>
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              {sessionUser ?
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(workspacePage)}>

                  Open Workspace
                </Button> :
              <>
                  <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('login')}>

                    Log in
                  </Button>
                  <Button className="w-full" onClick={() => navigate('signup')}>
                    Start Free Trial
                  </Button>
                </>
              }
            </div>
          </div>
        }
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-4 overflow-hidden relative">
          <div className="container mx-auto max-w-5xl">
            <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.95fr)]">
              <div className="flex flex-col items-center text-center md:items-start md:text-left">
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 20
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  transition={{
                    duration: 0.5
                  }}
                  className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-8">

                  <Store className="h-4 w-4 mr-2" />
                  Built for African Entrepreneurs
                </motion.div>

                <motion.h1
                  initial={{
                    opacity: 0,
                    y: 20
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  transition={{
                    duration: 0.5,
                    delay: 0.1
                  }}
                  className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-[1.1]">

                  Build Your{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                    Online
                  </span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary">
                    Store
                  </span>{' '}
                  in Minutes
                </motion.h1>

                <motion.p
                  initial={{
                    opacity: 0,
                    y: 20
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  transition={{
                    duration: 0.5,
                    delay: 0.2
                  }}
                  className="text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">

                  Launch a beautiful, mobile-first e-commerce store with M-Pesa
                  payments, custom domains, and everything you need to sell online
                  across Africa.
                </motion.p>

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 20
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  transition={{
                    duration: 0.5,
                    delay: 0.3
                  }}
                  className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">

                  <Button
                    size="lg"
                    className="w-full sm:w-auto"
                    onClick={() => navigate('signup')}>

                    Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto">

                    Watch Demo
                  </Button>
                </motion.div>

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 20
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  transition={{
                    duration: 0.5,
                    delay: 0.4
                  }}
                  className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-10 text-sm font-medium text-muted-foreground">

                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-secondary" />
                    Mobile-first
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-accent" />
                    No coding required
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-accent" />
                    Free plan
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{
                  opacity: 0,
                  y: 40
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                transition={{
                  duration: 0.7,
                  delay: 0.5
                }}
                className="relative mx-auto w-full max-w-xl lg:max-w-none">

                <div className="overflow-hidden">
                  <img
                    src="https://res.cloudinary.com/dgfmhyebp/image/upload/v1775506123/Copy_of_Untitled_Design_1_-Photoroom_wy3lgh.png"
                    alt="FEZZY Platform Dashboard"
                    className="w-full h-auto object-cover" />

                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-muted/30 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                Everything you need to succeed
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Powerful features designed specifically for the modern African
                entrepreneur.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, idx) =>
              <motion.div
                key={idx}
                initial={{
                  opacity: 0,
                  y: 20
                }}
                whileInView={{
                  opacity: 1,
                  y: 0
                }}
                viewport={{
                  once: true
                }}
                transition={{
                  duration: 0.5,
                  delay: idx * 0.1
                }}>

                  <Card className="border-border/50 bg-background hover:shadow-lg transition-shadow h-full rounded-2xl">
                    <CardHeader>
                      <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.desc}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </section>

        <section className="py-24 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="rounded-3xl border-border/60 bg-background">
                <CardHeader>
                  <CardTitle className="text-3xl">Explore Pricing</CardTitle>
                  <CardDescription className="text-base">
                    Compare merchant plans, transaction options, and growth tiers on a dedicated pricing page.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button onClick={() => navigate('pricing')}>
                    View Pricing
                  </Button>
                </CardFooter>
              </Card>

              <Card className="rounded-3xl border-border/60 bg-background">
                <CardHeader>
                  <CardTitle className="text-3xl">Read Our FAQs</CardTitle>
                  <CardDescription className="text-base">
                    Get answers about M-Pesa, custom domains, subscriptions, and merchant onboarding.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="outline" onClick={() => navigate('faq')}>
                    Open FAQs
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-24 bg-muted/30 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                Trusted by Kenyan Entrepreneurs
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
              {
                name: 'Wanjiku N.',
                biz: 'Shiku Styles',
                quote:
                'FEZZY made it so easy to move my boutique online. The M-Pesa integration works flawlessly!'
              },
              {
                name: 'Ochieng O.',
                biz: 'Lake View Electronics',
                quote:
                'I tried other platforms but they were too complex. FEZZY is built for our market. Highly recommended.'
              },
              {
                name: 'Amina Y.',
                biz: 'Amina Beauty',
                quote:
                'The custom domain feature gave my business the professional look it needed. Sales have doubled!'
              }].
              map((t, i) =>
              <Card
                key={i}
                className="bg-background rounded-2xl border-none shadow-md">

                  <CardContent className="pt-8">
                    <div className="flex gap-1 mb-6">
                      {[1, 2, 3, 4, 5].map((star) =>
                    <Star
                      key={star}
                      className="h-5 w-5 fill-accent text-accent" />

                    )}
                    </div>
                    <p className="text-muted-foreground text-lg italic mb-8 leading-relaxed">
                      "{t.quote}"
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{t.name}</p>
                        <p className="text-sm font-medium text-muted-foreground">
                          {t.biz}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-primary text-primary-foreground text-center px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="container mx-auto max-w-4xl relative z-10">
            <h2 className="text-4xl md:text-6xl font-extrabold mb-8">
              Ready to grow your business online?
            </h2>
            <p className="text-xl md:text-2xl opacity-90 mb-12 max-w-2xl mx-auto font-medium">
              Join thousands of African businesses selling on FEZZY today. No
              credit card required.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="text-lg h-14 px-10 bg-white text-primary hover:bg-gray-100"
              onClick={() => navigate('signup')}>

              Start Your Free Trial
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12 px-4">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between ">
            <img
              src="https://res.cloudinary.com/dgfmhyebp/image/upload/v1775503932/Untitled_design_6_-Photoroom_qi5ng3.png"
              alt="Lashawn Driving & Computer College"
              className="h-10 md:h-16 lg:h-24 w-auto object-contain" />
          <div className="text-muted-foreground font-medium">
            © {new Date().getFullYear()} FEZZY Technologies. All rights
            reserved.
          </div>
          <div className="flex flex-wrap gap-4 font-medium text-muted-foreground">
            <button type="button" onClick={() => navigate('pricing')}>Pricing</button>
            <button type="button" onClick={() => navigate('faq')}>FAQs</button>
            <button type="button" onClick={() => navigate('terms')}>Terms & Conditions</button>
            <button type="button" onClick={() => navigate('privacy')}>Privacy Policy</button>
          </div>
        </div>
      </footer>
    </div>);

}
