import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User, { type UserDocument, type UserRole } from "@/models/User";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  banned: boolean;
  dbUser: UserDocument | null;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  await connectDB();
  const dbUser = await User.findById(session.user.id);
  if (!dbUser) return null;
  return {
    id: dbUser._id.toString(),
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
    banned: dbUser.banned,
    dbUser,
  };
}

export async function requireAuth(): Promise<CurrentUser> {
  const u = await getCurrentUser();
  if (!u) {
    const err = new Error("Unauthorized");
    (err as Error & { status: number }).status = 401;
    throw err;
  }
  if (u.banned) {
    const err = new Error("Banned");
    (err as Error & { status: number }).status = 403;
    throw err;
  }
  return u;
}

export function requireRole(u: CurrentUser, roles: UserRole[]) {
  if (!roles.includes(u.role)) {
    const err = new Error("Forbidden");
    (err as Error & { status: number }).status = 403;
    throw err;
  }
}
