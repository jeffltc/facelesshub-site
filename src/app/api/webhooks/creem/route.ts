import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { getSupabase } from '@/lib/supabase';
import { planFromProductId, periodFromProductId } from '@/lib/creem';

function verifySignature(payload: string, signature: string): boolean {
  const secret = process.env.CREEM_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expected, 'hex')
  );
}

export async function POST(req: NextRequest) {
  const payload   = await req.text();
  const signature = req.headers.get('creem-signature') ?? '';

  if (!verifySignature(payload, signature)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(payload);
  const { eventType, object: obj } = event;

  const supabase = getSupabase();

  // Extract customer email — prefer metadata fallback
  const email: string | undefined =
    obj?.customer?.email ?? obj?.metadata?.email;

  if (!email) {
    return Response.json({ ok: true }); // ignore events without email
  }

  switch (eventType) {
    case 'checkout.completed':
    case 'subscription.active':
    case 'subscription.paid': {
      const productId = obj?.product_id ?? obj?.productId ?? '';
      const plan      = planFromProductId(productId) ?? 'pro';
      const period    = periodFromProductId(productId) ?? 'monthly';
      const periodEnd = obj?.current_period_end
        ? new Date(obj.current_period_end * 1000).toISOString()
        : null;

      await supabase.from('user_subscriptions').upsert(
        {
          email,
          creem_customer_id:     obj?.customer_id ?? obj?.customerId,
          creem_subscription_id: obj?.id,
          plan,
          billing_period: period,
          status: 'active',
          current_period_end: periodEnd,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      );
      break;
    }

    case 'subscription.canceled':
    case 'subscription.expired': {
      await supabase
        .from('user_subscriptions')
        .update({ status: 'canceled', updated_at: new Date().toISOString() })
        .eq('email', email);
      break;
    }

    case 'subscription.paused': {
      await supabase
        .from('user_subscriptions')
        .update({ status: 'past_due', updated_at: new Date().toISOString() })
        .eq('email', email);
      break;
    }
  }

  return Response.json({ ok: true });
}
