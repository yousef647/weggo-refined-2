import type { NextAuthConfig, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

/** Edge-safe: no Mongoose. Used by both middleware (`auth.edge`) and Node (`auth.ts`). */
export const authPagesSessionTrust: Pick<NextAuthConfig, "trustHost" | "session" | "pages"> = {
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: {
    signIn: "/login",
  },
};

export async function mapTokenToSession({
  session,
  token,
}: {
  session: Session;
  token: JWT;
}): Promise<Session> {
  if (session.user) {
    session.user.id = token.id as string;
    session.user.role = token.role;
    session.user.banned = token.banned;
  }
  return session;
}
