"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Edit, Trash2, Clock, X, Loader2, Check } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import type { Package } from "@/types/package";

export default function PackagesManagementPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    description: "",
    longDescription: "",
    durationNights: 2,
    durationDays: 3,
    price: 32000,
    priceType: "per_couple" as Package["priceType"],
    maxGuests: 2,
    includedRoom: "Deluxe Forest Room",
    whatsIncluded: "Luxury accommodation, Breakfast & Dinner, Wildlife Safari",
    images: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80",
    status: "active" as Package["status"],
    featured: true,
  });

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/packages");
      const data = await res.json();
      if (Array.isArray(data)) {
        setPackages(data);
      }
    } catch (err) {
      console.error("Failed to fetch packages", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const openAddModal = () => {
    setEditingPackage(null);
    setFormData({
      name: "",
      tagline: "",
      description: "",
      longDescription: "",
      durationNights: 2,
      durationDays: 3,
      price: 32000,
      priceType: "per_couple",
      maxGuests: 2,
      includedRoom: "Deluxe Forest Room",
      whatsIncluded: "Luxury accommodation, Breakfast & Dinner, Wildlife Safari",
      images: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80",
      status: "active",
      featured: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      tagline: pkg.tagline || "",
      description: pkg.description,
      longDescription: pkg.longDescription || "",
      durationNights: pkg.durationNights,
      durationDays: pkg.durationDays,
      price: pkg.price,
      priceType: pkg.priceType,
      maxGuests: pkg.maxGuests,
      includedRoom: pkg.includedRoom || "Deluxe Forest Room",
      whatsIncluded: (pkg.whatsIncluded || []).join(", "),
      images: pkg.images.join(", "),
      status: pkg.status,
      featured: pkg.featured,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const packagePayload = {
        ...formData,
        price: Number(formData.price),
        durationNights: Number(formData.durationNights),
        durationDays: Number(formData.durationDays),
        maxGuests: Number(formData.maxGuests),
        whatsIncluded: formData.whatsIncluded.split(",").map((s) => s.trim()).filter(Boolean),
        images: formData.images.split(",").map((s) => s.trim()).filter(Boolean),
      };

      if (editingPackage) {
        await fetch(`/api/packages/${editingPackage.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(packagePayload),
        });
      } else {
        await fetch("/api/packages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(packagePayload),
        });
      }

      setIsModalOpen(false);
      fetchPackages();
    } catch (err) {
      console.error("Failed to save package", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (packageId: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    try {
      await fetch(`/api/packages/${packageId}`, { method: "DELETE" });
      fetchPackages();
    } catch (err) {
      console.error("Failed to delete package", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Resort Packages</h1>
          <p className="text-xs text-warm-gray mt-1">Manage experiential packages, itineraries, and inclusions live in MongoDB</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-accent text-white text-xs font-semibold hover:bg-accent-dark transition-colors cursor-pointer"
        >
          <Plus className="size-3.5" /> Create New Package
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-warm-gray gap-2">
          <Loader2 className="size-5 animate-spin text-accent" /> Loading resort packages...
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-surface rounded-xl border border-border overflow-hidden shadow-card flex flex-col transition-all hover:shadow-lg">
              <div className="relative aspect-[16/10]">
                <Image src={pkg.images[0] || "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80"} alt={pkg.name} fill className="object-cover" />
                <div className="absolute top-3 left-3">
                  <StatusBadge status={pkg.status} />
                </div>
                {pkg.featured && (
                  <div className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow">
                    Featured
                  </div>
                )}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-1 text-xs text-accent font-semibold mb-1">
                  <Clock className="size-3.5" /> {pkg.durationNights} Nights / {pkg.durationDays} Days
                </div>
                <h2 className="font-serif text-lg font-bold text-charcoal mb-1">{pkg.name}</h2>
                <p className="text-xs text-warm-gray line-clamp-2 mb-4">{pkg.description}</p>
                <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                  <div>
                    <p className="text-xs text-warm-gray">Package Price</p>
                    <p className="text-lg font-bold text-charcoal">{formatCurrency(pkg.price)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(pkg)}
                      className="p-2 rounded border border-border hover:bg-background text-warm-gray hover:text-charcoal cursor-pointer"
                      title="Edit Package"
                    >
                      <Edit className="size-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.id)}
                      className="p-2 rounded border border-border hover:bg-red-50 text-warm-gray hover:text-red-600 cursor-pointer"
                      title="Delete Package"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Package Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface rounded-xl border border-border shadow-2xl max-w-2xl w-full p-6 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="font-serif text-xl font-bold text-charcoal">
                {editingPackage ? "Edit Package Details" : "Create New Package"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-warm-gray hover:text-charcoal cursor-pointer">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Package Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:border-accent"
                    placeholder="e.g. Wilderness & Wellness Retreat"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Tagline</label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:border-accent"
                    placeholder="e.g. 3 Days of pure rejuvenation"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Description *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:border-accent"
                  placeholder="Summary of experience..."
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Nights *</label>
                  <input
                    type="number"
                    required
                    value={formData.durationNights}
                    onChange={(e) => setFormData({ ...formData, durationNights: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Days *</label>
                  <input
                    type="number"
                    required
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Total Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Price Type</label>
                  <select
                    value={formData.priceType}
                    onChange={(e) => setFormData({ ...formData, priceType: e.target.value as Package["priceType"] })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:border-accent"
                  >
                    <option value="per_couple">Per Couple</option>
                    <option value="per_person">Per Person</option>
                    <option value="per_group">Per Group</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">What's Included (comma separated)</label>
                <input
                  type="text"
                  value={formData.whatsIncluded}
                  onChange={(e) => setFormData({ ...formData, whatsIncluded: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:border-accent"
                  placeholder="Buffet Breakfast, Candlelight Dinner, Spa Session"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Image URLs (comma separated)</label>
                <input
                  type="text"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="pkg-featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded border-border text-accent focus:ring-accent"
                  />
                  <label htmlFor="pkg-featured" className="font-semibold text-charcoal">Feature on Homepage</label>
                </div>

                <div>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Package["status"] })}
                    className="px-3 py-1.5 border border-border rounded-md bg-background focus:outline-none focus:border-accent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-md border border-border text-warm-gray hover:text-charcoal cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-md bg-accent text-white font-semibold hover:bg-accent-dark cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                  {editingPackage ? "Update Package" : "Create Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
