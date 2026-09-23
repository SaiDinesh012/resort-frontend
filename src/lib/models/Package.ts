import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPackage extends Document {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  images: string[];
  durationDays: number;
  durationNights: number;
  price: number;
  priceType: "per_person" | "per_couple" | "per_group";
  maxGuests: number;
  includedRoom: string;
  activities: string[];
  meals: {
    type: string;
    label: string;
    description: string;
  };
  sightseeing: string[];
  transport: boolean;
  itinerary: {
    day: number;
    title: string;
    activities: string[];
    meals: string[];
  }[];
  whatsIncluded: string[];
  whatsExcluded: string[];
  terms: string[];
  cancellationPolicy: string;
  faqs: { question: string; answer: string }[];
  status: "active" | "inactive" | "draft";
  featured: boolean;
  rating: number;
  reviewCount: number;
}

const PackageSchema = new Schema<IPackage>(
  {
    id: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    tagline: { type: String, default: "" },
    description: { type: String, required: true },
    longDescription: { type: String, default: "" },
    images: { type: [String], default: [] },
    durationDays: {
      type: Number,
      default: function (this: any) {
        return (this.durationNights || 3) + 1;
      },
    },
    durationNights: { type: Number, default: 3 },
    price: { type: Number, required: true },
    priceType: {
      type: String,
      enum: ["per_person", "per_couple", "per_group"],
      default: "per_couple",
    },
    maxGuests: { type: Number, default: 2 },
    includedRoom: { type: String, default: "" },
    activities: { type: [String], default: [] },
    meals: {
      type: { type: String, default: "MAP" },
      label: { type: String, default: "Breakfast & Dinner Included" },
      description: { type: String, default: "Daily buffet breakfast and multi-course dinner at our restaurant." },
    },
    sightseeing: { type: [String], default: [] },
    transport: { type: Boolean, default: false },
    itinerary: [
      {
        day: { type: Number },
        title: { type: String },
        activities: { type: [String] },
        meals: { type: [String] },
      },
    ],
    whatsIncluded: { type: [String], default: [] },
    whatsExcluded: { type: [String], default: [] },
    terms: { type: [String], default: [] },
    cancellationPolicy: { type: String, default: "Free cancellation up to 7 days before check-in." },
    faqs: [
      {
        question: { type: String },
        answer: { type: String },
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
    },
    featured: { type: Boolean, default: false },
    rating: { type: Number, default: 4.9 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

delete (mongoose.models as any).Package;
export const Package: Model<IPackage> =
  mongoose.models.Package || mongoose.model<IPackage>("Package", PackageSchema);

export default Package;
