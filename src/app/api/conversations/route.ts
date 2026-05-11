import { Types } from "mongoose";
import Conversation from "@/models/Conversation";
import Listing from "@/models/Listing";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { conversationCreateSchema } from "@/lib/validators";
import { jsonError, jsonOk } from "@/lib/api-response";
import { z } from "zod";

const postSchema = conversationCreateSchema.extend({
  buyerId: z.string().optional(),
});

export async function GET() {
  try {
    const me = await requireAuth();
    await connectDB();
    const uid = new Types.ObjectId(me.id);
    const rows = await Conversation.find({
      $or: [{ buyer: uid }, { seller: uid }],
    })
      .sort({ lastMessageAt: -1 })
      .populate("listing", "title images price status")
      .populate("buyer", "name email")
      .populate("seller", "name email")
      .lean();
    return jsonOk({ conversations: rows });
  } catch (e) {
    const err = e as Error & { status?: number };
    return jsonError(err.message, err.status ?? 500);
  }
}

export async function POST(req: Request) {
  try {
    const me = await requireAuth();
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON");
    }
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid body");
    const { listingId, buyerId: buyerIdRaw } = parsed.data;
    if (!Types.ObjectId.isValid(listingId)) return jsonError("Invalid listing");
    await connectDB();
    const listing = await Listing.findById(listingId);
    if (!listing) return jsonError("Listing not found", 404);
    const sellerId = listing.seller.toString();
    const meId = me.id;

    let buyerObjectId: Types.ObjectId;
    let sellerObjectId = new Types.ObjectId(sellerId);

    if (meId === sellerId) {
      if (!buyerIdRaw || !Types.ObjectId.isValid(buyerIdRaw)) {
        return jsonError("buyerId required when you are the seller", 400);
      }
      buyerObjectId = new Types.ObjectId(buyerIdRaw);
      if (buyerObjectId.equals(sellerObjectId)) {
        return jsonError("Invalid buyer", 400);
      }
    } else {
      buyerObjectId = new Types.ObjectId(meId);
      if (buyerObjectId.equals(sellerObjectId)) {
        return jsonError("Cannot message your own listing as buyer", 400);
      }
    }

    const filter = {
      listing: new Types.ObjectId(listingId),
      buyer: buyerObjectId,
      seller: sellerObjectId,
    };

    let conv = await Conversation.findOne(filter);
    if (!conv) {
      conv = await Conversation.create({ ...filter, lastMessageAt: new Date() });
    }
    return jsonOk({ conversationId: conv._id.toString() }, 201);
  } catch (e) {
    const err = e as Error & { status?: number };
    return jsonError(err.message, err.status ?? 500);
  }
}
