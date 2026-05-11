import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const ConversationSchema = new Schema(
  {
    listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
    buyer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ConversationSchema.index({ listing: 1, buyer: 1, seller: 1 }, { unique: true });
ConversationSchema.index({ buyer: 1, lastMessageAt: -1 });
ConversationSchema.index({ seller: 1, lastMessageAt: -1 });

export type ConversationDocument = InferSchemaType<typeof ConversationSchema> & {
  _id: mongoose.Types.ObjectId;
};

const Conversation: Model<ConversationDocument> =
  mongoose.models.Conversation ??
  mongoose.model<ConversationDocument>("Conversation", ConversationSchema);

export default Conversation;
