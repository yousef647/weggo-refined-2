import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { authPagesSessionTrust, mapTokenToSession } from "@/auth.shared";
import { authorizeCredentials } from "@/lib/authorize-credentials";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const nodeConfig = {
  ...authPagesSessionTrust,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        return authorizeCredentials(parsed.data);
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.banned = user.banned;
      }
      if (trigger === "update") {
        const userId = (token.id as string | undefined) ?? (token.sub as string | undefined);
        if (!userId) return token;
        const { connectDB } = await import("@/lib/db");
        const { default: User } = await import("@/models/User");
        await connectDB();
        const dbUser = await User.findById(userId);
        if (dbUser) {
          token.role = dbUser.role;
          token.banned = dbUser.banned;
        }
      }
      return token;
    },
    session: mapTokenToSession,
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(nodeConfig);
