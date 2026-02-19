import { SessionProvider } from '@/components/SessionProvider';
import { KeywordMonitorFeed } from '@/components/KeywordMonitorFeed';
import { Link } from '@/i18n/navigation';

export const metadata = {
  title: 'My Video Feed — Keyword Monitor',
  description: 'All viral Shorts discovered by your keyword monitors.',
  robots: { index: false },
};

export default function FeedPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/tools/keyword-monitor"
          className="text-sm text-text-secondary hover:text-primary transition-colors"
        >
          &larr; Manage monitors
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">My Video Feed</h1>
        <p className="text-text-secondary">
          Viral Shorts discovered by your keyword monitors — updated daily at 9:00 AM (UTC+8).
        </p>
      </div>

      <SessionProvider>
        <KeywordMonitorFeed />
      </SessionProvider>
    </div>
  );
}
