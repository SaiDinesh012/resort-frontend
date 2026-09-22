import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPayment extends Document {
  id: string;
  paymentId: string;
  bookingId: string;
  bookingNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  currency: string;
  method: "upi" | "card" | "netbanking" | "wallet" | "bank_transfer";
  status: "success" | "failed" | "pending" | "refunded";
  gateway: "razorpay" | "stripe" | "manual";
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  refundAmount?: number;
  refundedAt?: string;
  notes?: string;
}

const PaymentSchema = new Schema<IPayment>(
  {
    id: { type: String, required: true, unique: true },
    paymentId: { type: String, required: true, unique: true },
    bookingId: { type: String, required: true },
    bookingNumber: { type: String, required: true },
    customerId: { type: String, required: true },
    customerName: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    method: {
      type: String,
      enum: ["upi", "card", "netbanking", "wallet", "bank_transfer"],
      default: "card",
    },
    status: {
      type: String,
      enum: ["success", "failed", "pending", "refunded"],
      default: "pending",
    },
    gateway: {
      type: String,
      enum: ["razorpay", "stripe", "manual"],
      default: "manual",
    },
    gatewayOrderId: { type: String },
    gatewayPaymentId: { type: String },
    refundAmount: { type: Number, default: 0 },
    refundedAt: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;
