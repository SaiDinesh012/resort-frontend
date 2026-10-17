import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILegalPage extends Document {
  slug: string;
  title: string;
  subtitle?: string;
  content: string;
  lastUpdated: string;
  status: "published" | "draft";
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const LegalPageSchema = new Schema<ILegalPage>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    content: { type: String, required: true },
    lastUpdated: { type: String, default: "October 2026" },
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "published",
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const LegalPage: Model<ILegalPage> =
  mongoose.models.LegalPage || mongoose.model<ILegalPage>("LegalPage", LegalPageSchema);

export default LegalPage;
