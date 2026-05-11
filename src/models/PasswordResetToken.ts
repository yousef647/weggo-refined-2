import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const PasswordResetTokenSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

PasswordResetTokenSchema.index({ user: 1, expiresAt: -1 });

export type PasswordResetTokenDocument = InferSchemaType<typeof PasswordResetTokenSchema> & {
  _id: mongoose.Types.ObjectId;
};

const PasswordResetToken: Model<PasswordResetTokenDocument> =
  mongoose.models.PasswordResetToken ??
  mongoose.model<PasswordResetTokenDocument>("PasswordResetToken", PasswordResetTokenSchema);

export default PasswordResetToken;
