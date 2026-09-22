"use client";

import { useState } from "react";
import { Megaphone, Tag, Plus, CheckCircle } from "lucide-react";

export default function MarketingPage() {
  const coupons = [
    { code: "WELCOME10", type: "Percentage", discount: "10%", minBooking: "₹10,000", maxDiscount: "₹3,000", usage: "48 / 100", status: "Active" },
    { code: "VANAPRIYA", type: "Flat", discount: "₹5,000", minBooking: "₹35,000", maxDiscount: "₹5,000", usage: "12 / 50", status: "Active" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Marketing & Coupons</h1>
          <p className="text-xs text-warm-gray mt-1">Manage promotional discount codes, marketing campaigns, and UTM parameters</p>
        </div>
        <button className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded hover:bg-primary-dark flex items-center gap-1.5">
          <Plus className="size-3.5" /> Create Coupon
        </button>
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden">
        <div className="p-4 border-b border-border font-serif font-bold text-charcoal text-base">Active Promotional Coupons</div>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-background border-b border-border text-warm-gray font-semibold uppercase">
              <th className="p-3.5">Coupon Code</th>
              <th className="p-3.5">Discount Type</th>
              <th className="p-3.5">Value</th>
              <th className="p-3.5">Min Booking</th>
              <th className="p-3.5">Usage Limit</th>
              <th className="p-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-medium">
            {coupons.map((c) => (
              <tr key={c.code} className="hover:bg-background/50">
                <td className="p-3.5 font-mono font-bold text-primary">{c.code}</td>
                <td className="p-3.5">{c.type}</td>
                <td className="p-3.5 font-bold text-success">{c.discount}</td>
                <td className="p-3.5">{c.minBooking}</td>
                <td className="p-3.5">{c.usage}</td>
                <td className="p-3.5 text-success font-semibold flex items-center gap-1"><CheckCircle className="size-3.5" /> {c.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
