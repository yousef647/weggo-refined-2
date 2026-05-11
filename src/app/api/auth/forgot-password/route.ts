import User from "@/models/User";
import { connectDB } from "@/lib/db";
import { forgotPasswordSchema } from "@/lib/validators";
import { jsonError, jsonOk } from "@/lib/api-response";
import {
  buildResetUrl,
  createPasswordResetToken,
  sendResetEmailIfConfigured,
  shouldLogResetLink,
} from "@/lib/password-reset";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON");
  }
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid email");
  await connectDB();
  const user = await User.findOne({ email: parsed.data.email.toLowerCase() });
  if (!user) {
    return jsonOk({ ok: true });
  }
  const { raw, expiresAt } = await createPasswordResetToken(user._id);
  const origin = process.env.AUTH_URL ?? new URL(req.url).origin;
  const resetUrl = buildResetUrl(origin, raw);
  const emailed = await sendResetEmailIfConfigured(user.email, resetUrl);
  if (!emailed && shouldLogResetLink()) {
    console.info("[weggo] password reset link (dev):", resetUrl, "expires:", expiresAt.toISOString());
  }
  return jsonOk({ ok: true });
}
