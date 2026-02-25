import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      authorization: {
        params: {
          // Only request identity scopes — YouTube access is handled
          // separately via the channel-connect popup flow
          scope: 'openid email profile',
        },
      },
    }),
  ],
});
