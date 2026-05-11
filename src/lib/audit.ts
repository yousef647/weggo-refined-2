import AdminAuditLog from "@/models/AdminAuditLog";
import type { Types } from "mongoose";

export async function writeAdminAudit(params: {
  adminId: Types.ObjectId;
  action: string;
  targetType: string;
  targetId: string;
  meta?: Record<string, unknown>;
}) {
  await AdminAuditLog.create({
    admin: params.adminId,
    action: params.action,
    targetType: params.targetType,
    targetId: params.targetId,
    meta: params.meta ?? {},
  });
}
