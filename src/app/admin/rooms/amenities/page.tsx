"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Check, Loader2, Sparkles, Wifi, Wind, Bath, Mountain, Coffee, Tv, Shield } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import type { Room } from "@/types/room";

interface AmenityItem {
  name: string;
  category: "Comfort" | "Technology" | "View & Outdoor" | "Bathroom & Spa" | "Services";
  roomCount: number;
}

const DEFAULT_AMENITIES = [
  { name: "High-Speed WiFi", category: "Technology" },
  { name: "Air Conditioning", category: "Comfort" },
  { name: "Forest View Balcony", category: "View & Outdoor" },
  { name: "King Size Bed", category: "Comfort" },
  { name: "Private Plunge Pool", category: "Bathroom & Spa" },
  { name: "Espresso Maker", category: "Comfort" },
  { name: "Smart TV with Netflix", category: "Technology" },
  { name: "Rain Shower & Jacuzzi", category: "Bathroom & Spa" },
  { name: "24/7 Room Service", category: "Services" },
  { name: "Organic Forest Toiletries", category: "Bathroom & Spa" },
  { name: "Personal Safe", category: "Comfort" },
  { name: "Complimentary Mountain Breakfast", category: "Services" },
];

export default function AmenitiesManagementPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAmenityName, setNewAmenityName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<any>("Comfort");
  const [targetRoomId, setTargetRoomId] = useState<string>("all");
  const [assigning, setAssigning] = useState(false);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/rooms`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setRooms(data);
      }
    } catch (err) {
      console.error("Failed to load rooms for amenities", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Compute all unique amenities across rooms
  const allAmenitiesMap = new Map<string, number>();
  rooms.forEach((r) => {
    (r.amenities || []).forEach((am) => {
      const clean = am.trim();
      if (clean) {
        allAmenitiesMap.set(clean, (allAmenitiesMap.get(clean) || 0) + 1);
      }
    });
  });

  // Merge default list with dynamically found room amenities
  const dynamicAmenities: AmenityItem[] = [];
  const processed = new Set<string>();

  DEFAULT_AMENITIES.forEach((def) => {
    const count = allAmenitiesMap.get(def.name) || 0;
    dynamicAmenities.push({
      name: def.name,
      category: def.category as any,
      roomCount: count,
    });
    processed.add(def.name.toLowerCase());
  });

  allAmenitiesMap.forEach((count, name) => {
    if (!processed.has(name.toLowerCase())) {
      dynamicAmenities.push({
        name,
        category: "Comfort",
        roomCount: count,
      });
    }
  });

  const handleAddAmenity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAmenityName.trim()) return;

    try {
      setAssigning(true);
      const nameToAdd = newAmenityName.trim();

      const roomsToUpdate = targetRoomId === "all" ? rooms : rooms.filter((r) => r.id === targetRoomId);

      for (const room of roomsToUpdate) {
        if (!room.amenities.includes(nameToAdd)) {
          const updatedAmenities = [...room.amenities, nameToAdd];
          await fetch(`${API_BASE_URL}/rooms/${room.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amenities: updatedAmenities }),
          });
        }
      }

      setNewAmenityName("");
      await fetchRooms();
      alert(`Amenity "${nameToAdd}" successfully assigned!`);
    } catch (err) {
      console.error("Failed to add amenity", err);
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveAmenityGlobally = async (amenityName: string) => {
    if (!confirm(`Remove "${amenityName}" from all rooms in the resort?`)) return;

    try {
      setAssigning(true);
      for (const room of rooms) {
        if (room.amenities.includes(amenityName)) {
          const updatedAmenities = room.amenities.filter((a) => a !== amenityName);
          await fetch(`${API_BASE_URL}/rooms/${room.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amenities: updatedAmenities }),
          });
        }
      }
      await fetchRooms();
    } catch (err) {
      console.error("Failed to remove amenity", err);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-charcoal">Resort Amenities Master</h1>
        <p className="text-xs text-warm-gray mt-1">
          Manage, create, and standardize room amenities and luxury perks across all accommodation categories
        </p>
      </div>

      {/* Add New Amenity Bar */}
      <div className="bg-surface rounded-xl border border-border p-5 shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <h2 className="font-serif font-bold text-charcoal text-sm">Add & Assign New Amenity</h2>
        </div>

        <form onSubmit={handleAddAmenity} className="grid sm:grid-cols-4 gap-3 text-xs">
          <div className="sm:col-span-2">
            <input
              type="text"
              required
              value={newAmenityName}
              onChange={(e) => setNewAmenityName(e.target.value)}
              placeholder="e.g. Heated Infinity Pool, Bose Soundbar, Private Butler"
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-slate-50/70 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <select
              value={targetRoomId}
              onChange={(e) => setTargetRoomId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-slate-50/70 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">Apply to All Rooms ({rooms.length})</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              type="submit"
              disabled={assigning}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              {assigning ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Assign Amenity
            </button>
          </div>
        </form>
      </div>

      {/* Amenities Grid */}
      <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="font-serif font-bold text-charcoal text-base">Active Amenity Catalog</div>
          <span className="text-xs text-warm-gray">{dynamicAmenities.length} standard resort amenities</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-warm-gray flex flex-col items-center gap-2">
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="text-xs">Loading resort amenities...</p>
          </div>
        ) : (
          <div className="p-6 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {dynamicAmenities.map((amenity, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-border bg-slate-50/40 hover:bg-white hover:border-primary/30 hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="flex items-start justify-between">
                  <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Sparkles className="size-4" />
                  </div>
                  {amenity.roomCount > 0 ? (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                      {amenity.roomCount} {amenity.roomCount === 1 ? "Room" : "Rooms"}
                    </span>
                  ) : (
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-medium px-2 py-0.5 rounded-full">
                      Unassigned
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-charcoal text-xs">{amenity.name}</h3>
                  <span className="text-[10px] text-warm-gray font-normal">{amenity.category}</span>
                </div>

                {amenity.roomCount > 0 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveAmenityGlobally(amenity.name)}
                    className="text-[10px] text-red-600 hover:text-red-800 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer pt-1"
                  >
                    <Trash2 className="size-3" /> Remove from all
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
