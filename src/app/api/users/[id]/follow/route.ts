import { Types } from "mongoose";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { jsonError, jsonOk } from "@/lib/api-response";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  try {
    const me = await requireAuth();
    const { id } = await params;
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return jsonError("Invalid user ID");
    }

    const userId = new Types.ObjectId(id);
    const myId = new Types.ObjectId(me.id);

    // Get user to check if already following
    const user = await User.findById(userId);
    if (!user) {
      return jsonError("User not found", 404);
    }

    // Check if already following
    const isFollowing = user.followers.includes(myId);

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(userId, {
        $pull: { followers: myId },
      });
    } else {
      // Follow
      await User.findByIdAndUpdate(userId, {
        $addToSet: { followers: myId },
      });
    }

    const updatedUser = await User.findById(userId).select("-passwordHash -ratings");
    return jsonOk({
      user: updatedUser,
      following: !isFollowing,
    });
  } catch (e) {
    const err = e as Error & { status?: number };
    return jsonError(err.message, err.status ?? 500);
  }
}
