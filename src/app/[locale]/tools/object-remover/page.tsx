import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ObjectRemover } from '@/components/ObjectRemover';

export async function generateMetadata() {
  const t = await getTranslations('object_remover');
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

export default function ObjectRemoverPage() {
  const t = useTranslations('object_remover');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link
        href="/tools"
        className="text-sm text-text-secondary hover:text-primary transition-colors mb-8 inline-block"
      >
        &larr; Back to Tools
      </Link>

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">✂️</span>
          <h1 className="text-3xl font-bold text-text-primary">
            {t('title')}
          </h1>
        </div>
        <p className="text-lg text-text-secondary leading-relaxed max-w-3xl">
          {t('subtitle')}
        </p>

        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-xs bg-success/10 text-success px-3 py-1 rounded-full">
            {t('badge_free')}
          </span>
          <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full">
            {t('badge_ai')}
          </span>
          <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
            {t('badge_no_watermark')}
          </span>
        </div>
      </div>

      <ObjectRemover />

      {/* Tips section */}
      <section className="mt-16 pt-10 border-t border-border">
        <h2 className="text-2xl font-bold text-text-primary mb-6">
          {t('tips_title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['tip_1', 'tip_2', 'tip_3'] as const).map((key) => (
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
        <h2 className="text-2xl font-bold text-text-primary mb-4">Why Use an AI Object Remover for YouTube Thumbnails?</h2>
        <p className="text-text-secondary mb-8 leading-relaxed">
          A cluttered thumbnail loses clicks. Watermarks, copyright logos, unwanted text, and distracting background elements reduce your thumbnail's impact — but re-shooting or manually editing in Photoshop takes time most creators don't have. The AI Object Remover uses deep learning inpainting to detect and fill removed areas with contextually accurate background content, producing clean results in seconds without any design skills required.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: '🪄', title: 'AI Inpainting Technology', desc: 'The AI doesn\'t just erase — it intelligently fills the removed area with background content that matches the surrounding pixels.' },
            { icon: '🔖', title: 'Remove Watermarks & Logos', desc: 'Clean stock images, remove competitor branding, or strip watermarks from reference images you want to use as visual inspiration.' },
            { icon: '✍️', title: 'Remove Text Overlays', desc: 'Strip outdated text, incorrect captions, or old titles from images so you can re-use the visual in a new context.' },
            { icon: '⚡', title: 'Instant Processing', desc: 'Results in seconds. No queues, no waiting. Upload, brush, click remove, download.' },
            { icon: '🖼️', title: 'No Quality Loss', desc: 'The AI preserves full image resolution. Your cleaned thumbnail looks just as sharp as the original.' },
            { icon: '🔒', title: 'Private Processing', desc: 'Uploaded images are processed and immediately discarded. Your content is never stored or used for training.' },
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
        <h2 className="text-2xl font-bold text-text-primary mb-8">How to Remove Objects from Images</h2>
        <div className="space-y-5">
          {[
            { step: '01', title: 'Upload your image', desc: 'Drag and drop or click to upload any JPG, PNG, or WebP image. Works best with thumbnail-sized images (1280×720 or similar aspect ratios).' },
            { step: '02', title: 'Brush over the object', desc: 'Use the brush tool to paint a mask over the element you want to remove. Cover the full object — slightly over-selecting produces better results than under-selecting.' },
            { step: '03', title: 'Click Remove Object', desc: 'The AI analyzes the surrounding pixels and reconstructs the background. For most images, the result is seamless within 5–10 seconds.' },
            { step: '04', title: 'Download the clean image', desc: 'Review the result and download your clean image at full resolution. If the result needs refinement, try again with a slightly larger or smaller brush selection.' },
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
            { q: 'What file formats does the object remover support?', a: 'JPG, PNG, and WebP are all supported. The tool handles images up to around 5MB. For very large images, we recommend resizing to web resolution (1920px maximum width) before uploading for faster processing.' },
            { q: 'Can it remove text and watermarks cleanly?', a: 'Yes, and this is one of its strongest use cases. Text overlays and semi-transparent watermarks are well-handled by the inpainting model. Solid-color watermarks over complex backgrounds may require a second pass with a more precise brush selection.' },
            { q: 'How complex can the removed object be?', a: 'The AI handles most common cases — logos, text, small objects, and simple foreground elements — cleanly. Very large objects (removing a person from a group photo, for example) will work but may show artifacts around the edges that require manual touch-up in an external editor.' },
            { q: 'Is there a daily usage limit?', a: 'The tool uses AI processing resources, so fair-use limits apply. For typical thumbnail editing workflows (a few images per day), you will not hit any limits. If you need bulk processing, contact us for options.' },
            { q: 'Can I use this to remove copyright watermarks from stock photos?', a: 'The tool is designed for use on images you have legitimate rights to edit — your own photos, thumbnails you\'ve created, or licensed stock images. Using it to circumvent copyright protection on images you don\'t have rights to is not an authorized use case.' },
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

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'AI Object Remover',
            description:
              'Remove logos, watermarks, or any unwanted object from photos with AI inpainting',
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
