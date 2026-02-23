'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Link } from '@/i18n/navigation';

interface PlanData {
  plan: string;
  limits: {
    tdPerDay: number;
    objectRemoverPerDay: number;
    monitors: number;
    translatorVideos: number;
  };
  usage: { td: number; objectRemover: number; translator: number };
  subscription: {
    billing_period: string;
    current_period_end: string;
    status: string;
  } | null;
  user: { name: string; email: string; image: string };
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
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm text-text-secondary">{label}</span>
        <span className="text-sm font-medium text-text-primary">
          {used} / {isUnlimited ? '∞' : limit}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-2 bg-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isHigh ? 'bg-amber-400' : 'bg-primary'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      {isUnlimited && (
        <div className="h-2 bg-primary/20 rounded-full">
          <div className="h-full w-full bg-primary/30 rounded-full" />
        </div>
      )}
    </div>
  );
}

const PLAN_COLORS: Record<string, string> = {
  free: 'text-text-secondary',
  pro: 'text-primary',
  max: 'text-violet-400',
};

export function AccountClient() {
  const { data: session, status } = useSession();
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.email) {
      fetch('/api/user/plan')
        .then((r) => r.json())
        .then((data) => {
          setPlanData(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (status !== 'loading') {
      setLoading(false);
    }
  }, [session?.user?.email, status]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🔐</div>
        <h2 className="text-xl font-bold text-text-primary mb-3">
          Sign in to view your account
        </h2>
        <button
          onClick={() => signIn('google')}
          className="inline-flex items-center gap-3 bg-white text-gray-800 font-medium rounded-lg px-6 py-3 hover:bg-gray-100 transition-colors"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  const plan = planData?.plan ?? 'free';
  const sub = planData?.subscription;
  const periodEnd = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 space-y-8">
      <h1 className="text-3xl font-bold text-text-primary">Account</h1>

      {/* Profile */}
      <div className="bg-surface border border-border rounded-xl p-6 flex items-center gap-4">
        {session.user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt=""
            className="w-14 h-14 rounded-full"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-primary/20 text-primary font-bold text-xl flex items-center justify-center">
            {session.user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
        <div>
          <p className="text-lg font-semibold text-text-primary">
            {session.user?.name}
          </p>
          <p className="text-sm text-text-secondary">{session.user?.email}</p>
        </div>
      </div>

      {/* Plan */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Subscription
        </h2>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-text-secondary mb-1">Current plan</p>
            <p
              className={`text-2xl font-bold capitalize ${
                PLAN_COLORS[plan] ?? PLAN_COLORS.free
              }`}
            >
              {plan}
              {sub?.billing_period && (
                <span className="text-base font-normal text-text-secondary ml-2">
                  · {sub.billing_period}
                </span>
              )}
            </p>
          </div>
          {plan === 'free' ? (
            <Link
              href="/pricing"
              className="bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
            >
              Upgrade
            </Link>
          ) : (
            <a
              href="/api/billing"
              className="border border-border hover:border-primary text-text-secondary hover:text-text-primary text-sm font-medium rounded-lg px-4 py-2 transition-colors"
            >
              Manage Billing →
            </a>
          )}
        </div>

        {periodEnd && (
          <p className="text-sm text-text-secondary">
            {sub?.status === 'canceled'
              ? `Access until ${periodEnd}`
              : `Renews ${periodEnd}`}
          </p>
        )}

        {plan === 'free' && (
          <p className="text-sm text-text-secondary">
            Free forever — no credit card required.{' '}
            <Link href="/pricing" className="text-primary hover:underline">
              See what Pro includes →
            </Link>
          </p>
        )}
      </div>

      {/* Usage */}
      {planData && (
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-1">
            Today&apos;s Usage
          </h2>
          <p className="text-xs text-text-secondary mb-6">Resets daily at midnight UTC</p>

          <div className="space-y-5">
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

          <div className="mt-6 pt-5 border-t border-border">
            <p className="text-sm text-text-secondary mb-1">Keyword Monitors</p>
            <p className="text-sm text-text-primary font-medium">
              Up to{' '}
              {planData.limits.monitors >= 99
                ? 'unlimited'
                : planData.limits.monitors}{' '}
              monitors on your plan
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
