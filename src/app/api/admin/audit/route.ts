import AdminAuditLog from "@/models/AdminAuditLog";
import { connectDB } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/session";
import { jsonError, jsonOk } from "@/lib/api-response";
import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(30),
});

export async function GET(req: Request) {
  try {
    const me = await requireAuth();
    requireRole(me, ["admin"]);
    const url = new URL(req.url);
    const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
    if (!parsed.success) return jsonError("Invalid query");
    const { page, limit } = parsed.data;
    await connectDB();
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      AdminAuditLog.find()
        .populate("admin", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AdminAuditLog.countDocuments(),
    ]);
    return jsonOk({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (e) {
    const err = e as Error & { status?: number };
    return jsonError(err.message, err.status ?? 500);
  }
}
