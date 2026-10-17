import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICoupon extends Document {
  id: string;
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  minBookingAmount: number;
  maxDiscount: number;
  usageLimit: number;
  usedCount: number;
  validUntil?: string;
  status: "active" | "inactive" | "expired";
  description?: string;
}

const CouponSchema = new Schema<ICoupon>(
  {
    id: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: {
      type: String,
      enum: ["percentage", "flat"],
      default: "percentage",
    },
    discountValue: { type: Number, required: true },
    minBookingAmount: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: 0 },
    usageLimit: { type: Number, default: 100 },
    usedCount: { type: Number, default: 0 },
    validUntil: { type: String },
    status: {
      type: String,
      enum: ["active", "inactive", "expired"],
      default: "active",
    },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Coupon: Model<ICoupon> =
  mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", CouponSchema);

export default Coupon;
