import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { SessionProvider } from '@/components/SessionProvider';
import { YouTubeTranslator } from '@/components/YouTubeTranslator';

export async function generateMetadata() {
  const t = await getTranslations('yt_translator');
  return {
    title: t('page_title'),
    description: t('page_desc'),
    openGraph: {
      title: t('page_title'),
      description: t('page_desc'),
      type: 'website',
    },
  };
}

export default function YouTubeTranslatorPage() {
  const t = useTranslations('yt_translator');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link
        href="/tools"
        className="text-sm text-text-secondary hover:text-primary transition-colors mb-8 inline-block"
      >
        &larr; Back to Tools
      </Link>

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🌐</span>
          <h1 className="text-3xl font-bold text-text-primary">
            {t('title')}
          </h1>
        </div>
        <p className="text-lg text-text-secondary leading-relaxed max-w-3xl">
          {t('subtitle')}
        </p>

        {/* Feature badges */}
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-xs bg-success/10 text-success px-3 py-1 rounded-full">
            {t('badge_free')}
          </span>
          <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full">
            {t('badge_languages')}
          </span>
          <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
            {t('badge_writeback')}
          </span>
        </div>
      </div>

      <SessionProvider>
        <YouTubeTranslator />
      </SessionProvider>

      {/* How it works */}
      <section className="mt-16 pt-10 border-t border-border">
        <h2 className="text-2xl font-bold text-text-primary mb-6">
          {t('how_it_works')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '1', icon: '🔑', key: 'step_1' },
            { step: '2', icon: '🎯', key: 'step_2' },
            { step: '3', icon: '🚀', key: 'step_3' },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-surface border border-border rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-lg font-bold text-primary">
                  Step {item.step}
                </span>
              </div>
              <p className="text-sm text-text-secondary">
                {t(item.key as 'step_1' | 'step_2' | 'step_3')}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FTC Disclosure */}
      <p className="mt-10 text-xs text-text-secondary">
        {t('disclosure')}
      </p>

      {/* Why use this tool */}
      <section className="mt-16 pt-10 border-t border-border">
        <h2 className="text-2xl font-bold text-text-primary mb-4">Why Translate Your YouTube Videos?</h2>
        <p className="text-text-secondary mb-8 leading-relaxed">
          Over 80% of YouTube's audience is outside English-speaking countries, yet most creators only upload English titles and descriptions. Translating your metadata is the single easiest way to tap into Spanish, Chinese, Portuguese, and Japanese-speaking audiences — without re-recording a single second of content. The YouTube TD Translator uses AI to translate your video's title and description into multiple languages simultaneously, then writes the translations back to YouTube directly through the API.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: '🌏', title: 'Reach 80% More Viewers', desc: 'Translated metadata helps YouTube surface your videos to non-English speakers who are searching for the same topic in their language.' },
            { icon: '🤖', title: 'AI-Quality Translation', desc: 'Context-aware AI translation preserves the meaning, tone, and keyword intent of your original text — not word-for-word literal output.' },
            { icon: '🚀', title: 'One-Click Write-Back', desc: 'Translations are pushed directly to your YouTube video via the API. No copy-pasting into YouTube Studio for each language.' },
            { icon: '🌐', title: '4+ Languages at Once', desc: 'Translate to Spanish, Chinese, Japanese, Portuguese, and more in a single generation — parallel processing for all target languages.' },
            { icon: '🔒', title: 'Secure OAuth Login', desc: 'Uses YouTube\'s official OAuth authentication. We never store your credentials or access your videos beyond the translation write-back.' },
            { icon: '💸', title: 'Free to Use', desc: 'No subscription required. Connect your YouTube account and start translating immediately at no cost.' },
          ].map((f) => (
            <div key={f.title} className="bg-surface border border-border rounded-xl p-5">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-text-primary mb-2">{f.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-16 pt-10 border-t border-border">
        <h2 className="text-2xl font-bold text-text-primary mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'Which languages are supported?', a: 'The tool currently supports Spanish, Simplified Chinese, Japanese, Portuguese (Brazil), French, German, and Korean. Additional languages are being added regularly.' },
            { q: 'Will translating my metadata change the original English title?', a: 'No. YouTube stores translated metadata separately from your original title and description. Your English content remains untouched. Viewers in different regions will see the localized version automatically based on their language settings.' },
            { q: 'Is it safe to connect my YouTube account?', a: 'Yes. The tool uses YouTube\'s official OAuth 2.0 flow — the same authentication system used by YouTube Studio. We only request the minimum permission needed to update video metadata. We never access your private data or videos beyond the specific write-back action.' },
            { q: 'How accurate is the AI translation?', a: 'The AI produces high-quality translations that preserve keyword intent and natural phrasing in the target language. It significantly outperforms direct machine translation for idiomatic content. We recommend reviewing the output before writing back, particularly for languages you can verify.' },
            { q: 'Can I translate videos from multiple channels?', a: 'Yes. As long as you authenticate with the YouTube account that owns the videos, you can translate metadata for any video on that channel. Switch accounts to manage multiple channels.' },
            { q: 'Is there a limit on how many videos I can translate?', a: 'There is no hard limit imposed by FacelessHub. However, YouTube\'s API has rate limits that apply to all third-party apps. For bulk operations (50+ videos), we recommend spacing out your translations.' },
          ].map((item) => (
            <details key={item.q} className="group bg-surface border border-border rounded-xl">
              <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                <span className="font-medium text-text-primary">{item.q}</span>
                <span className="text-text-secondary group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="px-5 pb-5 text-sm text-text-secondary leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Social proof */}
      <section className="mt-16 pt-10 border-t border-border">
        <h2 className="text-2xl font-bold text-text-primary mb-8">What Creators Are Saying</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { name: 'Elena R.', handle: 'Finance Creator', text: 'I translated my top 20 videos into Spanish and within 60 days I had a consistent stream of Spanish-speaking subscribers. It\'s the easiest international growth strategy I\'ve found.' },
            { name: 'James W.', handle: '@faceless_history', text: 'The write-back feature saves enormous time. I used to manually update each language in YouTube Studio — this does it in one click. My channel now has localized titles in four languages.' },
            { name: 'Yuki N.', handle: 'Tutorial Creator', text: 'As a non-native English speaker I was worried about translation quality. But the AI output is natural and idiomatic — not the robotic phrasing I expected. Definitely recommend.' },
          ].map((r) => (
            <div key={r.name} className="bg-surface border border-border rounded-xl p-5">
              <p className="text-sm text-text-secondary leading-relaxed mb-4">"{r.text}"</p>
              <div>
                <p className="font-semibold text-text-primary text-sm">{r.name}</p>
                <p className="text-xs text-text-secondary">{r.handle}</p>
              </div>
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
            name: 'YouTube TD Translator',
            description:
              'Translate YouTube video titles and descriptions to multiple languages using AI',
            applicationCategory: 'WebApplication',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
          }),
        }}
      />
    </div>
  );
}
