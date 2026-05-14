import { Types } from "mongoose";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { jsonError, jsonOk } from "@/lib/api-response";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

const rateSchema = z.object({
  score: z.number().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export async function POST(req: Request, { params }: Params) {
  try {
    const me = await requireAuth();
    const { id } = await params;
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return jsonError("Invalid user ID");
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON");
    }

    const parsed = rateSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid rating data");

    const sellerId = new Types.ObjectId(id);
    const raterId = new Types.ObjectId(me.id);

    // Get seller user
    const seller = await User.findById(sellerId);
    if (!seller) {
      return jsonError("User not found", 404);
    }

    if (sellerId.equals(raterId)) {
      return jsonError("You cannot rate yourself");
    }

    // Remove existing rating from this user if any
    await User.findByIdAndUpdate(sellerId, {
      $pull: { ratings: { rater: raterId } },
    });

    // Add new rating
    await User.findByIdAndUpdate(
      sellerId,
      {
        $push: {
          ratings: {
            rater: raterId,
            score: parsed.data.score,
            comment: parsed.data.comment || "",
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    const updatedUser = await User.findById(sellerId).select("-passwordHash");
    return jsonOk({ user: updatedUser });
  } catch (e) {
    const err = e as Error & { status?: number };
    return jsonError(err.message, err.status ?? 500);
  }
}
