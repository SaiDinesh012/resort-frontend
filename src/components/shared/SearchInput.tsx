"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className,
  size = "md",
}: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <Search
        className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray pointer-events-none",
          size === "sm" ? "size-3.5" : "size-4"
        )}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-md border border-border bg-white text-charcoal placeholder:text-warm-gray/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors",
          size === "sm" && "pl-8 pr-3 py-1.5 text-sm",
          size === "md" && "pl-9 pr-4 py-2 text-sm",
          size === "lg" && "pl-10 pr-4 py-2.5 text-base"
        )}
      />
    </div>
  );
}
