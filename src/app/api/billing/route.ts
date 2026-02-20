import { auth } from '@/lib/auth';
import { createBillingPortal } from '@/lib/creem';
import { getSupabase } from '@/lib/supabase';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://facelesschannel.net';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.redirect(`${SITE_URL}/en/pricing`);
  }

  const supabase = getSupabase();
  const { data } = await supabase
    .from('user_subscriptions')
    .select('creem_customer_id')
    .eq('email', session.user.email)
    .single();

  if (!data?.creem_customer_id) {
    return Response.redirect(`${SITE_URL}/en/pricing`);
  }

  const { portal_url } = await createBillingPortal(data.creem_customer_id);
  return Response.redirect(portal_url);
}
