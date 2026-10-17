import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInquiry extends Document {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "new" | "in-progress" | "replied" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

const InquirySchema = new Schema<IInquiry>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    subject: { type: String, default: "General Inquiry" },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["new", "in-progress", "replied", "archived"],
      default: "new",
    },
  },
  { timestamps: true }
);

const Inquiry: Model<IInquiry> =
  mongoose.models.Inquiry || mongoose.model<IInquiry>("Inquiry", InquirySchema);

export default Inquiry;
