import { Types } from "mongoose";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { jsonError, jsonOk } from "@/lib/api-response";

export async function POST(req: Request) {
  try {
    const me = await requireAuth();
    await connectDB();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return jsonError("No file provided");
    }

    // Convert file to base64 data URL
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Update user profile picture
    const user = await User.findByIdAndUpdate(
      new Types.ObjectId(me.id),
      { profilePicture: dataUrl },
      { new: true }
    ).select("-passwordHash -ratings");

    return jsonOk({ user });
  } catch (e) {
    const err = e as Error & { status?: number };
    return jsonError(err.message, err.status ?? 500);
  }
}
