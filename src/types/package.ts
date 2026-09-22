export interface Activity {
  id: string;
  name: string;
  description: string;
  duration: string;
  icon?: string;
}

export interface MealPlan {
  type: "CP" | "MAP" | "AP" | "EP";
  label: string;
  description: string;
}

export interface PackageItineraryDay {
  day: number;
  title: string;
  activities: string[];
  meals: string[];
}

export interface Package {
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
  meals: MealPlan;
  sightseeing: string[];
  transport: boolean;
  itinerary: PackageItineraryDay[];
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
