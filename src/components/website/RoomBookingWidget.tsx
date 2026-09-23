"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface RoomBookingWidgetProps {
  itemId: string;
  basePrice: number;
  type: "room" | "package";
}

export function RoomBookingWidget({ itemId, basePrice, type }: RoomBookingWidgetProps) {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const handleBookNow = () => {
    router.push(
      `/booking?${type}=${itemId}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}`
    );
  };

  return (
    <div className="sticky top-24 bg-surface rounded-lg border border-border p-6 shadow-card">
      <p className="text-xs text-warm-gray uppercase tracking-wider mb-1">Total Starting From</p>
      <p className="text-3xl font-bold text-charcoal mb-4">{formatCurrency(basePrice)}</p>

      <div className="flex flex-col gap-3 mb-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-warm-gray mb-1">Check-in</label>
            <input
              type="date"
              value={checkIn}
              min={today}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border text-sm text-charcoal bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-warm-gray mb-1">Check-out</label>
            <input
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border text-sm text-charcoal bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-warm-gray mb-1">Adults</label>
            <select
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-md border border-border text-sm text-charcoal bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n} Adult{n > 1 ? "s" : ""}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-warm-gray mb-1">Children</label>
            <select
              value={children}
              onChange={(e) => setChildren(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-md border border-border text-sm text-charcoal bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {[0, 1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? "Child" : "Children"}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={handleBookNow}
        className="block w-full text-center py-3 rounded-md bg-primary hover:bg-primary-dark text-white font-semibold text-sm transition-colors cursor-pointer"
      >
        {type === "room" ? "Book This Room" : "Book This Package"}
      </button>
      <p className="text-xs text-warm-gray text-center mt-3">No payment charged yet</p>
    </div>
  );
}
