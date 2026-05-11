import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const AdminAuditLogSchema = new Schema(
  {
    admin: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    action: { type: String, required: true },
    targetType: { type: String, required: true },
    targetId: { type: String, required: true },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

AdminAuditLogSchema.index({ createdAt: -1 });

export type AdminAuditLogDocument = InferSchemaType<typeof AdminAuditLogSchema> & {
  _id: mongoose.Types.ObjectId;
};

const AdminAuditLog: Model<AdminAuditLogDocument> =
  mongoose.models.AdminAuditLog ??
  mongoose.model<AdminAuditLogDocument>("AdminAuditLog", AdminAuditLogSchema);

export default AdminAuditLog;
