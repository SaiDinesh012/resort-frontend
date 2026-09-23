"use client";

import { useState, useEffect } from "react";
import { Tag, Plus, CheckCircle, XCircle, Trash2, Loader2, X } from "lucide-react";

interface Coupon {
  code: string;
  type: "Percentage" | "Flat";
  discount: string;
  discountValue: number;
  minBooking: number;
  maxDiscount?: number;
  usage: string;
  status: "Active" | "Inactive";
}

export default function MarketingPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    type: "Percentage" as "Percentage" | "Flat",
    discountValue: 10,
    minBooking: 5000,
    maxDiscount: 2000,
    usageLimit: 100,
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings?key=marketing_coupons");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCoupons(data);
      } else {
        setCoupons([]);
      }
    } catch (err) {
      console.error("Failed to load coupons", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const saveCouponsToDb = async (updated: Coupon[]) => {
    try {
      setSaving(true);
      await fetch("/api/settings?key=marketing_coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      setCoupons(updated);
    } catch (err) {
      console.error("Failed to save coupons", err);
      alert("Error saving coupons to database.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedDiscount =
      formData.type === "Percentage" ? `${formData.discountValue}%` : `₹${formData.discountValue.toLocaleString()}`;

    const newCoupon: Coupon = {
      code: formData.code.toUpperCase().trim(),
      type: formData.type,
      discount: formattedDiscount,
      discountValue: Number(formData.discountValue),
      minBooking: Number(formData.minBooking),
      maxDiscount: formData.type === "Percentage" ? Number(formData.maxDiscount) : Number(formData.discountValue),
      usage: `0 / ${formData.usageLimit}`,
      status: "Active",
    };

    const updated = [...coupons.filter((c) => c.code !== newCoupon.code), newCoupon];
    await saveCouponsToDb(updated);
    setIsModalOpen(false);
    setFormData({
      code: "",
      type: "Percentage",
      discountValue: 10,
      minBooking: 5000,
      maxDiscount: 2000,
      usageLimit: 100,
    });
  };

  const handleDeleteCoupon = async (code: string) => {
    if (!confirm(`Are you sure you want to delete coupon ${code}?`)) return;
    const updated = coupons.filter((c) => c.code !== code);
    await saveCouponsToDb(updated);
  };

  const handleToggleStatus = async (code: string) => {
    const updated = coupons.map((c) =>
      c.code === code ? { ...c, status: c.status === "Active" ? ("Inactive" as const) : ("Active" as const) } : c
    );
    await saveCouponsToDb(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Marketing & Coupons</h1>
          <p className="text-xs text-warm-gray mt-1">Manage promotional discount codes live from MongoDB</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded hover:bg-primary-dark flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="size-3.5" /> Create Coupon
        </button>
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden">
        <div className="p-4 border-b border-border font-serif font-bold text-charcoal text-base flex justify-between items-center">
          <span>Active Promotional Coupons</span>
          {saving && <span className="text-xs text-primary font-sans font-normal">Saving to MongoDB...</span>}
        </div>

        {loading ? (
          <div className="p-12 text-center text-warm-gray flex flex-col items-center gap-2">
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="text-xs">Loading coupons from MongoDB...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center text-warm-gray">
            <Tag className="size-8 mx-auto text-warm-gray/40 mb-2" />
            <p className="font-semibold text-charcoal text-sm">No coupons found in database</p>
            <p className="text-xs mt-1">Click "Create Coupon" above to add your first promotional discount code.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-background border-b border-border text-warm-gray font-semibold uppercase">
                <th className="p-3.5">Coupon Code</th>
                <th className="p-3.5">Discount Type</th>
                <th className="p-3.5">Value</th>
                <th className="p-3.5">Min Booking</th>
                <th className="p-3.5">Usage Limit</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {coupons.map((c) => (
                <tr key={c.code} className="hover:bg-background/50">
                  <td className="p-3.5 font-mono font-bold text-primary">{c.code}</td>
                  <td className="p-3.5">{c.type}</td>
                  <td className="p-3.5 font-bold text-success">{c.discount}</td>
                  <td className="p-3.5">₹{c.minBooking.toLocaleString()}</td>
                  <td className="p-3.5">{c.usage}</td>
                  <td className="p-3.5">
                    <button
                      onClick={() => handleToggleStatus(c.code)}
                      className={`flex items-center gap-1 font-semibold cursor-pointer ${
                        c.status === "Active" ? "text-success" : "text-warm-gray"
                      }`}
                    >
                      {c.status === "Active" ? <CheckCircle className="size-3.5" /> : <XCircle className="size-3.5" />}
                      {c.status}
                    </button>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleDeleteCoupon(c.code)}
                      className="text-error hover:text-red-700 transition-colors p-1 cursor-pointer"
                      title="Delete Coupon"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl border border-border max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h2 className="font-serif text-lg font-bold text-charcoal">Create New Coupon</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-warm-gray hover:text-charcoal cursor-pointer">
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCoupon} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-warm-gray font-semibold mb-1 uppercase">Coupon Code</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. SUMMER25"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded border border-border font-mono font-bold uppercase text-charcoal bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-warm-gray font-semibold mb-1 uppercase">Discount Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded border border-border text-charcoal bg-background"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-warm-gray font-semibold mb-1 uppercase">
                    Value {formData.type === "Percentage" ? "(%)" : "(₹)"}
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded border border-border text-charcoal bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-warm-gray font-semibold mb-1 uppercase">Min Booking (₹)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.minBooking}
                    onChange={(e) => setFormData({ ...formData, minBooking: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded border border-border text-charcoal bg-background"
                  />
                </div>
                <div>
                  <label className="block text-warm-gray font-semibold mb-1 uppercase">Usage Limit</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded border border-border text-charcoal bg-background"
                  />
                </div>
              </div>

              {formData.type === "Percentage" && (
                <div>
                  <label className="block text-warm-gray font-semibold mb-1 uppercase">Max Discount Cap (₹)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded border border-border text-charcoal bg-background"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border rounded text-charcoal hover:bg-background"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-white rounded font-semibold hover:bg-primary-dark"
                >
                  {saving ? "Saving..." : "Save Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
