"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Plus,
  Edit,
  Trash2,
  Maximize,
  Users,
  X,
  Loader2,
  Upload,
  AlertCircle,
  BedDouble,
  RefreshCw,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import type { Room } from "@/types/room";

export default function RoomsManagementPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "Deluxe Room",
    description: "",
    longDescription: "",
    basePrice: 0,
    weekendPrice: 0,
    size: 0,
    maxAdults: 2,
    maxChildren: 0,
    maxOccupancy: 2,
    beds: "",
    amenities: "",
    images: [] as string[],
    status: "available" as Room["status"],
    featured: false,
  });

  const fetchRooms = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const res = await fetch("/api/rooms", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data)) {
        setRooms(data);
      }
    } catch (err) {
      console.error("Failed to load rooms", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const openAddModal = () => {
    setEditingRoom(null);
    setUploadError(null);
    setFormData({
      name: "",
      type: "Deluxe Room",
      description: "",
      longDescription: "",
      basePrice: 0,
      weekendPrice: 0,
      size: 0,
      maxAdults: 2,
      maxChildren: 0,
      maxOccupancy: 2,
      beds: "",
      amenities: "",
      images: [],
      status: "available",
      featured: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setUploadError(null);
    setFormData({
      name: room.name,
      type: room.type,
      description: room.description,
      longDescription: room.longDescription || "",
      basePrice: room.basePrice,
      weekendPrice: room.weekendPrice || room.basePrice,
      size: room.size,
      maxAdults: room.maxAdults,
      maxChildren: room.maxChildren,
      maxOccupancy: room.maxOccupancy,
      beds: room.beds || "1 King Bed",
      amenities: room.amenities?.join(", ") || "",
      images: Array.isArray(room.images) ? room.images : [],
      status: room.status,
      featured: room.featured,
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
            title: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ") || `${formData.name || "Room"} Photo`,
            fileData: base64,
            category: "rooms",
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
      const roomPayload = {
        ...formData,
        basePrice: Number(formData.basePrice),
        weekendPrice: Number(formData.weekendPrice || formData.basePrice),
        size: Number(formData.size),
        maxAdults: Number(formData.maxAdults),
        maxChildren: Number(formData.maxChildren),
        maxOccupancy: Number(formData.maxOccupancy),
        amenities: formData.amenities
          ? formData.amenities.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        images: formData.images,
      };

      const url = editingRoom ? `/api/rooms/${editingRoom.id}` : "/api/rooms";
      const method = editingRoom ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roomPayload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to save room");
      }

      setIsModalOpen(false);
      fetchRooms();
    } catch (err: any) {
      console.error("Failed to save room", err);
      alert(err.message || "Failed to save room");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (roomId: string) => {
    if (!confirm("Are you sure you want to delete this room? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/rooms/${roomId}`, { method: "DELETE" });
      if (res.ok) {
        fetchRooms();
      } else {
        alert("Failed to delete room.");
      }
    } catch (err) {
      console.error("Failed to delete room", err);
      alert("Error deleting room.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Room Types & Villas</h1>
          <p className="text-xs text-warm-gray mt-1">
            Manage resort room inventory, base rates, amenities, and status live from database
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchRooms(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-border bg-surface text-charcoal text-xs font-semibold hover:bg-background transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh rooms"
          >
            <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="size-3.5" /> Add New Room
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-warm-gray gap-2 bg-surface rounded-xl border border-border">
          <Loader2 className="size-5 animate-spin text-primary" /> Loading room inventory...
        </div>
      ) : rooms.length === 0 ? (
        <div className="p-12 text-center text-warm-gray bg-surface rounded-xl border border-border shadow-card">
          <BedDouble className="size-10 mx-auto mb-2 text-warm-gray/40" />
          <p className="font-semibold text-charcoal text-sm">No Rooms Created Yet</p>
          <p className="text-xs text-warm-gray mt-1 max-w-sm mx-auto">
            Click &ldquo;Add New Room&rdquo; to create your first room or villa with uploaded photos.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => {
            const hasCover = Array.isArray(room.images) && room.images.length > 0;
            return (
              <div
                key={room.id}
                className="bg-surface rounded-xl border border-border overflow-hidden shadow-card flex flex-col transition-all hover:shadow-lg"
              >
                <div className="relative aspect-[16/10] bg-warm-gray/10 flex items-center justify-center">
                  {hasCover ? (
                    <Image
                      src={room.images[0]}
                      alt={room.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-warm-gray/50 gap-1">
                      <BedDouble className="size-8" />
                      <span className="text-[11px]">No photo uploaded</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={room.status} />
                  </div>
                  {room.featured && (
                    <div className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow">
                      Featured
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <span className="text-xs font-semibold text-warm-gray uppercase tracking-wider mb-1">
                    {room.type}
                  </span>
                  <h2 className="font-serif text-lg font-bold text-charcoal mb-2">{room.name}</h2>
                  <p className="text-xs text-warm-gray line-clamp-2 mb-4">{room.description}</p>
                  <div className="flex items-center gap-4 text-xs text-warm-gray mb-4">
                    <span className="flex items-center gap-1">
                      <Users className="size-3.5 text-primary" /> Max {room.maxOccupancy} Guests
                    </span>
                    <span className="flex items-center gap-1">
                      <Maximize className="size-3.5 text-primary" /> {room.size} sq ft
                    </span>
                  </div>
                  <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                    <div>
                      <p className="text-xs text-warm-gray">Base Rate / Night</p>
                      <p className="text-lg font-bold text-charcoal">{formatCurrency(room.basePrice)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(room)}
                        className="p-2 rounded border border-border hover:bg-background text-warm-gray hover:text-charcoal cursor-pointer transition-colors"
                        title="Edit Room"
                      >
                        <Edit className="size-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(room.id)}
                        className="p-2 rounded border border-border hover:bg-red-50 text-warm-gray hover:text-red-600 cursor-pointer transition-colors"
                        title="Delete Room"
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface rounded-xl border border-border shadow-2xl max-w-2xl w-full p-6 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="font-serif text-xl font-bold text-charcoal">
                {editingRoom ? "Edit Room Details" : "Add New Room"}
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
                  <label className="block font-semibold text-charcoal mb-1">Room Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:border-primary"
                    placeholder="e.g. Deluxe Forest Suite"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Room Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="Deluxe Room">Deluxe Room</option>
                    <option value="Premium Suite">Premium Suite</option>
                    <option value="Jungle Villa">Jungle Villa</option>
                    <option value="Cottage">Cottage</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Short Description *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:border-primary"
                  placeholder="Summary of room features..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Base Rate (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.basePrice || ""}
                    onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:border-primary"
                    placeholder="e.g. 8500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Weekend Rate (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.weekendPrice || ""}
                    onChange={(e) => setFormData({ ...formData, weekendPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:border-primary"
                    placeholder="e.g. 10500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Size (sq ft)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.size || ""}
                    onChange={(e) => setFormData({ ...formData, size: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:border-primary"
                    placeholder="e.g. 450"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Max Adults</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.maxAdults}
                    onChange={(e) => setFormData({ ...formData, maxAdults: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Max Children</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.maxChildren}
                    onChange={(e) => setFormData({ ...formData, maxChildren: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Room["status"] })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Bed Configuration</label>
                  <input
                    type="text"
                    value={formData.beds}
                    onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:border-primary"
                    placeholder="e.g. 1 King Bed or 2 Twin Beds"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Amenities (comma separated)</label>
                  <input
                    type="text"
                    value={formData.amenities}
                    onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:border-primary"
                    placeholder="WiFi, Air Conditioning, Forest View, Private Pool"
                  />
                </div>
              </div>

              {/* Image Upload Area (No URL input) */}
              <div className="space-y-2 pt-1">
                <label className="block font-semibold text-charcoal">
                  Room Photos (Upload Images)
                </label>

                {uploadError && (
                  <div className="p-2.5 bg-red-50 text-red-700 text-[11px] rounded border border-red-200 flex items-center gap-1.5">
                    <AlertCircle className="size-3.5 shrink-0 text-red-500" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Dropzone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-border rounded-xl p-5 text-center hover:border-primary/50 hover:bg-background/50 transition-colors cursor-pointer bg-background/30"
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
                      <Loader2 className="size-6 animate-spin text-primary" />
                      <p className="font-semibold text-charcoal text-xs">Uploading image(s) to Cloudinary...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 py-1">
                      <div className="p-2.5 rounded-full bg-primary/10 text-primary">
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

                {/* Uploaded Photos Gallery Preview */}
                {formData.images.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-warm-gray font-semibold">
                      <span>Uploaded Photos ({formData.images.length})</span>
                      <span className="text-[10px]">First photo will be used as the cover photo</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                      {formData.images.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="group relative aspect-[4/3] rounded-lg overflow-hidden border border-border bg-background shadow-xs"
                        >
                          <img
                            src={imgUrl}
                            alt={`Room photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {idx === 0 && (
                            <span className="absolute top-1 left-1 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
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
                        className="aspect-[4/3] rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center text-warm-gray hover:text-primary transition-colors cursor-pointer bg-background/20"
                      >
                        <Plus className="size-4 mb-0.5" />
                        <span className="text-[10px] font-semibold">Add More</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured-room"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
                <label htmlFor="featured-room" className="font-semibold text-charcoal cursor-pointer">
                  Feature on Homepage
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border text-charcoal rounded-md hover:bg-background transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {saving && <Loader2 className="size-3.5 animate-spin" />}
                  {editingRoom ? "Save Changes" : "Create Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
