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
  AlertCircle,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Lock,
  Unlock,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  CalendarDays
} from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";
import type { Room } from "@/types/room";
import type { Booking } from "@/types/booking";

export default function RoomsManagementPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>({
    checkInTime: "12:00 PM",
    checkOutTime: "11:00 AM",
    overstayGraceMinutes: 30,
    overstayHourlyRate: 500,
  });
  const [selectedRoomForSchedule, setSelectedRoomForSchedule] = useState<Room | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
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

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [roomsRes, bookingsRes, settingsRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/rooms`),
        fetch("/api/bookings"),
        fetch(`${API_BASE_URL}/settings?key=site_config`),
      ]);

      if (roomsRes.status === "fulfilled" && roomsRes.value.ok) {
        const data = await roomsRes.value.json();
        if (Array.isArray(data)) setRooms(data);
      }

      if (bookingsRes.status === "fulfilled" && bookingsRes.value.ok) {
        const bData = await bookingsRes.value.json();
        if (Array.isArray(bData)) setBookings(bData);
      }

      if (settingsRes.status === "fulfilled" && settingsRes.value.ok) {
        const sData = await settingsRes.value.json();
        if (sData && typeof sData === "object") {
          setSiteSettings((prev: any) => ({
            ...prev,
            checkInTime: sData.checkInTime || prev.checkInTime,
            checkOutTime: sData.checkOutTime || prev.checkOutTime,
            overstayGraceMinutes: sData.overstayGraceMinutes !== undefined ? Number(sData.overstayGraceMinutes) : prev.overstayGraceMinutes,
            overstayHourlyRate: sData.overstayHourlyRate !== undefined ? Number(sData.overstayHourlyRate) : prev.overstayHourlyRate,
          }));
        }
      }
    } catch (err) {
      console.error("Failed to load room management data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
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

  const calculateOverstay = (booking: Booking, checkoutTimeStr: string, graceMinutes: number, hourlyRate: number) => {
    if (!booking.checkOut) return null;
    let targetHour = 11;
    let targetMinute = 0;
    const match = (checkoutTimeStr || "11:00 AM").match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (match) {
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const ampm = match[3]?.toUpperCase();
      if (ampm === "PM" && h < 12) h += 12;
      if (ampm === "AM" && h === 12) h = 0;
      targetHour = h;
      targetMinute = m;
    }

    const [year, month, day] = booking.checkOut.split("-").map(Number);
    const checkoutDeadline = new Date(year, month - 1, day, targetHour, targetMinute, 0);
    const graceDeadline = new Date(checkoutDeadline.getTime() + (graceMinutes || 30) * 60 * 1000);
    const now = new Date();
    const compareTime = booking.actualCheckOut ? new Date(booking.actualCheckOut) : now;

    if (compareTime > graceDeadline) {
      const diffMs = compareTime.getTime() - checkoutDeadline.getTime();
      const diffHours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
      const charges = diffHours * (hourlyRate || 500);
      return {
        isOverstay: true,
        diffHours,
        charges,
        deadlineStr: checkoutDeadline.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
    }

    return {
      isOverstay: false,
      diffHours: 0,
      charges: 0,
      deadlineStr: checkoutDeadline.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const handleSetRoomStatus = async (roomId: string, newStatus: Room["status"]) => {
    try {
      setActionLoading(true);
      await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      await loadAllData();
      if (selectedRoomForSchedule && selectedRoomForSchedule.id === roomId) {
        setSelectedRoomForSchedule((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err) {
      console.error("Failed to update room status", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckInGuest = async (bookingId: string, roomId: string) => {
    try {
      setActionLoading(true);
      const nowIso = new Date().toISOString();
      await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingStatus: "checked-in",
          actualCheckIn: nowIso,
          actor: "Front Desk Admin",
        }),
      });
      await handleSetRoomStatus(roomId, "occupied");
      await loadAllData();
    } catch (err) {
      console.error("Failed to check in guest", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOutGuest = async (bookingId: string, roomId: string, overstayHours: number, overstayCharges: number) => {
    const confirmMsg = overstayCharges > 0
      ? `Guest has overstayed by ${overstayHours} hour(s).\nOverstay fee: ${formatCurrency(overstayCharges)}.\nConfirm check-out and send room to housekeeping?`
      : "Confirm guest check-out and set room status to 'Needs Cleaning'?";

    if (!confirm(confirmMsg)) return;

    try {
      setActionLoading(true);
      const nowIso = new Date().toISOString();
      await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingStatus: "checked-out",
          actualCheckOut: nowIso,
          overstayHours,
          overstayCharges,
          actor: "Front Desk Admin",
        }),
      });
      await handleSetRoomStatus(roomId, "cleaning");
      await loadAllData();
    } catch (err) {
      console.error("Failed to check out guest", err);
    } finally {
      setActionLoading(false);
    }
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
        images: formData.images.split(",").map((s) => s.trim()).filter(Boolean).length > 0
          ? formData.images.split(",").map((s) => s.trim()).filter(Boolean)
          : ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"],
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
      loadAllData();
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
      loadAllData();
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
          {rooms.map((room) => {
            const roomBookings = bookings.filter((b) => b.roomId === room.id && b.bookingStatus !== "cancelled");
            const todayStr = new Date().toISOString().split("T")[0];
            const activeBooking = roomBookings.find(
              (b) => b.bookingStatus === "checked-in" || (b.bookingStatus === "confirmed" && todayStr >= b.checkIn && todayStr <= b.checkOut)
            );
            return (
              <div 
                key={room.id} 
                onClick={() => setSelectedRoomForSchedule(room)}
                className="bg-surface rounded-xl border border-border overflow-hidden shadow-card flex flex-col transition-all hover:shadow-xl hover:border-primary/40 cursor-pointer group"
              >
                <div className="relative aspect-[16/10]">
                  <Image src={room.images[0] || "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"} alt={room.name} fill className="object-cover" />
                  <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                    <StatusBadge status={room.status} />
                    {activeBooking && (
                      <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                        <Lock className="size-2.5" /> Locked to {formatDate(activeBooking.checkOut)}
                      </span>
                    )}
                    {room.status === "cleaning" && (
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                        <Sparkles className="size-2.5" /> Cleaning
                      </span>
                    )}
                  </div>
                  {room.featured && (
                    <div className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow">
                      Featured
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-full bg-white/95 text-charcoal font-bold text-xs shadow-md flex items-center gap-1.5">
                      <Clock className="size-3.5 text-primary" /> View Live Schedule & Status
                    </span>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-semibold text-warm-gray uppercase tracking-wider">{room.type}</span>
                    {activeBooking ? (
                      <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {activeBooking.guestDetails.firstName} {activeBooking.guestDetails.lastName}
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Available
                      </span>
                    )}
                  </div>
                  <h2 className="font-serif text-lg font-bold text-charcoal mb-2 group-hover:text-primary transition-colors">{room.name}</h2>
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
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
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
            );
          })}
        </div>
      )}

      {/* Live Room Schedule & Occupancy Drawer */}
      {selectedRoomForSchedule && (() => {
        const room = selectedRoomForSchedule;
        const roomBookings = bookings.filter((b) => b.roomId === room.id && b.bookingStatus !== "cancelled");
        const todayStr = new Date().toISOString().split("T")[0];
        const activeBooking = roomBookings.find(
          (b) => b.bookingStatus === "checked-in" || (b.bookingStatus === "confirmed" && todayStr >= b.checkIn && todayStr <= b.checkOut)
        );
        const upcomingBookings = roomBookings
          .filter((b) => b.checkIn > todayStr && b.bookingStatus !== "completed" && b.bookingStatus !== "checked-out")
          .sort((a, b) => a.checkIn.localeCompare(b.checkIn));
        
        const overstayInfo = activeBooking
          ? calculateOverstay(
              activeBooking,
              siteSettings.checkOutTime || "11:00 AM",
              siteSettings.overstayGraceMinutes || 30,
              siteSettings.overstayHourlyRate || 500
            )
          : null;

        return (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedRoomForSchedule(null)}
          >
            <div
              className="relative bg-white rounded-2xl border border-border shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 my-8 z-10 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-xl font-bold text-charcoal">{room.name}</h2>
                    <StatusBadge status={room.status} />
                  </div>
                  <p className="text-xs text-warm-gray mt-1">
                    {room.type} • Base Rate: {formatCurrency(room.basePrice)}/night • Max {room.maxOccupancy} Guests
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRoomForSchedule(null)}
                  className="size-8 rounded-lg flex items-center justify-center text-warm-gray hover:text-charcoal hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Current Occupancy & Lock Status Card */}
              <div className="p-4 rounded-xl border border-border bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-charcoal text-xs flex items-center gap-1.5">
                    <CalendarDays className="size-4 text-primary" /> Live Occupancy & Lock Information
                  </span>
                  {activeBooking ? (
                    <span className="bg-rose-100 text-rose-800 border border-rose-200 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock className="size-3" /> Locked until {formatDate(activeBooking.checkOut)}
                    </span>
                  ) : room.status === "cleaning" ? (
                    <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="size-3" /> Under Housekeeping
                    </span>
                  ) : room.status === "maintenance" ? (
                    <span className="bg-slate-200 text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock className="size-3" /> Maintenance Hold
                    </span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="size-3" /> Currently Available
                    </span>
                  )}
                </div>

                {activeBooking ? (
                  <div className="bg-white rounded-lg p-4 border border-border shadow-xs space-y-3">
                    <div className="flex justify-between items-start border-b border-border pb-2.5">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-warm-gray tracking-wider">Current Guest</p>
                        <p className="text-sm font-bold text-charcoal flex items-center gap-1.5 mt-0.5">
                          <User className="size-3.5 text-primary" />
                          {activeBooking.guestDetails.firstName} {activeBooking.guestDetails.lastName}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                          #{activeBooking.bookingNumber}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-warm-gray block">Contact Info</span>
                        <p className="text-charcoal font-medium">{activeBooking.guestDetails.phone}</p>
                        <p className="text-warm-gray text-[11px] truncate">{activeBooking.guestDetails.email}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-warm-gray block">Occupancy & Plan</span>
                        <p className="text-charcoal font-medium">
                          {activeBooking.adults} Adults, {activeBooking.children} Children
                        </p>
                        <p className="text-warm-gray text-[11px]">{activeBooking.nights} night(s) stay</p>
                      </div>
                    </div>

                    {/* In-Time & Out-Time Timestamps */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border text-xs">
                      <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-warm-gray flex items-center gap-1">
                          <Clock className="size-3 text-primary" /> Check-in (In-Time)
                        </span>
                        <p className="text-charcoal font-semibold mt-1">
                          {formatDate(activeBooking.checkIn)}
                        </p>
                        <p className="text-[11px] text-warm-gray">
                          Slot: {activeBooking.estimatedCheckInTime || siteSettings.checkInTime || "12:00 PM"}
                        </p>
                        <p className="text-[10px] text-emerald-700 font-medium mt-1">
                          {activeBooking.actualCheckIn
                            ? `Actual In: ${new Date(activeBooking.actualCheckIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                            : "Not marked checked-in yet"}
                        </p>
                      </div>

                      <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-warm-gray flex items-center gap-1">
                          <Clock className="size-3 text-primary" /> Check-out (Out-Time)
                        </span>
                        <p className="text-charcoal font-semibold mt-1">
                          {formatDate(activeBooking.checkOut)}
                        </p>
                        <p className="text-[11px] text-warm-gray">
                          Standard: {siteSettings.checkOutTime || "11:00 AM"}
                        </p>
                        <p className="text-[10px] text-charcoal font-medium mt-1">
                          {activeBooking.actualCheckOut
                            ? `Actual Out: ${new Date(activeBooking.actualCheckOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                            : "Currently residing"}
                        </p>
                      </div>
                    </div>

                    {/* Overstay Alert & Calculation */}
                    {overstayInfo && overstayInfo.isOverstay && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs space-y-1">
                        <div className="flex items-center gap-2 text-red-700 font-bold">
                          <AlertTriangle className="size-4 shrink-0 text-red-600" />
                          <span>Overstay Alert: Exceeded check-out threshold!</span>
                        </div>
                        <p className="text-red-800 text-[11px]">
                          Guest exceeded scheduled check-out ({overstayInfo.deadlineStr}) by <b>{overstayInfo.diffHours} billable hour(s)</b>.
                        </p>
                        <p className="text-red-900 font-bold text-xs pt-1">
                          Hourly Overstay Charge: +{formatCurrency(overstayInfo.charges)} ({overstayInfo.diffHours} hrs × {formatCurrency(siteSettings.overstayHourlyRate || 500)}/hr)
                        </p>
                      </div>
                    )}

                    {/* Action Buttons for Active Booking */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                      {activeBooking.bookingStatus !== "checked-in" && (
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleCheckInGuest(activeBooking.id, room.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Check className="size-3.5" /> Check In Guest (Record In-Time)
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() =>
                          handleCheckOutGuest(
                            activeBooking.id,
                            room.id,
                            overstayInfo?.diffHours || 0,
                            overstayInfo?.charges || 0
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-charcoal hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Unlock className="size-3.5" /> Check Out Guest & Send to Cleaning
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 bg-white rounded-lg border border-dashed border-slate-200">
                    <p className="text-xs text-warm-gray">No guest is currently occupying this room today.</p>
                  </div>
                )}
              </div>

              {/* Room Status Override & Housekeeping Controls */}
              <div className="p-4 rounded-xl border border-border bg-white space-y-3">
                <p className="font-semibold text-charcoal text-xs">Room Readiness & Housekeeping Actions</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {room.status === "cleaning" && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleSetRoomStatus(room.id, "available")}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Sparkles className="size-4" /> Mark Cleaned & Set to Available
                    </button>
                  )}

                  {room.status !== "available" && room.status !== "cleaning" && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleSetRoomStatus(room.id, "available")}
                      className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-charcoal font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <Unlock className="size-3.5 text-emerald-600" /> Reset Status to Available
                    </button>
                  )}

                  {room.status !== "cleaning" && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleSetRoomStatus(room.id, "cleaning")}
                      className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-charcoal font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="size-3.5 text-amber-600" /> Send to Housekeeping
                    </button>
                  )}

                  {room.status !== "maintenance" ? (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleSetRoomStatus(room.id, "maintenance")}
                      className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-charcoal font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <Lock className="size-3.5 text-slate-500" /> Lock for Maintenance
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleSetRoomStatus(room.id, "available")}
                      className="px-3 py-2 rounded-lg border border-border hover:bg-slate-50 text-charcoal font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <Unlock className="size-3.5 text-emerald-600" /> End Maintenance
                    </button>
                  )}
                </div>
              </div>

              {/* Upcoming Reservations List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-charcoal text-xs">Upcoming Bookings for this Room ({upcomingBookings.length})</h3>
                  <span className="text-[10px] text-warm-gray">Auto-synced from reservations</span>
                </div>

                {upcomingBookings.length === 0 ? (
                  <p className="text-xs text-warm-gray italic py-2">No upcoming bookings scheduled for this room.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {upcomingBookings.map((bk) => (
                      <div key={bk.id} className="p-3 rounded-lg border border-border bg-slate-50/50 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-charcoal">
                            {bk.guestDetails.firstName} {bk.guestDetails.lastName}{" "}
                            <span className="text-warm-gray font-normal text-[11px]">({bk.adults}A, {bk.children}C)</span>
                          </p>
                          <p className="text-warm-gray text-[11px] mt-0.5">
                            {formatDate(bk.checkIn)} → {formatDate(bk.checkOut)} ({bk.nights} nights)
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-[11px] text-primary font-bold">#{bk.bookingNumber}</span>
                          <p className="text-[10px] text-emerald-600 font-semibold">{bk.paymentStatus.toUpperCase()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

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
