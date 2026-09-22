import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
  subtitle?: string;
  className?: string;
}

export function KpiCard({ title, value, change, isPositive, icon, subtitle, className }: KpiCardProps) {
  return (
    <div className={cn("bg-surface rounded-xl border border-border p-5 shadow-card", className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-warm-gray uppercase tracking-wider">{title}</span>
        <div className="p-2 rounded-lg bg-primary/8 text-primary">{icon}</div>
      </div>
      <div className="flex items-baseline justify-between">
        <p className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">{value}</p>
        {change && (
          <span
            className={cn(
              "inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full",
              isPositive ? "bg-green-50 text-success" : "bg-red-50 text-error"
            )}
          >
            {isPositive ? <ArrowUpRight className="size-3 mr-0.5" /> : <ArrowDownRight className="size-3 mr-0.5" />}
            {change}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-warm-gray mt-2">{subtitle}</p>}
    </div>
  );
}
