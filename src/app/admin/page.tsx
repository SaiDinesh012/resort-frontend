"use client";

import { useState, useEffect, useCallback } from "react";
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
  RefreshCw,
  CalendarDays,
  FileQuestion,
} from "lucide-react";
import { KpiCard } from "@/components/admin/KpiCard";
import { ChartCard } from "@/components/admin/ChartCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";

interface DashboardData {
  kpis: {
    totalRevenue: {
      value: number;
      formatted: string;
      change?: string;
      isPositive?: boolean;
      subtitle: string;
    };
    todayBookings: {
      value: number;
      formatted: string;
      change?: string;
      isPositive?: boolean;
      subtitle: string;
    };
    upcomingCheckIns: {
      value: number;
      formatted: string;
      subtitle: string;
    };
    availableRooms: {
      value: number;
      total: number;
      formatted: string;
      subtitle: string;
    };
    occupiedRooms: {
      value: number;
      occupancyRate: number;
      formatted: string;
      subtitle: string;
    };
    pendingPayments: {
      value: number;
      count: number;
      formatted: string;
      change?: string;
      isPositive?: boolean;
      subtitle: string;
    };
  };
  charts: {
    year: number;
    revenueOverTime: { month: string; revenue: number; bookings: number }[];
    occupancyTrend: { month: string; occupancy: number }[];
  };
  recentBookings: any[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Try Next.js API route first
      let res = await fetch("/api/dashboard", { cache: "no-store" });
      if (!res.ok) {
        // Fallback to /api/admin/dashboard
        res = await fetch("/api/admin/dashboard", { cache: "no-store" });
      }

      if (!res.ok) {
        throw new Error(`Failed to load dashboard data (Status ${res.status})`);
      }

      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error("Dashboard data load error:", err);
      setError(err.message || "Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <div className="space-y-8">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">Resort Dashboard</h1>
          <p className="text-xs sm:text-sm text-warm-gray mt-1">
            Real-time overview of bookings, occupancy, and resort revenue from database
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => fetchDashboard(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-border bg-surface text-charcoal text-xs font-semibold hover:bg-background transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            href="/admin/rooms"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-colors shadow-xs"
          >
            <Plus className="size-3.5" /> Add Room
          </Link>
          <Link
            href="/admin/packages"
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

      {/* Error Banner */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchDashboard(false)}
            className="px-3 py-1 bg-red-600 text-white rounded font-semibold hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-surface rounded-xl border border-border p-5 shadow-card animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="h-3 w-20 bg-warm-gray/20 rounded" />
                <div className="size-8 rounded-lg bg-warm-gray/20" />
              </div>
              <div className="h-8 w-24 bg-warm-gray/30 rounded mb-2" />
              <div className="h-3 w-16 bg-warm-gray/20 rounded" />
            </div>
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KpiCard
            title="Total Revenue"
            value={data.kpis.totalRevenue.formatted}
            change={data.kpis.totalRevenue.change}
            isPositive={data.kpis.totalRevenue.isPositive}
            icon={<IndianRupee className="size-4" />}
            subtitle={data.kpis.totalRevenue.subtitle}
          />
          <KpiCard
            title="Today's Bookings"
            value={data.kpis.todayBookings.formatted}
            change={data.kpis.todayBookings.change}
            isPositive={data.kpis.todayBookings.isPositive}
            icon={<Calendar className="size-4" />}
            subtitle={data.kpis.todayBookings.subtitle}
          />
          <KpiCard
            title="Upcoming Check-ins"
            value={data.kpis.upcomingCheckIns.formatted}
            icon={<Clock className="size-4" />}
            subtitle={data.kpis.upcomingCheckIns.subtitle}
          />
          <KpiCard
            title="Available Rooms"
            value={data.kpis.availableRooms.formatted}
            icon={<BedDouble className="size-4 text-success" />}
            subtitle={data.kpis.availableRooms.subtitle}
          />
          <KpiCard
            title="Occupied Rooms"
            value={data.kpis.occupiedRooms.formatted}
            icon={<CheckCircle2 className="size-4 text-primary" />}
            subtitle={data.kpis.occupiedRooms.subtitle}
          />
          <KpiCard
            title="Pending Payments"
            value={data.kpis.pendingPayments.formatted}
            change={data.kpis.pendingPayments.change}
            isPositive={data.kpis.pendingPayments.isPositive}
            icon={<AlertCircle className="size-4 text-warning" />}
            subtitle={data.kpis.pendingPayments.subtitle}
          />
        </div>
      ) : null}

      {/* Charts Grid */}
      {loading ? (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-surface rounded-xl border border-border p-5 shadow-card h-80 animate-pulse">
            <div className="h-5 w-44 bg-warm-gray/20 rounded mb-2" />
            <div className="h-3 w-32 bg-warm-gray/20 rounded mb-6" />
            <div className="h-52 bg-warm-gray/10 rounded" />
          </div>
          <div className="bg-surface rounded-xl border border-border p-5 shadow-card h-80 animate-pulse">
            <div className="h-5 w-44 bg-warm-gray/20 rounded mb-2" />
            <div className="h-3 w-32 bg-warm-gray/20 rounded mb-6" />
            <div className="h-52 bg-warm-gray/10 rounded" />
          </div>
        </div>
      ) : data ? (
        <div className="grid lg:grid-cols-2 gap-6">
          <ChartCard
            title={`Revenue Over Time (${data.charts.year})`}
            subtitle="Monthly revenue in INR"
            data={data.charts.revenueOverTime}
            type="area"
            dataKey="revenue"
            categoryKey="month"
            color="#1F4D3A"
          />
          <ChartCard
            title="Room Occupancy Trend (%)"
            subtitle="Monthly occupancy rates"
            data={data.charts.occupancyTrend}
            type="bar"
            dataKey="occupancy"
            categoryKey="month"
            color="#B8945A"
          />
        </div>
      ) : null}

      {/* Recent Bookings Table */}
      <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-charcoal">Recent Bookings</h2>
            <p className="text-xs text-warm-gray">Latest transactions and reservation requests from database</p>
          </div>
          <Link
            href="/admin/bookings"
            className="text-xs font-semibold text-primary hover:text-primary-dark hover:underline flex items-center gap-1"
          >
            View All Bookings <Eye className="size-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-warm-gray/10 rounded animate-pulse" />
              ))}
            </div>
          ) : !data || data.recentBookings.length === 0 ? (
            <div className="p-12 text-center text-warm-gray">
              <CalendarDays className="size-10 mx-auto mb-2 text-warm-gray/50" />
              <p className="font-semibold text-charcoal text-sm">No Bookings Found</p>
              <p className="text-xs text-warm-gray mt-1 max-w-sm mx-auto">
                No reservations have been placed yet. When guests book online or via admin, they will appear here live.
              </p>
            </div>
          ) : (
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
                {data.recentBookings.map((b) => (
                  <tr key={b.id || b._id} className="hover:bg-background/60 transition-colors">
                    <td className="p-3.5 font-mono text-primary font-bold">{b.bookingNumber}</td>
                    <td className="p-3.5">
                      <p className="font-semibold">
                        {b.guestDetails?.firstName || ""} {b.guestDetails?.lastName || ""}
                      </p>
                      <p className="text-[11px] text-warm-gray">{b.guestDetails?.phone || b.guestDetails?.email || "—"}</p>
                    </td>
                    <td className="p-3.5 capitalize text-warm-gray">{b.type || "room"}</td>
                    <td className="p-3.5 font-medium">{b.roomName || b.packageName || "Resort Stay"}</td>
                    <td className="p-3.5">{b.checkIn ? formatDate(b.checkIn) : "—"}</td>
                    <td className="p-3.5 font-bold">{formatCurrency(b.priceBreakdown?.total || 0)}</td>
                    <td className="p-3.5">
                      <StatusBadge status={b.paymentStatus || "pending"} size="sm" />
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={b.bookingStatus || "confirmed"} size="sm" />
                    </td>
                    <td className="p-3.5 text-right">
                      <Link
                        href={`/admin/bookings/${b.id || b._id}`}
                        className="px-2.5 py-1 rounded border border-border text-charcoal hover:bg-primary hover:text-white transition-colors"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
