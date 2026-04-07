import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { MarketingPageLayout } from './MarketingPageLayout';
import type { PageType, SessionUser } from '../App';

interface FaqPageProps {
  navigate: (page: PageType) => void;
  sessionUser?: SessionUser | null;
}

const faqs = [
  {
    q: 'Do I need technical skills to use FEZZY?',
    a: 'Not at all. FEZZY is designed so merchants can create a polished online store without writing code.'
  },
  {
    q: 'How do I receive payments via M-Pesa?',
    a: 'You can connect your Paybill or Till details inside your merchant settings, and FEZZY routes customer payments through your checkout flow.'
  },
  {
    q: 'Can I use my own domain name?',
    a: 'Yes. Paid plans support custom domains, while all accounts also get a free FEZZY subdomain.'
  },
  {
    q: 'Is there a limit to how many products I can sell?',
    a: 'Free stores are capped, while higher plans increase or remove product limits depending on your plan.'
  },
  {
    q: 'Do you take a commission on my sales?',
    a: 'You can choose between monthly plans with predictable pricing or a pay-as-you-go model based on each transaction.'
  },
  {
    q: 'Can FEZZY support multiple user roles?',
    a: 'Yes. FEZZY now includes merchant access, admin access, and a Root Admin layer for platform-wide store management.'
  }
];

export function FaqPage({ navigate, sessionUser }: FaqPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <MarketingPageLayout
      navigate={navigate}
      sessionUser={sessionUser}
      title="Frequently Asked Questions"
      subtitle="Everything merchants and platform operators usually want to know before getting started."
    >
      <section className="px-4 pb-20">
        <div className="container mx-auto max-w-4xl space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.q}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              className="border border-border rounded-2xl overflow-hidden bg-card"
            >
              <button
                type="button"
                className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <span className="font-bold text-lg text-foreground">{faq.q}</span>
                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground transition-transform ${
                    openFaq === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaq === index && (
                <div className="p-6 pt-0 bg-background text-muted-foreground leading-relaxed text-lg">
                  {faq.a}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>
    </MarketingPageLayout>
  );
}
