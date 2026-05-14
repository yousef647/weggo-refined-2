import { Types } from "mongoose";
import Listing from "@/models/Listing";
import { connectDB } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api-response";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return jsonError("Invalid user ID");
    }

    const sellerId = new Types.ObjectId(id);

    // Get active listings
    const activeListings = await Listing.find({ seller: sellerId, status: "active" })
      .sort({ createdAt: -1 })
      .select("title status price images createdAt")
      .lean();

    // Get all other listings (sold, hidden, removed)
    const otherListings = await Listing.find({ seller: sellerId, status: { $ne: "active" } })
      .sort({ createdAt: -1 })
      .select("title status price images createdAt")
      .lean();

    return jsonOk({ 
      activeListings,
      otherListings,
    });
  } catch (e) {
    const err = e as Error & { status?: number };
    return jsonError(err.message, err.status ?? 500);
  }
}
