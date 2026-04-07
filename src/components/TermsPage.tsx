import React from 'react';
import { MarketingPageLayout } from './MarketingPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import type { PageType, SessionUser } from '../App';

interface TermsPageProps {
  navigate: (page: PageType) => void;
  sessionUser?: SessionUser | null;
}

const sections = [
  {
    title: '1. Account Use',
    body:
      'Merchants are responsible for keeping their login credentials secure and for activity carried out under their FEZZY account.'
  },
  {
    title: '2. Merchant Content',
    body:
      'You retain ownership of your products, descriptions, and media, but you give FEZZY permission to host and display that content as part of your storefront.'
  },
  {
    title: '3. Billing and Payments',
    body:
      'Paid plans, transaction fees, and payment processing terms depend on the active package selected for your store.'
  },
  {
    title: '4. Compliance',
    body:
      'Stores must follow applicable laws, payment-network requirements, and marketplace policies. FEZZY may suspend stores that present fraud, abuse, or compliance risk.'
  },
  {
    title: '5. Platform Availability',
    body:
      'We aim to keep FEZZY reliable and available, but temporary outages, maintenance, or service changes may occasionally occur.'
  }
];

export function TermsPage({ navigate, sessionUser }: TermsPageProps) {
  return (
    <MarketingPageLayout
      navigate={navigate}
      sessionUser={sessionUser}
      title="Terms & Conditions"
      subtitle="These terms explain how FEZZY accounts, billing, and platform usage are handled."
    >
      <section className="px-4 pb-20">
        <div className="container mx-auto max-w-4xl space-y-6">
          {sections.map((section) => (
            <Card key={section.title} className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-2xl">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-7">{section.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </MarketingPageLayout>
  );
}
