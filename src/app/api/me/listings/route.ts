import { Types } from "mongoose";
import Listing from "@/models/Listing";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { jsonError, jsonOk } from "@/lib/api-response";

export async function GET() {
  try {
    const me = await requireAuth();
    await connectDB();
    const uid = new Types.ObjectId(me.id);

    const listings = await Listing.find({ seller: uid })
      .sort({ createdAt: -1 })
      .select("title status price images createdAt")
      .lean();

    return jsonOk({ listings });
  } catch (e) {
    const err = e as Error & { status?: number };
    return jsonError(err.message, err.status ?? 500);
  }
}
