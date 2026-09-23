import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICustomer extends Document {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
  address?: string;
  city?: string;
  country?: string;
  avatar?: string;
  totalBookings: number;
  totalSpend: number;
  lastBookingDate?: string;
  status: "active" | "inactive" | "blocked";
  notes?: string;
  tags?: string[];
}

const CustomerSchema = new Schema<ICustomer>(
  {
    id: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String },
    address: { type: String },
    city: { type: String },
    country: { type: String, default: "India" },
    avatar: { type: String },
    totalBookings: { type: Number, default: 0 },
    totalSpend: { type: Number, default: 0 },
    lastBookingDate: { type: String },
    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
    },
    notes: { type: String },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Customer: Model<ICustomer> =
  mongoose.models.Customer || mongoose.model<ICustomer>("Customer", CustomerSchema);

export default Customer;
