const BASE_URL = process.env.CREEM_API_KEY?.startsWith('creem_test_')
  ? 'https://test-api.creem.io'
  : 'https://api.creem.io';

function headers() {
  const key = process.env.CREEM_API_KEY;
  if (!key) throw new Error('Missing CREEM_API_KEY');
  return { 'x-api-key': key, 'Content-Type': 'application/json' };
}

export async function createCheckout(opts: {
  productId: string;
  email: string;
  successUrl: string;
  metadata?: Record<string, string>;
}): Promise<{ checkout_url: string }> {
  const res = await fetch(`${BASE_URL}/v1/checkouts`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      product_id: opts.productId,
      success_url: opts.successUrl,
      customer: { email: opts.email },
      metadata: opts.metadata ?? {},
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Creem checkout error: ${err}`);
  }
  return res.json();
}

export async function createBillingPortal(customerId: string): Promise<{ portal_url: string }> {
  const res = await fetch(`${BASE_URL}/v1/customers/billing`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ customer_id: customerId }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Creem portal error: ${err}`);
  }
  return res.json();
}

// Map Creem product IDs → plan names
export function planFromProductId(productId: string): 'pro' | 'max' | null {
  const map: Record<string, 'pro' | 'max'> = {
    [process.env.CREEM_PRODUCT_PRO_MONTHLY ?? '']: 'pro',
    [process.env.CREEM_PRODUCT_PRO_ANNUAL  ?? '']: 'pro',
    [process.env.CREEM_PRODUCT_MAX_MONTHLY ?? '']: 'max',
    [process.env.CREEM_PRODUCT_MAX_ANNUAL  ?? '']: 'max',
  };
  return map[productId] ?? null;
}

export function periodFromProductId(productId: string): 'monthly' | 'annual' | null {
  const monthly = [
    process.env.CREEM_PRODUCT_PRO_MONTHLY ?? '',
    process.env.CREEM_PRODUCT_MAX_MONTHLY ?? '',
  ];
  const annual = [
    process.env.CREEM_PRODUCT_PRO_ANNUAL ?? '',
    process.env.CREEM_PRODUCT_MAX_ANNUAL ?? '',
  ];
  if (monthly.includes(productId)) return 'monthly';
  if (annual.includes(productId))  return 'annual';
  return null;
}

// Plan limits
export const PLAN_LIMITS = {
  free: { monitors: 1, tdPerDay: 5,  objectRemoverPerDay: 3,  translatorVideos: 5,  translatorLanguages: 3  },
  pro:  { monitors: 5, tdPerDay: 30, objectRemoverPerDay: 20, translatorVideos: 30, translatorLanguages: 99 },
  max:  { monitors: 99,tdPerDay: 999,objectRemoverPerDay: 999,translatorVideos: 999,translatorLanguages: 99 },
} as const;

export type Plan = keyof typeof PLAN_LIMITS;
