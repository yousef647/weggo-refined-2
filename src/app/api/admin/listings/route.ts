import Listing from "@/models/Listing";
import { connectDB } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/session";
import { jsonError, jsonOk } from "@/lib/api-response";
import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(["active", "hidden", "removed", "sold", "all"]).default("all"),
  q: z.string().max(120).optional(),
});

export async function GET(req: Request) {
  try {
    const me = await requireAuth();
    requireRole(me, ["admin"]);
    const url = new URL(req.url);
    const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
    if (!parsed.success) return jsonError("Invalid query");
    const { page, limit, status, q } = parsed.data;
    await connectDB();
    const filter: Record<string, unknown> = {};
    if (status !== "all") filter.status = status;
    if (q && q.trim()) {
      filter.title = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    }
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Listing.find(filter)
        .populate("seller", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Listing.countDocuments(filter),
    ]);
    return jsonOk({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (e) {
    const err = e as Error & { status?: number };
    return jsonError(err.message, err.status ?? 500);
  }
}
