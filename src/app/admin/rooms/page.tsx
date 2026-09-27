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
  Check, 
  UploadCloud, 
  Star, 
  AlertCircle 
} from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";
import type { Room } from "@/types/room";

export default function RoomsManagementPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [saving, setSaving] = useState(false);

  // Cloudinary upload states
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [newUrlInput, setNewUrlInput] = useState("");
  const [showRawUrlInput, setShowRawUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "Deluxe Room",
    description: "",
    longDescription: "",
    basePrice: 8500,
    weekendPrice: 10500,
    size: 450,
    maxAdults: 2,
    maxChildren: 1,
    maxOccupancy: 3,
    beds: "1 King Bed",
    amenities: "WiFi, Air Conditioning, Forest View, Balcony",
    images: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80",
    status: "available" as Room["status"],
    featured: false,
  });

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/rooms`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setRooms(data);
      }
    } catch (err) {
      console.error("Failed to load rooms", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const openAddModal = () => {
    setEditingRoom(null);
    setUploadError(null);
    setNewUrlInput("");
    setShowRawUrlInput(false);
    setFormData({
      name: "",
      type: "Deluxe Room",
      description: "",
      longDescription: "",
      basePrice: 8500,
      weekendPrice: 10500,
      size: 450,
      maxAdults: 2,
      maxChildren: 1,
      maxOccupancy: 3,
      beds: "1 King Bed",
      amenities: "WiFi, Air Conditioning, Forest View, Balcony",
      images: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80",
      status: "available",
      featured: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setUploadError(null);
    setNewUrlInput("");
    setShowRawUrlInput(false);
    setFormData({
      name: room.name,
      type: room.type,
      description: room.description,
      longDescription: room.longDescription || "",
      basePrice: room.basePrice,
      weekendPrice: room.weekendPrice,
      size: room.size,
      maxAdults: room.maxAdults,
      maxChildren: room.maxChildren,
      maxOccupancy: room.maxOccupancy,
      beds: room.beds,
      amenities: room.amenities.join(", "),
      images: room.images.join(", "),
      status: room.status,
      featured: room.featured,
    });
    setIsModalOpen(true);
  };

  const uploadFileToCloudinary = async (file: File): Promise<string> => {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });

    const payload = {
      title: `Room - ${formData.name || "Room"} - ${Date.now()}`,
      category: "rooms",
      fileData: base64,
    };

    // Try backend API first, fallback to Next.js API route
    try {
      const res = await fetch(`${API_BASE_URL}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.url) return data.url;
      }
    } catch (err) {
      console.warn("Backend media upload failed, trying Next.js /api/media route...", err);
    }

    const resLocal = await fetch("/api/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const localData = await resLocal.json();
    if (localData?.url) return localData.url;
    throw new Error(localData?.error || "Failed to upload to Cloudinary");
  };

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    setUploadError(null);
    setUploadProgress({ current: 0, total: files.length });

    const newUploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      setUploadProgress({ current: i + 1, total: files.length });
      try {
        const url = await uploadFileToCloudinary(files[i]);
        if (url) newUploadedUrls.push(url);
      } catch (err: any) {
        console.error("Upload error for file:", files[i].name, err);
        setUploadError(`Failed to upload ${files[i].name}: ${err.message || "Unknown error"}`);
      }
    }

    if (newUploadedUrls.length > 0) {
      const currentList = formData.images
        ? formData.images.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      const updated = [...currentList, ...newUploadedUrls];
      setFormData((prev) => ({ ...prev, images: updated.join(", ") }));
    }

    setUploadingImages(false);
    setUploadProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    setUploadError(null);
    setUploadProgress({ current: 0, total: files.length });

    const newUploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      if (!files[i].type.startsWith("image/")) continue;
      setUploadProgress({ current: i + 1, total: files.length });
      try {
        const url = await uploadFileToCloudinary(files[i]);
        if (url) newUploadedUrls.push(url);
      } catch (err: any) {
        console.error("Upload error for file:", files[i].name, err);
        setUploadError(`Failed to upload ${files[i].name}: ${err.message || "Unknown error"}`);
      }
    }

    if (newUploadedUrls.length > 0) {
      const currentList = formData.images
        ? formData.images.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      const updated = [...currentList, ...newUploadedUrls];
      setFormData((prev) => ({ ...prev, images: updated.join(", ") }));
    }

    setUploadingImages(false);
    setUploadProgress(null);
  };

  const handleAddUrl = () => {
    if (!newUrlInput.trim()) return;
    const currentList = formData.images
      ? formData.images.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    const updated = [...currentList, newUrlInput.trim()];
    setFormData((prev) => ({ ...prev, images: updated.join(", ") }));
    setNewUrlInput("");
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const currentList = formData.images
      ? formData.images.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    const updated = currentList.filter((_, idx) => idx !== indexToRemove);
    setFormData((prev) => ({ ...prev, images: updated.join(", ") }));
  };

  const handleSetCoverImage = (indexToCover: number) => {
    const currentList = formData.images
      ? formData.images.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    const target = currentList[indexToCover];
    const rest = currentList.filter((_, idx) => idx !== indexToCover);
    const updated = [target, ...rest];
    setFormData((prev) => ({ ...prev, images: updated.join(", ") }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const roomPayload = {
        ...formData,
        basePrice: Number(formData.basePrice),
        weekendPrice: Number(formData.weekendPrice),
        size: Number(formData.size),
        maxAdults: Number(formData.maxAdults),
        maxChildren: Number(formData.maxChildren),
        maxOccupancy: Number(formData.maxOccupancy),
        amenities: formData.amenities.split(",").map((s) => s.trim()).filter(Boolean),
        images: formData.images.split(",").map((s) => s.trim()).filter(Boolean),
      };

      if (editingRoom) {
        await fetch(`${API_BASE_URL}/rooms/${editingRoom.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(roomPayload),
        });
      } else {
        await fetch(`${API_BASE_URL}/rooms`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(roomPayload),
        });
      }

      setIsModalOpen(false);
      fetchRooms();
    } catch (err) {
      console.error("Failed to save room", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (roomId: string) => {
    if (!confirm("Are you sure you want to delete this room?")) return;
    try {
      await fetch(`${API_BASE_URL}/rooms/${roomId}`, { method: "DELETE" });
      fetchRooms();
    } catch (err) {
      console.error("Failed to delete room", err);
    }
  };

  const imageList = formData.images
    ? formData.images.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Room Types & Villas</h1>
          <p className="text-xs text-warm-gray mt-1">Manage resort room inventory, base rates, amenities, and status live in Express API & MongoDB Atlas</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-colors cursor-pointer"
        >
          <Plus className="size-3.5" /> Add New Room
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-warm-gray gap-2">
          <Loader2 className="size-5 animate-spin text-primary" /> Loading room inventory...
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div key={room.id} className="bg-surface rounded-xl border border-border overflow-hidden shadow-card flex flex-col transition-all hover:shadow-lg">
              <div className="relative aspect-[16/10]">
                <Image src={room.images[0] || "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"} alt={room.name} fill className="object-cover" />
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
                <span className="text-xs font-semibold text-warm-gray uppercase tracking-wider mb-1">{room.type}</span>
                <h2 className="font-serif text-lg font-bold text-charcoal mb-2">{room.name}</h2>
                <p className="text-xs text-warm-gray line-clamp-2 mb-4">{room.description}</p>
                <div className="flex items-center gap-4 text-xs text-warm-gray mb-4">
                  <span className="flex items-center gap-1"><Users className="size-3.5 text-primary" /> Max {room.maxOccupancy} Guests</span>
                  <span className="flex items-center gap-1"><Maximize className="size-3.5 text-primary" /> {room.size} sq ft</span>
                </div>
                <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                  <div>
                    <p className="text-xs text-warm-gray">Base Rate / Night</p>
                    <p className="text-lg font-bold text-charcoal">{formatCurrency(room.basePrice)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(room)}
                      className="p-2 rounded border border-border hover:bg-background text-warm-gray hover:text-charcoal cursor-pointer"
                      title="Edit Room"
                    >
                      <Edit className="size-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(room.id)}
                      className="p-2 rounded border border-border hover:bg-red-50 text-warm-gray hover:text-red-600 cursor-pointer"
                      title="Delete Room"
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="relative bg-white rounded-2xl border border-border shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 my-8 z-10 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-charcoal">
                  {editingRoom ? "Edit Room Details" : "Add New Room"}
                </h2>
                <p className="text-xs text-warm-gray mt-0.5">
                  {editingRoom ? "Update room configuration and live rates" : "Configure a new room type or luxury villa for the resort"}
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)} 
                className="size-8 rounded-lg flex items-center justify-center text-warm-gray hover:text-charcoal hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-charcoal mb-1.5">Room Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-border rounded-lg bg-slate-50/70 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="e.g. Deluxe Forest Suite"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1.5">Room Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-border rounded-lg bg-slate-50/70 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="Deluxe Room">Deluxe Room</option>
                    <option value="Premium Suite">Premium Suite</option>
                    <option value="Jungle Villa">Jungle Villa</option>
                    <option value="Honeymoon Cottage">Honeymoon Cottage</option>
                    <option value="Family Suite">Family Suite</option>
                    <option value="Presidential Suite">Presidential Suite</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1.5">Short Description *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-border rounded-lg bg-slate-50/70 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Summary of room features, ambiance, and view..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-charcoal mb-1.5">Base Rate (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-border rounded-lg bg-slate-50/70 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1.5">Weekend Rate (₹)</label>
                  <input
                    type="number"
                    value={formData.weekendPrice}
                    onChange={(e) => setFormData({ ...formData, weekendPrice: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-border rounded-lg bg-slate-50/70 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1.5">Size (sq ft)</label>
                  <input
                    type="number"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-border rounded-lg bg-slate-50/70 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-charcoal mb-1.5">Max Adults</label>
                  <input
                    type="number"
                    value={formData.maxAdults}
                    onChange={(e) => setFormData({ ...formData, maxAdults: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-border rounded-lg bg-slate-50/70 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1.5">Max Children</label>
                  <input
                    type="number"
                    value={formData.maxChildren}
                    onChange={(e) => setFormData({ ...formData, maxChildren: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-border rounded-lg bg-slate-50/70 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1.5">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Room["status"] })}
                    className="w-full px-3.5 py-2.5 border border-border rounded-lg bg-slate-50/70 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1.5">Amenities (comma separated)</label>
                <input
                  type="text"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-border rounded-lg bg-slate-50/70 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="WiFi, Air Conditioning, Forest View, Private Pool"
                />
              </div>

              {/* Room Images & Cloudinary Upload */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-charcoal text-xs">
                    Room Images <span className="text-warm-gray font-normal">({imageList.length} {imageList.length === 1 ? "image" : "images"})</span>
                  </label>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-medium border border-emerald-200">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Cloudinary Live
                  </div>
                </div>

                {/* Cloudinary Drag & Drop Box */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                    isDragging
                      ? "border-primary bg-primary/5 scale-[0.99]"
                      : "border-slate-300 hover:border-primary hover:bg-slate-50/70 bg-slate-50/40"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFilesSelected}
                    multiple
                    accept="image/*"
                    className="hidden"
                  />

                  {uploadingImages ? (
                    <div className="py-2 flex flex-col items-center gap-2">
                      <Loader2 className="size-7 text-primary animate-spin" />
                      <p className="font-semibold text-charcoal text-xs">
                        Uploading to Cloudinary... {uploadProgress ? `(${uploadProgress.current}/${uploadProgress.total})` : ""}
                      </p>
                      <p className="text-[11px] text-warm-gray">Optimizing and storing high-resolution image securely</p>
                    </div>
                  ) : (
                    <>
                      <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <UploadCloud className="size-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-charcoal text-xs">
                          <span className="text-primary hover:underline">Click to upload</span> or drag and drop images
                        </p>
                        <p className="text-[11px] text-warm-gray mt-0.5">
                          PNG, JPG, WEBP • Uploads directly to Cloudinary resort album
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {uploadError && (
                  <div className="text-[11px] text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-lg flex items-center gap-2">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Thumbnail Gallery & Reordering */}
                {imageList.length > 0 && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {imageList.map((url, idx) => {
                        const isCover = idx === 0;
                        const isCloudinary = url.includes("cloudinary.com");
                        return (
                          <div
                            key={idx}
                            className={`group relative rounded-lg border overflow-hidden aspect-[4/3] bg-slate-100 flex flex-col justify-between transition-all ${
                              isCover ? "ring-2 ring-primary border-primary shadow-sm" : "border-border hover:shadow"
                            }`}
                          >
                            <img
                              src={url}
                              alt={`Room image ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80";
                              }}
                            />

                            {/* Badges / Cover Action */}
                            <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 z-10">
                              {isCover ? (
                                <span className="bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                                  <Star className="size-2.5 fill-white" /> Cover
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetCoverImage(idx);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 hover:bg-primary text-white text-[9px] font-medium px-1.5 py-0.5 rounded backdrop-blur-xs flex items-center gap-0.5 cursor-pointer"
                                  title="Set as Cover Image"
                                >
                                  <Star className="size-2.5" /> Make Cover
                                </button>
                              )}
                              {isCloudinary && (
                                <span className="bg-emerald-600/90 text-white text-[8px] font-semibold px-1 py-0.5 rounded shadow-xs w-fit">
                                  Cloudinary
                                </span>
                              )}
                            </div>

                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage(idx);
                              }}
                              className="absolute top-1.5 right-1.5 size-6 rounded-full bg-red-600/90 hover:bg-red-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow cursor-pointer z-10"
                              title="Remove image"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-warm-gray">
                      ★ The first image is the cover displayed in booking cards. Hover over any photo and click &ldquo;Make Cover&rdquo; to reorder.
                    </p>
                  </div>
                )}

                {/* Direct URL input option */}
                <div className="pt-1">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newUrlInput}
                      onChange={(e) => setNewUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddUrl();
                        }
                      }}
                      placeholder="Or paste external image URL (Unsplash, CDN)..."
                      className="flex-1 px-3 py-2 border border-border rounded-lg bg-slate-50/70 focus:bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={handleAddUrl}
                      className="px-3 py-2 border border-border rounded-lg bg-slate-100 hover:bg-slate-200 text-charcoal text-xs font-semibold cursor-pointer transition-colors"
                    >
                      + Add URL
                    </button>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowRawUrlInput(!showRawUrlInput)}
                      className="text-[11px] text-warm-gray hover:text-primary underline cursor-pointer"
                    >
                      {showRawUrlInput ? "Hide raw URLs" : "Edit raw URLs directly"}
                    </button>
                  </div>

                  {showRawUrlInput && (
                    <div className="mt-2">
                      <textarea
                        rows={2}
                        value={formData.images}
                        onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-slate-50/70 focus:bg-white text-[11px] font-mono text-charcoal focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="Comma-separated image URLs"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="size-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
                <label htmlFor="featured" className="font-semibold text-charcoal cursor-pointer text-xs">
                  Feature this room on the homepage showcase
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-5 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg border border-border text-xs font-semibold text-warm-gray hover:bg-slate-50 hover:text-charcoal transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-dark shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                  {editingRoom ? "Update Room" : "Create Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
