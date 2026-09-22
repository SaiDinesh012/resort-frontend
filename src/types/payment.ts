export interface Payment {
  id: string;
  paymentId: string;
  bookingId: string;
  bookingNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  currency: string;
  method: "upi" | "card" | "netbanking" | "wallet" | "bank_transfer";
  status: "success" | "failed" | "pending" | "refunded";
  gateway: "razorpay" | "stripe" | "manual";
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  createdAt: string;
  refundAmount?: number;
  refundedAt?: string;
  notes?: string;
}

export interface Refund {
  id: string;
  paymentId: string;
  bookingId: string;
  bookingNumber: string;
  customerName: string;
  amount: number;
  reason: string;
  status: "pending" | "processed" | "rejected";
  requestedAt: string;
  processedAt?: string;
}
