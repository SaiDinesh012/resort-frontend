"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Users, Search, Loader2, AlertCircle } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckInChange = (newDate: string) => {
    setCheckIn(newDate);
    setError(null);
    if (newDate >= checkOut) {
      // automatically advance check-out to next day
      const nextDay = new Date(new Date(newDate).getTime() + 86400000).toISOString().split("T")[0];
      setCheckOut(nextDay);
    }
  };

  const handleCheckOutChange = (newDate: string) => {
    setCheckOut(newDate);
    setError(null);
    if (newDate <= checkIn) {
      setError("Check-out date must be after check-in date.");
    }
  };

  const handleSearch = async () => {
    setError(null);

    // Validate
    if (!checkIn || !checkOut) {
      setError("Please select both check-in and check-out dates.");
      return;
    }

    if (checkIn < today) {
      setError("Check-in date cannot be in the past.");
      return;
    }

    if (checkOut <= checkIn) {
      setError("Check-out date must be after check-in date.");
      return;
    }

    setIsLoading(true);

    try {
      // Pre-check availability via backend API
      const res = await fetch(
        `/api/availability?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}&rooms=${rooms}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Unable to check availability at this time.");
        setIsLoading(false);
        return;
      }

      // Navigate to rooms page with parameters
      router.push(
        `/rooms?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}&rooms=${rooms}&verified=true`
      );
    } catch (err) {
      console.error("Availability check failed:", err);
      // Fallback navigation
      router.push(
        `/rooms?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}&rooms=${rooms}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "compact") {
    return (
      <div className={cn("space-y-2", className)}>
        {error && (
          <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-sm">
            <AlertCircle className="size-3.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-warm-gray mb-1">Check-in</label>
            <input
              type="date"
              value={checkIn}
              min={today}
              onChange={(e) => handleCheckInChange(e.target.value)}
              className="w-full px-3 py-2 rounded-sm border border-border text-sm text-charcoal bg-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-warm-gray mb-1">Check-out</label>
            <input
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => handleCheckOutChange(e.target.value)}
              className="w-full px-3 py-2 rounded-sm border border-border text-sm text-charcoal bg-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="flex-1 min-w-[100px]">
            <label className="block text-xs font-medium text-warm-gray mb-1">Guests</label>
            <select
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-sm border border-border text-sm text-charcoal bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} Adult{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-sm bg-accent hover:bg-accent-dark text-white text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
            <span>Search</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-white rounded-sm shadow-2xl border border-white/20 backdrop-blur-md overflow-hidden text-left",
        variant === "hero" ? "w-full max-w-4xl" : "",
        className
      )}
    >
      {error && (
        <div className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-700 text-xs border-b border-red-100">
          <AlertCircle className="size-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-border">
        {/* Check-in */}
        <div className="col-span-1 p-4 lg:p-5 hover:bg-warm-white/50 transition-colors">
          <label className="block text-[11px] font-semibold text-muted-sage uppercase tracking-wider mb-1.5">
            Check-in
          </label>
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-primary flex-shrink-0" />
            <input
              type="date"
              value={checkIn}
              min={today}
              onChange={(e) => handleCheckInChange(e.target.value)}
              className="w-full text-sm font-medium text-charcoal bg-transparent focus:outline-none cursor-pointer"
              aria-label="Check-in date"
            />
          </div>
        </div>

        {/* Check-out */}
        <div className="col-span-1 p-4 lg:p-5 hover:bg-warm-white/50 transition-colors">
          <label className="block text-[11px] font-semibold text-muted-sage uppercase tracking-wider mb-1.5">
            Check-out
          </label>
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-primary flex-shrink-0" />
            <input
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => handleCheckOutChange(e.target.value)}
              className="w-full text-sm font-medium text-charcoal bg-transparent focus:outline-none cursor-pointer"
              aria-label="Check-out date"
            />
          </div>
        </div>

        {/* Adults */}
        <div className="col-span-1 p-4 lg:p-5 hover:bg-warm-white/50 transition-colors">
          <label className="block text-[11px] font-semibold text-muted-sage uppercase tracking-wider mb-1.5">
            Adults
          </label>
          <div className="flex items-center gap-2">
            <Users className="size-4 text-primary flex-shrink-0" />
            <select
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
              className="w-full text-sm font-medium text-charcoal bg-transparent focus:outline-none cursor-pointer"
              aria-label="Number of adults"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} Adult{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Children */}
        <div className="col-span-1 p-4 lg:p-5 hover:bg-warm-white/50 transition-colors">
          <label className="block text-[11px] font-semibold text-muted-sage uppercase tracking-wider mb-1.5">
            Children
          </label>
          <div className="flex items-center gap-2">
            <Users className="size-4 text-primary flex-shrink-0" />
            <select
              value={children}
              onChange={(e) => setChildren(Number(e.target.value))}
              className="w-full text-sm font-medium text-charcoal bg-transparent focus:outline-none cursor-pointer"
              aria-label="Number of children"
            >
              {[0, 1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "Child" : "Children"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search button */}
        <div className="col-span-2 lg:col-span-1 p-3 flex items-center justify-center">
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="w-full h-full min-h-[52px] rounded-sm bg-accent hover:bg-accent-dark text-white font-sans font-semibold text-sm transition-all flex items-center justify-center gap-2 px-4 shadow-sm hover:shadow cursor-pointer disabled:opacity-60"
            aria-label="Search room availability"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <Search className="size-4" />
                <span>Check Availability</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
