import { Casefold, Collection, Create, Exists, Get, If, Index, Match, Not } from 'faunadb';

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
