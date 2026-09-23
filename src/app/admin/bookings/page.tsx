"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Download, Filter, Eye, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Booking, BookingStatus } from "@/types/booking";

function BookingsContent() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");

  useEffect(() => {
    const s = searchParams.get("status");
    if (s) {
      setStatusFilter(s);
    } else {
      setStatusFilter("all");
    }
  }, [searchParams]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/bookings");
      const data = await res.json();
      if (Array.isArray(data)) {
        setBookings(data);
      }
    } catch (err) {
      console.error("Failed to load bookings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingStatus: newStatus }),
      });
      fetchBookings();
    } catch (err) {
      console.error("Failed to update status", err);
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
          <p className="text-xs text-warm-gray mt-1">View, update, filter, and export resort reservations live from MongoDB</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-border bg-surface text-charcoal text-xs font-semibold hover:bg-background transition-colors cursor-pointer"
        >
          <Download className="size-3.5" /> Export Bookings CSV
        </button>
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
                  <th className="p-3.5">Item</th>
                  <th className="p-3.5">Dates</th>
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
                    <td className="p-3.5 font-mono text-primary font-bold">{b.bookingNumber}</td>
                    <td className="p-3.5">
                      <p className="font-semibold">{b.guestDetails?.firstName} {b.guestDetails?.lastName}</p>
                      <p className="text-[11px] text-warm-gray">{b.guestDetails?.email}</p>
                    </td>
                    <td className="p-3.5">{b.roomName || b.packageName}</td>
                    <td className="p-3.5">{formatDate(b.checkIn)} → {formatDate(b.checkOut)}</td>
                    <td className="p-3.5">{b.adults}A, {b.children}C</td>
                    <td className="p-3.5 font-bold">{formatCurrency(b.priceBreakdown?.total || 0)}</td>
                    <td className="p-3.5"><StatusBadge status={b.paymentStatus} size="sm" /></td>
                    <td className="p-3.5">
                      <select
                        value={b.bookingStatus}
                        onChange={(e) => handleStatusChange(b.id, e.target.value as BookingStatus)}
                        className="px-2 py-1 border border-border rounded bg-background text-[11px] font-semibold focus:outline-none"
                      >
                        <option value="confirmed">Confirmed</option>
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