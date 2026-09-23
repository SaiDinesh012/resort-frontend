"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Edit, Trash2, Maximize, Users, X, Loader2, Check } from "lucide-react";
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface rounded-xl border border-border shadow-2xl max-w-2xl w-full p-6 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="font-serif text-xl font-bold text-charcoal">
                {editingRoom ? "Edit Room Details" : "Add New Room"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-warm-gray hover:text-charcoal cursor-pointer">
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
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:border-primary"
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
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Weekend Rate (₹)</label>
                  <input
                    type="number"
                    value={formData.weekendPrice}
                    onChange={(e) => setFormData({ ...formData, weekendPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Size (sq ft)</label>
                  <input
                    type="number"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Max Adults</label>
                  <input
                    type="number"
                    value={formData.maxAdults}
                    onChange={(e) => setFormData({ ...formData, maxAdults: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1">Max Children</label>
                  <input
                    type="number"
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
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:border-primary"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
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

              <div>
                <label className="block font-semibold text-charcoal mb-1">Image URLs (comma separated)</label>
                <input
                  type="text"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:border-primary"
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="featured" className="font-semibold text-charcoal">Feature on Homepage</label>
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
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-md bg-primary text-white font-semibold hover:bg-primary-dark cursor-pointer disabled:opacity-50"
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
