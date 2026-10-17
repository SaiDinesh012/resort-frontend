"use client";

import { useState, useEffect } from "react";
import {
  Megaphone,
  Tag,
  Plus,
  CheckCircle,
  XCircle,
  Trash2,
  Loader2,
  X,
  Search,
  Sparkles,
  Percent,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CouponItem {
  id: string;
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  minBookingAmount: number;
  maxDiscount: number;
  usageLimit: number;
  usedCount: number;
  validUntil?: string;
  status: "active" | "inactive" | "expired";
  description?: string;
}

export default function MarketingPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage" as "percentage" | "flat",
    discountValue: 10,
    minBookingAmount: 10000,
    maxDiscount: 3000,
    usageLimit: 100,
    status: "active" as "active" | "inactive",
    description: "",
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/coupons");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setCoupons(data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to create coupon.");
        return;
      }

      setIsModalOpen(false);
      setFormData({
        code: "",
        discountType: "percentage",
        discountValue: 10,
        minBookingAmount: 10000,
        maxDiscount: 3000,
        usageLimit: 100,
        status: "active",
        description: "",
      });
      fetchCoupons();
    } catch (err) {
      console.error("Error creating coupon:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (coupon: CouponItem) => {
    const nextStatus = coupon.status === "active" ? "inactive" : "active";
    try {
      const res = await fetch("/api/coupons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: coupon.id, status: nextStatus }),
      });
      if (res.ok) {
        fetchCoupons();
      }
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete coupon '${code}'?`)) return;
    try {
      const res = await fetch(`/api/coupons?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchCoupons();
      }
    } catch (err) {
      console.error("Error deleting coupon:", err);
    }
  };

  const filtered = coupons.filter((c) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return c.code.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal flex items-center gap-2">
            <Tag className="size-6 text-primary" /> Promotional Coupons & Campaigns
          </h1>
          <p className="text-xs text-warm-gray mt-1">
            Create and manage promotional discount codes that guests can redeem during online reservation checkout.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/admin/subscriptions"
            className="px-3.5 py-2 border border-border text-charcoal text-xs font-semibold rounded hover:bg-surface flex items-center gap-1.5 transition-colors"
          >
            Subscribers Studio &rarr;
          </a>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded hover:bg-primary-dark flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
          >
            <Plus className="size-3.5" /> Create Coupon
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-surface border border-border">
          <span className="text-[11px] font-bold text-warm-gray uppercase tracking-wider block">Total Coupons</span>
          <span className="text-2xl font-bold font-serif text-charcoal mt-1 block">{coupons.length}</span>
        </div>
        <div className="p-4 rounded-xl bg-surface border border-border">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Active & Redeemable</span>
          <span className="text-2xl font-bold font-serif text-emerald-600 mt-1 block">
            {coupons.filter((c) => c.status === "active").length}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-surface border border-border">
          <span className="text-[11px] font-bold text-warm-gray uppercase tracking-wider block">Total Redemptions</span>
          <span className="text-2xl font-bold font-serif text-charcoal mt-1 block">
            {coupons.reduce((acc, c) => acc + (c.usedCount || 0), 0)}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-surface border border-border">
          <span className="text-[11px] font-bold text-warm-gray uppercase tracking-wider block">Checkout Status</span>
          <span className="text-xs font-semibold text-emerald-600 mt-2 block flex items-center gap-1">
            <CheckCircle className="size-3.5" /> Live Dynamic Validation
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 p-3 bg-surface rounded-xl border border-border">
        <Search className="size-4 text-warm-gray ml-1" />
        <input
          type="text"
          placeholder="Search by code (e.g. WELCOME10, MONSOON15)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs text-charcoal focus:outline-none placeholder:text-warm-gray/60"
        />
      </div>

      {/* Coupons Table */}
      <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden">
        <div className="p-4 border-b border-border font-serif font-bold text-charcoal text-base flex items-center justify-between">
          <span>Active & Historical Promotional Codes</span>
          <span className="text-xs text-warm-gray font-normal font-sans">
            Guests apply codes directly on <code className="text-primary font-bold">/booking</code>
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center items-center gap-2 text-warm-gray text-xs">
            <Loader2 className="size-5 animate-spin text-primary" /> Loading coupon engine...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-warm-gray p-6">
            No coupon codes found. Click &quot;Create Coupon&quot; to add your first promotion.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-background border-b border-border text-warm-gray font-semibold uppercase">
                  <th className="p-3.5">Code</th>
                  <th className="p-3.5">Discount</th>
                  <th className="p-3.5">Min Booking</th>
                  <th className="p-3.5">Max Cap</th>
                  <th className="p-3.5">Redemptions</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-background/50">
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-primary text-sm tracking-wider">{c.code}</div>
                      {c.description && <div className="text-[11px] text-warm-gray/80 mt-0.5">{c.description}</div>}
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {c.discountType === "percentage" ? `${c.discountValue}% OFF` : `₹${c.discountValue.toLocaleString("en-IN")} FLAT`}
                      </span>
                    </td>
                    <td className="p-3.5 text-charcoal">
                      {c.minBookingAmount ? `₹${c.minBookingAmount.toLocaleString("en-IN")}` : "No minimum"}
                    </td>
                    <td className="p-3.5 text-charcoal">
                      {c.maxDiscount ? `₹${c.maxDiscount.toLocaleString("en-IN")}` : "No limit"}
                    </td>
                    <td className="p-3.5 text-charcoal">
                      <div className="flex items-center gap-2">
                        <span>{c.usedCount} / {c.usageLimit}</span>
                        <div className="w-16 bg-background rounded-full h-1.5 overflow-hidden border border-border">
                          <div
                            className="bg-primary h-full"
                            style={{ width: `${Math.min(100, ((c.usedCount || 0) / (c.usageLimit || 100)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => handleToggleStatus(c)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors ${
                          c.status === "active"
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-warm-gray/20 text-warm-gray hover:bg-warm-gray/30"
                        }`}
                        title="Click to toggle status"
                      >
                        {c.status === "active" ? (
                          <>
                            <CheckCircle className="size-3" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="size-3" /> Disabled
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleDelete(c.id, c.code)}
                        className="p-1.5 text-warm-gray hover:text-red-600 rounded hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete coupon"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-surface rounded-2xl border border-border shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-serif font-bold text-charcoal text-lg">Create Promotional Coupon</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-warm-gray hover:text-charcoal cursor-pointer">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-warm-gray font-semibold mb-1">Coupon Code (Uppercase) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DIWALI20 or MONSOON15"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, "") })}
                  className="w-full px-3 py-2 rounded border border-border font-mono font-bold text-primary bg-white focus:outline-none focus:border-primary text-sm uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-warm-gray font-semibold mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded border border-border bg-white text-charcoal font-semibold focus:outline-none focus:border-primary"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-warm-gray font-semibold mb-1">
                    {formData.discountType === "percentage" ? "Discount Percentage (%) *" : "Flat Discount (₹) *"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded border border-border bg-white text-charcoal font-bold focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-warm-gray font-semibold mb-1">Min. Booking Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 for none"
                    value={formData.minBookingAmount}
                    onChange={(e) => setFormData({ ...formData, minBookingAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded border border-border bg-white text-charcoal focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-warm-gray font-semibold mb-1">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 for unlimited"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded border border-border bg-white text-charcoal focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-warm-gray font-semibold mb-1">Usage Limit (Max Uses)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value, 10) || 100 })}
                    className="w-full px-3 py-2 rounded border border-border bg-white text-charcoal focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-warm-gray font-semibold mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded border border-border bg-white text-charcoal font-semibold focus:outline-none focus:border-primary"
                  >
                    <option value="active">Active (Redeemable immediately)</option>
                    <option value="inactive">Disabled / Paused</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-warm-gray font-semibold mb-1">Promotion Description</label>
                <input
                  type="text"
                  placeholder="e.g. 15% discount for monsoon bookings over ₹15,000"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-border bg-white text-charcoal focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border rounded text-warm-gray hover:bg-background font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {saving && <Loader2 className="size-3.5 animate-spin" />} Save & Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
