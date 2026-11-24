"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Plus,
  Edit,
  Trash2,
  Clock,
  X,
  Loader2,
  Check,
  Upload,
  AlertCircle,
  Package as PackageIcon,
  RefreshCw,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import type { Package } from "@/types/package";

export default function PackagesManagementPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    description: "",
    longDescription: "",
    durationNights: 1,
    durationDays: 2,
    price: 0,
    priceType: "per_couple" as Package["priceType"],
    maxGuests: 2,
    includedRoom: "",
    whatsIncluded: "",
    images: [] as string[],
    status: "active" as Package["status"],
    featured: false,
  });

  const fetchPackages = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const res = await fetch("/api/packages", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) {
        setPackages(data);
      }
    } catch (err) {
      console.error("Failed to fetch packages", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const openAddModal = () => {
    setEditingPackage(null);
    setUploadError(null);
    setFormData({
      name: "",
      tagline: "",
      description: "",
      longDescription: "",
      durationNights: 1,
      durationDays: 2,
      price: 0,
      priceType: "per_couple",
      maxGuests: 2,
      includedRoom: "",
      whatsIncluded: "",
      images: [],
      status: "active",
      featured: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: Package) => {
    setEditingPackage(pkg);
    setUploadError(null);
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
      includedRoom: pkg.includedRoom || "",
      whatsIncluded: (pkg.whatsIncluded || []).join(", "),
      images: Array.isArray(pkg.images) ? pkg.images : [],
      status: pkg.status,
      featured: pkg.featured,
    });
    setIsModalOpen(true);
  };

  const handleImageFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);

    try {
      const newUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;

        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const res = await fetch("/api/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ") || `${formData.name || "Package"} Photo`,
            fileData: base64,
            category: "packages",
            fileName: file.name,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Upload failed for ${file.name}`);
        }

        const mediaItem = await res.json();
        if (mediaItem.url) {
          newUrls.push(mediaItem.url);
        }
      }

      if (newUrls.length > 0) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...newUrls],
        }));
      }
    } catch (err: any) {
      console.error("Image upload error:", err);
      setUploadError(err.message || "Failed to upload image(s). Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleImageFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      handleImageFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
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
        whatsIncluded: formData.whatsIncluded
          ? formData.whatsIncluded.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        images: formData.images,
      };

      const url = editingPackage ? `/api/packages/${editingPackage.id}` : "/api/packages";
      const method = editingPackage ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(packagePayload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to save package");
      }

      setIsModalOpen(false);
      fetchPackages();
    } catch (err: any) {
      console.error("Failed to save package", err);
      alert(err.message || "Failed to save package");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (packageId: string) => {
    if (!confirm("Are you sure you want to delete this package? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/packages/${packageId}`, { method: "DELETE" });
      if (res.ok) {
        fetchPackages();
      } else {
        alert("Failed to delete package.");
      }
    } catch (err) {
      console.error("Failed to delete package", err);
      alert("Error deleting package.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Resort Packages</h1>
          <p className="text-xs text-warm-gray mt-1">
            Manage experiential packages, itineraries, and inclusions live in MongoDB
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchPackages(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-border bg-surface text-charcoal text-xs font-semibold hover:bg-background transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh packages"
          >
            <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-accent text-white text-xs font-semibold hover:bg-accent-dark transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="size-3.5" /> Create New Package
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-warm-gray gap-2 bg-surface rounded-xl border border-border">
          <Loader2 className="size-5 animate-spin text-accent" /> Loading resort packages...
        </div>
      ) : packages.length === 0 ? (
        <div className="p-12 text-center text-warm-gray bg-surface rounded-xl border border-border shadow-card">
          <PackageIcon className="size-10 mx-auto mb-2 text-warm-gray/40" />
          <p className="font-semibold text-charcoal text-sm">No Packages Created Yet</p>
          <p className="text-xs text-warm-gray mt-1 max-w-sm mx-auto">
            Click &ldquo;Create New Package&rdquo; to build your first experiential retreat with uploaded photos.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const hasCover = Array.isArray(pkg.images) && pkg.images.length > 0;
            return (
              <div
                key={pkg.id}
                className="bg-surface rounded-xl border border-border overflow-hidden shadow-card flex flex-col transition-all hover:shadow-lg"
              >
                <div className="relative aspect-[16/10] bg-warm-gray/10 flex items-center justify-center">
                  {hasCover ? (
                    <Image
                      src={pkg.images[0]}
                      alt={pkg.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-warm-gray/50 gap-1">
                      <PackageIcon className="size-8" />
                      <span className="text-[11px]">No photo uploaded</span>
                    </div>
                  )}
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
                  {pkg.tagline && <p className="text-xs text-accent font-medium mb-1">{pkg.tagline}</p>}
                  <p className="text-xs text-warm-gray line-clamp-2 mb-4">{pkg.description}</p>
                  <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                    <div>
                      <p className="text-xs text-warm-gray">Package Price</p>
                      <p className="text-lg font-bold text-charcoal">{formatCurrency(pkg.price)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(pkg)}
                        className="p-2 rounded border border-border hover:bg-background text-warm-gray hover:text-charcoal cursor-pointer transition-colors"
                        title="Edit Package"
                      >
                        <Edit className="size-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(pkg.id)}
                        className="p-2 rounded border border-border hover:bg-red-50 text-warm-gray hover:text-red-600 cursor-pointer transition-colors"
                        title="Delete Package"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Package Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface rounded-xl border border-border shadow-2xl max-w-2xl w-full p-6 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="font-serif text-xl font-bold text-charcoal">
                {editingPackage ? "Edit Package Details" : "Create New Package"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-warm-gray hover:text-charcoal cursor-pointer p-1"
              >
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
                    min={1}
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
                    min={1}
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
                    min={0}
                    value={formData.price || ""}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:border-accent"
                    placeholder="e.g. 25000"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Price Type</label>
                  <select
                    value={formData.priceType}
                    onChange={(e) => setFormData({ ...formData, priceType: e.target.value as Package["priceType"] })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="per_couple">Per Couple</option>
                    <option value="per_person">Per Person</option>
                    <option value="per_group">Per Group</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Included Room</label>
                  <input
                    type="text"
                    value={formData.includedRoom}
                    onChange={(e) => setFormData({ ...formData, includedRoom: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:border-accent"
                    placeholder="e.g. Deluxe Forest Room"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Max Guests</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.maxGuests}
                    onChange={(e) => setFormData({ ...formData, maxGuests: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">What's Included (comma separated)</label>
                <input
                  type="text"
                  value={formData.whatsIncluded}
                  onChange={(e) => setFormData({ ...formData, whatsIncluded: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:border-accent"
                  placeholder="e.g. Luxury accommodation, Daily Breakfast & Dinner, Wildlife Safari"
                />
              </div>

              {/* Package Photos File Upload Dropzone */}
              <div className="space-y-2 pt-1">
                <label className="block font-semibold text-charcoal">
                  Package Photos (Upload Images)
                </label>

                {uploadError && (
                  <div className="p-2.5 bg-red-50 text-red-700 text-[11px] rounded border border-red-200 flex items-center gap-1.5">
                    <AlertCircle className="size-3.5 shrink-0 text-red-500" />
                    <span>{uploadError}</span>
                  </div>
                )}

                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-border rounded-xl p-5 text-center hover:border-accent/50 hover:bg-background/50 transition-colors cursor-pointer bg-background/30"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    accept="image/*"
                    className="hidden"
                  />
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <Loader2 className="size-6 animate-spin text-accent" />
                      <p className="font-semibold text-charcoal text-xs">Uploading image(s) to Cloudinary...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 py-1">
                      <div className="p-2.5 rounded-full bg-accent/10 text-accent">
                        <Upload className="size-5" />
                      </div>
                      <p className="font-semibold text-charcoal text-xs">
                        Click or drag &amp; drop photos here to upload
                      </p>
                      <p className="text-[11px] text-warm-gray">
                        Supports JPG, PNG, WEBP, AVIF (Stored securely on Cloudinary)
                      </p>
                    </div>
                  )}
                </div>

                {formData.images.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-warm-gray font-semibold">
                      <span>Uploaded Photos ({formData.images.length})</span>
                      <span className="text-[10px]">First photo will be used as the package cover</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                      {formData.images.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="group relative aspect-[4/3] rounded-lg overflow-hidden border border-border bg-background shadow-xs"
                        >
                          <img
                            src={imgUrl}
                            alt={`Package photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {idx === 0 && (
                            <span className="absolute top-1 left-1 bg-accent text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                              Cover
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(idx);
                            }}
                            className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-80 group-hover:opacity-100 hover:bg-red-600 transition-all cursor-pointer"
                            title="Remove photo"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-[4/3] rounded-lg border-2 border-dashed border-border hover:border-accent/50 flex flex-col items-center justify-center text-warm-gray hover:text-accent transition-colors cursor-pointer bg-background/20"
                      >
                        <Plus className="size-4 mb-0.5" />
                        <span className="text-[10px] font-semibold">Add More</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="pkg-featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded border-border text-accent focus:ring-accent cursor-pointer"
                  />
                  <label htmlFor="pkg-featured" className="font-semibold text-charcoal cursor-pointer">
                    Feature on Homepage
                  </label>
                </div>

                <div>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Package["status"] })}
                    className="px-3 py-1.5 border border-border rounded-md bg-background focus:outline-none focus:border-accent cursor-pointer"
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
                  disabled={saving || uploading}
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
