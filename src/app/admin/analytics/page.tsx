"use client";

import { BarChart3, TrendingUp, Users, ArrowUpRight } from "lucide-react";
import { KpiCard } from "@/components/admin/KpiCard";
import { ChartCard } from "@/components/admin/ChartCard";
import { mockAnalyticsRevenue, mockOccupancyData, mockTrafficData } from "@/data/mock/payments";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-charcoal">Resort Analytics & Insights</h1>
        <p className="text-xs text-warm-gray mt-1">Traffic funnels, conversion rates, organic reach, and revenue breakdowns</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Visitors" value="74,500" change="+24%" isPositive icon={<Users className="size-4" />} />
        <KpiCard title="Booking Conversion Rate" value="3.42%" change="+0.6%" isPositive icon={<TrendingUp className="size-4" />} />
        <KpiCard title="Avg Booking Value" value="₹42,800" change="+12%" isPositive icon={<BarChart3 className="size-4" />} />
        <KpiCard title="Direct Web Revenue" value="₹48.2L" change="+31%" isPositive icon={<ArrowUpRight className="size-4" />} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard
          title="Website Traffic by Channel"
          subtitle="Monthly sessions"
          data={mockTrafficData}
          type="area"
          dataKey="organic"
          categoryKey="month"
          color="#1F4D3A"
        />
        <ChartCard
          title="Monthly Booking Conversions"
          subtitle="Completed bookings count"
          data={mockAnalyticsRevenue}
          type="bar"
          dataKey="bookings"
          categoryKey="month"
          color="#B8945A"
        />
      </div>
    </div>
  );
}
