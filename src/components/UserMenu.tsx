'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Link } from '@/i18n/navigation';

interface PlanData {
  plan: string;
  limits: { tdPerDay: number; objectRemoverPerDay: number; monitors: number };
  usage: { td: number; objectRemover: number };
  subscription: {
    billing_period: string;
    current_period_end: string;
    status: string;
  } | null;
}

function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, string> = {
    free: 'bg-surface-hover text-text-secondary border border-border',
    pro: 'bg-primary/10 text-primary border border-primary/20',
    max: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
  };
  return (
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
        styles[plan] ?? styles.free
      }`}
    >
      {plan}
    </span>
  );
}

function UsageBar({
  used,
  limit,
  label,
}: {
  used: number;
  limit: number;
  label: string;
}) {
  const isUnlimited = limit >= 999;
  const pct = isUnlimited ? 0 : Math.min(100, (used / limit) * 100);
  const isHigh = pct >= 80;
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-text-secondary">{label}</span>
        <span className="text-xs text-text-secondary">
          {used}/{isUnlimited ? '∞' : limit}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isHigh ? 'bg-amber-400' : 'bg-primary'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session?.user?.email) {
      fetch('/api/user/plan')
        .then((r) => r.json())
        .then(setPlanData)
        .catch(() => {});
    }
  }, [session?.user?.email]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (status === 'loading') {
    return <div className="w-8 h-8 rounded-full bg-surface-hover animate-pulse" />;
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn('google')}
        className="text-sm font-medium text-text-secondary hover:text-text-primary px-3 py-1.5 border border-border rounded-lg hover:border-primary transition-colors"
      >
        Sign in
      </button>
    );
  }

  const plan = planData?.plan ?? 'free';
  const initial = session.user?.name?.[0]?.toUpperCase() ?? '?';
  const periodEnd = planData?.subscription?.current_period_end;
  const renewDate = periodEnd
    ? new Date(periodEnd).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 focus:outline-none"
      >
        {session.user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt=""
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-semibold text-sm flex items-center justify-center">
            {initial}
          </div>
        )}
        <PlanBadge plan={plan} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-64 bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          {/* User info */}
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium text-text-primary truncate">
              {session.user?.name}
            </p>
            <p className="text-xs text-text-secondary truncate">
              {session.user?.email}
            </p>
          </div>

          {/* Plan */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    plan === 'free' ? 'bg-text-secondary/40' : 'bg-green-400'
                  }`}
                />
                <span className="text-sm font-medium text-text-primary capitalize">
                  {plan}
                </span>
                {planData?.subscription?.billing_period && (
                  <span className="text-xs text-text-secondary capitalize">
                    · {planData.subscription.billing_period}
                  </span>
                )}
              </div>
              {plan === 'free' && (
                <Link
                  href="/pricing"
                  onClick={() => setOpen(false)}
                  className="text-xs text-primary hover:underline"
                >
                  Upgrade
                </Link>
              )}
            </div>
            {renewDate && plan !== 'free' && (
              <p className="text-xs text-text-secondary">Renews {renewDate}</p>
            )}
          </div>

          {/* Usage */}
          {planData && (
            <div className="px-4 py-3 border-b border-border space-y-2.5">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                Today
              </p>
              <UsageBar
                used={planData.usage.td}
                limit={planData.limits.tdPerDay}
                label="TD Generator"
              />
              <UsageBar
                used={planData.usage.objectRemover}
                limit={planData.limits.objectRemoverPerDay}
                label="Object Remover"
              />
            </div>
          )}

          {/* Links */}
          <div className="p-2">
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="flex items-center px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors"
            >
              Account
            </Link>
            <Link
              href="/account/feed"
              onClick={() => setOpen(false)}
              className="flex items-center px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors"
            >
              My Feed
            </Link>
            {plan !== 'free' && (
              <a
                href="/api/billing"
                className="flex items-center px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors"
              >
                Manage Billing →
              </a>
            )}
            <button
              onClick={() => signOut()}
              className="w-full flex items-center px-3 py-2 text-sm text-text-secondary hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
