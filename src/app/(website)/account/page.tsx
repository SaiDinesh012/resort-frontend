"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Calendar,
  History,
  XCircle,
  Download,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Shield,
  CreditCard,
  Printer,
  Search,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Clock,
  Sparkles,
  Edit3,
  RefreshCw,
  X,
  FileText,
  HelpCircle,
  LogOut,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useSiteSettings } from "@/context/SettingsContext";
import { SITE_NAME, SITE_PHONE, SITE_EMAIL, SITE_ADDRESS } from "@/lib/constants";

interface GuestDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  specialRequests?: string;
}

interface PriceBreakdown {
  basePrice: number;
  nights: number;
  subtotal: number;
  taxAmount: number;
  taxRate?: number;
  discountAmount?: number;
  total: number;
}

interface BookingItem {
  id: string;
  bookingNumber: string;
  type?: "room" | "package";
  roomId?: string;
  roomName?: string;
  packageId?: string;
  packageName?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  guestDetails: GuestDetails;
  priceBreakdown: PriceBreakdown;
  paymentStatus: "paid" | "pending" | "failed" | "refunded" | "partial";
  paymentMethod?: string;
  bookingStatus: "confirmed" | "pending" | "cancelled" | "completed" | "no-show";
  notes?: string;
  timeline?: {
    timestamp: string;
    event: string;
    description: string;
    actor?: string;
  }[];
  createdAt?: string;
}

interface CustomerItem {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city?: string;
  country?: string;
  address?: string;
  totalBookings: number;
  totalSpend: number;
}

