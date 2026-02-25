import { Redis } from '@upstash/redis';

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function dailyKey(email: string, tool: string): string {
  const date = new Date().toISOString().slice(0, 10); // UTC YYYY-MM-DD
  return `ulimit:${email}:${tool}:${date}`;
}

function monthlyPoolKey(email: string): string {
  const month = new Date().toISOString().slice(0, 7); // UTC YYYY-MM
  return `ulimit:${email}:translator_pool:${month}`;
}

/** Increment usage counter by count (default 1) and return new count */
export async function incrementUsage(email: string, tool: string, count = 1): Promise<number> {
  const redis = getRedis();
  if (!redis) return count;
  const key = dailyKey(email, tool);
  const newCount = count === 1
    ? await redis.incr(key)
    : await redis.incrby(key, count);
  if (newCount === count) await redis.expire(key, 25 * 3600); // 25h TTL on first write
  return newCount;
}

/** Get current usage count for today */
export async function getUsage(email: string, tool: string): Promise<number> {
  const redis = getRedis();
  if (!redis) return 0;
  const val = await redis.get<number>(dailyKey(email, tool));
  return val ?? 0;
}

/** Get current monthly pool usage for translator */
export async function getTranslatorPoolUsage(email: string): Promise<number> {
  const redis = getRedis();
  if (!redis) return 0;
  const val = await redis.get<number>(monthlyPoolKey(email));
  return val ?? 0;
}

/**
 * Increment translator usage across daily allowance + monthly pool.
 * Daily slots are consumed first; overflow goes to pool.
 * Returns how much was consumed from each bucket and the new totals.
 */
export async function incrementTranslatorUsage(
  email: string,
  videosCount: number,
  dailyLimit: number,
  poolLimit: number
): Promise<{ fromDaily: number; fromPool: number; dailyUsed: number; poolUsed: number }> {
  const redis = getRedis();
  if (!redis) {
    return { fromDaily: videosCount, fromPool: 0, dailyUsed: videosCount, poolUsed: 0 };
  }

  const [currentDaily, currentPool] = await Promise.all([
    getUsage(email, 'translator'),
    getTranslatorPoolUsage(email),
  ]);

  const dailyRemaining = Math.max(0, dailyLimit - currentDaily);
  const fromDaily = Math.min(videosCount, dailyRemaining);
  const fromPool = videosCount - fromDaily;

  const dKey = dailyKey(email, 'translator');
  const pKey = monthlyPoolKey(email);

  const ops: Promise<unknown>[] = [];

  if (fromDaily > 0) {
    ops.push(
      (async () => {
        const newCount = await redis.incrby(dKey, fromDaily);
        if (newCount === fromDaily) await redis.expire(dKey, 25 * 3600);
      })()
    );
  }

  if (fromPool > 0 && poolLimit > 0) {
    ops.push(
      (async () => {
        const newCount = await redis.incrby(pKey, fromPool);
        if (newCount === fromPool) await redis.expire(pKey, 33 * 24 * 3600); // 33 days TTL
      })()
    );
  }

  await Promise.all(ops);

  return {
    fromDaily,
    fromPool,
    dailyUsed: currentDaily + fromDaily,
    poolUsed: currentPool + fromPool,
  };
}

/** Get all tool usage for today */
export async function getAllUsage(email: string): Promise<{
  td: number;
  objectRemover: number;
  translator: number;
  translatorPool: number;
}> {
  const [td, objectRemover, translator, translatorPool] = await Promise.all([
    getUsage(email, 'td'),
    getUsage(email, 'object-remover'),
    getUsage(email, 'translator'),
    getTranslatorPoolUsage(email),
  ]);
  return { td, objectRemover, translator, translatorPool };
}
