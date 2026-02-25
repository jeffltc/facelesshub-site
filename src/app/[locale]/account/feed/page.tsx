import { SessionProvider } from '@/components/SessionProvider';
import { UnifiedFeed } from '@/components/UnifiedFeed';
import { Link } from '@/i18n/navigation';

export const metadata = {
  title: 'My Discoveries — FacelessHub',
  description: 'All viral Shorts discovered by your keyword monitors and competitor trackers.',
  robots: { index: false },
};

export default function FeedPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/account"
          className="text-sm text-text-secondary hover:text-primary transition-colors"
        >
          &larr; Account
        </Link>
        <div className="flex gap-4">
          <Link
            href="/tools/keyword-monitor"
            className="text-sm text-text-secondary hover:text-primary transition-colors"
          >
            Keyword monitors
          </Link>
          <Link
            href="/tools/competitor-monitor"
            className="text-sm text-text-secondary hover:text-primary transition-colors"
          >
            Competitor monitors
          </Link>
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">My Discoveries</h1>
        <p className="text-text-secondary">
          Viral Shorts found by your keyword monitors and competitor trackers — updated daily at 9:00 AM (UTC+8).
        </p>
      </div>

      <SessionProvider>
        <UnifiedFeed />
      </SessionProvider>
    </div>
  );
}
