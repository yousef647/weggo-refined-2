import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function authorizeCredentials(data: { email: string; password: string }) {
  await connectDB();
  const user = await User.findOne({ email: data.email.toLowerCase() });
  if (!user) return null;
  const ok = await bcrypt.compare(data.password, user.passwordHash);
  if (!ok) return null;
  if (user.banned) return null;
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    banned: user.banned,
  };
}
