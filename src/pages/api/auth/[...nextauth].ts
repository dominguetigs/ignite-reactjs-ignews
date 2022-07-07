import {
  Casefold,
  Collection,
  Create,
  Exists,
  Get,
  If,
  Index,
  Intersection,
  Match,
  Not,
  Select,
} from 'faunadb';

import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';

import { fauna } from '../../../services/fauna';

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'read:user',
        },
      },
    }),
  ],
  callbacks: {
    async session({ session }) {
      try {
        const matchUserByEmail = Match(Index('user_by_email'), Casefold(session.user.email));

        const matchSubscriptionByUserRef = Match(
          Index('subscription_by_user_ref'),
          Select('ref', Get(matchUserByEmail))
        );

        const matchSubscriptionByStatus = Match(Index('subscription_by_status'), 'active');

        const userActiveSubscription = await fauna.query(
          Get(Intersection([matchSubscriptionByUserRef, matchSubscriptionByStatus]))
        );

        return {
          ...session,
          activeSubscription: userActiveSubscription,
        };
      } catch {
        return {
          ...session,
          activeSubscription: null,
        };
      }
    },
    async signIn({ user: { email } }) {
      const matchByIndex = Match(Index('user_by_email'), Casefold(email));

      try {
        await fauna.query(
          If(
            Not(Exists(matchByIndex)),
            Create(Collection('users'), { data: { email } }),
            Get(matchByIndex)
          )
        );
        return true;
      } catch {
        return false;
      }
    },
  },
});
