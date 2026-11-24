"use client";

import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, ArrowUpRight, Loader2 } from "lucide-react";
import { KpiCard } from "@/components/admin/KpiCard";
import { ChartCard } from "@/components/admin/ChartCard";
import { formatCurrency } from "@/lib/utils";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalRev = data?.kpis?.totalRevenue?.value || 0;
  const totalBookingsCount = data?.charts?.revenueOverTime?.reduce(
    (sum: number, item: any) => sum + (item.bookings || 0),
    0
  ) || 0;
  const avgBookingVal = totalBookingsCount > 0 ? Math.round(totalRev / totalBookingsCount) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-charcoal">Resort Analytics & Insights</h1>
        <p className="text-xs text-warm-gray mt-1">
          Dynamic metrics, conversion rates, and revenue breakdowns live from MongoDB
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Total Revenue"
              value={data?.kpis?.totalRevenue?.formatted || "₹0"}
              change={data?.kpis?.totalRevenue?.change}
              isPositive={data?.kpis?.totalRevenue?.isPositive}
              icon={<ArrowUpRight className="size-4" />}
            />
            <KpiCard
              title="Total Bookings"
              value={String(totalBookingsCount)}
              icon={<Users className="size-4" />}
            />
            <KpiCard
              title="Avg Booking Value"
              value={formatCurrency(avgBookingVal)}
              icon={<BarChart3 className="size-4" />}
            />
            <KpiCard
              title="Occupied Rate"
              value={`${data?.kpis?.occupiedRooms?.occupancyRate || 0}%`}
              isPositive={true}
              icon={<TrendingUp className="size-4" />}
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <ChartCard
              title={`Monthly Revenue (${data?.charts?.year || new Date().getFullYear()})`}
              subtitle="Monthly revenue in INR"
              data={data?.charts?.revenueOverTime || []}
              type="area"
              dataKey="revenue"
              categoryKey="month"
              color="#1F4D3A"
            />
            <ChartCard
              title="Monthly Booking Conversions"
              subtitle="Completed bookings count"
              data={data?.charts?.revenueOverTime || []}
              type="bar"
              dataKey="bookings"
              categoryKey="month"
              color="#B8945A"
            />
          </div>
        </>
      )}
    </div>
  );
}
