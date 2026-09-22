export type BookingStatus = "confirmed" | "pending" | "cancelled" | "completed" | "no-show";
export type PaymentStatus = "paid" | "pending" | "failed" | "refunded" | "partial";
export type BookingType = "room" | "package";

export interface GuestDetails {
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
}

export interface PriceBreakdown {
  basePrice: number;
  nights: number;
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  discountAmount: number;
  couponCode?: string;
  total: number;
}

export interface BookingTimeline {
  timestamp: string;
  event: string;
  description: string;
  actor?: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  type: BookingType;
  roomId?: string;
  roomName?: string;
  packageId?: string;
  packageName?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  guestDetails: GuestDetails;
  priceBreakdown: PriceBreakdown;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  bookingStatus: BookingStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  timeline: BookingTimeline[];
  cancellationReason?: string;
  refundAmount?: number;
}
