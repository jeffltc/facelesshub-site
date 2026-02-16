import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      authorization: {
        params: {
          scope:
            'openid email profile https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.force-ssl',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // First login: persist tokens from the OAuth provider
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        return token;
      }

      // Token still valid — return as-is
      if (typeof token.expiresAt === 'number' && Date.now() < token.expiresAt * 1000) {
        return token;
      }

      // Token expired — refresh it
      if (!token.refreshToken) return { ...token, error: 'RefreshTokenMissing' };

      try {
        const res = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: process.env.AUTH_GOOGLE_ID!,
            client_secret: process.env.AUTH_GOOGLE_SECRET!,
            grant_type: 'refresh_token',
            refresh_token: token.refreshToken as string,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error_description ?? 'Refresh failed');

        token.accessToken = data.access_token;
        token.expiresAt = Math.floor(Date.now() / 1000) + (data.expires_in as number);
        // Google may rotate refresh tokens
        if (data.refresh_token) token.refreshToken = data.refresh_token;
        return token;
      } catch (error) {
        console.error('Token refresh error:', error);
        return { ...token, error: 'RefreshTokenError' };
      }
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
});
