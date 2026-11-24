"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2, BedDouble } from "lucide-react";
import type { Room } from "@/types/room";

export default function RoomInventoryPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    async function fetchRooms() {
      try {
        setLoading(true);
        const res = await fetch("/api/rooms");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setRooms(data);
          }
        }
      } catch (err) {
        console.error("Failed to load rooms for inventory:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, []);

  // Compute 7 days dynamically based on week offset
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() + weekOffset * 7);

  const dates: { label: string; fullDate: string }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    dates.push({
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      fullDate: d.toISOString().slice(0, 10),
    });
  }

  const rangeLabel = `${dates[0].label}, ${startDate.getFullYear()} - ${dates[6].label}, ${new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000).getFullYear()}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Room Inventory Matrix</h1>
          <p className="text-xs text-warm-gray mt-1">Real-time availability and units live from MongoDB</p>
        </div>
        <div className="flex items-center gap-2 bg-surface rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-charcoal">
          <ChevronLeft
            onClick={() => setWeekOffset((prev) => prev - 1)}
            className="size-4 cursor-pointer hover:text-primary transition-colors"
          />
          <span>{rangeLabel}</span>
          <ChevronRight
            onClick={() => setWeekOffset((prev) => prev + 1)}
            className="size-4 cursor-pointer hover:text-primary transition-colors"
          />
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="p-12 text-center text-warm-gray">
            <BedDouble className="size-10 mx-auto mb-2 text-warm-gray/40" />
            <p className="font-semibold text-charcoal">No Rooms Configured</p>
            <p className="text-xs text-warm-gray mt-1">Add rooms to view availability matrix.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-background border-b border-border text-warm-gray font-semibold">
                  <th className="p-4 w-56">Room Type</th>
                  {dates.map((d) => (
                    <th key={d.fullDate} className="p-4 text-center border-l border-border">
                      {d.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-charcoal font-medium">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-background/50">
                    <td className="p-4 font-semibold text-charcoal">{room.name}</td>
                    {dates.map((d) => {
                      const isAvailable = room.status === "available";
                      return (
                        <td key={d.fullDate} className="p-4 text-center border-l border-border">
                          <span
                            className={`inline-block px-2.5 py-1 rounded font-bold text-[11px] ${
                              isAvailable
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-amber-100 text-amber-800 border border-amber-200"
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
