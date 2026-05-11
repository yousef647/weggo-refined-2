import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export const LISTING_CONDITIONS = ["new", "like_new", "good", "fair", "for_parts"] as const;
export type ListingCondition = (typeof LISTING_CONDITIONS)[number];

export const LISTING_STATUSES = ["active", "hidden", "removed", "sold"] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

const ListingSchema = new Schema(
  {
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    condition: { type: String, enum: LISTING_CONDITIONS, required: true },
    categorySlug: { type: String, required: true, index: true },
    subcategorySlug: { type: String, required: true, index: true },
    location: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    images: { type: [String], default: [] },
    status: {
      type: String,
      enum: LISTING_STATUSES,
      default: "active",
      index: true,
    },
  },
  { timestamps: true }
);

ListingSchema.index({ status: 1, createdAt: -1 });
ListingSchema.index({ status: 1, categorySlug: 1, subcategorySlug: 1 });
ListingSchema.index({ status: 1, condition: 1 });
ListingSchema.index({ status: 1, price: 1 });
ListingSchema.index({ title: "text", description: "text" });

export type ListingDocument = InferSchemaType<typeof ListingSchema> & {
  _id: mongoose.Types.ObjectId;
};

const Listing: Model<ListingDocument> =
  mongoose.models.Listing ?? mongoose.model<ListingDocument>("Listing", ListingSchema);

export default Listing;
