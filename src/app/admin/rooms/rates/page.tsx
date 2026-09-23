"use client";

import { Construction } from "lucide-react";

export default function PlaceholderPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center bg-surface rounded-xl border border-border shadow-sm p-8">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <Construction className="size-8 text-primary" />
      </div>
      <h1 className="text-2xl font-serif font-bold text-charcoal mb-3">Rates Management</h1>
      <p className="text-warm-gray max-w-md mx-auto leading-relaxed">
        This module is currently under construction. In a future update, you will be able to configure dynamic seasonal pricing, weekend surges, and discount rules directly from this interface.
      </p>
    </div>
  );
}
