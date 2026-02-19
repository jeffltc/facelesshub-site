import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { TDGenerator } from '@/components/TDGenerator';

const SITE_URL = 'https://facelesschannel.net';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('td_generator');
  const ogImage = `${SITE_URL}/api/og?title=${encodeURIComponent('YouTube TD Generator')}&category=${encodeURIComponent('Tools')}`;
  return {
    title: t('page_title'),
    description: t('page_desc'),
    openGraph: {
      title: t('page_title'),
      description: t('page_desc'),
      type: 'website',
      url: `${SITE_URL}/${locale}/tools/td-generator`,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('page_title'),
      description: t('page_desc'),
      images: [ogImage],
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}/tools/td-generator`,
      languages: {
        en: `${SITE_URL}/en/tools/td-generator`,
        zh: `${SITE_URL}/zh/tools/td-generator`,
        ja: `${SITE_URL}/ja/tools/td-generator`,
        ko: `${SITE_URL}/ko/tools/td-generator`,
        de: `${SITE_URL}/de/tools/td-generator`,
      },
    },
  };
}

export default function TDGeneratorPage() {
  const t = useTranslations('td_generator');

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
          <span className="text-4xl">✍️</span>
          <h1 className="text-3xl font-bold text-text-primary">
            {t('title')}
          </h1>
        </div>
        <p className="text-lg text-text-secondary leading-relaxed max-w-2xl">
          {t('subtitle')}
        </p>

        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-xs bg-success/10 text-success px-3 py-1 rounded-full">
            {t('badge_free')}
          </span>
          <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full">
            {t('badge_seo')}
          </span>
          <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
            {t('badge_image')}
          </span>
        </div>
      </div>

      <TDGenerator />

      {/* Tips section */}
      <section className="mt-16 pt-10 border-t border-border">
        <h2 className="text-2xl font-bold text-text-primary mb-6">
          {t('tips_title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(['tip_1', 'tip_2', 'tip_3', 'tip_4'] as const).map((key) => (
            <div
              key={key}
              className="bg-surface border border-border rounded-xl p-5"
            >
              <p className="text-sm text-text-secondary leading-relaxed">
                {t(key)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why use this tool */}
      <section className="mt-16 pt-10 border-t border-border">
        <h2 className="text-2xl font-bold text-text-primary mb-4">Why Use the YouTube TD Generator?</h2>
        <p className="text-text-secondary mb-8 leading-relaxed">
          Writing a great YouTube title and description is one of the highest-leverage activities for channel growth. Titles determine click-through rate — the single biggest factor in how often YouTube recommends your video. Descriptions feed the algorithm with keyword context. But writing both from scratch for every video is time-consuming. The YouTube TD Generator uses AI to produce SEO-optimized titles and descriptions in seconds, trained on what works across every major niche.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: '🎯', title: 'SEO-Optimized Output', desc: 'Every title and description is crafted with keyword placement and search intent in mind — not just generic phrasing.' },
            { icon: '🖼️', title: 'Thumbnail-Aware Generation', desc: 'Upload your thumbnail and the AI reads the visual context to generate titles that match what viewers will see.' },
            { icon: '⚡', title: 'Generate in Seconds', desc: 'What used to take 20 minutes of staring at a blank page now takes under 10 seconds with one click.' },
            { icon: '🔄', title: 'Multiple Variations', desc: 'Get several title options per generation so you can A/B test or pick the best fit for your audience.' },
            { icon: '📋', title: 'One-Click Copy', desc: 'Copy the title and description to your clipboard instantly — no reformatting or cleaning up needed.' },
            { icon: '💸', title: 'Completely Free', desc: 'No subscription, no watermark, no credit card. Use it as many times as you need.' },
          ].map((f) => (
            <div key={f.title} className="bg-surface border border-border rounded-xl p-5">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-text-primary mb-2">{f.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How to use */}
      <section className="mt-16 pt-10 border-t border-border">
        <h2 className="text-2xl font-bold text-text-primary mb-8">How to Generate YouTube Titles &amp; Descriptions</h2>
        <div className="space-y-5">
          {[
            { step: '01', title: 'Describe your video topic', desc: 'Type a brief description of what your video covers — the more specific you are, the more targeted the output. For example: "beginner guide to compound interest for 20-year-olds" beats "investing basics".' },
            { step: '02', title: 'Upload your thumbnail (optional)', desc: 'If you already have a thumbnail ready, upload it. The AI analyzes the visual content — text, imagery, faces, colors — and factors it into the title generation for a cohesive title-thumbnail pair.' },
            { step: '03', title: 'Click Generate', desc: 'The AI generates 3–5 title variations plus a full description with keyword-rich sentences, a call to action, and hashtag suggestions.' },
            { step: '04', title: 'Pick, edit, and copy', desc: 'Choose the title that best matches your content and audience. Make any small tweaks directly in the field, then copy to clipboard with one click.' },
          ].map((s) => (
            <div key={s.step} className="flex gap-5 bg-surface border border-border rounded-xl p-6">
              <span className="text-2xl font-bold text-primary/40 shrink-0 w-10">{s.step}</span>
              <div>
                <h3 className="font-semibold text-text-primary mb-1">{s.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-16 pt-10 border-t border-border">
        <h2 className="text-2xl font-bold text-text-primary mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'How does the AI generate YouTube titles?', a: 'The generator uses a large language model trained on YouTube SEO best practices. It analyzes your topic description, identifies high-intent keywords, and structures titles using patterns proven to maximize click-through rate — curiosity gaps, specific numbers, emotional triggers, and clear value statements.' },
            { q: 'Is this tool free to use?', a: 'Yes, completely free. There are no limits, subscriptions, or paywalls. You can generate titles and descriptions for as many videos as you need.' },
            { q: 'Can I use this for any YouTube niche?', a: 'Yes. The AI works across all niches — personal finance, gaming, cooking, tutorials, vlogs, faceless channels, and more. The more specific your topic description, the better it tailors the output to your niche audience.' },
            { q: 'How long should a YouTube description be?', a: 'YouTube allows up to 5,000 characters. The optimal length is 200–400 words — enough to include your main keywords naturally, a summary of the video, links, and a call-to-action, without padding. The generator produces descriptions in this range by default.' },
            { q: 'Does uploading a thumbnail improve the results?', a: 'Yes, meaningfully. When you upload a thumbnail, the AI can align the title with the visual hook in your image. For example, if your thumbnail shows a dollar amount, the AI can reference that in the title. Without the image, it works purely from the text description.' },
            { q: 'Can I edit the generated title and description?', a: 'Yes. The output fields are fully editable. Think of the AI output as a strong first draft — you can tweak the wording, adjust keyword placement, or personalize the tone before copying.' },
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
            { name: 'Marcus T.', handle: '@finance_faceless', text: 'I used to spend 20 minutes writing titles and still wasn\'t sure if they were any good. Now I generate 5 options in 10 seconds and the CTR on my videos has noticeably improved.' },
            { name: 'Sarah K.', handle: 'YouTube Creator', text: 'The thumbnail upload feature is a game changer. It picks up on the visual context and writes a title that actually matches what\'s in the image. My title-thumbnail consistency has never been better.' },
            { name: 'David L.', handle: '@autodidact_yt', text: 'Simple, fast, and the output is genuinely good. Not generic AI fluff — it actually sounds like a real YouTube title. My watch time went up after I started using this for my descriptions too.' },
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
            name: 'YouTube TD Generator',
            description:
              'AI-powered YouTube title and description generator with image analysis support',
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
