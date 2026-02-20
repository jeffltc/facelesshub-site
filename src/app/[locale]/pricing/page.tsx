'use client';

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Link } from '@/i18n/navigation';

const SITE_URL = 'https://facelesschannel.net';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Get started for free.',
    cta: 'Get Started',
    ctaVariant: 'secondary' as const,
    features: [
      '1 keyword monitor',
      'Daily email alerts',
      '5 TD generations / day',
      '3 languages for translator',
      '5 videos / batch (translator)',
      '3 object removals / day',
      'Thumbnail downloader (unlimited)',
    ],
    limits: ['No video feed', 'No thumbnail upload'],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 9,
    annualPrice: 84,
    description: 'For creators serious about growth.',
    cta: 'Upgrade to Pro',
    ctaVariant: 'primary' as const,
    highlight: true,
    features: [
      '5 keyword monitors',
      'Daily email alerts',
      'Video feed (web viewer)',
      '30 TD generations / day',
      'Thumbnail upload for TD',
      'All 20+ languages for translator',
      '30 videos / batch (translator)',
      '20 object removals / day',
      'Thumbnail Analyzer (coming soon)',
      'Script Generator · 10/day (coming soon)',
    ],
    limits: [],
  },
  {
    id: 'max',
    name: 'Max',
    monthlyPrice: 19,
    annualPrice: 180,
    description: 'For studios and power users.',
    cta: 'Upgrade to Max',
    ctaVariant: 'outline' as const,
    features: [
      'Unlimited keyword monitors',
      'Daily email alerts',
      'Video feed (web viewer)',
      'Unlimited TD generations',
      'Unlimited translations',
      'Unlimited object removals',
      'All Pro features',
      'Niche Finder (coming soon)',
      'Title Optimizer (coming soon)',
      'Early access to new tools',
    ],
    limits: [],
  },
];

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-green-400 shrink-0 mt-0.5" viewBox="0 0 16 16" fill="currentColor">
      <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-4 h-4 text-text-secondary/40 shrink-0 mt-0.5" viewBox="0 0 16 16" fill="currentColor">
      <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06z" />
    </svg>
  );
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const { data: session, status } = useSession();

  // Success / signin param feedback
  if (typeof window !== 'undefined') {
    const p = new URLSearchParams(window.location.search);
    if (p.get('signin') === '1' && status === 'unauthenticated') {
      signIn('google');
    }
  }

  function getHref(planId: string) {
    if (planId === 'free') return '/en/tools';
    if (status === 'unauthenticated') return '#'; // will trigger signIn on click
    return `/api/checkout?plan=${planId}&period=${annual ? 'annual' : 'monthly'}`;
  }

  function handleCta(e: React.MouseEvent, planId: string) {
    if (planId === 'free') return;
    if (status === 'unauthenticated') {
      e.preventDefault();
      signIn('google');
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-text-primary mb-4">Simple, transparent pricing</h1>
        <p className="text-lg text-text-secondary max-w-xl mx-auto">
          Start free. Upgrade when you&apos;re ready to scale.
        </p>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <span className={`text-sm ${!annual ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
            Monthly
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative inline-flex w-12 h-6 rounded-full transition-colors ${
              annual ? 'bg-primary' : 'bg-border'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                annual ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-sm ${annual ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
            Annual
            <span className="ml-1.5 text-xs bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full">
              2 months free
            </span>
          </span>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const price = annual ? plan.annualPrice : plan.monthlyPrice;
          const perMonth = annual && plan.annualPrice > 0
            ? Math.round(plan.annualPrice / 12)
            : plan.monthlyPrice;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl p-6 border ${
                plan.highlight
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-surface'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-bold text-text-primary mb-1">{plan.name}</h2>
                <p className="text-sm text-text-secondary mb-4">{plan.description}</p>

                <div className="flex items-end gap-1">
                  {price === 0 ? (
                    <span className="text-4xl font-bold text-text-primary">Free</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-text-primary">
                        ${annual ? perMonth : price}
                      </span>
                      <span className="text-text-secondary text-sm mb-1">/mo</span>
                    </>
                  )}
                </div>
                {annual && price > 0 && (
                  <p className="text-xs text-text-secondary mt-1">
                    Billed ${price}/year
                  </p>
                )}
              </div>

              {/* CTA */}
              <a
                href={getHref(plan.id)}
                onClick={(e) => handleCta(e, plan.id)}
                className={`block text-center font-medium rounded-lg px-4 py-2.5 text-sm transition-colors mb-6 ${
                  plan.ctaVariant === 'primary'
                    ? 'bg-primary hover:bg-primary-hover text-white'
                    : plan.ctaVariant === 'outline'
                    ? 'border border-border hover:border-primary text-text-primary hover:text-primary'
                    : 'bg-surface border border-border hover:border-primary/50 text-text-primary'
                }`}
              >
                {plan.cta}
              </a>

              {/* Features */}
              <ul className="space-y-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                    <CheckIcon />
                    {f}
                  </li>
                ))}
                {plan.limits.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-text-secondary/50">
                    <XIcon />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="mt-20">
        <h2 className="text-2xl font-bold text-text-primary mb-8 text-center">Common questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {[
            {
              q: 'Can I cancel anytime?',
              a: 'Yes. Cancel from your billing portal and your plan stays active until the end of the paid period. No questions asked.',
            },
            {
              q: 'What payment methods are accepted?',
              a: 'All major credit cards and debit cards via Creem. PayPal and local payment methods may be available depending on your region.',
            },
            {
              q: 'Is there a free trial?',
              a: 'The Free plan is forever free — no credit card required. Upgrade to Pro or Max whenever you\'re ready.',
            },
            {
              q: 'What happens to my monitors if I downgrade?',
              a: 'Your existing monitors stay, but only the first one will be active. Your history and video feed are preserved.',
            },
          ].map((item) => (
            <div key={item.q} className="bg-surface border border-border rounded-xl p-5">
              <h3 className="font-semibold text-text-primary mb-2 text-sm">{item.q}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Manage billing link */}
      {session && (
        <p className="text-center mt-12 text-sm text-text-secondary">
          Already subscribed?{' '}
          <a href="/api/billing" className="text-primary hover:underline">
            Manage your billing →
          </a>
        </p>
      )}
    </div>
  );
}
