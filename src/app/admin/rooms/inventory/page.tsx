"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import type { Room } from "@/types/room";

export default function RoomInventoryPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate dynamic 7-day window starting from today
  const [startDate, setStartDate] = useState(() => new Date());

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });

  const rangeLabel = `${dates[0]} - ${dates[dates.length - 1]}`;

  useEffect(() => {
    async function loadRooms() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/rooms`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setRooms(data);
        }
      } catch (err) {
        console.error("Failed to fetch rooms for inventory", err);
      } finally {
        setLoading(false);
      }
    }
    loadRooms();
  }, []);

  const handlePrev = () => {
    setStartDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };

  const handleNext = () => {
    setStartDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Room Inventory Matrix</h1>
          <p className="text-xs text-warm-gray mt-1">Real-time availability, booked units, and maintenance blocks</p>
        </div>
        <div className="flex items-center gap-2 bg-surface rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-charcoal">
          <ChevronLeft className="size-4 cursor-pointer hover:text-accent" onClick={handlePrev} />
          <span>{rangeLabel}</span>
          <ChevronRight className="size-4 cursor-pointer hover:text-accent" onClick={handleNext} />
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-warm-gray flex flex-col items-center gap-2">
            <Loader2 className="size-6 animate-spin text-accent" />
            <p className="text-xs">Loading live room inventory...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="p-12 text-center text-warm-gray">
            <p className="font-semibold text-charcoal">No rooms in database</p>
            <p className="text-xs mt-1">Add rooms from the Room Management tab to see inventory here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-background border-b border-border text-warm-gray font-semibold">
                  <th className="p-4 w-56">Room Type</th>
                  {dates.map((d) => (
                    <th key={d} className="p-4 text-center border-l border-border">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-charcoal font-medium">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-background/50">
                    <td className="p-4 font-semibold text-charcoal">
                      {room.name}
                      <span className="block text-[10px] text-warm-gray font-normal">{room.type}</span>
                    </td>
                    {dates.map((d, idx) => {
                      const isAvailable = room.status === "available";
                      return (
                        <td key={d} className="p-4 text-center border-l border-border">
                          <span
                            className={`inline-block px-2.5 py-1 rounded font-bold text-[11px] ${
                              isAvailable
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "bg-rose-100 text-rose-800 border border-rose-200"
                            }`}
                          >
                            {isAvailable ? "Available" : room.status}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
