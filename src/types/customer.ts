export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  avatar?: string;
  totalBookings: number;
  totalSpend: number;
  lastBookingDate?: string;
  status: "active" | "inactive" | "blocked";
  createdAt: string;
  notes?: string;
  tags?: string[];
}
