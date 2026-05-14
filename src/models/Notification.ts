import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const NotificationSchema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["new_listing", "followed_seller_listing"], default: "new_listing" },
    listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    readAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, readAt: 1 });

export type NotificationDocument = InferSchemaType<typeof NotificationSchema> & {
  _id: mongoose.Types.ObjectId;
};

const Notification: Model<NotificationDocument> =
  mongoose.models.Notification ?? mongoose.model<NotificationDocument>("Notification", NotificationSchema);

export default Notification;
