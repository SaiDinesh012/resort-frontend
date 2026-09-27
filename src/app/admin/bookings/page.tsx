"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Download, Filter, Eye, Loader2, Plus, X, Check, Calendar, Clock, User, Phone, CreditCard, AlertTriangle } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";
import type { Booking, BookingStatus } from "@/types/booking";
import type { Room } from "@/types/room";

function BookingsContent() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");

  // Walk-in modal state
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [walkInSubmitting, setWalkInSubmitting] = useState(false);
  const [walkInForm, setWalkInForm] = useState({
    roomId: "",
    checkIn: new Date().toISOString().split("T")[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    estimatedCheckInTime: "12:00 PM - 02:00 PM",
    estimatedCheckOutTime: "10:00 AM - 11:00 AM",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    adults: 2,
    children: 0,
    basePrice: 8500,
    paymentMethod: "cash",
    checkInImmediately: true,
  });

  useEffect(() => {
    const s = searchParams.get("status");
    if (s) {
      setStatusFilter(s);
    } else {
      setStatusFilter("all");
    }
  }, [searchParams]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bRes, rRes] = await Promise.allSettled([
        fetch("/api/bookings"),
        fetch(`${API_BASE_URL}/rooms`),
      ]);
      if (bRes.status === "fulfilled" && bRes.value.ok) {
        const data = await bRes.value.json();
        if (Array.isArray(data)) setBookings(data);
      }
      if (rRes.status === "fulfilled" && rRes.value.ok) {
        const rData = await rRes.value.json();
        if (Array.isArray(rData)) {
          setRooms(rData);
          if (rData.length > 0) {
            setWalkInForm((prev) => ({
              ...prev,
              roomId: rData[0].id,
              basePrice: rData[0].basePrice,
            }));
          }
        }
      }
    } catch (err) {
      console.error("Failed to load bookings or rooms", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingStatus: newStatus }),
      });
      loadData();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleCreateWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setWalkInSubmitting(true);
      const selectedRoom = rooms.find((r) => r.id === walkInForm.roomId);
      const [startYear, startMonth, startDay] = walkInForm.checkIn.split("-").map(Number);
      const [endYear, endMonth, endDay] = walkInForm.checkOut.split("-").map(Number);
      const d1 = new Date(startYear, startMonth - 1, startDay);
      const d2 = new Date(endYear, endMonth - 1, endDay);
      const nights = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
      const subtotal = walkInForm.basePrice * nights;
      const taxAmount = Math.round(subtotal * 0.18);
      const grandTotal = subtotal + taxAmount;

      const payload = {
        type: "room",
        roomId: walkInForm.roomId,
        roomName: selectedRoom?.name || "Resort Room",
        checkIn: walkInForm.checkIn,
        checkOut: walkInForm.checkOut,
        estimatedCheckInTime: walkInForm.estimatedCheckInTime,
        estimatedCheckOutTime: walkInForm.estimatedCheckOutTime,
        actualCheckIn: walkInForm.checkInImmediately ? new Date().toISOString() : undefined,
        nights,
        adults: Number(walkInForm.adults),
        children: Number(walkInForm.children),
        guestDetails: {
          firstName: walkInForm.firstName || "Walk-in",
          lastName: walkInForm.lastName || "Guest",
          email: walkInForm.email || `guest_${Date.now()}@resort.local`,
          phone: walkInForm.phone || "+91 99999 00000",
        },
        priceBreakdown: {
          basePrice: walkInForm.basePrice,
          nights,
          subtotal,
          taxAmount,
          taxRate: 18,
          discountAmount: 0,
          total: grandTotal,
        },
        paymentStatus: "paid",
        paymentMethod: walkInForm.paymentMethod,
        bookingStatus: walkInForm.checkInImmediately ? "checked-in" : "confirmed",
        notes: "Front desk walk-in / phone reservation",
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to create walk-in booking");
      }

      setIsWalkInModalOpen(false);
      setWalkInForm({
        roomId: rooms[0]?.id || "",
        checkIn: new Date().toISOString().split("T")[0],
        checkOut: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        estimatedCheckInTime: "12:00 PM - 02:00 PM",
        estimatedCheckOutTime: "10:00 AM - 11:00 AM",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        adults: 2,
        children: 0,
        basePrice: rooms[0]?.basePrice || 8500,
        paymentMethod: "cash",
        checkInImmediately: true,
      });
      await loadData();
      alert("Walk-in booking created and confirmed successfully!");
    } catch (err) {
      console.error("Failed to create walk-in", err);
      alert("Could not create walk-in reservation.");
    } finally {
      setWalkInSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    if (bookings.length === 0) return;
    const headers = ["Booking ID,Guest Name,Email,Item,CheckIn,CheckOut,Guests,Total,Payment,Status\n"];
    const rows = bookings.map(b =>
      `"${b.bookingNumber}","${b.guestDetails?.firstName || ''} ${b.guestDetails?.lastName || ''}","${b.guestDetails?.email || ''}","${b.roomName || b.packageName || ''}","${b.checkIn}","${b.checkOut}","${b.adults}A,${b.children}C","${b.priceBreakdown?.total || 0}","${b.paymentStatus}","${b.bookingStatus}"`
    ).join("\n");

    const blob = new Blob([...headers, rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resort_bookings_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.guestDetails?.firstName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.guestDetails?.lastName || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || b.bookingStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Booking Management</h1>
          <p className="text-xs text-warm-gray mt-1">View, update, filter, check-in, and create walk-in reservations live in MongoDB</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsWalkInModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="size-3.5" /> + New Walk-in Booking
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-border bg-surface text-charcoal text-xs font-semibold hover:bg-background transition-colors cursor-pointer"
          >
            <Download className="size-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface rounded-xl border border-border p-4 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-warm-gray" />
          <input
            type="text"
            placeholder="Search by ID or guest name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-md border border-border text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="size-4 text-warm-gray" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-md border border-border text-xs text-charcoal bg-background focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked-in">Checked In</option>
            <option value="checked-out">Checked Out</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20 text-warm-gray gap-2 bg-surface rounded-xl border border-border">
          <Loader2 className="size-5 animate-spin text-primary" /> Loading bookings from database...
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-background border-b border-border text-warm-gray font-semibold uppercase tracking-wider">
                  <th className="p-3.5">Booking ID</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Room / Villa</th>
                  <th className="p-3.5">Dates & Timings</th>
                  <th className="p-3.5">Guests</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-charcoal font-medium">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-background/60 transition-colors">
                    <td className="p-3.5 font-mono text-primary font-bold">
                      #{b.bookingNumber}
                      {b.overstayCharges && b.overstayCharges > 0 ? (
                        <span className="block text-[10px] text-red-600 font-bold font-sans">
                          Overstay +{formatCurrency(b.overstayCharges)}
                        </span>
                      ) : null}
                    </td>
                    <td className="p-3.5">
                      <p className="font-semibold">{b.guestDetails?.firstName} {b.guestDetails?.lastName}</p>
                      <p className="text-[11px] text-warm-gray">{b.guestDetails?.phone || b.guestDetails?.email}</p>
                    </td>
                    <td className="p-3.5 font-medium">{b.roomName || b.packageName}</td>
                    <td className="p-3.5">
                      <p className="font-semibold text-charcoal">{formatDate(b.checkIn)} → {formatDate(b.checkOut)}</p>
                      <p className="text-[10px] text-warm-gray">
                        Slot: {b.estimatedCheckInTime || "12:00 PM"}
                      </p>
                      {b.actualCheckIn && (
                        <p className="text-[10px] text-emerald-700 font-semibold">
                          In: {new Date(b.actualCheckIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </td>
                    <td className="p-3.5">{b.adults}A, {b.children}C</td>
                    <td className="p-3.5 font-bold">{formatCurrency(b.priceBreakdown?.total || 0)}</td>
                    <td className="p-3.5"><StatusBadge status={b.paymentStatus} size="sm" /></td>
                    <td className="p-3.5">
                      <select
                        value={b.bookingStatus}
                        onChange={(e) => handleStatusChange(b.id, e.target.value as BookingStatus)}
                        className={`px-2 py-1 border rounded text-[11px] font-semibold focus:outline-none ${
                          b.bookingStatus === "checked-in"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : b.bookingStatus === "checked-out"
                            ? "bg-slate-100 text-slate-800 border-slate-300"
                            : "bg-background border-border"
                        }`}
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="checked-in">Checked In</option>
                        <option value="checked-out">Checked Out</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-3.5 text-right">
                      <Link
                        href={`/admin/bookings/${b.id}`}
                        className="px-2.5 py-1 rounded border border-border text-charcoal hover:bg-primary hover:text-white transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="size-3" /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Walk-in / Phone Reservation Modal */}
      {isWalkInModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsWalkInModalOpen(false)}
        >
          <div
            className="relative bg-white rounded-2xl border border-border shadow-2xl max-w-xl w-full p-6 space-y-5 my-8 z-10 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-charcoal">+ New Walk-in Reservation</h3>
                <p className="text-xs text-warm-gray">Create an instant reservation for desk walk-ins or phone bookings</p>
              </div>
              <button
                type="button"
                onClick={() => setIsWalkInModalOpen(false)}
                className="size-8 rounded-lg flex items-center justify-center text-warm-gray hover:text-charcoal hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWalkIn} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-charcoal mb-1">Select Room / Villa *</label>
                <select
                  required
                  value={walkInForm.roomId}
                  onChange={(e) => {
                    const sel = rooms.find((r) => r.id === e.target.value);
                    setWalkInForm({
                      ...walkInForm,
                      roomId: e.target.value,
                      basePrice: sel?.basePrice || walkInForm.basePrice,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-slate-50 focus:bg-white text-charcoal focus:outline-none focus:border-primary text-xs"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.type}) — {formatCurrency(r.basePrice)}/night [{r.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Check-in Date *</label>
                  <input
                    type="date"
                    required
                    value={walkInForm.checkIn}
                    onChange={(e) => setWalkInForm({ ...walkInForm, checkIn: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-slate-50 focus:bg-white text-charcoal focus:outline-none focus:border-primary text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Check-out Date *</label>
                  <input
                    type="date"
                    required
                    value={walkInForm.checkOut}
                    min={walkInForm.checkIn}
                    onChange={(e) => setWalkInForm({ ...walkInForm, checkOut: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-slate-50 focus:bg-white text-charcoal focus:outline-none focus:border-primary text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Arrival Time Slot</label>
                  <select
                    value={walkInForm.estimatedCheckInTime}
                    onChange={(e) => setWalkInForm({ ...walkInForm, estimatedCheckInTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-slate-50 focus:bg-white text-charcoal focus:outline-none focus:border-primary text-xs"
                  >
                    <option value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM (Standard)</option>
                    <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                    <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                    <option value="Immediate Arrival">Immediate Arrival (Now)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Departure Time Slot</label>
                  <select
                    value={walkInForm.estimatedCheckOutTime}
                    onChange={(e) => setWalkInForm({ ...walkInForm, estimatedCheckOutTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-slate-50 focus:bg-white text-charcoal focus:outline-none focus:border-primary text-xs"
                  >
                    <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM (Standard)</option>
                    <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM (Grace Period)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Guest First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh"
                    value={walkInForm.firstName}
                    onChange={(e) => setWalkInForm({ ...walkInForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-slate-50 focus:bg-white text-charcoal focus:outline-none focus:border-primary text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Guest Last Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kumar"
                    value={walkInForm.lastName}
                    onChange={(e) => setWalkInForm({ ...walkInForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-slate-50 focus:bg-white text-charcoal focus:outline-none focus:border-primary text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={walkInForm.phone}
                    onChange={(e) => setWalkInForm({ ...walkInForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-slate-50 focus:bg-white text-charcoal focus:outline-none focus:border-primary text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="guest@example.com"
                    value={walkInForm.email}
                    onChange={(e) => setWalkInForm({ ...walkInForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-slate-50 focus:bg-white text-charcoal focus:outline-none focus:border-primary text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Adults</label>
                  <input
                    type="number"
                    min={1}
                    value={walkInForm.adults}
                    onChange={(e) => setWalkInForm({ ...walkInForm, adults: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-slate-50 focus:bg-white text-charcoal focus:outline-none focus:border-primary text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Children</label>
                  <input
                    type="number"
                    min={0}
                    value={walkInForm.children}
                    onChange={(e) => setWalkInForm({ ...walkInForm, children: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-slate-50 focus:bg-white text-charcoal focus:outline-none focus:border-primary text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Payment Method</label>
                  <select
                    value={walkInForm.paymentMethod}
                    onChange={(e) => setWalkInForm({ ...walkInForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-slate-50 focus:bg-white text-charcoal focus:outline-none focus:border-primary text-xs"
                  >
                    <option value="cash">Cash on Desk</option>
                    <option value="card">POS Card Machine</option>
                    <option value="upi">UPI / QR Code</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="checkInImmediately"
                  checked={walkInForm.checkInImmediately}
                  onChange={(e) => setWalkInForm({ ...walkInForm, checkInImmediately: e.target.checked })}
                  className="size-4 text-emerald-600 rounded cursor-pointer"
                />
                <label htmlFor="checkInImmediately" className="font-semibold text-emerald-900 cursor-pointer text-xs">
                  Check-in guest immediately (records In-Time and sets room to Occupied)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsWalkInModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border text-warm-gray hover:text-charcoal hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={walkInSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  {walkInSubmitting ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                  Confirm Walk-in Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingsManagementPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    }>
      <BookingsContent />
    </Suspense>
  );
}