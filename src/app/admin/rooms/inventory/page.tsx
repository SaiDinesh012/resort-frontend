"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2, User, Clock, Phone, Mail, X, Lock, CheckCircle2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Room } from "@/types/room";
import type { Booking } from "@/types/booking";

export default function RoomInventoryPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingCell, setSelectedBookingCell] = useState<{ room: Room; booking: Booking; dateStr: string } | null>(null);

  // Generate dynamic 7-day window starting from today
  const [startDate, setStartDate] = useState(() => new Date());

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    return { dateStr, label, dayName };
  });

  const rangeLabel = `${days[0].label} - ${days[days.length - 1].label}`;

  useEffect(() => {
    async function loadInventoryData() {
      try {
        setLoading(true);
        const [roomsRes, bookingsRes] = await Promise.allSettled([
          fetch(`${API_BASE_URL}/rooms`),
          fetch("/api/bookings"),
        ]);

        if (roomsRes.status === "fulfilled" && roomsRes.value.ok) {
          const rData = await roomsRes.value.json();
          if (Array.isArray(rData)) setRooms(rData);
        }

        if (bookingsRes.status === "fulfilled" && bookingsRes.value.ok) {
          const bData = await bookingsRes.value.json();
          if (Array.isArray(bData)) setBookings(bData);
        }
      } catch (err) {
        console.error("Failed to fetch inventory data", err);
      } finally {
        setLoading(false);
      }
    }
    loadInventoryData();
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
          <p className="text-xs text-warm-gray mt-1">Real-time availability, booked guests, locked dates, and occupancy schedule live from MongoDB</p>
        </div>
        <div className="flex items-center gap-2 bg-surface rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-charcoal shadow-xs">
          <ChevronLeft className="size-4 cursor-pointer hover:text-primary" onClick={handlePrev} />
          <span>{rangeLabel}</span>
          <ChevronRight className="size-4 cursor-pointer hover:text-primary" onClick={handleNext} />
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-warm-gray flex flex-col items-center gap-2">
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="text-xs">Loading live room reservations...</p>
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
                  <th className="p-4 w-60">Room / Villa</th>
                  {days.map((day) => (
                    <th key={day.dateStr} className="p-3 text-center border-l border-border min-w-[120px]">
                      <div>{day.dayName}</div>
                      <div className="text-charcoal font-bold text-xs">{day.label}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-charcoal font-medium">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-semibold text-charcoal">
                      <div className="text-sm font-bold text-charcoal">{room.name}</div>
                      <span className="block text-[11px] text-warm-gray font-normal">{room.type}</span>
                    </td>
                    {days.map((day) => {
                      const bookingForDay = bookings.find(
                        (b) =>
                          b.roomId === room.id &&
                          b.bookingStatus !== "cancelled" &&
                          day.dateStr >= b.checkIn &&
                          day.dateStr < b.checkOut
                      );

                      if (bookingForDay) {
                        return (
                          <td key={day.dateStr} className="p-2.5 text-center border-l border-border">
                            <button
                              type="button"
                              onClick={() => setSelectedBookingCell({ room, booking: bookingForDay, dateStr: day.dateStr })}
                              className="w-full py-1.5 px-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-[11px] font-bold text-left transition-all cursor-pointer shadow-2xs group"
                              title="Click to view reservation and guest details"
                            >
                              <div className="flex items-center gap-1 truncate text-rose-900">
                                <User className="size-3 shrink-0 text-rose-600" />
                                <span className="truncate">{bookingForDay.guestDetails.firstName} {bookingForDay.guestDetails.lastName}</span>
                              </div>
                              <span className="text-[9px] text-rose-600 font-medium block">
                                #{bookingForDay.bookingNumber}
                              </span>
                            </button>
                          </td>
                        );
                      }

                      if (room.status === "maintenance") {
                        return (
                          <td key={day.dateStr} className="p-2.5 text-center border-l border-border">
                            <span className="inline-block w-full py-1.5 px-2 rounded-lg bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-[11px]">
                              Maintenance
                            </span>
                          </td>
                        );
                      }

                      return (
                        <td key={day.dateStr} className="p-2.5 text-center border-l border-border">
                          <span className="inline-block w-full py-1.5 px-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[11px]">
                            Available
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

      {/* Booking Details Modal when clicking a booked date */}
      {selectedBookingCell && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedBookingCell(null)}
        >
          <div
            className="relative bg-white rounded-2xl border border-border shadow-2xl max-w-lg w-full p-6 space-y-5 my-8 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-warm-gray">Room Reservation Info</span>
                <h3 className="font-serif text-lg font-bold text-charcoal mt-0.5">
                  {selectedBookingCell.room.name}
                </h3>
                <p className="text-xs text-warm-gray">{selectedBookingCell.room.type}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBookingCell(null)}
                className="size-8 rounded-lg flex items-center justify-center text-warm-gray hover:text-charcoal hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-rose-900 flex items-center gap-1.5">
                  <Lock className="size-3.5" /> Room Locked for Stay
                </span>
                <span className="font-mono font-bold text-rose-800 text-[11px]">
                  #{selectedBookingCell.booking.bookingNumber}
                </span>
              </div>
              <p className="text-xs text-rose-800">
                Booked from <b>{formatDate(selectedBookingCell.booking.checkIn)}</b> to <b>{formatDate(selectedBookingCell.booking.checkOut)}</b> ({selectedBookingCell.booking.nights} nights).
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-border space-y-2">
                <div className="font-semibold text-charcoal text-sm flex items-center gap-1.5">
                  <User className="size-4 text-primary" />
                  {selectedBookingCell.booking.guestDetails.firstName} {selectedBookingCell.booking.guestDetails.lastName}
                </div>
                <div className="grid grid-cols-2 gap-2 text-warm-gray text-[11px]">
                  <p className="flex items-center gap-1"><Phone className="size-3 text-primary" /> {selectedBookingCell.booking.guestDetails.phone}</p>
                  <p className="flex items-center gap-1 truncate"><Mail className="size-3 text-primary" /> {selectedBookingCell.booking.guestDetails.email}</p>
                </div>
                <p className="text-[11px] text-charcoal font-medium">
                  Party: {selectedBookingCell.booking.adults} Adults, {selectedBookingCell.booking.children} Children
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg border border-border bg-white">
                  <span className="text-[10px] uppercase font-bold text-warm-gray block">Check-in Slot</span>
                  <p className="font-semibold text-charcoal mt-0.5">{formatDate(selectedBookingCell.booking.checkIn)}</p>
                  <p className="text-warm-gray text-[11px]">{selectedBookingCell.booking.estimatedCheckInTime || "12:00 PM"}</p>
                </div>
                <div className="p-2.5 rounded-lg border border-border bg-white">
                  <span className="text-[10px] uppercase font-bold text-warm-gray block">Check-out Slot</span>
                  <p className="font-semibold text-charcoal mt-0.5">{formatDate(selectedBookingCell.booking.checkOut)}</p>
                  <p className="text-warm-gray text-[11px]">{selectedBookingCell.booking.estimatedCheckOutTime || "11:00 AM"}</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedBookingCell(null)}
                className="px-4 py-2 rounded-lg bg-charcoal text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
