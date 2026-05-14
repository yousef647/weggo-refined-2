import { Types } from "mongoose";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { jsonError, jsonOk } from "@/lib/api-response";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return jsonError("Invalid user ID");
    }

    const user = await User.findById(id)
      .select("-passwordHash")
      .populate("ratings.rater", "name profilePicture")
      .populate("followers", "name email");

    if (!user) {
      return jsonError("User not found", 404);
    }

    // Calculate average rating
    const avgRating =
      user.ratings.length > 0
        ? (user.ratings.reduce((sum: number, r: any) => sum + r.score, 0) / user.ratings.length).toFixed(1)
        : 0;

    return jsonOk({
      user: {
        ...user.toObject(),
        averageRating: avgRating,
        followersCount: user.followers.length,
        ratingsCount: user.ratings.length,
      },
    });
  } catch (e) {
    const err = e as Error & { status?: number };
    return jsonError(err.message, err.status ?? 500);
  }
}
