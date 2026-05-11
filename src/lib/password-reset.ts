import crypto from "crypto";
import PasswordResetToken from "@/models/PasswordResetToken";
import type { Types } from "mongoose";

const HOUR_MS = 60 * 60 * 1000;

export function hashResetToken(raw: string) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export async function createPasswordResetToken(userId: Types.ObjectId, ttlHours = 2) {
  const raw = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashResetToken(raw);
  const expiresAt = new Date(Date.now() + ttlHours * HOUR_MS);
  await PasswordResetToken.updateMany({ user: userId, usedAt: null }, { $set: { usedAt: new Date() } });
  await PasswordResetToken.create({ user: userId, tokenHash, expiresAt });
  return { raw, expiresAt };
}

export function buildResetUrl(origin: string, rawToken: string) {
  const u = new URL("/reset-password", origin);
  u.searchParams.set("token", rawToken);
  return u.toString();
}

export async function sendResetEmailIfConfigured(to: string, resetUrl: string) {
  const from = process.env.EMAIL_FROM;
  const apiKey = process.env.RESEND_API_KEY;
  if (!from || !apiKey) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Reset your weggo password",
      html: `<p>Click to reset your password (expires soon):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    }),
  });
  return res.ok;
}

export function shouldLogResetLink() {
  if (process.env.NODE_ENV === "production") return false;
  return process.env.LOG_RESET_LINK === "true" || process.env.LOG_RESET_LINK === "1";
}
