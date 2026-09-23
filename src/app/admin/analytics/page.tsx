"use client";

import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, ArrowUpRight, Loader2 } from "lucide-react";
import { KpiCard } from "@/components/admin/KpiCard";
import { ChartCard } from "@/components/admin/ChartCard";
import { formatCurrency } from "@/lib/utils";
import type { Booking } from "@/types/booking";

export default function AnalyticsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const res = await fetch("/api/bookings");
        const data = await res.json();
        if (Array.isArray(data)) setBookings(data);
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.priceBreakdown?.total || 0), 0);
  const avgBookingValue = bookings.length > 0 ? Math.round(totalRevenue / bookings.length) : 0;

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyData = months.map((month) => {
    const monthBookings = bookings.filter((b) => b.checkIn && months[new Date(b.checkIn).getMonth()] === month);
    const revenue = monthBookings.reduce((sum, b) => sum + (b.priceBreakdown?.total || 0), 0);
    return {
      month,
      bookings: monthBookings.length,
      revenue,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-charcoal">Resort Analytics & Insights</h1>
        <p className="text-xs text-warm-gray mt-1">Real-time performance metrics and revenue breakdowns</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Reservations" value={String(bookings.length)} change={bookings.length > 0 ? "+100%" : "0"} isPositive icon={<Users className="size-4" />} />
        <KpiCard title="Active Stays" value={String(bookings.filter((b) => b.bookingStatus === "confirmed").length)} change="0" isPositive icon={<TrendingUp className="size-4" />} />
        <KpiCard title="Avg Booking Value" value={formatCurrency(avgBookingValue)} change="0" isPositive icon={<BarChart3 className="size-4" />} />
        <KpiCard title="Direct Web Revenue" value={formatCurrency(totalRevenue)} change="0" isPositive icon={<ArrowUpRight className="size-4" />} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard
          title="Revenue by Month"
          subtitle="Total revenue generated"
          data={monthlyData}
          type="area"
          dataKey="revenue"
          categoryKey="month"
          color="#1F4D3A"
        />
        <ChartCard
          title="Monthly Booking Count"
          subtitle="Confirmed bookings count"
          data={monthlyData}
          type="bar"
          dataKey="bookings"
          categoryKey="month"
          color="#B8945A"
        />
      </div>
    </div>
  );
}
