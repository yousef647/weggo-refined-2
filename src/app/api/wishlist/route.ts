import { Types } from "mongoose";
import WishlistItem from "@/models/WishlistItem";
import Listing from "@/models/Listing";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { jsonError, jsonOk } from "@/lib/api-response";
import { z } from "zod";

const postSchema = z.object({ listingId: z.string().min(1) });

export async function GET(req: Request) {
  try {
    const me = await requireAuth();
    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
    const limit = Math.min(48, Math.max(1, Number(url.searchParams.get("limit") ?? "12") || 12));
    await connectDB();
    const skip = (page - 1) * limit;
    const [rows, total] = await Promise.all([
      WishlistItem.find({ user: me.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "listing",
          match: { status: "active" },
        })
        .lean(),
      WishlistItem.countDocuments({ user: me.id }),
    ]);
    const items = rows
      .map((r) => r.listing)
      .filter((l): l is NonNullable<typeof l> => !!l && typeof l === "object");
    return jsonOk({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
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
    const listingId = parsed.data.listingId;
    if (!Types.ObjectId.isValid(listingId)) return jsonError("Invalid listing");
    await connectDB();
    const listing = await Listing.findById(listingId);
    if (!listing || listing.status !== "active") return jsonError("Listing not found", 404);
    await WishlistItem.updateOne(
      { user: new Types.ObjectId(me.id), listing: new Types.ObjectId(listingId) },
      { $setOnInsert: { user: new Types.ObjectId(me.id), listing: new Types.ObjectId(listingId) } },
      { upsert: true }
    );
    return jsonOk({ ok: true }, 201);
  } catch (e) {
    const err = e as Error & { status?: number };
    if ((err as NodeJS.ErrnoException).code === 11000) return jsonOk({ ok: true });
    return jsonError(err.message, err.status ?? 500);
  }
}
