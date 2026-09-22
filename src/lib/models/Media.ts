import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMedia extends Document {
  id: string;
  title: string;
  altText: string;
  fileName: string;
  url: string;
  thumbnailUrl: string;
  category: "resort" | "rooms" | "packages" | "activities" | "blog" | "seo";
  width: number;
  height: number;
  fileSizeKb: number;
  format: "jpg" | "png" | "webp" | "avif";
  usedIn: string[];
  isPrimary: boolean;
}

const MediaSchema = new Schema<IMedia>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    altText: { type: String, default: "" },
    fileName: { type: String, required: true },
    url: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    category: {
      type: String,
      enum: ["resort", "rooms", "packages", "activities", "blog", "seo"],
      default: "resort",
    },
    width: { type: Number, default: 1200 },
    height: { type: Number, default: 800 },
    fileSizeKb: { type: Number, default: 250 },
    format: {
      type: String,
      enum: ["jpg", "png", "webp", "avif"],
      default: "jpg",
    },
    usedIn: { type: [String], default: [] },
    isPrimary: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Media: Model<IMedia> =
  mongoose.models.Media || mongoose.model<IMedia>("Media", MediaSchema);

export default Media;
