import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { SessionProvider } from '@/components/SessionProvider';
import { KeywordMonitor } from '@/components/KeywordMonitor';

const SITE_URL = 'https://facelesschannel.net';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const title = 'Keyword Monitor — Track Low-Sub High-View YouTube Shorts';
  const description =
    'Get a daily email alert whenever a YouTube Short with your target keyword blows up — high views, low subscriber channel. Free tool for faceless creators.';
  const ogImage = `${SITE_URL}/api/og?title=${encodeURIComponent('Keyword Monitor')}&category=${encodeURIComponent('Tools')}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${SITE_URL}/${locale}/tools/keyword-monitor`,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
    alternates: {
      canonical: `${SITE_URL}/${locale}/tools/keyword-monitor`,
      languages: {
        en: `${SITE_URL}/en/tools/keyword-monitor`,
        zh: `${SITE_URL}/zh/tools/keyword-monitor`,
        ja: `${SITE_URL}/ja/tools/keyword-monitor`,
        ko: `${SITE_URL}/ko/tools/keyword-monitor`,
        de: `${SITE_URL}/de/tools/keyword-monitor`,
      },
    },
  };
}

export default function KeywordMonitorPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link
        href="/tools"
        className="text-sm text-text-secondary hover:text-primary transition-colors mb-8 inline-block"
      >
        &larr; Back to Tools
      </Link>

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">📡</span>
          <h1 className="text-3xl font-bold text-text-primary">Keyword Monitor</h1>
        </div>
        <p className="text-lg text-text-secondary leading-relaxed max-w-2xl">
          Track any YouTube keyword daily. Get an email every morning with Shorts that have
          exploded in views despite the channel having few subscribers — a reliable signal
          for finding viral niche content to replicate.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-xs bg-success/10 text-success px-3 py-1 rounded-full">Free</span>
          <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full">Daily Alerts</span>
          <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">Shorts Only</span>
        </div>
      </div>

      <SessionProvider>
        <KeywordMonitor />
      </SessionProvider>

      {/* How it works */}
      <section className="mt-16 pt-10 border-t border-border">
        <h2 className="text-2xl font-bold text-text-primary mb-6">How It Works</h2>
        <div className="space-y-4">
          {[
            {
              step: '01',
              title: 'Enter a keyword',
              desc: 'Type any topic you want to monitor — "dog sleep", "stoic quotes", "budget meal prep". The monitor scans YouTube Shorts published in the last 7 days matching that keyword.',
            },
            {
              step: '02',
              title: 'Set your ratio threshold',
              desc: 'Choose how viral the signal needs to be. A ratio of 10× means the video has at least 10× more views than the channel has subscribers. Higher ratio = stronger viral signal.',
            },
            {
              step: '03',
              title: 'Receive a daily email',
              desc: 'Every morning at 9:00 AM (UTC+8), you\'ll receive an email listing only new, previously-unsent videos that meet your criteria — with thumbnail, view count, subscriber count, and direct link.',
            },
          ].map(s => (
            <div key={s.step} className="flex gap-5 bg-surface border border-border rounded-xl p-5">
              <span className="text-2xl font-bold text-primary/40 shrink-0 w-10">{s.step}</span>
              <div>
                <h3 className="font-semibold text-text-primary mb-1">{s.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why this matters */}
      <section className="mt-16 pt-10 border-t border-border">
        <h2 className="text-2xl font-bold text-text-primary mb-4">
          Why Low-Sub High-View Videos Are a Goldmine
        </h2>
        <p className="text-text-secondary mb-8 leading-relaxed">
          When a channel with 200 subscribers gets 500K views on a single Short, it means the
          algorithm pushed the content — not the audience. That&apos;s proof the topic, format,
          and hook have genuine demand. Faceless creators use these signals to identify exactly
          what to make next, before the niche becomes saturated.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { icon: '📈', title: 'Algorithmic Pull Signals', desc: 'High ratio = the algorithm is actively distributing the content. Low subs means it\'s not riding existing audience.' },
            { icon: '🕐', title: 'First-Mover Advantage', desc: 'You see these videos within 7 days of posting, while the trend is still early and competition is low.' },
            { icon: '🎯', title: 'Format Validation', desc: 'The thumbnail, hook, and length already proved they work. Replicate the format, not the content.' },
            { icon: '🔁', title: 'Daily Fresh Data', desc: 'New results every day. Each email contains only videos you haven\'t been alerted about before.' },
          ].map(f => (
            <div key={f.title} className="bg-surface border border-border rounded-xl p-5">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-text-primary mb-2">{f.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'YouTube Keyword Monitor',
            description: 'Daily email alerts for low-subscriber high-view YouTube Shorts matching your keywords',
            applicationCategory: 'WebApplication',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }),
        }}
      />
    </div>
  );
}
