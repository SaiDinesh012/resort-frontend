export interface MediaItem {
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
  uploadedAt: string;
  isPrimary: boolean;
}

export interface Review {
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
  createdAt: string;
  status: "published" | "pending" | "rejected";
  reply?: string;
  repliedAt?: string;
}

export interface BlogPost {
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

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  status: "active" | "inactive";
}

export interface Attraction {
  id: string;
  name: string;
  description: string;
  distance: string;
  duration: string;
  type: "nature" | "heritage" | "adventure" | "town" | "religious";
  image?: string;
}

export interface AnalyticsData {
  period: string;
  visitors: number;
  sessions: number;
  pageviews: number;
  bookings: number;
  revenue: number;
  conversionRate: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  bookings: number;
  avgValue: number;
}

export interface OccupancyData {
  month: string;
  occupancy: number;
  available: number;
}
