import { Types } from "mongoose";
import { z } from "zod";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/session";
import { writeAdminAudit } from "@/lib/audit";
import { USER_ROLES } from "@/models/User";
import { jsonError, jsonOk } from "@/lib/api-response";

const patchSchema = z.object({
  banned: z.boolean().optional(),
  bannedReason: z.string().max(500).optional().nullable(),
  role: z.enum(USER_ROLES).optional(),
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
    if (!parsed.success || Object.keys(parsed.data).length === 0) {
      return jsonError("Invalid body");
    }
    await connectDB();
    const user = await User.findById(id);
    if (!user) return jsonError("Not found", 404);
    if (user._id.equals(me.dbUser!._id) && parsed.data.banned === true) {
      return jsonError("Cannot ban yourself", 400);
    }
    const before = { banned: user.banned, role: user.role };
    if (parsed.data.banned !== undefined) user.banned = parsed.data.banned;
    if (parsed.data.bannedReason !== undefined) user.bannedReason = parsed.data.bannedReason;
    if (parsed.data.role !== undefined) user.role = parsed.data.role;
    await user.save();
    await writeAdminAudit({
      adminId: me.dbUser!._id,
      action: "user.update",
      targetType: "user",
      targetId: user._id.toString(),
      meta: { before, after: { banned: user.banned, role: user.role } },
    });
    return jsonOk({ ok: true });
  } catch (e) {
    const err = e as Error & { status?: number };
    return jsonError(err.message, err.status ?? 500);
  }
}
