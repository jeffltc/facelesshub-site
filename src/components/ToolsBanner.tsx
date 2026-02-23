'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Link } from '@/i18n/navigation';

export function ToolsBanner() {
  const { data: session } = useSession();
  const [plan, setPlan] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.email) {
      fetch('/api/user/plan')
        .then((r) => r.json())
        .then((data) => setPlan(data.plan))
        .catch(() => {});
    }
  }, [session?.user?.email]);

  // Only show for logged-in free users
  if (!session || plan === null || plan !== 'free') return null;

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl px-5 py-3.5 mb-8 flex items-center justify-between gap-4">
      <p className="text-sm text-text-secondary">
        🚀{' '}
        <span className="text-text-primary font-medium">Unlock all tools</span>
        {' '}— Pro from $7/mo. More monitors, unlimited generations, 20+ languages.
      </p>
      <Link
        href="/pricing"
        className="shrink-0 text-sm font-medium text-primary hover:underline"
      >
        Upgrade →
      </Link>
    </div>
  );
}
