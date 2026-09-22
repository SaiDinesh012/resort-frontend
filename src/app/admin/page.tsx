"use client";

import Link from "next/link";
import {
  IndianRupee,
  Calendar,
  BedDouble,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  PlusCircle,
  Eye,
  Upload,
} from "lucide-react";
import { KpiCard } from "@/components/admin/KpiCard";
import { ChartCard } from "@/components/admin/ChartCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { mockBookings } from "@/data/mock/bookings";
import { mockAnalyticsRevenue, mockOccupancyData } from "@/data/mock/payments";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminDashboardPage() {
  const recentBookings = mockBookings.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">Resort Dashboard</h1>
          <p className="text-xs sm:text-sm text-warm-gray mt-1">Overview of bookings, occupancy, and resort revenue</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/rooms/new"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-colors shadow-xs"
          >
            <Plus className="size-3.5" /> Add Room
          </Link>
          <Link
            href="/admin/packages/new"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-accent text-white text-xs font-semibold hover:bg-accent-dark transition-colors shadow-xs"
          >
            <PlusCircle className="size-3.5" /> Add Package
          </Link>
          <Link
            href="/admin/media"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-border bg-surface text-charcoal text-xs font-semibold hover:bg-background transition-colors"
          >
            <Upload className="size-3.5" /> Upload Media
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          title="Total Revenue"
          value="₹71.85L"
          change="+18.4%"
          isPositive={true}
          icon={<IndianRupee className="size-4" />}
          subtitle="Year to date"
        />
        <KpiCard
          title="Today's Bookings"
          value="4"
          change="+2"
          isPositive={true}
          icon={<Calendar className="size-4" />}
          subtitle="New reservations"
        />
        <KpiCard
          title="Upcoming Check-ins"
          value="12"
          icon={<Clock className="size-4" />}
          subtitle="Next 48 hours"
        />
        <KpiCard
          title="Available Rooms"
          value="6"
          icon={<BedDouble className="size-4 text-success" />}
          subtitle="Out of 18 total"
        />
        <KpiCard
          title="Occupied Rooms"
          value="12"
          icon={<CheckCircle2 className="size-4 text-primary" />}
          subtitle="66% Occupancy"
        />
        <KpiCard
          title="Pending Payments"
          value="₹1.65L"
          change="-5.2%"
          isPositive={false}
          icon={<AlertCircle className="size-4 text-warning" />}
          subtitle="1 invoice pending"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard
          title="Revenue Over Time (2024)"
          subtitle="Monthly revenue in INR"
          data={mockAnalyticsRevenue}
          type="area"
          dataKey="revenue"
          categoryKey="month"
          color="#1F4D3A"
        />
        <ChartCard
          title="Room Occupancy Trend (%)"
          subtitle="Monthly occupancy rates"
          data={mockOccupancyData}
          type="bar"
          dataKey="occupancy"
          categoryKey="month"
          color="#B8945A"
        />
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-charcoal">Recent Bookings</h2>
            <p className="text-xs text-warm-gray">Latest transactions and reservation requests</p>
          </div>
          <Link
            href="/admin/bookings"
            className="text-xs font-semibold text-primary hover:text-primary-dark hover:underline flex items-center gap-1"
          >
            View All Bookings <Eye className="size-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-background border-b border-border text-warm-gray font-semibold uppercase tracking-wider">
                <th className="p-3.5">Booking ID</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Item Name</th>
                <th className="p-3.5">Check-in</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-charcoal font-medium">
              {recentBookings.map((b) => (
                <tr key={b.id} className="hover:bg-background/60 transition-colors">
                  <td className="p-3.5 font-mono text-primary font-bold">{b.bookingNumber}</td>
                  <td className="p-3.5">
                    <p className="font-semibold">{b.guestDetails.firstName} {b.guestDetails.lastName}</p>
                    <p className="text-[11px] text-warm-gray">{b.guestDetails.phone}</p>
                  </td>
                  <td className="p-3.5 capitalize text-warm-gray">{b.type}</td>
                  <td className="p-3.5 font-medium">{b.roomName || b.packageName}</td>
                  <td className="p-3.5">{formatDate(b.checkIn)}</td>
                  <td className="p-3.5 font-bold">{formatCurrency(b.priceBreakdown.total)}</td>
                  <td className="p-3.5">
                    <StatusBadge status={b.paymentStatus} size="sm" />
                  </td>
                  <td className="p-3.5">
                    <StatusBadge status={b.bookingStatus} size="sm" />
                  </td>
                  <td className="p-3.5 text-right">
                    <Link
                      href={`/admin/bookings/${b.id}`}
                      className="px-2.5 py-1 rounded border border-border text-charcoal hover:bg-primary hover:text-white transition-colors"
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
