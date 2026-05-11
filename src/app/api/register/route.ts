import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { registerSchema } from "@/lib/validators";
import { jsonError, jsonOk } from "@/lib/api-response";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON");
  }
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.flatten().fieldErrors ? "Validation failed" : "Validation failed");
  }
  const { name, email, password } = parsed.data;
  await connectDB();
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return jsonError("Email already registered", 409);
  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({
    email: email.toLowerCase(),
    passwordHash,
    name,
    role: "buyer",
    banned: false,
  });
  return jsonOk({ ok: true }, 201);
}
