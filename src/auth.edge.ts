import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import { authPagesSessionTrust, mapTokenToSession } from "@/auth.shared";

/**
 * Edge middleware: JWT decode + session mapping only (no DB).
 */
const edgeConfig = {
  ...authPagesSessionTrust,
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.banned = user.banned;
      }
      return token;
    },
    session: mapTokenToSession,
  },
} satisfies NextAuthConfig;

export const { auth } = NextAuth(edgeConfig);