export default function AccountPage() {
  const { settings } = useSiteSettings();
  const siteName = settings.siteName || SITE_NAME;

  // Active Tab
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "cancelled" | "profile">("upcoming");

  // State
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [activeCustomer, setActiveCustomer] = useState<CustomerItem | null>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);

  // Lookup / Switch Guest Modal
  const [isLookupModalOpen, setIsLookupModalOpen] = useState(false);
  const [lookupQuery, setLookupQuery] = useState("");
  const [lookupError, setLookupError] = useState("");
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [liveBookings, setLiveBookings] = useState<BookingItem[]>([]);
  const [allSystemBookings, setAllSystemBookings] = useState<BookingItem[]>([]);
  const [activeModalTab, setActiveModalTab] = useState<"all" | "bookings" | "guests">("all");

  // Invoice Modal
  const [invoiceBooking, setInvoiceBooking] = useState<BookingItem | null>(null);

  // Booking Details Modal
  const [detailsBooking, setDetailsBooking] = useState<BookingItem | null>(null);

  // Edit Profile Form State
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    country: "India",
    address: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");

  // Copy booking ID feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Cancellation state
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Fetch initial data
  const loadAccountData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Customers
      const custRes = await fetch("/api/customers");
      let custList: CustomerItem[] = [];
      if (custRes.ok) {
        custList = await custRes.json();
        setCustomers(custList);
      }

      // 2. Fetch Bookings
      const bookRes = await fetch("/api/bookings");
      let allBookings: BookingItem[] = [];
      if (bookRes.ok) {
        allBookings = await bookRes.json();
        setAllSystemBookings(allBookings);
      }

      // 3. Determine Active Customer
      // Check localStorage for previously used guest email
      const savedEmail = typeof window !== "undefined" ? localStorage.getItem("resort_guest_email") : null;
      let matchedCust = custList.find(
        (c) => c.email && savedEmail && c.email.toLowerCase() === savedEmail.toLowerCase()
      );

      // If not in storage, match against latest booking's guestDetails
      if (!matchedCust && allBookings.length > 0) {
        const latestBooking = allBookings[0];
        if (latestBooking.guestDetails?.email) {
          matchedCust = custList.find(
            (c) => c.email?.toLowerCase() === latestBooking.guestDetails.email.toLowerCase()
          );

          if (!matchedCust) {
            matchedCust = {
              id: `cust-${Date.now()}`,
              firstName: latestBooking.guestDetails.firstName || "Guest",
              lastName: latestBooking.guestDetails.lastName || "User",
              email: latestBooking.guestDetails.email,
              phone: latestBooking.guestDetails.phone || "",
              city: latestBooking.guestDetails.city || "",
              country: latestBooking.guestDetails.country || "India",
              address: latestBooking.guestDetails.address || "",
              totalBookings: 1,
              totalSpend: latestBooking.priceBreakdown?.total || 0,
            };
          }
        }
      }

      // Fallback to first customer in list
      if (!matchedCust && custList.length > 0) {
        matchedCust = custList[0];
      }

      // Final default if database is empty
      if (!matchedCust) {
        matchedCust = {
          id: "cust-default",
          firstName: "Arjun",
          lastName: "Sharma",
          email: "arjun.sharma@example.com",
          phone: "+91 98765 43210",
          city: "Bengaluru",
          country: "India",
          address: "Indiranagar 100ft Road",
          totalBookings: 0,
          totalSpend: 0,
        };
      }

      setActiveCustomer(matchedCust);
      setProfileForm({
        firstName: matchedCust.firstName || "",
        lastName: matchedCust.lastName || "",
        email: matchedCust.email || "",
        phone: matchedCust.phone || "",
        city: matchedCust.city || "",
        country: matchedCust.country || "India",
        address: matchedCust.address || "",
      });

      // Filter bookings for this guest
      filterBookingsForCustomer(matchedCust.email, allBookings);
    } catch (err) {
      console.error("Error loading account data:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterBookingsForCustomer = (guestEmail: string, allBookings: BookingItem[]) => {
    if (!guestEmail) {
      setBookings(allBookings);
      return;
    }

    const guestLower = guestEmail.toLowerCase().trim();
    const guestBookings = allBookings.filter(
      (b) => b.guestDetails?.email?.toLowerCase().trim() === guestLower
    );

    // If customer has bookings, show them; otherwise show all available bookings
    if (guestBookings.length > 0) {
      setBookings(guestBookings);
    } else {
      setBookings(allBookings);
    }
  };

  useEffect(() => {
    loadAccountData();
  }, []);

  // Switch to another customer
  const handleSwitchCustomer = (cust: CustomerItem) => {
    setActiveCustomer(cust);
    if (typeof window !== "undefined") {
      localStorage.setItem("resort_guest_email", cust.email);
    }
    setProfileForm({
      firstName: cust.firstName || "",
      lastName: cust.lastName || "",
      email: cust.email || "",
      phone: cust.phone || "",
      city: cust.city || "",
      country: cust.country || "India",
      address: cust.address || "",
    });
    // Refetch bookings for this email
    fetch(`/api/bookings?email=${encodeURIComponent(cust.email)}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBookings(data);
        } else {
          // If none specifically by email, reload all
          fetch("/api/bookings")
            .then((r) => r.json())
            .then((all) => setBookings(Array.isArray(all) ? all : []));
        }
      });
    setIsLookupModalOpen(false);
  };

  // Live search debounced
  useEffect(() => {
    if (!isLookupModalOpen) return;
    const trimmed = lookupQuery.trim();
    if (!trimmed) {
      setLiveBookings([]);
      setIsSearchingLive(false);
      setLookupError("");
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearchingLive(true);
        setLookupError("");
        const res = await fetch(`/api/bookings?search=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          setLiveBookings(Array.isArray(data) ? data : []);
        } else {
          setLiveBookings([]);
        }
      } catch (err) {
        console.error("Live search error:", err);
      } finally {
        setIsSearchingLive(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [lookupQuery, isLookupModalOpen]);

  // Select a specific booking
  const handleSelectBooking = (b: BookingItem, openDetails = false) => {
    const guestEmail = b.guestDetails?.email;
    const matchedCust = customers.find(
      (c) => c.email && guestEmail && c.email.toLowerCase() === guestEmail.toLowerCase()
    ) || {
      id: `cust-${Date.now()}`,
      firstName: b.guestDetails?.firstName || "Guest",
      lastName: b.guestDetails?.lastName || "User",
      email: b.guestDetails?.email || "",
      phone: b.guestDetails?.phone || "",
      city: b.guestDetails?.city || "",
      country: b.guestDetails?.country || "India",
      address: b.guestDetails?.address || "",
      totalBookings: 1,
      totalSpend: b.priceBreakdown?.total || 0,
    };

    setActiveCustomer(matchedCust);
    if (typeof window !== "undefined" && matchedCust.email) {
      localStorage.setItem("resort_guest_email", matchedCust.email);
    }
    setProfileForm({
      firstName: matchedCust.firstName || "",
      lastName: matchedCust.lastName || "",
      email: matchedCust.email || "",
      phone: matchedCust.phone || "",
      city: matchedCust.city || "",
      country: matchedCust.country || "India",
      address: matchedCust.address || "",
    });

    if (guestEmail) {
      fetch(`/api/bookings?email=${encodeURIComponent(guestEmail)}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setBookings(data);
          } else {
            setBookings([b]);
          }
        });
    } else {
      setBookings([b]);
    }

    setIsLookupModalOpen(false);
    if (openDetails) {
      setDetailsBooking(b);
    }
  };

  // Sign out / forget current guest session
  const handleSignOutGuest = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("resort_guest_email");
    }
    setActiveCustomer(null);
    setBookings([]);
    setLookupQuery("");
    setLiveBookings([]);
    setIsLookupModalOpen(false);
  };

  // Search by Email or Booking Reference
  const handleLookupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = lookupQuery.trim();
    if (!q) return;

    // 1. If we already have live booking search results, select the first match
    if (liveBookings.length > 0) {
      handleSelectBooking(liveBookings[0], false);
      return;
    }

    // 2. Check if it matches an in-memory customer
    const matchedByEmail = customers.find(
      (c) =>
        c.email.toLowerCase() === q.toLowerCase() ||
        `${c.firstName} ${c.lastName}`.toLowerCase() === q.toLowerCase()
    );
    if (matchedByEmail) {
      handleSwitchCustomer(matchedByEmail);
      return;
    }

    // 3. Fallback remote query by search term
    try {
      setLookupError("");
      const res = await fetch(`/api/bookings?search=${encodeURIComponent(q)}`);
      if (res.ok) {
        const found = await res.json();
        if (Array.isArray(found) && found.length > 0) {
          handleSelectBooking(found[0], false);
          return;
        }
      }
      setLookupError("No booking or guest account found with this reference or email.");
    } catch (err) {
      setLookupError("Failed to lookup. Please try again.");
    }
  };

  // Save Profile Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCustomer) return;

    try {
      setSavingProfile(true);
      setProfileSuccessMsg("");

      const res = await fetch(`/api/customers/${activeCustomer.id || activeCustomer.email}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });

      if (res.ok) {
        const updated = await res.json();
        setActiveCustomer({
          ...activeCustomer,
          ...profileForm,
        });
        if (typeof window !== "undefined") {
          localStorage.setItem("resort_guest_email", profileForm.email);
        }
        setProfileSuccessMsg("Profile information updated successfully!");
        setTimeout(() => setProfileSuccessMsg(""), 4000);
      } else {
        alert("Failed to update profile.");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Error saving profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Cancel Booking
  const handleCancelBooking = async (b: BookingItem) => {
    if (!confirm(`Are you sure you want to cancel booking #${b.bookingNumber}?`)) return;

    try {
      setCancellingId(b.id || b.bookingNumber);
      const res = await fetch(`/api/bookings/${b.id || b.bookingNumber}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingStatus: "cancelled",
          cancellationReason: "Cancelled by guest via My Account portal",
        }),
      });

      if (res.ok) {
        setBookings((prev) =>
          prev.map((item) =>
            item.bookingNumber === b.bookingNumber
              ? { ...item, bookingStatus: "cancelled" }
              : item
          )
        );
        alert(`Booking #${b.bookingNumber} has been cancelled.`);
      } else {
        alert("Could not cancel booking. Please contact resort reception.");
      }
    } catch (err) {
      console.error("Error cancelling booking:", err);
      alert("Failed to cancel booking.");
    } finally {
      setCancellingId(null);
    }
  };

  // Copy Booking Number
  const handleCopyBookingId = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedId(num);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Calculate dynamic statistics
  const upcomingBookings = bookings.filter(
    (b) => b.bookingStatus === "confirmed" || b.bookingStatus === "pending"
  );
  const pastBookings = bookings.filter((b) => b.bookingStatus === "completed");
  const cancelledBookings = bookings.filter((b) => b.bookingStatus === "cancelled");

  const totalCalculatedSpend = bookings.reduce(
    (acc, b) => (b.bookingStatus !== "cancelled" ? acc + (b.priceBreakdown?.total || 0) : acc),
    0
  );

  // Dynamic sample references and filtered lists for lookup modal
  const dynamicSampleBooking =
    allSystemBookings[0]?.bookingNumber || bookings[0]?.bookingNumber || "RG-546005";
  const dynamicSampleEmail =
    customers[0]?.email || "bhanu@gmail.com";

  const filteredCustomers = customers.filter((c) => {
    const q = lookupQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      c.firstName?.toLowerCase().includes(q) ||
      c.lastName?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q)
    );
  });

  const displayBookings = lookupQuery.trim()
    ? liveBookings
    : allSystemBookings.slice(0, 5);

  return (
    <div className="bg-background min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "My Account" }]} className="mb-6" />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 text-warm-gray gap-3 bg-surface rounded-xl border border-border shadow-card">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Retrieving your resort reservations & account details...</p>
          </div>
        ) : (
          <>
            {/* ══════════════════════════════════════════════════════
                GUEST PROFILE BANNER
            ══════════════════════════════════════════════════════ */}
            <div className="bg-surface rounded-xl border border-border p-6 sm:p-7 mb-8 shadow-card flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="size-16 sm:size-18 rounded-full bg-primary/10 text-primary font-serif font-bold text-xl sm:text-2xl flex items-center justify-center border-2 border-primary/20 flex-shrink-0 shadow-xs">
                  {activeCustomer?.firstName?.[0] || "R"}
                  {activeCustomer?.lastName?.[0] || "G"}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
                      {activeCustomer
                        ? `Welcome back, ${activeCustomer.firstName} ${activeCustomer.lastName}`
                        : "Guest Reservation Portal"}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-accent/20 text-accent uppercase tracking-wider">
                      {activeCustomer ? "Valued Guest" : "Guest Mode"}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-warm-gray flex flex-wrap items-center gap-2">
                    {activeCustomer ? (
                      <>
                        <span className="inline-flex items-center gap-1">
                          <Mail className="size-3 text-muted-sage" /> {activeCustomer.email}
                        </span>
                        {activeCustomer.phone && (
                          <>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1">
                              <Phone className="size-3 text-muted-sage" /> {activeCustomer.phone}
                            </span>
                          </>
                        )}
                      </>
                    ) : (
                      <span>Search with your booking reference or select a guest profile to view reservations.</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Stats & Lookup Switcher */}
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-border">
                <div className="flex gap-3 text-center">
                  <div className="px-4 py-2.5 bg-background rounded-lg border border-border min-w-[95px]">
                    <p className="text-[11px] text-warm-gray uppercase tracking-wider font-semibold">
                      Total Stays
                    </p>
                    <p className="font-serif font-bold text-charcoal text-xl">
                      {bookings.length}
                    </p>
                  </div>
                  <div className="px-4 py-2.5 bg-background rounded-lg border border-border min-w-[110px]">
                    <p className="text-[11px] text-warm-gray uppercase tracking-wider font-semibold">
                      Total Spent
                    </p>
                    <p className="font-serif font-bold text-primary text-xl">
                      {formatCurrency(totalCalculatedSpend || activeCustomer?.totalSpend || 0)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsLookupModalOpen(true)}
                  className="px-3.5 py-2.5 rounded-lg border border-border bg-background hover:bg-surface text-charcoal text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title="Find another booking or switch profile"
                >
                  <Search className="size-3.5 text-accent" />
                  <span>Lookup / Switch</span>
                </button>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════
                NAVIGATION TABS
            ══════════════════════════════════════════════════════ */}
            <div className="flex border-b border-border mb-8 overflow-x-auto scrollbar-none">
              {[
                { id: "upcoming", label: `Upcoming Bookings (${upcomingBookings.length})`, icon: Calendar },
                { id: "past", label: `Past Stays (${pastBookings.length})`, icon: History },
                { id: "cancelled", label: `Cancelled (${cancelledBookings.length})`, icon: XCircle },
                { id: "profile", label: "My Profile & Preferences", icon: User },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`flex items-center gap-2 px-6 py-3.5 font-sans font-medium text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === t.id
                      ? "border-primary text-primary font-bold bg-surface/50"
                      : "border-transparent text-warm-gray hover:text-charcoal hover:bg-surface/30"
                  }`}
                >
                  <t.icon className="size-4" />
                  {t.label}
                </button>
              ))}
            </div>

            {/* ══════════════════════════════════════════════════════
                TAB CONTENT
            ══════════════════════════════════════════════════════ */}
            {activeTab === "profile" ? (
              /* PROFILE TAB */
              <div className="bg-surface rounded-xl border border-border p-6 sm:p-8 shadow-card max-w-3xl">
                <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-charcoal">
                      Guest Information & Contact
                    </h2>
                    <p className="text-xs text-warm-gray mt-0.5">
                      Keep your contact details up to date for smooth check-ins and invoice generation.
                    </p>
                  </div>
                  <div className="size-9 rounded-full bg-accent/15 text-accent flex items-center justify-center">
                    <Edit3 className="size-4" />
                  </div>
                </div>

                {profileSuccessMsg && (
                  <div className="mb-5 p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <Check className="size-4 text-emerald-600 flex-shrink-0" />
                    <span>{profileSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-warm-gray uppercase tracking-wider font-semibold mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded border border-border bg-background focus:outline-none focus:border-primary text-charcoal text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-warm-gray uppercase tracking-wider font-semibold mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded border border-border bg-background focus:outline-none focus:border-primary text-charcoal text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-warm-gray uppercase tracking-wider font-semibold mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded border border-border bg-background focus:outline-none focus:border-primary text-charcoal text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-warm-gray uppercase tracking-wider font-semibold mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded border border-border bg-background focus:outline-none focus:border-primary text-charcoal text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-warm-gray uppercase tracking-wider font-semibold mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={profileForm.city}
                        onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded border border-border bg-background focus:outline-none focus:border-primary text-charcoal text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-warm-gray uppercase tracking-wider font-semibold mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        value={profileForm.country}
                        onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded border border-border bg-background focus:outline-none focus:border-primary text-charcoal text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-warm-gray uppercase tracking-wider font-semibold mb-1">
                      Residential Address
                    </label>
                    <input
                      type="text"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      placeholder="e.g. 42 Hilltop Boulevard"
                      className="w-full px-3.5 py-2.5 rounded border border-border bg-background focus:outline-none focus:border-primary text-charcoal text-sm"
                    />
                  </div>

                  <div className="flex justify-end pt-3 border-t border-border">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded cursor-pointer disabled:opacity-50 inline-flex items-center gap-2 shadow-sm transition-colors text-xs"
                    >
                      {savingProfile ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Check className="size-3.5" /> Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* BOOKINGS TAB (Upcoming / Past / Cancelled) */
              <div className="space-y-5">
                {(() => {
                  const currentList =
                    activeTab === "upcoming"
                      ? upcomingBookings
                      : activeTab === "past"
                      ? pastBookings
                      : cancelledBookings;

                  if (currentList.length === 0) {
                    return (
                      <div className="bg-surface rounded-xl border border-border p-12 text-center text-warm-gray shadow-card">
                        <Calendar className="size-10 mx-auto mb-3 text-muted-sage opacity-40" />
                        <h3 className="font-serif text-lg font-bold text-charcoal mb-1">
                          No {activeTab} bookings found
                        </h3>
                        <p className="text-xs max-w-md mx-auto mb-6">
                          {activeTab === "upcoming"
                            ? "You do not have any upcoming stays scheduled at Royal Grand IN Resorts."
                            : activeTab === "past"
                            ? "You have no past completed stays logged in your account."
                            : "No cancelled bookings on record."}
                        </p>
                        <Link
                          href="/booking"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-sm bg-accent hover:bg-accent-dark text-white font-sans font-semibold text-xs tracking-wider uppercase transition-colors shadow-sm"
                        >
                          Book Your Stay Now <ChevronRight className="size-3.5" />
                        </Link>
                      </div>
                    );
                  }

                  return currentList.map((b) => {
                    const isUpcoming = b.bookingStatus === "confirmed" || b.bookingStatus === "pending";

                    return (
                      <div
                        key={b.id || b.bookingNumber}
                        className="bg-surface rounded-xl border border-border p-6 sm:p-7 shadow-card transition-all hover:border-primary/30"
                      >
                        {/* Top Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                                #{b.bookingNumber}
                              </span>
                              <button
                                onClick={() => handleCopyBookingId(b.bookingNumber)}
                                className="text-warm-gray hover:text-charcoal p-1 rounded cursor-pointer"
                                title="Copy Booking Reference"
                              >
                                {copiedId === b.bookingNumber ? (
                                  <Check className="size-3 text-emerald-600" />
                                ) : (
                                  <Copy className="size-3" />
                                )}
                              </button>
                              {b.type && (
                                <span className="text-[10px] uppercase font-semibold text-warm-gray tracking-wider">
                                  {b.type === "package" ? "Curated Package" : "Resort Suite"}
                                </span>
                              )}
                            </div>
                            <h3 className="font-serif text-xl sm:text-2xl font-light text-charcoal">
                              {b.roomName || b.packageName || "Luxury Forest Accommodation"}
                            </h3>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 sm:self-center">
                            <StatusBadge status={b.bookingStatus} />
                            <span
                              className={`px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                                b.paymentStatus === "paid"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              Payment: {b.paymentStatus}
                            </span>
                          </div>
                        </div>

                        {/* Mid Grid Details */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 text-xs border-b border-border">
                          <div>
                            <p className="text-[10px] text-warm-gray uppercase tracking-wider font-semibold mb-0.5">
                              Check-In Date
                            </p>
                            <p className="font-sans font-semibold text-charcoal text-sm">
                              {formatDate(b.checkIn)}
                            </p>
                            <p className="text-[11px] text-muted-sage">From 02:00 PM</p>
                          </div>

                          <div>
                            <p className="text-[10px] text-warm-gray uppercase tracking-wider font-semibold mb-0.5">
                              Check-Out Date
                            </p>
                            <p className="font-sans font-semibold text-charcoal text-sm">
                              {formatDate(b.checkOut)}
                            </p>
                            <p className="text-[11px] text-muted-sage">{b.nights} {b.nights === 1 ? "Night" : "Nights"}</p>
                          </div>

                          <div>
                            <p className="text-[10px] text-warm-gray uppercase tracking-wider font-semibold mb-0.5">
                              Guests
                            </p>
                            <p className="font-sans font-semibold text-charcoal text-sm">
                              {b.adults} Adults {b.children > 0 ? `, ${b.children} Children` : ""}
                            </p>
                            <p className="text-[11px] text-muted-sage">All inclusive access</p>
                          </div>

                          <div>
                            <p className="text-[10px] text-warm-gray uppercase tracking-wider font-semibold mb-0.5">
                              Total Stay Price
                            </p>
                            <p className="font-serif font-bold text-charcoal text-base">
                              {formatCurrency(b.priceBreakdown?.total || 0)}
                            </p>
                            <p className="text-[11px] text-emerald-600 font-medium">Taxes Included (GST)</p>
                          </div>
                        </div>

                        {/* Special requests notice if present */}
                        {b.notes && (
                          <div className="py-3 text-[11px] text-warm-gray border-b border-border flex items-start gap-1.5">
                            <span className="font-semibold text-charcoal">Special Note:</span>
                            <span>{b.notes}</span>
                          </div>
                        )}

                        {/* Bottom Action Strip */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => setInvoiceBooking(b)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-border text-xs font-semibold text-charcoal hover:bg-background transition-colors cursor-pointer shadow-2xs"
                            >
                              <Download className="size-3.5 text-accent" /> Tax Invoice
                            </button>
                            <button
                              onClick={() => setDetailsBooking(b)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-border text-xs font-semibold text-charcoal hover:bg-background transition-colors cursor-pointer shadow-2xs"
                            >
                              <FileText className="size-3.5 text-muted-sage" /> Stay Summary
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            {isUpcoming && (
                              <button
                                onClick={() => handleCancelBooking(b)}
                                disabled={cancellingId === (b.id || b.bookingNumber)}
                                className="text-xs text-rose-600 hover:text-rose-800 font-medium hover:underline cursor-pointer disabled:opacity-50"
                              >
                                {cancellingId === (b.id || b.bookingNumber) ? "Cancelling..." : "Cancel Reservation"}
                              </button>
                            )}
                            <Link
                              href={`/contact?booking=${b.bookingNumber}`}
                              className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                            >
                              Contact Desk <ChevronRight className="size-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          LOOKUP / SWITCH GUEST MODAL
      ══════════════════════════════════════════════════════ */}
      {isLookupModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl border border-border shadow-2xl max-w-xl w-full p-5 sm:p-6 space-y-4 max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border pb-3 shrink-0">
              <div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-charcoal flex items-center gap-2">
                  <Search className="size-4 text-accent" /> Find Booking / Switch Account
                </h2>
                <p className="text-xs text-warm-gray mt-0.5">
                  Search live by booking reference, email, guest name, or phone number.
                </p>
              </div>
              <button
                onClick={() => setIsLookupModalOpen(false)}
                className="p-1 rounded-lg text-warm-gray hover:text-charcoal hover:bg-background cursor-pointer transition-colors"
                title="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Live Search Input Form */}
            <div className="shrink-0 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-charcoal">
                  Email Address, Guest Name, or Booking Reference
                </label>
                <span className="text-[11px] text-warm-gray font-mono">
                  e.g. {dynamicSampleBooking}
                </span>
              </div>
              <form onSubmit={handleLookupSubmit} className="relative flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-warm-gray">
                    {isSearchingLive ? (
                      <Loader2 className="size-3.5 animate-spin text-primary" />
                    ) : (
                      <Search className="size-3.5" />
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder={`e.g. ${dynamicSampleEmail} or ${dynamicSampleBooking}`}
                    value={lookupQuery}
                    onChange={(e) => setLookupQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm border rounded-lg bg-background text-charcoal focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-warm-gray/60"
                    autoFocus
                  />
                  {lookupQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setLookupQuery("");
                        setLiveBookings([]);
                        setLookupError("");
                      }}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-warm-gray hover:text-charcoal cursor-pointer"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dark cursor-pointer transition-colors flex items-center gap-1.5 shadow-2xs shrink-0"
                >
                  <span>Lookup</span>
                </button>
              </form>
              {lookupError && (
                <p className="text-xs text-rose-600 flex items-center gap-1.5 pt-0.5">
                  <AlertCircle className="size-3.5 shrink-0" /> {lookupError}
                </p>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 border-b border-border pb-2 shrink-0 overflow-x-auto text-xs">
              <button
                type="button"
                onClick={() => setActiveModalTab("all")}
                className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                  activeModalTab === "all"
                    ? "bg-primary text-white font-semibold"
                    : "bg-background text-warm-gray hover:text-charcoal border border-border"
                }`}
              >
                All Results ({displayBookings.length + filteredCustomers.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab("bookings")}
                className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors flex items-center gap-1 ${
                  activeModalTab === "bookings"
                    ? "bg-primary text-white font-semibold"
                    : "bg-background text-warm-gray hover:text-charcoal border border-border"
                }`}
              >
                <Calendar className="size-3" /> Bookings ({displayBookings.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab("guests")}
                className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors flex items-center gap-1 ${
                  activeModalTab === "guests"
                    ? "bg-primary text-white font-semibold"
                    : "bg-background text-warm-gray hover:text-charcoal border border-border"
                }`}
              >
                <User className="size-3" /> Registered Guests ({filteredCustomers.length})
              </button>
            </div>

            {/* Scrollable Results Area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {displayBookings.length === 0 && filteredCustomers.length === 0 ? (
                <div className="py-10 text-center space-y-2">
                  <div className="size-12 rounded-full bg-background border border-border mx-auto flex items-center justify-center text-warm-gray">
                    <Search className="size-5" />
                  </div>
                  <p className="text-sm font-semibold text-charcoal">
                    No results found {lookupQuery.trim() ? `for "${lookupQuery}"` : ""}
                  </p>
                  <p className="text-xs text-warm-gray max-w-xs mx-auto">
                    Try searching by booking reference (e.g. {dynamicSampleBooking}), registered email, or guest phone number.
                  </p>
                  {lookupQuery.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        setLookupQuery("");
                        setLiveBookings([]);
                      }}
                      className="text-xs text-primary font-semibold hover:underline mt-2 cursor-pointer"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* MATCHING BOOKINGS */}
                  {(activeModalTab === "all" || activeModalTab === "bookings") && displayBookings.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-semibold text-warm-gray uppercase tracking-wider flex items-center gap-1.5">
                          <Calendar className="size-3 text-accent" />
                          {lookupQuery.trim() ? "Matching Bookings" : "Recent Resort Bookings"} ({displayBookings.length})
                        </p>
                      </div>
                      <div className="space-y-2">
                        {displayBookings.map((b) => (
                          <div
                            key={b.id || b.bookingNumber}
                            className="p-3 rounded-lg border border-border bg-background/50 hover:bg-background hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded text-[11px]">
                                  #{b.bookingNumber}
                                </span>
                                <StatusBadge status={b.bookingStatus} size="sm" />
                                <span className="text-[11px] font-semibold text-charcoal">
                                  {b.type === "package" ? (b.packageName || "Package Stay") : (b.roomName || "Luxury Villa")}
                                </span>
                              </div>
                              <p className="text-warm-gray text-[11px]">
                                {formatDate(b.checkIn)} → {formatDate(b.checkOut)} ({b.nights} {b.nights === 1 ? "night" : "nights"})
                                {b.guestDetails?.firstName && (
                                  <> · <span className="text-charcoal font-medium">{b.guestDetails.firstName} {b.guestDetails.lastName}</span></>
                                )}
                              </p>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                              <span className="font-serif font-bold text-charcoal text-sm">
                                {formatCurrency(b.priceBreakdown?.total || 0)}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleSelectBooking(b, false)}
                                  className="px-2.5 py-1.5 bg-primary text-white rounded text-[11px] font-semibold hover:bg-primary-dark transition-colors cursor-pointer"
                                >
                                  Select & View
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSelectBooking(b, true)}
                                  className="p-1.5 rounded border border-border bg-surface hover:bg-background text-warm-gray hover:text-charcoal transition-colors cursor-pointer"
                                  title="View Full Booking Details"
                                >
                                  <Eye className="size-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* REGISTERED GUEST PROFILES */}
                  {(activeModalTab === "all" || activeModalTab === "guests") && filteredCustomers.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <p className="text-[11px] font-semibold text-warm-gray uppercase tracking-wider flex items-center gap-1.5">
                        <User className="size-3 text-accent" />
                        {lookupQuery.trim() ? "Matching Guest Accounts" : "Select Registered Guest"} ({filteredCustomers.length})
                      </p>
                      <div className="space-y-2">
                        {filteredCustomers.map((c) => {
                          const isCurrent = activeCustomer?.email?.toLowerCase() === c.email?.toLowerCase();
                          return (
                            <button
                              key={c.id || c.email}
                              type="button"
                              onClick={() => handleSwitchCustomer(c)}
                              className={`w-full text-left p-3 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${
                                isCurrent
                                  ? "border-primary bg-primary/5 text-primary font-bold shadow-2xs"
                                  : "border-border hover:bg-background hover:border-warm-gray/40 text-charcoal"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`size-9 rounded-full font-serif font-bold text-xs flex items-center justify-center shrink-0 ${
                                    isCurrent ? "bg-primary text-white" : "bg-primary/10 text-primary"
                                  }`}
                                >
                                  {c.firstName?.[0] || "G"}
                                  {c.lastName?.[0] || ""}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-charcoal">
                                      {c.firstName} {c.lastName}
                                    </p>
                                    {isCurrent && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-medium">
                                        <CheckCircle2 className="size-2.5" /> Active Session
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-warm-gray text-[11px]">
                                    {c.email} {c.phone ? `· ${c.phone}` : ""}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right text-[11px] shrink-0">
                                <span className="text-accent font-semibold block">
                                  {c.totalBookings || 0} stays
                                </span>
                                {c.totalSpend ? (
                                  <span className="text-warm-gray text-[10px]">
                                    {formatCurrency(c.totalSpend)}
                                  </span>
                                ) : null}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Active Session Status Footer */}
            <div className="pt-3 border-t border-border flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2 truncate text-warm-gray">
                <span className={`size-2 rounded-full ${activeCustomer ? "bg-emerald-500" : "bg-warm-gray"} shrink-0`} />
                <span className="truncate">
                  {activeCustomer ? (
                    <>
                      Active Guest: <strong className="text-charcoal font-semibold">{activeCustomer.firstName} {activeCustomer.lastName}</strong>
                      <span className="hidden sm:inline"> ({activeCustomer.email})</span>
                    </>
                  ) : (
                    "Guest Mode (No profile selected)"
                  )}
                </span>
              </div>
              {activeCustomer && (
                <button
                  type="button"
                  onClick={handleSignOutGuest}
                  className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer hover:underline shrink-0 ml-2"
                  title="Forget this guest profile on this browser"
                >
                  <LogOut className="size-3" /> Sign Out / Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAX INVOICE MODAL
      ══════════════════════════════════════════════════════ */}
      {invoiceBooking && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl border border-border shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto print:m-0 print:p-0">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-4 print:hidden">
              <span className="text-xs font-semibold text-warm-gray uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="size-4 text-accent" /> Official Tax Invoice
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded border border-border text-xs font-semibold text-charcoal hover:bg-background flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="size-3.5" /> Print / PDF
                </button>
                <button
                  onClick={() => setInvoiceBooking(null)}
                  className="text-warm-gray hover:text-charcoal cursor-pointer p-1"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Body */}
            <div className="space-y-6 text-charcoal font-sans text-xs">
              {/* Brand Header */}
              <div className="flex justify-between items-start border-b border-border pb-6">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-primary-dark">
                    {siteName}
                  </h2>
                  <p className="text-warm-gray mt-1 max-w-xs leading-relaxed">
                    {SITE_ADDRESS}
                  </p>
                  <p className="text-warm-gray mt-0.5">
                    Phone: {SITE_PHONE} | Email: {SITE_EMAIL}
                  </p>
                  <p className="text-muted-sage mt-1 font-mono text-[11px]">GSTIN: 37AAECR1234F1Z8</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs uppercase mb-2">
                    Tax Invoice / Paid
                  </span>
                  <p className="font-mono text-xs font-bold text-charcoal">
                    Invoice: INV-{invoiceBooking.bookingNumber}
                  </p>
                  <p className="text-warm-gray mt-0.5">
                    Date: {formatDate(invoiceBooking.createdAt || invoiceBooking.checkIn)}
                  </p>
                </div>
              </div>

              {/* Guest & Stay Details */}
              <div className="grid grid-cols-2 gap-6 bg-background p-4 rounded-lg border border-border">
                <div>
                  <p className="text-[10px] text-warm-gray uppercase tracking-wider font-semibold mb-1">
                    Billed To:
                  </p>
                  <p className="font-bold text-sm text-charcoal">
                    {invoiceBooking.guestDetails?.firstName} {invoiceBooking.guestDetails?.lastName}
                  </p>
                  <p className="text-warm-gray">{invoiceBooking.guestDetails?.email}</p>
                  <p className="text-warm-gray">{invoiceBooking.guestDetails?.phone}</p>
                  {invoiceBooking.guestDetails?.city && (
                    <p className="text-warm-gray">{invoiceBooking.guestDetails.city}, {invoiceBooking.guestDetails.country || "India"}</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-warm-gray uppercase tracking-wider font-semibold mb-1">
                    Reservation Details:
                  </p>
                  <p className="font-semibold text-charcoal">
                    {invoiceBooking.roomName || invoiceBooking.packageName || "Resort Accommodation"}
                  </p>
                  <p className="text-warm-gray">Check-in: {formatDate(invoiceBooking.checkIn)}</p>
                  <p className="text-warm-gray">Check-out: {formatDate(invoiceBooking.checkOut)} ({invoiceBooking.nights} nights)</p>
                  <p className="text-warm-gray">Occupancy: {invoiceBooking.adults} Adults, {invoiceBooking.children} Children</p>
                </div>
              </div>

              {/* Itemized Table */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-background border-y border-border text-warm-gray uppercase text-[10px] font-semibold">
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-center">Nights</th>
                    <th className="py-2.5 px-3 text-right">Base Rate</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-charcoal">
                        {invoiceBooking.roomName || invoiceBooking.packageName || "Resort Stay"}
                      </p>
                      <p className="text-[11px] text-warm-gray">Luxury Forest Stay Experience</p>
                    </td>
                    <td className="py-3 px-3 text-center font-medium">{invoiceBooking.nights}</td>
                    <td className="py-3 px-3 text-right font-medium">
                      {formatCurrency(invoiceBooking.priceBreakdown?.basePrice || 0)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-charcoal">
                      {formatCurrency(invoiceBooking.priceBreakdown?.subtotal || invoiceBooking.priceBreakdown?.basePrice || 0)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Breakdown Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-xs">
                  <div className="flex justify-between text-warm-gray">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(invoiceBooking.priceBreakdown?.subtotal || 0)}</span>
                  </div>
                  {Boolean(invoiceBooking.priceBreakdown?.discountAmount) && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount:</span>
                      <span>-{formatCurrency(invoiceBooking.priceBreakdown.discountAmount || 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-warm-gray">
                    <span>GST (18%):</span>
                    <span>{formatCurrency(invoiceBooking.priceBreakdown?.taxAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between font-serif font-bold text-base text-charcoal border-t border-border pt-2">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(invoiceBooking.priceBreakdown?.total || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="text-center text-[10px] text-warm-gray border-t border-border pt-4">
                Thank you for choosing {siteName}. For inquiries, please reach out to reservations desk.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          STAY SUMMARY MODAL
      ══════════════════════════════════════════════════════ */}
      {detailsBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl border border-border shadow-2xl max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h2 className="font-serif text-lg font-bold text-charcoal">
                  Stay Summary & Itinerary
                </h2>
                <p className="text-xs text-warm-gray">Booking #{detailsBooking.bookingNumber}</p>
              </div>
              <button
                onClick={() => setDetailsBooking(null)}
                className="text-warm-gray hover:text-charcoal cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-background rounded-lg border border-border">
                <p className="font-serif text-base font-bold text-charcoal mb-1">
                  {detailsBooking.roomName || detailsBooking.packageName}
                </p>
                <p className="text-warm-gray">
                  {detailsBooking.adults} Adults · {detailsBooking.children} Children · {detailsBooking.nights} Nights
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-background rounded border border-border">
                  <p className="text-[10px] text-warm-gray uppercase font-semibold">Check-In</p>
                  <p className="font-bold text-charcoal text-sm mt-0.5">{formatDate(detailsBooking.checkIn)}</p>
                  <p className="text-[11px] text-muted-sage">02:00 PM onwards</p>
                </div>
                <div className="p-3 bg-background rounded border border-border">
                  <p className="text-[10px] text-warm-gray uppercase font-semibold">Check-Out</p>
                  <p className="font-bold text-charcoal text-sm mt-0.5">{formatDate(detailsBooking.checkOut)}</p>
                  <p className="text-[11px] text-muted-sage">Until 11:00 AM</p>
                </div>
              </div>

              {detailsBooking.timeline && detailsBooking.timeline.length > 0 && (
                <div className="space-y-2 pt-2">
                  <p className="font-semibold text-charcoal text-xs">Booking Activity Log</p>
                  <div className="space-y-2 border-l-2 border-primary/20 pl-3">
                    {detailsBooking.timeline.map((evt, idx) => (
                      <div key={idx} className="relative">
                        <span className="size-2 rounded-full bg-primary absolute -left-[17px] top-1.5" />
                        <p className="font-semibold text-charcoal text-[11px]">{evt.event}</p>
                        <p className="text-[10px] text-warm-gray">{evt.description}</p>
                        <p className="text-[9px] text-muted-sage">{new Date(evt.timestamp).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setDetailsBooking(null)}
                  className="px-4 py-2 bg-primary text-white font-semibold rounded cursor-pointer text-xs"
                >
                  Close Summary
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
