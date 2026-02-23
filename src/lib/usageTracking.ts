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

/** Increment usage counter and return new count */
export async function incrementUsage(email: string, tool: string): Promise<number> {
  const redis = getRedis();
  if (!redis) return 1;
  const key = dailyKey(email, tool);
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 25 * 3600); // 25h TTL
  return count;
}

/** Get current usage count for today */
export async function getUsage(email: string, tool: string): Promise<number> {
  const redis = getRedis();
  if (!redis) return 0;
  const val = await redis.get<number>(dailyKey(email, tool));
  return val ?? 0;
}

/** Get all tool usage for today */
export async function getAllUsage(email: string): Promise<{
  td: number;
  objectRemover: number;
  translator: number;
}> {
  const [td, objectRemover, translator] = await Promise.all([
    getUsage(email, 'td'),
    getUsage(email, 'object-remover'),
    getUsage(email, 'translator'),
  ]);
  return { td, objectRemover, translator };
}
