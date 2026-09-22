"use client";

import { cn } from "@/lib/utils";

type BadgeVariant = "success" | "error" | "warning" | "pending" | "info" | "neutral";

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-green-50 text-green-700 border-green-200",
  error: "bg-red-50 text-[#B4534B] border-red-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
  neutral: "bg-gray-50 text-gray-600 border-gray-200",
};

const statusMap: Record<string, BadgeVariant> = {
  confirmed: "success",
  completed: "success",
  available: "success",
  active: "success",
  published: "success",
  success: "success",
  processed: "success",
  paid: "success",
  cancelled: "error",
  failed: "error",
  rejected: "error",
  error: "error",
  blocked: "error",
  inactive: "neutral",
  pending: "pending",
  draft: "neutral",
  maintenance: "warning",
  partial: "warning",
  refunded: "info",
  "no-show": "neutral",
  scheduled: "info",
};

interface StatusBadgeProps {
  status: string;
  label?: string;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  dot?: boolean;
}

export function StatusBadge({ status, label, variant, size = "sm", dot = true }: StatusBadgeProps) {
  const resolvedVariant = variant ?? statusMap[status] ?? "neutral";
  const displayLabel = label ?? status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, " ");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
        variantClasses[resolvedVariant]
      )}
    >
      {dot && (
        <span
          className={cn(
            "size-1.5 rounded-full",
            resolvedVariant === "success" && "bg-green-500",
            resolvedVariant === "error" && "bg-[#B4534B]",
            resolvedVariant === "warning" && "bg-amber-500",
            resolvedVariant === "pending" && "bg-yellow-500",
            resolvedVariant === "info" && "bg-blue-500",
            resolvedVariant === "neutral" && "bg-gray-400"
          )}
        />
      )}
      {displayLabel}
    </span>
  );
}
