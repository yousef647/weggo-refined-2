import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const WishlistItemSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
  },
  { timestamps: true }
);

WishlistItemSchema.index({ user: 1, listing: 1 }, { unique: true });

export type WishlistItemDocument = InferSchemaType<typeof WishlistItemSchema> & {
  _id: mongoose.Types.ObjectId;
};

const WishlistItem: Model<WishlistItemDocument> =
  mongoose.models.WishlistItem ??
  mongoose.model<WishlistItemDocument>("WishlistItem", WishlistItemSchema);

export default WishlistItem;
