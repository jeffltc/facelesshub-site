import { getSupabase } from './supabase';
import { PLAN_LIMITS, type Plan } from './creem';

export async function getUserPlan(email: string): Promise<Plan> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('user_subscriptions')
    .select('plan, status')
    .eq('email', email)
    .single();

  if (!data) return 'free';
  if (data.status !== 'active') return 'free';
  return (data.plan as Plan) ?? 'free';
}

export async function getPlanLimits(email: string) {
  const plan = await getUserPlan(email);
  return { plan, limits: PLAN_LIMITS[plan] };
}
