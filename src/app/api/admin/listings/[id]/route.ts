import { Types } from "mongoose";
import { z } from "zod";
import Listing, { LISTING_STATUSES } from "@/models/Listing";
import { connectDB } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/session";
import { writeAdminAudit } from "@/lib/audit";
import { jsonError, jsonOk } from "@/lib/api-response";

const patchSchema = z.object({
  status: z.enum(LISTING_STATUSES).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  try {
    const me = await requireAuth();
    requireRole(me, ["admin"]);
    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) return jsonError("Not found", 404);
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON");
    }
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success || !parsed.data.status) return jsonError("Invalid body");
    await connectDB();
    const listing = await Listing.findById(id);
    if (!listing) return jsonError("Not found", 404);
    const before = listing.status;
    listing.status = parsed.data.status;
    await listing.save();
    await writeAdminAudit({
      adminId: me.dbUser!._id,
      action: "listing.status",
      targetType: "listing",
      targetId: listing._id.toString(),
      meta: { before, after: listing.status },
    });
    return jsonOk({ ok: true });
  } catch (e) {
    const err = e as Error & { status?: number };
    return jsonError(err.message, err.status ?? 500);
  }
}
