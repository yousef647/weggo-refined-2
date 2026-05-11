import { Types } from "mongoose";
import WishlistItem from "@/models/WishlistItem";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { jsonError, jsonOk } from "@/lib/api-response";

type Params = { params: Promise<{ listingId: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const me = await requireAuth();
    const { listingId } = await params;
    if (!Types.ObjectId.isValid(listingId)) return jsonError("Invalid listing");
    await connectDB();
    await WishlistItem.deleteOne({ user: me.id, listing: listingId });
    return jsonOk({ ok: true });
  } catch (e) {
    const err = e as Error & { status?: number };
    return jsonError(err.message, err.status ?? 500);
  }
}
