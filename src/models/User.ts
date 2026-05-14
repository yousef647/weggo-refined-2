import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export const USER_ROLES = ["admin", "buyer", "seller"] as const;
export type UserRole = (typeof USER_ROLES)[number];

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "buyer",
    },
    banned: { type: Boolean, default: false },
    bannedReason: { type: String, default: null },
    profilePicture: { type: String, default: null },
    bio: { type: String, default: "", trim: true, maxlength: 500 },
    location: { type: String, default: "", trim: true },
    followers: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
      index: true,
    },
    ratings: [
      {
        rater: { type: Schema.Types.ObjectId, ref: "User", required: true },
        score: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, default: "", trim: true, maxlength: 500 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

UserSchema.index({ role: 1, banned: 1 });

export type UserDocument = InferSchemaType<typeof UserSchema> & { _id: mongoose.Types.ObjectId };


const User: Model<UserDocument> =
  mongoose.models.User ?? mongoose.model<UserDocument>("User", UserSchema);

export default User;
