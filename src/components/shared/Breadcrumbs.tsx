"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  variant?: "light" | "dark";
}

export function Breadcrumbs({ items, className, variant = "light" }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1 text-sm", className)}
    >
      <Link
        href="/"
        aria-label="Home"
        className={cn(
          "flex items-center hover:opacity-70 transition-opacity",
          variant === "light" ? "text-warm-gray" : "text-white/60 hover:text-white"
        )}
      >
        <Home className="size-3.5" />
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight
            className={cn(
              "size-3.5",
              variant === "light" ? "text-border" : "text-white/30"
            )}
          />
          {item.href && i < items.length - 1 ? (
            <Link
              href={item.href}
              className={cn(
                "hover:opacity-70 transition-opacity",
                variant === "light" ? "text-warm-gray" : "text-white/60 hover:text-white"
              )}
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={cn(
                "font-medium",
                variant === "light" ? "text-charcoal" : "text-white"
              )}
              aria-current="page"
            >
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
