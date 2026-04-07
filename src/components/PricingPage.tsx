import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/Card';
import { MarketingPageLayout } from './MarketingPageLayout';
import type { PageType, SessionUser } from '../App';

interface PricingPageProps {
  navigate: (page: PageType) => void;
  sessionUser?: SessionUser | null;
}

const plans = [
  {
    name: 'Free',
    description: 'Perfect for getting started',
    price: 'KES 0',
    suffix: '/mo',
    features: [
      'Up to 20 products',
      'storename.fezzy.com subdomain',
      'M-Pesa Integration',
      'Basic Analytics',
      'FEZZY Branding'
    ],
    cta: 'Get Started',
    variant: 'outline' as const
  },
  {
    name: 'Basic',
    description: 'For growing businesses',
    price: 'KES 2,500',
    suffix: '/mo',
    features: [
      'Up to 200 products',
      'Custom Domain (.co.ke, .com)',
      'Remove FEZZY Branding',
      'Advanced Analytics',
      'Email Support'
    ],
    cta: 'Start 14-Day Trial',
    featured: true
  },
  {
    name: 'Pro',
    description: 'For high-volume sellers',
    price: 'KES 7,500',
    suffix: '/mo',
    features: [
      'Unlimited products',
      'Everything in Basic',
      'AI Product Descriptions',
      'Email Marketing Tools',
      'Priority 24/7 Support'
    ],
    cta: 'Get Started',
    variant: 'outline' as const
  },
  {
    name: 'Pay As You Go',
    description: 'Only pay when you sell',
    price: '2%',
    suffix: '/transaction',
    features: [
      'Unlimited products',
      'Custom Domain (.co.ke, .com)',
      'Remove FEZZY Branding',
      'M-Pesa & Card Payments',
      'Basic Analytics',
      'No monthly commitment'
    ],
    cta: 'Start Selling',
    variant: 'outline' as const
  }
];

export function PricingPage({ navigate, sessionUser }: PricingPageProps) {
  return (
    <MarketingPageLayout
      navigate={navigate}
      sessionUser={sessionUser}
      title="Simple, transparent pricing"
      subtitle="Choose the plan that fits your business today, and upgrade when your store grows."
    >
      <section className="px-4 pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Card
                  className={`flex h-full flex-col rounded-3xl ${
                    plan.featured ? 'border-primary shadow-xl relative scale-[1.02]' : ''
                  }`}
                >
                  {plan.featured && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                      Most Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4 flex items-baseline text-4xl font-extrabold">
                      {plan.price}
                      <span className="ml-1 text-xl font-medium text-muted-foreground">
                        {plan.suffix}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-4">
                      {plan.features.map((item) => (
                        <li key={item} className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-primary shrink-0" />
                          <span className="text-muted-foreground text-sm font-medium">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={plan.variant || 'default'}
                      onClick={() => navigate('signup')}
                    >
                      {plan.cta}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </MarketingPageLayout>
  );
}
