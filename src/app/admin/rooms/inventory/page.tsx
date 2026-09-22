"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { mockRooms } from "@/data/mock/rooms";

export default function RoomInventoryPage() {
  const dates = ["Dec 20", "Dec 21", "Dec 22", "Dec 23", "Dec 24", "Dec 25", "Dec 26"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Room Inventory Matrix</h1>
          <p className="text-xs text-warm-gray mt-1">Real-time availability, booked units, and maintenance blocks</p>
        </div>
        <div className="flex items-center gap-2 bg-surface rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-charcoal">
          <ChevronLeft className="size-4 cursor-pointer" />
          <span>Dec 20, 2024 - Dec 26, 2024</span>
          <ChevronRight className="size-4 cursor-pointer" />
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden">
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
              {mockRooms.map((room) => (
                <tr key={room.id} className="hover:bg-background/50">
                  <td className="p-4 font-semibold text-charcoal">{room.name}</td>
                  {dates.map((d, idx) => {
                    const isBooked = idx % 2 === 0;
                    return (
                      <td key={d} className="p-4 text-center border-l border-border">
                        <span
                          className={`inline-block px-2.5 py-1 rounded font-bold text-[11px] ${
                            isBooked
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {isBooked ? "Booked" : "3 Avail"}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
