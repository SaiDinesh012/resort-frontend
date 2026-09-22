"use client";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-6 text-center", className)}>
      {icon && (
        <div className="mb-4 rounded-full bg-border/50 p-4 text-warm-gray">
          {icon}
        </div>
      )}
      <h3 className="font-sans text-base font-semibold text-charcoal mb-1">{title}</h3>
      {description && <p className="text-sm text-warm-gray max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface LoadingStateProps {
  className?: string;
  rows?: number;
}

export function TableSkeleton({ rows = 5, className }: LoadingStateProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <div className="skeleton h-4 w-12 rounded" />
          <div className="skeleton h-4 flex-1 rounded" />
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-4 w-20 rounded" />
          <div className="skeleton h-4 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border border-border bg-surface p-5 space-y-3", className)}>
      <div className="skeleton h-40 w-full rounded-md" />
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-3 w-full rounded" />
      <div className="skeleton h-3 w-5/6 rounded" />
      <div className="flex gap-2 mt-4">
        <div className="skeleton h-8 flex-1 rounded" />
        <div className="skeleton h-8 flex-1 rounded" />
      </div>
    </div>
  );
}

export function KpiSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border border-border bg-surface p-5", className)}>
      <div className="skeleton h-3 w-24 rounded mb-3" />
      <div className="skeleton h-8 w-32 rounded mb-1" />
      <div className="skeleton h-3 w-20 rounded" />
    </div>
  );
}
