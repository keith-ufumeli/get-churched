import { ExpressAuth, getSession } from '@auth/express';
import GitHub from '@auth/express/providers/github';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import mongoose from 'mongoose';

export { getSession };

const allowedUsername = process.env.ALLOWED_GITHUB_USERNAME?.trim() || '';
const allowedId = process.env.ALLOWED_GITHUB_ID?.trim() || '';

/** Uses the same MongoDB connection as the app (mongoose). Client is resolved at request time. */
function getMongoClient() {
  return mongoose.connection.getClient();
}

export const authConfig = {
  adapter: MongoDBAdapter(getMongoClient, {
    databaseName: process.env.MONGO_DB_NAME || undefined,
    collections: {
      Users: 'auth_users',
      Accounts: 'auth_accounts',
      Sessions: 'auth_sessions',
      VerificationTokens: 'auth_verification_tokens',
    },
  }),
  // Force non-secure cookies in dev (http://localhost) so browser stores the session cookie
  useSecureCookies: process.env.NODE_ENV === 'production' && process.env.AUTH_URL?.startsWith('https'),
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
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
