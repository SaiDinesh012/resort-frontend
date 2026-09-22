import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRoom extends Document {
  id: string;
  slug: string;
  name: string;
  type: string;
  description: string;
  longDescription: string;
  images: string[];
  size: number;
  maxAdults: number;
  maxChildren: number;
  maxOccupancy: number;
  beds: string;
  amenities: string[];
  basePrice: number;
  weekendPrice: number;
  taxRate: number;
  status: "available" | "occupied" | "maintenance" | "blocked";
  rating: number;
  reviewCount: number;
  featured: boolean;
  floorLevel?: string;
  view?: string;
}

const RoomSchema = new Schema<IRoom>(
  {
    id: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    longDescription: { type: String, default: "" },
    images: { type: [String], default: [] },
    size: { type: Number, required: true, default: 400 },
    maxAdults: { type: Number, required: true, default: 2 },
    maxChildren: { type: Number, required: true, default: 1 },
    maxOccupancy: { type: Number, required: true, default: 3 },
    beds: { type: String, required: true, default: "1 King Bed" },
    amenities: { type: [String], default: [] },
    basePrice: { type: Number, required: true },
    weekendPrice: { type: Number, required: true },
    taxRate: { type: Number, default: 18 },
    status: {
      type: String,
      enum: ["available", "occupied", "maintenance", "blocked"],
      default: "available",
    },
    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    floorLevel: { type: String, default: "" },
    view: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Room: Model<IRoom> =
  mongoose.models.Room || mongoose.model<IRoom>("Room", RoomSchema);

export default Room;
