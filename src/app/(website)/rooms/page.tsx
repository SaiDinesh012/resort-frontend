"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, Loader2, Calendar, CheckCircle2 } from "lucide-react";
import { RoomCard } from "@/components/website/RoomCard";
import { AvailabilitySearch } from "@/components/website/AvailabilitySearch";
import { mockRooms } from "@/data/mock/rooms";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ROOM_TYPES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { Room } from "@/types/room";

function RoomsContent() {
  const searchParams = useSearchParams();
  const checkInParam = searchParams.get("checkIn");
  const checkOutParam = searchParams.get("checkOut");
  const adultsParam = searchParams.get("adults");
  const childrenParam = searchParams.get("children");

  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [minGuests, setMinGuests] = useState<number>(
    adultsParam ? parseInt(adultsParam, 10) + parseInt(childrenParam || "0", 10) : 0
  );
  const [availabilityMeta, setAvailabilityMeta] = useState<{
    checkIn: string;
    checkOut: string;
    nights: number;
    count: number;
  } | null>(null);

  useEffect(() => {
    async function fetchRooms() {
      try {
        setLoading(true);

        if (checkInParam && checkOutParam) {
          // Query real availability endpoint
          const res = await fetch(
            `/api/availability?checkIn=${checkInParam}&checkOut=${checkOutParam}&adults=${adultsParam || 1}&children=${childrenParam || 0}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data.rooms) {
              setRooms(data.rooms);
              setAvailabilityMeta({
                checkIn: data.checkIn,
                checkOut: data.checkOut,
                nights: data.nights,
                count: data.totalAvailable,
              });
              setLoading(false);
              return;
            }
          }
        }

        // Fallback or normal query
        const res = await fetch("/api/rooms");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setRooms(data);
        }
      } catch (err) {
        console.error("Failed to fetch rooms", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, [checkInParam, checkOutParam, adultsParam, childrenParam]);

  // Dynamically derive room types from active rooms in database
  const availableTypes: string[] = useMemo(() => {
    const fromRooms = Array.from(
      new Set(
        rooms
          .map((r) => r.type?.trim())
          .filter((t): t is string => Boolean(t))
      )
    );
    return fromRooms.length > 0 ? fromRooms : [...ROOM_TYPES];
  }, [rooms]);

  const filtered = rooms.filter((r) => {
    if (selectedType && r.type !== selectedType) return false;
    if (r.basePrice > maxPrice) return false;
    if (minGuests > 0 && r.maxOccupancy < minGuests) return false;
    return true;
  });

  return (
    <div className="bg-background min-h-screen">
      {/* Page header */}
      <div className="bg-primary-dark text-white pt-28 pb-14 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[{ label: "Rooms & Suites" }]}
            variant="dark"
            className="mb-4"
          />
          <h1 className="font-serif text-3xl sm:text-5xl font-light text-white mb-3">
            Rooms & Suites
          </h1>
          <div className="w-12 h-px bg-accent mb-4" />
          <p className="font-sans text-white/75 max-w-xl text-sm leading-relaxed">
            Thoughtfully crafted sanctuaries nestled in the Maredumilli wilderness, blending royal refinement with natural tranquility.
          </p>
        </div>
      </div>

      {/* Availability search bar */}
      <div className="bg-surface border-b border-border sticky top-16 lg:top-20 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <AvailabilitySearch variant="compact" />
        </div>
      </div>

      {/* Availability active notification banner */}
      {availabilityMeta && (
        <div className="bg-primary/10 border-b border-primary/20 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs sm:text-sm text-primary-dark">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-primary" />
              <span>
                Available dates verified: <strong>{availabilityMeta.checkIn}</strong> to{" "}
                <strong>{availabilityMeta.checkOut}</strong> ({availabilityMeta.nights} night
                {availabilityMeta.nights > 1 ? "s" : ""}) —{" "}
                <span className="font-semibold">{availabilityMeta.count}</span> room
                {availabilityMeta.count !== 1 ? "s" : ""} available
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-surface rounded-sm border border-border p-5 sticky top-36 shadow-xs">
              <div className="flex items-center justify-between mb-5 border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="size-4 text-primary" />
                  <h2 className="font-sans font-semibold text-charcoal text-sm">Filters</h2>
                </div>
                {(selectedType || maxPrice < 100000 || minGuests > 0) && (
                  <button
                    onClick={() => {
                      setSelectedType("");
                      setMaxPrice(100000);
                      setMinGuests(0);
                    }}
                    className="flex items-center gap-1 text-xs text-accent font-medium hover:underline cursor-pointer"
                  >
                    <X className="size-3" /> Reset
                  </button>
                )}
              </div>

              {/* Room type filter */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-warm-gray uppercase tracking-wider mb-3">
                  Room Type
                </label>
                <div className="space-y-2.5">
                  <label
                    onClick={() => setSelectedType("")}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="roomType"
                      checked={selectedType === ""}
                      onChange={() => setSelectedType("")}
                      className="size-4 text-primary focus:ring-primary border-border"
                    />
                    <span className="font-sans text-sm text-charcoal group-hover:text-primary transition-colors">
                      All Accommodations
                    </span>
                  </label>
                  {availableTypes.map((t: string) => {
                    const count = rooms.filter((r) => r.type === t).length;
                    return (
                      <label
                        key={t}
                        onClick={() => setSelectedType(t)}
                        className="flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="roomType"
                            checked={selectedType === t}
                            onChange={() => setSelectedType(t)}
                            className="size-4 text-primary focus:ring-primary border-border"
                          />
                          <span className="font-sans text-sm text-charcoal group-hover:text-primary transition-colors">
                            {t}
                          </span>
                        </div>
                        <span className="text-xs text-warm-gray font-medium">({count})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Max price filter */}
              <div className="mb-6 pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-warm-gray uppercase tracking-wider">
                    Max Price
                  </label>
                  <span className="font-sans text-xs font-semibold text-primary">
                    {formatCurrency(maxPrice)}
                  </span>
                </div>
                <input
                  type="range"
                  min={2000}
                  max={30000}
                  step={500}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              {/* Min occupancy filter */}
              <div className="pt-4 border-t border-border">
                <label className="block text-xs font-semibold text-warm-gray uppercase tracking-wider mb-2">
                  Minimum Capacity
                </label>
                <select
                  value={minGuests}
                  onChange={(e) => setMinGuests(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-sm border border-border text-sm text-charcoal bg-background font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value={0}>Any Occupancy</option>
                  {[2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n}+ guests
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* Rooms grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="font-sans text-sm text-warm-gray">
                Showing <span className="font-semibold text-charcoal">{filtered.length}</span> room
                {filtered.length !== 1 ? "s" : ""}
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20 text-warm-gray gap-2 bg-surface rounded-sm border border-border">
                <Loader2 className="size-5 animate-spin text-primary" /> Loading room collection...
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-surface rounded-sm border border-border p-12 text-center shadow-xs">
                <p className="font-serif text-2xl font-light text-charcoal mb-2">
                  No rooms match your criteria
                </p>
                <p className="font-sans text-warm-gray text-sm mb-6">
                  Try adjusting dates or widening your price filters.
                </p>
                <button
                  onClick={() => {
                    setSelectedType("");
                    setMaxPrice(100000);
                    setMinGuests(0);
                  }}
                  className="px-6 py-2.5 bg-primary text-white rounded-sm text-sm font-semibold hover:bg-primary-dark transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RoomsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <RoomsContent />
    </Suspense>
  );
}
