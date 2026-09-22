import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBooking extends Document {
  id: string;
  bookingNumber: string;
  type: "room" | "package";
  roomId?: string;
  roomName?: string;
  packageId?: string;
  packageName?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  guestDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    country?: string;
    idType?: string;
    idNumber?: string;
    specialRequests?: string;
  };
  priceBreakdown: {
    basePrice: number;
    nights: number;
    subtotal: number;
    taxAmount: number;
    taxRate: number;
    discountAmount: number;
    couponCode?: string;
    total: number;
  };
  paymentStatus: "paid" | "pending" | "failed" | "refunded" | "partial";
  paymentMethod?: string;
  bookingStatus: "confirmed" | "pending" | "cancelled" | "completed" | "no-show";
  notes?: string;
  timeline: {
    timestamp: string;
    event: string;
    description: string;
    actor?: string;
  }[];
  cancellationReason?: string;
  refundAmount?: number;
}

const BookingSchema = new Schema<IBooking>(
  {
    id: { type: String, required: true, unique: true },
    bookingNumber: { type: String, required: true, unique: true },
    type: { type: String, enum: ["room", "package"], required: true },
    roomId: { type: String },
    roomName: { type: String },
    packageId: { type: String },
    packageName: { type: String },
    checkIn: { type: String, required: true },
    checkOut: { type: String, required: true },
    nights: { type: Number, required: true },
    adults: { type: Number, required: true, default: 1 },
    children: { type: Number, default: 0 },
    guestDetails: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String },
      city: { type: String },
      country: { type: String },
      idType: { type: String },
      idNumber: { type: String },
      specialRequests: { type: String },
    },
    priceBreakdown: {
      basePrice: { type: Number, required: true },
      nights: { type: Number, required: true },
      subtotal: { type: Number, required: true },
      taxAmount: { type: Number, required: true },
      taxRate: { type: Number, required: true, default: 18 },
      discountAmount: { type: Number, default: 0 },
      couponCode: { type: String },
      total: { type: Number, required: true },
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "failed", "refunded", "partial"],
      default: "pending",
    },
    paymentMethod: { type: String, default: "card" },
    bookingStatus: {
      type: String,
      enum: ["confirmed", "pending", "cancelled", "completed", "no-show"],
      default: "confirmed",
    },
    notes: { type: String },
    timeline: [
      {
        timestamp: { type: String },
        event: { type: String },
        description: { type: String },
        actor: { type: String },
      },
    ],
    cancellationReason: { type: String },
    refundAmount: { type: Number },
  },
  { timestamps: true }
);

export const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;
