import { auth } from '@/lib/auth';
import { createCheckout } from '@/lib/creem';
import { NextRequest } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://facelesschannel.net';

// product IDs keyed by "plan-period"
function getProductId(plan: string, period: string): string | null {
  const map: Record<string, string | undefined> = {
    'pro-monthly':  process.env.CREEM_PRODUCT_PRO_MONTHLY,
    'pro-annual':   process.env.CREEM_PRODUCT_PRO_ANNUAL,
    'max-monthly':  process.env.CREEM_PRODUCT_MAX_MONTHLY,
    'max-annual':   process.env.CREEM_PRODUCT_MAX_ANNUAL,
  };
  return map[`${plan}-${period}`] ?? null;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    // Redirect to sign-in, then back to pricing
    return Response.redirect(`${SITE_URL}/en/pricing?signin=1`);
  }

  const { searchParams } = new URL(req.url);
  const plan   = searchParams.get('plan')   ?? '';
  const period = searchParams.get('period') ?? 'monthly';

  const productId = getProductId(plan, period);
  if (!productId) {
    return Response.json({ error: 'Invalid plan' }, { status: 400 });
  }

  const { checkout_url } = await createCheckout({
    productId,
    email: session.user.email,
    successUrl: `${SITE_URL}/en/pricing?success=1`,
    metadata: { email: session.user.email, plan, period },
  });

  return Response.redirect(checkout_url);
}
