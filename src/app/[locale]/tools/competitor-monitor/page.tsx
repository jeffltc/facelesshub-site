import { SessionProvider } from '@/components/SessionProvider';
import { CompetitorMonitor } from '@/components/CompetitorMonitor';
import { Link } from '@/i18n/navigation';

const SITE_URL = 'https://facelesschannel.net';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const title = 'Competitor Monitor — Track Rival Channels on YouTube Shorts';
  const description =
    'Get daily alerts when a competitor\'s YouTube Short goes viral. Input any channel URL, set a view/subs ratio threshold, and receive email notifications automatically.';
  const ogImage = `${SITE_URL}/api/og?title=${encodeURIComponent('Competitor Monitor')}&category=${encodeURIComponent('Tools')}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${SITE_URL}/${locale}/tools/competitor-monitor`,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
    alternates: {
      canonical: `${SITE_URL}/${locale}/tools/competitor-monitor`,
      languages: {
        en: `${SITE_URL}/en/tools/competitor-monitor`,
        zh: `${SITE_URL}/zh/tools/competitor-monitor`,
        ja: `${SITE_URL}/ja/tools/competitor-monitor`,
        ko: `${SITE_URL}/ko/tools/competitor-monitor`,
        de: `${SITE_URL}/de/tools/competitor-monitor`,
      },
    },
  };
}

export default function CompetitorMonitorPage() {
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
          <span className="text-4xl">📊</span>
          <h1 className="text-3xl font-bold text-text-primary">Competitor Monitor</h1>
        </div>
        <p className="text-lg text-text-secondary leading-relaxed max-w-2xl">
          Track any YouTube channel and get daily email alerts when one of their Shorts goes viral
          — high views relative to their subscriber count. Stay ahead of competitors before their
          format trends saturate your niche.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-xs bg-success/10 text-success px-3 py-1 rounded-full">Free (1 channel)</span>
          <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full">Daily Alerts</span>
          <span className="text-xs bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full">Competitor Intel</span>
        </div>
      </div>

      <SessionProvider>
        <CompetitorMonitor />
      </SessionProvider>

      {/* How it works */}
      <section className="mt-16 pt-10 border-t border-border">
        <h2 className="text-2xl font-bold text-text-primary mb-6">How It Works</h2>
        <div className="space-y-4">
          {[
            {
              step: '01',
              title: 'Enter a competitor channel',
              desc: 'Paste any YouTube channel URL, @handle, or channel ID. We\'ll look up the channel and show you a preview before you confirm.',
            },
            {
              step: '02',
              title: 'Set your viral threshold',
              desc: 'Choose how viral a Short needs to be to trigger an alert. A ratio of 10× means the video has at least 10× more views than the channel\'s subscriber count — a strong signal of algorithmic push.',
            },
            {
              step: '03',
              title: 'Receive daily alerts',
              desc: 'Every morning at 9:00 AM (UTC+8), we scan your tracked channels for newly published Shorts that meet your threshold and email you the highlights.',
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

      {/* Why track competitors */}
      <section className="mt-16 pt-10 border-t border-border">
        <h2 className="text-2xl font-bold text-text-primary mb-4">
          Why Track Competitor Channels?
        </h2>
        <p className="text-text-secondary mb-8 leading-relaxed">
          When a competitor publishes a Short that gets 50× their subscriber count in views, the
          algorithm is actively distributing that format. That&apos;s your cue to replicate the
          hook, topic, or style — fast, while the trend is fresh and competition is still low.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { icon: '🏆', title: 'Real-Time Competitive Edge', desc: 'Know what\'s working for competitors before everyone in your niche catches on.' },
            { icon: '📐', title: 'Format Intelligence', desc: 'Viral ratio signals that the format itself is working — replicate structure, not content.' },
            { icon: '⚡', title: 'First-Mover Advantage', desc: 'Get alerts within 24h of a viral Short being published. Act while the trend is still early.' },
            { icon: '🎯', title: 'Zero Guessing', desc: 'Stop trying to predict what will work. Track what already works for your competitors.' },
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
            name: 'YouTube Competitor Monitor',
            description: 'Daily email alerts when competitor YouTube channels publish viral Shorts',
            applicationCategory: 'WebApplication',
            offers: { '@type': 'Offer', price: '9', priceCurrency: 'USD' },
          }),
        }}
      />
    </div>
  );
}
