import { Types } from "mongoose";
import Listing from "@/models/Listing";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { jsonError, jsonOk } from "@/lib/api-response";
import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(48).default(12),
  status: z.enum(["active", "hidden", "removed", "sold", "all"]).default("all"),
});

export async function GET(req: Request) {
  try {
    const me = await requireAuth();
    if (me.role !== "seller" && me.role !== "admin") {
      return jsonError("Seller role required", 403);
    }
    const url = new URL(req.url);
    const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
    if (!parsed.success) return jsonError("Invalid query");
    const { page, limit, status } = parsed.data;
    await connectDB();
    const filter: Record<string, unknown> = { seller: new Types.ObjectId(me.id) };
    if (status !== "all") filter.status = status;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Listing.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Listing.countDocuments(filter),
    ]);
    return jsonOk({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (e) {
    const err = e as Error & { status?: number };
    return jsonError(err.message, err.status ?? 500);
  }
}
