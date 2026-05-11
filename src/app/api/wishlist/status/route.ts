import { Types } from "mongoose";
import WishlistItem from "@/models/WishlistItem";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { jsonError, jsonOk } from "@/lib/api-response";

export async function GET(req: Request) {
  try {
    const me = await requireAuth();
    const listingId = new URL(req.url).searchParams.get("listingId");
    if (!listingId || !Types.ObjectId.isValid(listingId)) {
      return jsonError("listingId required");
    }
    await connectDB();
    const w = await WishlistItem.findOne({
      user: me.id,
      listing: listingId,
    }).lean();
    return jsonOk({ inWishlist: !!w });
  } catch (e) {
    const err = e as Error & { status?: number };
    return jsonError(err.message, err.status ?? 500);
  }
}
