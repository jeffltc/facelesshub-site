export async function verifyTurnstile(
  token: string | null,
  ip?: string
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Dev mode: no secret configured, skip verification
    return true;
  }
  if (!token) return false;

  const res = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token, remoteip: ip }),
    }
  );

  const data = (await res.json()) as { success: boolean };
  return data.success === true;
}
