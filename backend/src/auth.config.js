import { ExpressAuth, getSession } from '@auth/express';
import GitHub from '@auth/express/providers/github';

export { getSession };

const allowedUsername = process.env.ALLOWED_GITHUB_USERNAME?.trim() || '';
const allowedId = process.env.ALLOWED_GITHUB_ID?.trim() || '';

export const authConfig = {
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  trustHost: true,
  callbacks: {
    signIn({ user, profile }) {
      if (!allowedUsername && !allowedId) {
        return false;
      }
      const login = profile?.login ?? user?.name;
      const id = profile?.id ?? user?.id ?? '';
      const idStr = String(id);
      if (allowedUsername && login === allowedUsername) return true;
      if (allowedId && (idStr === allowedId || profile?.id?.toString() === allowedId)) return true;
      return false;
    },
  },
};

export const auth = ExpressAuth(authConfig);
