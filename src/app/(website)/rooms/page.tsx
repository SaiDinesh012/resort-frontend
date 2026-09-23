"use client";

import { useState, useEffect } from "react";
import { SlidersHorizontal, X, Loader2 } from "lucide-react";
import { RoomCard } from "@/components/website/RoomCard";
import { AvailabilitySearch } from "@/components/website/AvailabilitySearch";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ROOM_TYPES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { Room } from "@/types/room";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [minGuests, setMinGuests] = useState<number>(0);

  useEffect(() => {
    async function fetchRooms() {
      try {
        setLoading(true);
        const res = await fetch("/api/rooms");
        const data = await res.json();
        if (Array.isArray(data)) {
          setRooms(data);
        }
      } catch (err) {
        console.error("Failed to fetch rooms", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, []);

  const filtered = rooms.filter((r) => {
    if (selectedType && r.type !== selectedType) return false;
    if (r.basePrice > maxPrice) return false;
    if (minGuests > 0 && r.maxOccupancy < minGuests) return false;
    return true;
  });

  return (
    <div className="bg-background min-h-screen">
      {/* Page header */}
      <div className="bg-primary-dark text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[{ label: "Rooms & Suites" }]}
            variant="dark"
            className="mb-4"
          />
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-3">
            Rooms & Suites
          </h1>
          <p className="text-white/80 max-w-xl text-sm leading-relaxed">
            Choose from our collection of thoughtfully designed accommodations, each offering a unique forest experience.
          </p>
        </div>
      </div>

      {/* Availability search */}
      <div className="bg-surface border-b border-border sticky top-16 lg:top-20 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <AvailabilitySearch variant="compact" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-surface rounded-xl border border-border p-5 sticky top-36 shadow-card">
              <div className="flex items-center justify-between mb-5 border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="size-4 text-primary" />
                  <h2 className="font-sans font-bold text-charcoal text-sm">Filters</h2>
                </div>
                {(selectedType || maxPrice < 100000 || minGuests > 0) && (
                  <button
                    onClick={() => { setSelectedType(""); setMaxPrice(100000); setMinGuests(0); }}
                    className="flex items-center gap-1 text-xs text-error font-medium hover:underline cursor-pointer"
                  >
                    <X className="size-3" /> Reset
                  </button>
                )}
              </div>

              {/* Room type filter */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-warm-gray uppercase tracking-wider mb-3">
                  Room Type
                </label>
                <div className="space-y-2.5">
                  <label
                    onClick={() => setSelectedType("")}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div
                      className={`size-4 rounded-full border flex items-center justify-center transition-all ${
                        selectedType === ""
                          ? "border-primary bg-primary"
                          : "border-gray-400 group-hover:border-primary"
                      }`}
                    >
                      {selectedType === "" && <div className="size-1.5 rounded-full bg-white" />}
                    </div>
                    <span
                      className={`text-sm ${
                        selectedType === "" ? "font-bold text-primary" : "text-charcoal group-hover:text-primary"
                      }`}
                    >
                      All Types
                    </span>
                  </label>

                  {ROOM_TYPES.map((t) => {
                    const isSelected = selectedType === t;
                    return (
                      <label
                        key={t}
                        onClick={() => setSelectedType(t)}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <div
                          className={`size-4 rounded-full border flex items-center justify-center transition-all ${
                            isSelected
                              ? "border-primary bg-primary"
                              : "border-gray-400 group-hover:border-primary"
                          }`}
                        >
                          {isSelected && <div className="size-1.5 rounded-full bg-white" />}
                        </div>
                        <span
                          className={`text-sm ${
                            isSelected ? "font-bold text-primary" : "text-charcoal group-hover:text-primary"
                          }`}
                        >
                          {t}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Price range */}
              <div className="mb-6 pt-4 border-t border-border">
                <label className="block text-xs font-bold text-warm-gray uppercase tracking-wider mb-2">
                  Max Price per Night
                </label>
                <input
                  type="range"
                  min={5000}
                  max={100000}
                  step={1000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-xs text-warm-gray mt-1.5">
                  <span>₹5,000</span>
                  <span className="font-bold text-primary">{formatCurrency(maxPrice)}</span>
                </div>
              </div>

              {/* Guests */}
              <div className="pt-4 border-t border-border">
                <label className="block text-xs font-bold text-warm-gray uppercase tracking-wider mb-2">
                  Minimum Capacity
                </label>
                <select
                  value={minGuests}
                  onChange={(e) => setMinGuests(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-md border border-border text-sm text-charcoal bg-background font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value={0}>Any Occupancy</option>
                  {[2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>{n}+ guests</option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* Rooms grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-warm-gray">
                Showing <span className="font-bold text-charcoal">{filtered.length}</span> room{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20 text-warm-gray gap-2 bg-surface rounded-xl border border-border">
                <Loader2 className="size-5 animate-spin text-primary" /> Loading room collection...
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-surface rounded-xl border border-border p-12 text-center shadow-card">
                <p className="font-serif text-xl font-bold text-charcoal mb-2">No rooms match your filters</p>
                <p className="text-warm-gray text-sm mb-4">Try clearing or widening your price range</p>
                <button
                  onClick={() => { setSelectedType(""); setMaxPrice(100000); setMinGuests(0); }}
                  className="px-5 py-2.5 bg-primary text-white rounded-md text-sm font-semibold hover:bg-primary-dark transition-colors cursor-pointer"
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
