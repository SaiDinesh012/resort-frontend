"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Users, Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvailabilitySearchProps {
  variant?: "hero" | "inline" | "compact";
  className?: string;
}

export function AvailabilitySearch({ variant = "hero", className }: AvailabilitySearchProps) {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);

  const handleSearch = () => {
    router.push(
      `/rooms?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}&rooms=${rooms}`
    );
  };

  if (variant === "compact") {
    return (
      <div className={cn("flex flex-wrap gap-3 items-end", className)}>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-medium text-warm-gray mb-1">Check-in</label>
          <input
            type="date"
            value={checkIn}
            min={today}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-border text-sm text-charcoal bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-medium text-warm-gray mb-1">Check-out</label>
          <input
            type="date"
            value={checkOut}
            min={checkIn}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-border text-sm text-charcoal bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="flex-1 min-w-[100px]">
          <label className="block text-xs font-medium text-warm-gray mb-1">Guests</label>
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
        <button
          onClick={handleSearch}
          className="px-6 py-2 rounded-md bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-colors"
        >
          Search
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-surface rounded-xl shadow-panel border border-border overflow-hidden",
        variant === "hero" ? "w-full max-w-4xl" : "",
        className
      )}
    >
      <div className="grid grid-cols-2 lg:grid-cols-5 divide-x divide-border">
        {/* Check-in */}
        <div className="col-span-1 p-4 lg:p-5">
          <label className="block text-xs font-semibold text-warm-gray uppercase tracking-wider mb-1.5">
            Check-in
          </label>
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-primary flex-shrink-0" />
            <input
              type="date"
              value={checkIn}
              min={today}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full text-sm font-medium text-charcoal bg-transparent focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Check-out */}
        <div className="col-span-1 p-4 lg:p-5">
          <label className="block text-xs font-semibold text-warm-gray uppercase tracking-wider mb-1.5">
            Check-out
          </label>
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-primary flex-shrink-0" />
            <input
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full text-sm font-medium text-charcoal bg-transparent focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Adults */}
        <div className="col-span-1 p-4 lg:p-5">
          <label className="block text-xs font-semibold text-warm-gray uppercase tracking-wider mb-1.5">
            Adults
          </label>
          <div className="flex items-center gap-2">
            <Users className="size-4 text-primary flex-shrink-0" />
            <select
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
              className="w-full text-sm font-medium text-charcoal bg-transparent focus:outline-none cursor-pointer appearance-none"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n} Adult{n > 1 ? "s" : ""}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Children */}
        <div className="col-span-1 p-4 lg:p-5">
          <label className="block text-xs font-semibold text-warm-gray uppercase tracking-wider mb-1.5">
            Children
          </label>
          <div className="flex items-center gap-2">
            <Users className="size-4 text-primary flex-shrink-0" />
            <select
              value={children}
              onChange={(e) => setChildren(Number(e.target.value))}
              className="w-full text-sm font-medium text-charcoal bg-transparent focus:outline-none cursor-pointer appearance-none"
            >
              {[0, 1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? "Child" : "Children"}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search button */}
        <div className="col-span-2 lg:col-span-1 p-3">
          <button
            onClick={handleSearch}
            className="w-full h-full min-h-[56px] rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 px-4"
          >
            <Search className="size-4" />
            <span>Check Availability</span>
          </button>
        </div>
      </div>
    </div>
  );
}
