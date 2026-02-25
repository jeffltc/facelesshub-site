import { auth } from '@/lib/auth';
import { getPlanLimits } from '@/lib/subscription';
import { getAllUsage, getUsage, getTranslatorPoolUsage } from '@/lib/usageTracking';
import { getSupabase } from '@/lib/supabase';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const email = session.user.email;

  const [{ plan, limits }, usage, subResult, translatorDaily, translatorPool] = await Promise.all([
    getPlanLimits(email),
    getAllUsage(email),
    getSupabase()
      .from('user_subscriptions')
      .select('billing_period, current_period_end, status')
      .eq('email', email)
      .single(),
    getUsage(email, 'translator'),
    getTranslatorPoolUsage(email),
  ]);

  return Response.json({
    plan,
    limits,
    usage,
    subscription: subResult.data ?? null,
    user: {
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
    },
    translatorQuota: {
      dailyUsed: translatorDaily,
      dailyLimit: limits.translatorDailyVideos,
      poolUsed: translatorPool,
      poolLimit: limits.translatorMonthlyPool,
    },
  });
}
