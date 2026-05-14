import { Types } from "mongoose";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { jsonError, jsonOk } from "@/lib/api-response";
import { z } from "zod";

const profileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
});

export async function PUT(req: Request) {
  try {
    const me = await requireAuth();
    await connectDB();

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON");
    }

    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid data");

    const updateData: Record<string, string> = {};
    if (parsed.data.name) updateData.name = parsed.data.name;
    if (parsed.data.bio !== undefined) updateData.bio = parsed.data.bio;
    if (parsed.data.location !== undefined) updateData.location = parsed.data.location;

    const user = await User.findByIdAndUpdate(
      new Types.ObjectId(me.id),
      updateData,
      { new: true }
    ).select("-passwordHash -ratings");

    return jsonOk({ user });
  } catch (e) {
    const err = e as Error & { status?: number };
    return jsonError(err.message, err.status ?? 500);
  }
}
