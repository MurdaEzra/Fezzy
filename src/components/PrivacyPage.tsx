import React from 'react';
import { MarketingPageLayout } from './MarketingPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import type { PageType, SessionUser } from '../App';

interface PrivacyPageProps {
  navigate: (page: PageType) => void;
  sessionUser?: SessionUser | null;
}

const sections = [
  {
    title: 'Information We Collect',
    body:
      'We collect account details, store information, transaction data, and the operational data needed to provide storefront and payment features.'
  },
  {
    title: 'How We Use Information',
    body:
      'Your data is used to run your FEZZY account, improve platform performance, support merchants, and help protect the platform from fraud or misuse.'
  },
  {
    title: 'Data Sharing',
    body:
      'We only share information with payment providers, infrastructure partners, and service providers when required to operate FEZZY or comply with legal obligations.'
  },
  {
    title: 'Security',
    body:
      'We use technical and administrative safeguards to protect merchant and customer data, though no system can guarantee absolute security.'
  },
  {
    title: 'Your Choices',
    body:
      'You can request account updates, export certain data, or close your FEZZY store subject to any compliance or payment retention obligations.'
  }
];

export function PrivacyPage({ navigate, sessionUser }: PrivacyPageProps) {
  return (
    <MarketingPageLayout
      navigate={navigate}
      sessionUser={sessionUser}
      title="Privacy Policy"
      subtitle="This page explains how FEZZY collects, uses, and protects merchant and store data."
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
