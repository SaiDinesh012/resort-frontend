import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBlogPost extends Document {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  category: string;
  author: string;
  authorAvatar?: string;
  publishedAt?: string;
  status: "published" | "draft" | "scheduled";
  seoTitle?: string;
  seoDescription?: string;
  tags: string[];
  readTime: number;
}

export interface IReview extends Document {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  bookingId?: string;
  rating: number;
  title: string;
  body: string;
  roomId?: string;
  packageId?: string;
  status: "published" | "pending" | "rejected";
  reply?: string;
  repliedAt?: string;
}

export interface IFAQ extends Document {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  status: "active" | "inactive";
}

export interface IAttraction extends Document {
  id: string;
  name: string;
  description: string;
  distance: string;
  duration: string;
  type: "nature" | "heritage" | "adventure" | "town" | "religious";
  image?: string;
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, default: "" },
    content: { type: String, required: true },
    featuredImage: {
      type: String,
      default: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80",
    },
    category: { type: String, default: "Experiences" },
    author: { type: String, default: "Resort Editorial" },
    authorAvatar: { type: String },
    publishedAt: { type: String },
    status: {
      type: String,
      enum: ["published", "draft", "scheduled"],
      default: "published",
    },
    seoTitle: { type: String },
    seoDescription: { type: String },
    tags: { type: [String], default: [] },
    readTime: { type: Number, default: 5 },
  },
  { timestamps: true }
);

const ReviewSchema = new Schema<IReview>(
  {
    id: { type: String, required: true, unique: true },
    customerId: { type: String, default: () => `cust-${Date.now()}` },
    customerName: { type: String, required: true },
    customerAvatar: { type: String },
    bookingId: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true },
    body: { type: String, required: true },
    roomId: { type: String },
    packageId: { type: String },
    status: {
      type: String,
      enum: ["published", "pending", "rejected"],
      default: "published",
    },
    reply: { type: String },
    repliedAt: { type: String },
  },
  { timestamps: true }
);

const FAQSchema = new Schema<IFAQ>(
  {
    id: { type: String, required: true, unique: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String, default: "General" },
    order: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

const AttractionSchema = new Schema<IAttraction>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    distance: { type: String, required: true },
    duration: { type: String, required: true },
    type: {
      type: String,
      enum: ["nature", "heritage", "adventure", "town", "religious"],
      default: "nature",
    },
    image: { type: String },
  },
  { timestamps: true }
);

delete (mongoose.models as any).BlogPost;
delete (mongoose.models as any).Review;
delete (mongoose.models as any).FAQ;
delete (mongoose.models as any).Attraction;

export const BlogPost: Model<IBlogPost> =
  mongoose.models.BlogPost || mongoose.model<IBlogPost>("BlogPost", BlogPostSchema);

export const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export const FAQ: Model<IFAQ> =
  mongoose.models.FAQ || mongoose.model<IFAQ>("FAQ", FAQSchema);

export const Attraction: Model<IAttraction> =
  mongoose.models.Attraction || mongoose.model<IAttraction>("Attraction", AttractionSchema);
