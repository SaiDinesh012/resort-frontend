"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Calendar, History, XCircle, Download, Mail, Phone, MapPin, ChevronRight, Shield, CreditCard } from "lucide-react";
import { mockBookings } from "@/data/mock/bookings";
import { mockCustomers } from "@/data/mock/customers";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "cancelled" | "profile">("upcoming");
  const customer = mockCustomers[0];

  const upcomingBookings = mockBookings.filter((b) => b.bookingStatus === "confirmed" || b.bookingStatus === "pending");
  const pastBookings = mockBookings.filter((b) => b.bookingStatus === "completed");
  const cancelledBookings = mockBookings.filter((b) => b.bookingStatus === "cancelled");

  return (
    <div className="bg-background min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "My Account" }]} className="mb-6" />

        {/* Profile Banner */}
        <div className="bg-surface rounded-xl border border-border p-6 mb-8 shadow-card flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-full bg-primary/10 text-primary font-bold text-xl flex items-center justify-center border-2 border-primary/20">
              {customer.firstName[0]}{customer.lastName[0]}
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-charcoal">
                Welcome back, {customer.firstName} {customer.lastName}
              </h1>
              <p className="text-xs text-warm-gray">{customer.email} · {customer.phone}</p>
            </div>
          </div>
          <div className="flex gap-4 text-center">
            <div className="px-4 py-2 bg-background rounded-lg border border-border">
              <p className="text-xs text-warm-gray">Total Bookings</p>
              <p className="font-bold text-charcoal text-lg">{customer.totalBookings}</p>
            </div>
            <div className="px-4 py-2 bg-background rounded-lg border border-border">
              <p className="text-xs text-warm-gray">Total Spent</p>
              <p className="font-bold text-primary text-lg">{formatCurrency(customer.totalSpend)}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
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
              className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
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

        {/* Content based on Tab */}
        {activeTab === "profile" ? (
          <div className="bg-surface rounded-xl border border-border p-6 shadow-card max-w-2xl">
            <h2 className="font-serif text-xl font-semibold text-charcoal mb-4">Personal Information</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-xs text-warm-gray uppercase tracking-wider font-semibold">First Name</label>
                <p className="font-medium text-charcoal mt-1">{customer.firstName}</p>
              </div>
              <div>
                <label className="text-xs text-warm-gray uppercase tracking-wider font-semibold">Last Name</label>
                <p className="font-medium text-charcoal mt-1">{customer.lastName}</p>
              </div>
              <div>
                <label className="text-xs text-warm-gray uppercase tracking-wider font-semibold">Email</label>
                <p className="font-medium text-charcoal mt-1">{customer.email}</p>
              </div>
              <div>
                <label className="text-xs text-warm-gray uppercase tracking-wider font-semibold">Phone</label>
                <p className="font-medium text-charcoal mt-1">{customer.phone}</p>
              </div>
              <div>
                <label className="text-xs text-warm-gray uppercase tracking-wider font-semibold">City</label>
                <p className="font-medium text-charcoal mt-1">{customer.city}</p>
              </div>
              <div>
                <label className="text-xs text-warm-gray uppercase tracking-wider font-semibold">Country</label>
                <p className="font-medium text-charcoal mt-1">{customer.country}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {(activeTab === "upcoming" ? upcomingBookings : activeTab === "past" ? pastBookings : cancelledBookings).map((b) => (
              <div key={b.id} className="bg-surface rounded-xl border border-border p-6 shadow-card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                  <div>
                    <span className="text-xs font-mono font-bold text-primary">{b.bookingNumber}</span>
                    <h3 className="font-serif text-lg font-semibold text-charcoal">
                      {b.roomName || b.packageName}
                    </h3>
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
                    <p>{formatDate(b.checkOut)} ({b.nights} nights)</p>
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal">Guests</p>
                    <p>{b.adults} Adults, {b.children} Children</p>
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal">Total Price</p>
                    <p className="text-sm font-bold text-charcoal">{formatCurrency(b.priceBreakdown.total)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
                  <button
                    onClick={() => alert(`Downloading tax invoice for ${b.bookingNumber}...`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs font-medium text-charcoal hover:bg-background transition-colors"
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
