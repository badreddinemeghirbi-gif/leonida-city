import NextAuth from 'next-auth';
import Discord from 'next-auth/providers/discord';
import Google from 'next-auth/providers/google';
import { upsertUser } from '@/lib/users';

/**
 * Auth.js v5. Sessions are JWTs — no database adapter needed.
 *
 * We deliberately do NOT persist the provider's name or email.
 * All we keep is an opaque "provider:accountId" string plus the
 * random handle we generate. Nothing identifying is stored.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [Discord, Google],
  pages: { signIn: '/forum' },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        const id = `${account.provider}:${account.providerAccountId}`;
        const avatar =
          (profile as { image_url?: string; picture?: string })?.image_url ??
          (profile as { picture?: string })?.picture ??
          null;

        const user = await upsertUser(id, avatar);
        token.uid = user.id;
        token.handle = user.handle;
        token.role = user.role;
        token.banned = user.banned === 1;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.uid as string;
      session.user.handle = token.handle as string;
      session.user.role = (token.role as string) ?? 'member';
      session.user.banned = Boolean(token.banned);
      return session;
    },
  },
});
