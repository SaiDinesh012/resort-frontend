"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  Calendar,
  History,
  XCircle,
  Download,
  ChevronRight,
  Loader2,
  BedDouble,
  LogOut,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { formatCurrency, formatDate, clearLocalUserData } from "@/lib/utils";
import type { Booking } from "@/types/booking";
import type { Customer } from "@/types/customer";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "cancelled" | "profile">("upcoming");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customer, setCustomer] = useState<Partial<Customer> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setBookings([]);
    setCustomer(null);
    clearLocalUserData();
    window.location.replace("/login");
  };

  useEffect(() => {
    const session =
      typeof window !== "undefined"
        ? (localStorage.getItem("resortUserSession") || sessionStorage.getItem("resortUserSession"))
        : null;

    if (!session) {
      setIsAuthenticated(false);
      setBookings([]);
      setCustomer(null);
      window.location.replace("/login");
      return;
    }

    const parsedSession = JSON.parse(session);
    const userEmail = parsedSession?.email;

    setIsAuthenticated(true);

    async function loadAccountData() {
      try {
        setLoading(true);
        const [bRes, cRes] = await Promise.allSettled([
          fetch("/api/bookings"),
          fetch(`/api/customers/${userEmail}`),
        ]);

        let loadedBookings: Booking[] = [];

        if (bRes.status === "fulfilled" && bRes.value.ok) {
          const bData = await bRes.value.json();
          if (Array.isArray(bData)) {
            loadedBookings = bData.filter((b: any) => b.guestDetails?.email === userEmail || b.customerId === userEmail);
            setBookings(loadedBookings);
          }
        }

        if (cRes.status === "fulfilled" && cRes.value.ok) {
          const cData = await cRes.value.json();
          setCustomer(cData);
        } else if (loadedBookings.length > 0 && loadedBookings[0].guestDetails) {
          const gd = loadedBookings[0].guestDetails;
          setCustomer({
            firstName: gd.firstName,
            lastName: gd.lastName,
            email: gd.email,
            phone: gd.phone,
            city: gd.city || "Chikmagalur",
            country: gd.country || "India",
            totalBookings: loadedBookings.length,
            totalSpend: loadedBookings.reduce((sum, b) => sum + (b.priceBreakdown?.total || 0), 0),
          });
        }
      } catch (err) {
        console.error("Failed to load account data from database", err);
      } finally {
        setLoading(false);
      }
    }

    loadAccountData();
  }, []);

  if (isAuthenticated === false || isAuthenticated === null) {
    return (
      <div className="bg-background min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-surface rounded-xl border border-border p-12 text-center text-warm-gray flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="font-semibold text-charcoal">Checking authentication & session...</p>
        </div>
      </div>
    );
  }

  const upcomingBookings = bookings.filter((b) => b.bookingStatus === "confirmed" || b.bookingStatus === "pending");
  const pastBookings = bookings.filter((b) => b.bookingStatus === "completed");
  const cancelledBookings = bookings.filter((b) => b.bookingStatus === "cancelled");

  const totalBookingsCount = bookings.length;
  const totalSpendAmount = bookings.reduce((sum, b) => sum + (b.priceBreakdown?.total || 0), 0);

  const displayName = customer?.firstName ? `${customer.firstName} ${customer.lastName || ""}`.trim() : "Resort Guest";
  const displayInitials = customer?.firstName
    ? `${customer.firstName[0]}${customer.lastName ? customer.lastName[0] : ""}`.toUpperCase()
    : "RG";

  if (loading) {
    return (
      <div className="bg-background min-h-screen pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "My Account" }]} className="mb-6" />
          <div className="bg-surface rounded-xl border border-border p-16 text-center text-warm-gray flex flex-col items-center justify-center gap-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="font-medium text-charcoal">Loading your reservations from database...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "My Account" }]} className="mb-6" />

        <div className="bg-surface rounded-xl border border-border p-6 mb-8 shadow-card flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-full bg-primary/10 text-primary font-bold text-xl flex items-center justify-center border-2 border-primary/20">
              {displayInitials}
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-charcoal">
                {customer ? `Welcome back, ${displayName}` : "Welcome to Guest Portal"}
              </h1>
              <p className="text-xs text-warm-gray">
                {customer?.email ? `${customer.email} ${customer.phone ? `· ${customer.phone}` : ""}` : "Direct bookings and stay history live from MongoDB"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center md:justify-end">
            <div className="flex gap-4 text-center">
              <div className="px-4 py-2 bg-background rounded-lg border border-border">
                <p className="text-xs text-warm-gray">Total Bookings</p>
                <p className="font-bold text-charcoal text-lg">{totalBookingsCount}</p>
              </div>
              <div className="px-4 py-2 bg-background rounded-lg border border-border">
                <p className="text-xs text-warm-gray">Total Spent</p>
                <p className="font-bold text-primary text-lg">{formatCurrency(totalSpendAmount)}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-background text-xs font-semibold text-charcoal hover:text-primary hover:border-primary/40 transition-colors cursor-pointer"
            >
              <LogOut className="size-3.5" />
              Logout
            </button>
          </div>
        </div>

        <div className="flex border-b border-border mb-8 overflow-x-auto">
          {[
            { id: "upcoming", label: `Upcoming Bookings (${upcomingBookings.length})`, icon: Calendar },
            { id: "past", label: `Past Bookings (${pastBookings.length})`, icon: History },
            { id: "cancelled", label: `Cancelled (${cancelledBookings.length})`, icon: XCircle },
            { id: "profile", label: "My Profile", icon: User },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === t.id
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-warm-gray hover:text-charcoal"
              }`}
            >
              <t.icon className="size-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "profile" ? (
          <div className="bg-surface rounded-xl border border-border p-6 shadow-card max-w-2xl space-y-6">
            <h2 className="font-serif text-xl font-bold text-charcoal border-b border-border pb-3">Guest Profile Information</h2>
            {customer ? (
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-xs text-warm-gray uppercase tracking-wider font-semibold">First Name</label>
                  <p className="font-medium text-charcoal mt-1 text-sm">{customer.firstName || "—"}</p>
                </div>
                <div>
                  <label className="text-xs text-warm-gray uppercase tracking-wider font-semibold">Last Name</label>
                  <p className="font-medium text-charcoal mt-1 text-sm">{customer.lastName || "—"}</p>
                </div>
                <div>
                  <label className="text-xs text-warm-gray uppercase tracking-wider font-semibold">Email Address</label>
                  <p className="font-medium text-charcoal mt-1 text-sm">{customer.email || "—"}</p>
                </div>
                <div>
                  <label className="text-xs text-warm-gray uppercase tracking-wider font-semibold">Phone Number</label>
                  <p className="font-medium text-charcoal mt-1 text-sm">{customer.phone || "—"}</p>
                </div>
                <div>
                  <label className="text-xs text-warm-gray uppercase tracking-wider font-semibold">City</label>
                  <p className="font-medium text-charcoal mt-1 text-sm">{customer.city || "—"}</p>
                </div>
                <div>
                  <label className="text-xs text-warm-gray uppercase tracking-wider font-semibold">Country</label>
                  <p className="font-medium text-charcoal mt-1 text-sm">{customer.country || "India"}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-warm-gray text-xs">
                <p className="font-semibold text-charcoal text-sm mb-1">No Profile on File</p>
                <p>When you book a room or holiday package, your profile details will appear here automatically.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {((activeTab === "upcoming" ? upcomingBookings : activeTab === "past" ? pastBookings : cancelledBookings).length === 0) ? (
              <div className="bg-surface rounded-xl border border-border p-12 text-center text-warm-gray">
                <BedDouble className="size-10 text-warm-gray/40 mx-auto mb-3" />
                <p className="font-serif text-lg font-bold text-charcoal">No {activeTab} bookings found in database</p>
                <p className="text-xs text-warm-gray mt-1 max-w-md mx-auto">
                  {activeTab === "upcoming"
                    ? "You have no upcoming stays. Book a retreat now to experience luxury amidst nature."
                    : `No ${activeTab} reservations are recorded in your account.`}
                </p>
                {activeTab === "upcoming" && (
                  <Link
                    href="/rooms"
                    className="mt-5 inline-block px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-md hover:bg-primary-dark transition-colors"
                  >
                    Explore Rooms & Suites
                  </Link>
                )}
              </div>
            ) : (
              (activeTab === "upcoming" ? upcomingBookings : activeTab === "past" ? pastBookings : cancelledBookings).map((b) => (
                <div key={b.id} className="bg-surface rounded-xl border border-border p-6 shadow-card">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                    <div>
                      <span className="text-xs font-mono font-bold text-primary">{b.bookingNumber}</span>
                      <h3 className="font-serif text-lg font-semibold text-charcoal">{b.roomName || b.packageName}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={b.bookingStatus} />
                      <StatusBadge status={b.paymentStatus} label={`Payment: ${b.paymentStatus}`} />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-4 gap-4 py-4 text-xs text-warm-gray">
                    <div>
                      <p className="font-semibold text-charcoal">Check-in</p>
                      <p>{formatDate(b.checkIn)}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-charcoal">Check-out</p>
                      <p>{formatDate(b.checkOut)}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-charcoal">Guests</p>
                      <p>{b.adults || 1} Adult{b.adults > 1 ? "s" : ""}{b.children ? `, ${b.children} Child` : ""}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-charcoal">Total</p>
                      <p>{formatCurrency(b.priceBreakdown?.total || 0)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
                    <button
                      onClick={() => alert(`Tax invoice for booking ${b.bookingNumber} is verified and stored in database.`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs font-medium text-charcoal hover:bg-background transition-colors cursor-pointer"
                    >
                      <Download className="size-3.5" /> Download Invoice
                    </button>
                    <Link
                      href={`/contact?booking=${b.bookingNumber}`}
                      className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
                    >
                      Contact Resort Desk <ChevronRight className="size-3" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
