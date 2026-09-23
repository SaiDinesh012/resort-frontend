import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMedia extends Document {
  id: string;
  title: string;
  altText: string;
  fileName: string;
  url: string;
  thumbnailUrl: string;
  category: string;
  width: number;
  height: number;
  fileSizeKb: number;
  format: string;
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
    thumbnailUrl: { type: String, default: "" },
    category: {
      type: String,
      default: "resort",
    },
    width: { type: Number, default: 1200 },
    height: { type: Number, default: 800 },
    fileSizeKb: { type: Number, default: 250 },
    format: {
      type: String,
      default: "jpg",
    },
    usedIn: { type: [String], default: [] },
    isPrimary: { type: Boolean, default: false },
  },
  { timestamps: true }
);

delete (mongoose.models as any).Media;
export const Media: Model<IMedia> =
  mongoose.models.Media || mongoose.model<IMedia>("Media", MediaSchema);

export default Media;
