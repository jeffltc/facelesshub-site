import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { YouTubeThumbnailDownloader } from '@/components/YouTubeThumbnailDownloader';

export async function generateMetadata() {
  const t = await getTranslations('yt_thumbnail');
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

export default function YouTubeThumbnailDownloaderPage() {
  const t = useTranslations('yt_thumbnail');

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
          <span className="text-4xl">🖼️</span>
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
            {t('badge_resolutions')}
          </span>
          <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
            {t('badge_no_login')}
          </span>
        </div>
      </div>

      <YouTubeThumbnailDownloader />

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
        <h2 className="text-2xl font-bold text-text-primary mb-4">Why Download YouTube Thumbnails?</h2>
        <p className="text-text-secondary mb-8 leading-relaxed">
          Studying competitor thumbnails is one of the most practical ways to improve your own. Before spending an hour designing a thumbnail, it pays to study what's working in your niche: color schemes, text placement, facial expressions, and composition styles. YouTube's interface doesn't make it easy to save thumbnails for reference — this tool pulls the full-resolution image directly from YouTube's CDN in one click, no extensions or screen grabs needed.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: '🎓', title: 'Swipe File Research', desc: 'Build a reference library of high-performing thumbnails in your niche to identify patterns in color, text, and composition.' },
            { icon: '📐', title: 'Use as Design Template', desc: 'Download a thumbnail to use as a size reference or composition guide when designing your own in Canva or Figma.' },
            { icon: '🔍', title: 'Competitor Analysis', desc: 'Download thumbnails from top channels in your niche to analyze what visual styles are driving the highest CTR.' },
            { icon: '📱', title: 'All Resolutions Available', desc: 'Get the thumbnail in HD (1280×720), SD (640×480), HQ (480×360), MQ (320×180), or default (120×90) depending on availability.' },
            { icon: '🔓', title: 'No Login Required', desc: 'Paste the URL, click download. No YouTube account, no API key, no sign-up. Works on any public video.' },
            { icon: '⚡', title: 'Instant Download', desc: 'Results in under a second. Works for any public YouTube video, regardless of channel size.' },
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
        <h2 className="text-2xl font-bold text-text-primary mb-8">How to Download a YouTube Thumbnail</h2>
        <div className="space-y-5">
          {[
            { step: '01', title: 'Copy the YouTube video URL', desc: 'Go to any YouTube video and copy the URL from the address bar. The full URL (youtube.com/watch?v=...) and the shortened URL (youtu.be/...) both work.' },
            { step: '02', title: 'Paste it in the input field', desc: 'Paste the video URL into the input field on this page and press Enter or click the download button.' },
            { step: '03', title: 'Choose your resolution', desc: 'The tool fetches all available thumbnail resolutions for that video. Select the highest quality available — usually the HD (maxresdefault) version at 1280×720.' },
            { step: '04', title: 'Download the image', desc: 'Click the download button next to your preferred resolution. The thumbnail saves as a JPG file named after the video ID.' },
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
            { q: 'Can I download thumbnails from private or unlisted videos?', a: 'No. The tool can only access thumbnails from public videos. Private and unlisted videos require authentication that this tool does not support.' },
            { q: 'What resolutions are available?', a: 'YouTube stores thumbnails in five sizes: maxresdefault (1280×720, HD), sddefault (640×480), hqdefault (480×360), mqdefault (320×180), and default (120×90). Not all videos have every size available — older or lower-traffic videos may not have the HD version.' },
            { q: 'Is it legal to download YouTube thumbnails?', a: 'Downloading for personal research, design reference, or educational use is generally considered fair use. Thumbnails are copyrighted by their creators, so you cannot republish downloaded thumbnails as your own or use them commercially without permission.' },
            { q: 'Does this work for YouTube Shorts?', a: 'Yes. YouTube Shorts have thumbnails stored in the same CDN format. Paste the Shorts URL the same way you would a regular video.' },
            { q: 'Why is the HD thumbnail not available for some videos?', a: 'YouTube generates the HD (maxresdefault) thumbnail size when a video is uploaded in high resolution. Very old videos (pre-2013) and videos originally uploaded in low resolution may not have the HD version. In these cases, the next best available resolution is shown.' },
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
            name: 'YouTube Thumbnail Downloader',
            description:
              'Download YouTube video thumbnails in all available resolutions — HD, SD, HQ, MQ, and default',
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
