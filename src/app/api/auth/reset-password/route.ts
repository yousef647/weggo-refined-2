import bcrypt from "bcryptjs";
import User from "@/models/User";
import PasswordResetToken from "@/models/PasswordResetToken";
import { connectDB } from "@/lib/db";
import { resetPasswordSchema } from "@/lib/validators";
import { jsonError, jsonOk } from "@/lib/api-response";
import { hashResetToken } from "@/lib/password-reset";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON");
  }
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid token or password");
  const tokenHash = hashResetToken(parsed.data.token);
  await connectDB();
  const row = await PasswordResetToken.findOne({
    tokenHash,
    usedAt: null,
    expiresAt: { $gt: new Date() },
  });
  if (!row) return jsonError("Invalid or expired token", 400);
  const user = await User.findById(row.user);
  if (!user) return jsonError("Invalid token", 400);
  user.passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await user.save();
  row.usedAt = new Date();
  await row.save();
  return jsonOk({ ok: true });
}
