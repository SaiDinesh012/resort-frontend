export interface Room {
  id: string;
  slug: string;
  name: string;
  type: string;
  description: string;
  longDescription: string;
  images: string[];
  size: number; // sq ft
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

export interface RoomRate {
  id: string;
  roomId: string;
  name: string;
  basePrice: number;
  weekendPrice: number;
  minimumNights: number;
  startDate?: string;
  endDate?: string;
  type: "standard" | "seasonal" | "special";
}

export interface RoomInventory {
  date: string;
  roomTypeId: string;
  total: number;
  booked: number;
  blocked: number;
  available: number;
}
