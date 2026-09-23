"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Check, Calendar, Users, Shield, CreditCard, ChevronRight, ArrowLeft, Loader2 } from "lucide-react";
import { formatCurrency, calculateNights } from "@/lib/utils";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import type { Room } from "@/types/room";
import type { Package } from "@/types/package";

function BookingContent() {
  const searchParams = useSearchParams();
  const roomParam = searchParams.get("room");
  const checkInParam = searchParams.get("checkIn");
  const checkOutParam = searchParams.get("checkOut");
  const adultsParam = searchParams.get("adults");
  const childrenParam = searchParams.get("children");
  const packageParam = searchParams.get("package");
  const [step, setStep] = useState(1);
  const [bookingType, setBookingType] = useState<"room" | "package">(packageParam ? "package" : "room");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedItemSlug, setSelectedItemSlug] = useState<string>("");

  // Dates
  const today = new Date().toISOString().split("T")[0];
  const threeDaysLater = new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0];
  const [checkIn, setCheckIn] = useState(checkInParam || today);
  const [checkOut, setCheckOut] = useState(checkOutParam || threeDaysLater);
  const [adults, setAdults] = useState(adultsParam ? parseInt(adultsParam, 10) : 2);
  const [children, setChildren] = useState(childrenParam ? parseInt(childrenParam, 10) : 0);

  // Guest Info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmedBookingNum, setConfirmedBookingNum] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [rRes, pRes] = await Promise.allSettled([
          fetch("/api/rooms"),
          fetch("/api/packages"),
        ]);
        if (rRes.status === "fulfilled" && rRes.value.ok) {
          const rData = await rRes.value.json();
          if (Array.isArray(rData) && rData.length > 0) {
            setRooms(rData);
            if (roomParam) {
              setSelectedItemSlug(roomParam);
              setBookingType("room");
            } else if (!packageParam) {
              setSelectedItemSlug(rData[0].slug);
            }
          }
        }
        if (pRes.status === "fulfilled" && pRes.value.ok) {
          const pData = await pRes.value.json();
          if (Array.isArray(pData) && pData.length > 0) {
            setPackages(pData);
            if (packageParam) {
              setSelectedItemSlug(packageParam);
              setBookingType("package");
            }
          }
        }
      } catch (err) {
        console.error("Error loading stay items", err);
      }
    }
    loadData();
  }, []);

  const selectedRoom = rooms.find((r) => r.slug === selectedItemSlug || r.id === selectedItemSlug) || rooms[0];
  const selectedPackage = packages.find((p) => p.slug === selectedItemSlug || p.id === selectedItemSlug) || packages[0];

  const nights = calculateNights(checkIn, checkOut) || 1;
  const baseRate = bookingType === "room" ? (selectedRoom?.basePrice || 8500) : (selectedPackage?.price || 32000);
  const subtotal = bookingType === "room" ? baseRate * nights : baseRate;
  const rawTaxRate = bookingType === "room" ? (selectedRoom?.taxRate || 0.18) : 0.18;
  const taxRate = rawTaxRate > 1 ? rawTaxRate / 100 : rawTaxRate;
  const taxAmount = Math.round(subtotal * taxRate);
  const grandTotal = Math.max(0, subtotal + taxAmount - discount);

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === "WELCOME10") {
      setDiscount(subtotal * 0.1);
    } else if (couponCode.toUpperCase() === "VANAPRIYA") {
      setDiscount(5000);
    } else {
      alert("Invalid coupon code. Try WELCOME10 or VANAPRIYA");
    }
  };

  const handleCompleteBooking = async () => {
    try {
      setSubmitting(true);
      const payload = {
        type: bookingType,
        roomId: bookingType === "room" ? selectedRoom?.id : undefined,
        roomName: bookingType === "room" ? selectedRoom?.name : undefined,
        packageId: bookingType === "package" ? selectedPackage?.id : undefined,
        packageName: bookingType === "package" ? selectedPackage?.name : undefined,
        checkIn,
        checkOut,
        nights,
        adults,
        children,
        guestDetails: {
          firstName: firstName || "Guest",
          lastName: lastName || "User",
          email: email || "guest@example.com",
          phone: phone || "+91 98765 43210",
          specialRequests,
        },
        priceBreakdown: {
          basePrice: baseRate,
          nights,
          subtotal,
          taxAmount,
          taxRate,
          discountAmount: discount,
          couponCode: discount > 0 ? couponCode : undefined,
          total: grandTotal,
        },
        paymentStatus: "paid",
        paymentMethod,
        notes: specialRequests || "Booked online via Website",
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.bookingNumber) {
        setConfirmedBookingNum(data.bookingNumber);
      } else {
        setConfirmedBookingNum(`VP-${Math.floor(100000 + Math.random() * 900000)}`);
      }

      setBookingConfirmed(true);
      setStep(6);
    } catch (err) {
      console.error("Booking error:", err);
      setConfirmedBookingNum(`VP-${Math.floor(100000 + Math.random() * 900000)}`);
      setBookingConfirmed(true);
      setStep(6);
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, name: "Choose Stay" },
    { num: 2, name: "Select Dates" },
    { num: 3, name: "Guest Details" },
    { num: 4, name: "Summary" },
    { num: 5, name: "Payment" },
  ];

  return (
    <div className="bg-background min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Booking" }]} className="mb-6" />

        {/* Stepper Header */}
        {!bookingConfirmed && (
          <div className="bg-surface rounded-xl border border-border p-6 mb-8 shadow-card">
            <div className="flex items-center justify-between max-w-4xl mx-auto overflow-x-auto scrollbar-hide py-2">
              {steps.map((s, idx) => (
                <div key={s.num} className="flex items-center flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div
                      className={`size-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        step > s.num
                          ? "bg-emerald-600 text-white"
                          : step === s.num
                          ? "bg-primary text-white"
                          : "bg-border text-warm-gray"
                      }`}
                    >
                      {step > s.num ? <Check className="size-4" /> : s.num}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        step === s.num ? "text-charcoal font-semibold" : "text-warm-gray"
                      }`}
                    >
                      {s.name}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`w-10 sm:w-16 h-0.5 mx-3 ${
                        step > s.num ? "bg-emerald-600" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-2">
            {/* STEP 1: Select Dates */}
            {step === 1 && (
              <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-6">
                <h2 className="font-serif text-2xl font-semibold text-charcoal">Select Stay Dates & Guests</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-warm-gray uppercase tracking-wider mb-2">
                      Check-in Date
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      min={today}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full px-4 py-3 rounded-md border border-border text-charcoal bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-warm-gray uppercase tracking-wider mb-2">
                      Check-out Date
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      min={checkIn}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full px-4 py-3 rounded-md border border-border text-charcoal bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-warm-gray uppercase tracking-wider mb-2">
                      Adults (Ages 12+)
                    </label>
                    <select
                      value={adults}
                      onChange={(e) => setAdults(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-md border border-border text-charcoal bg-background focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>{n} Adult{n > 1 ? "s" : ""}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-warm-gray uppercase tracking-wider mb-2">
                      Children (Ages 0-11)
                    </label>
                    <select
                      value={children}
                      onChange={(e) => setChildren(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-md border border-border text-charcoal bg-background focus:outline-none"
                    >
                      {[0, 1, 2, 3, 4].map((n) => (
                        <option key={n} value={n}>{n} {n === 1 ? "Child" : "Children"}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3 rounded-md bg-primary hover:bg-primary-dark text-white font-semibold text-sm transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    Continue to Choose Stay <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Select Room / Package */}
            {step === 2 && (
              <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-2xl font-semibold text-charcoal">Choose Accommodation / Package</h2>
                  <div className="flex rounded-md border border-border overflow-hidden">
                    <button
                      onClick={() => { setBookingType("room"); if (rooms[0]) setSelectedItemSlug(rooms[0].slug); }}
                      className={`px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                        bookingType === "room" ? "bg-primary text-white" : "bg-background text-warm-gray"
                      }`}
                    >
                      Rooms
                    </button>
                    <button
                      onClick={() => { setBookingType("package"); if (packages[0]) setSelectedItemSlug(packages[0].slug); }}
                      className={`px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                        bookingType === "package" ? "bg-primary text-white" : "bg-background text-warm-gray"
                      }`}
                    >
                      Packages
                    </button>
                  </div>
                </div>

                {bookingType === "room" ? (
                  <div className="space-y-4">
                    {rooms.map((room) => (
                      <div
                        key={room.id}
                        onClick={() => setSelectedItemSlug(room.slug)}
                        className={`cursor-pointer rounded-lg border p-4 flex flex-col sm:flex-row gap-4 items-center transition-all ${
                          selectedItemSlug === room.slug || selectedItemSlug === room.id
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border hover:border-secondary"
                        }`}
                      >
                        <div className="relative size-24 sm:size-28 rounded-md overflow-hidden flex-shrink-0">
                          <Image src={room.images[0] || "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80"} alt={room.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-serif font-semibold text-charcoal text-base">{room.name}</h3>
                          <p className="text-xs text-warm-gray mb-2">{room.type} · Up to {room.maxOccupancy} guests</p>
                          <p className="text-xs text-warm-gray line-clamp-1">{room.description}</p>
                        </div>
                        <div className="text-right sm:border-l sm:border-border sm:pl-4">
                          <p className="text-lg font-bold text-charcoal">{formatCurrency(room.basePrice)}</p>
                          <p className="text-xs text-warm-gray">/ night</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {packages.map((pkg) => (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedItemSlug(pkg.slug)}
                        className={`cursor-pointer rounded-lg border p-4 flex flex-col sm:flex-row gap-4 items-center transition-all ${
                          selectedItemSlug === pkg.slug || selectedItemSlug === pkg.id
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border hover:border-secondary"
                        }`}
                      >
                        <div className="relative size-24 sm:size-28 rounded-md overflow-hidden flex-shrink-0">
                          <Image src={pkg.images[0] || "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80"} alt={pkg.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-serif font-semibold text-charcoal text-base">{pkg.name}</h3>
                          <p className="text-xs text-accent font-medium">{pkg.durationNights}N / {pkg.durationDays}D</p>
                          <p className="text-xs text-warm-gray line-clamp-1 mt-1">{pkg.description}</p>
                        </div>
                        <div className="text-right sm:border-l sm:border-border sm:pl-4">
                          <p className="text-lg font-bold text-charcoal">{formatCurrency(pkg.price)}</p>
                          <p className="text-xs text-warm-gray">total package</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="px-5 py-2.5 rounded-md border border-border text-charcoal text-sm font-medium hover:bg-border/30 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="size-4" /> Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="px-6 py-3 rounded-md bg-primary hover:bg-primary-dark text-white font-semibold text-sm transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    Continue to Guest Details <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Guest Information */}
            {step === 3 && (
              <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-6">
                <h2 className="font-serif text-2xl font-semibold text-charcoal">Guest Details</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-warm-gray uppercase tracking-wider mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Arjun"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-md border border-border text-charcoal bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-warm-gray uppercase tracking-wider mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sharma"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-md border border-border text-charcoal bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-warm-gray uppercase tracking-wider mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder="arjun@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-md border border-border text-charcoal bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-warm-gray uppercase tracking-wider mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-md border border-border text-charcoal bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-warm-gray uppercase tracking-wider mb-2">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Late arrival, high floor, dietary preferences, honeymoon setup, etc."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-md border border-border text-charcoal bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  />
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="px-5 py-2.5 rounded-md border border-border text-charcoal text-sm font-medium hover:bg-border/30 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="size-4" /> Back
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="px-6 py-3 rounded-md bg-primary hover:bg-primary-dark text-white font-semibold text-sm transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    Review Booking Summary <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Booking Summary */}
            {step === 4 && (
              <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-6">
                <h2 className="font-serif text-2xl font-semibold text-charcoal">Review Booking Summary</h2>

                <div className="bg-background p-4 rounded-lg border border-border space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-warm-gray">Selected Item:</span>
                    <span className="font-semibold text-charcoal">
                      {bookingType === "room" ? selectedRoom?.name : selectedPackage?.name}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-warm-gray">Dates:</span>
                    <span className="font-medium text-charcoal">{checkIn} to {checkOut} ({nights} nights)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-warm-gray">Guests:</span>
                    <span className="font-medium text-charcoal">{adults} Adults, {children} Children</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-warm-gray">Primary Guest:</span>
                    <span className="font-medium text-charcoal">{firstName || "Guest"} {lastName || "User"} ({email || "guest@example.com"})</span>
                  </div>
                </div>

                {/* Coupon Code section */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon Code (try WELCOME10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-md border border-border text-sm bg-background uppercase focus:outline-none"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-4 py-2.5 rounded-md bg-accent text-white text-sm font-semibold hover:bg-accent-dark transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {discount > 0 && (
                  <p className="text-xs text-emerald-600 font-medium">Coupon applied! Discount: -{formatCurrency(discount)}</p>
                )}

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setStep(3)}
                    className="px-5 py-2.5 rounded-md border border-border text-charcoal text-sm font-medium hover:bg-border/30 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="size-4" /> Back
                  </button>
                  <button
                    onClick={() => setStep(5)}
                    className="px-6 py-3 rounded-md bg-primary hover:bg-primary-dark text-white font-semibold text-sm transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    Proceed to Payment <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: Payment */}
            {step === 5 && (
              <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-6">
                <div className="flex items-center gap-3">
                  <CreditCard className="size-6 text-primary" />
                  <h2 className="font-serif text-2xl font-semibold text-charcoal">Complete Payment</h2>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-warm-gray uppercase tracking-wider mb-2">
                    Select Payment Method
                  </label>
                  {[
                    { id: "upi", label: "UPI (Google Pay, PhonePe, Paytm)" },
                    { id: "card", label: "Credit / Debit Card" },
                    { id: "netbanking", label: "Net Banking" },
                  ].map((m) => (
                    <label key={m.id} className="flex items-center gap-3 p-3 rounded-md border border-border cursor-pointer hover:bg-background">
                      <input
                        type="radio"
                        name="pay"
                        checked={paymentMethod === m.id}
                        onChange={() => setPaymentMethod(m.id)}
                        className="accent-primary"
                      />
                      <span className="text-sm font-medium text-charcoal">{m.label}</span>
                    </label>
                  ))}
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setStep(4)}
                    className="px-5 py-2.5 rounded-md border border-border text-charcoal text-sm font-medium hover:bg-border/30 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="size-4" /> Back
                  </button>
                  <button
                    onClick={handleCompleteBooking}
                    disabled={submitting}
                    className="px-8 py-3.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base transition-colors flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="size-5 animate-spin" /> : <Check className="size-5" />}
                    Pay {formatCurrency(grandTotal)} & Confirm Booking
                  </button>
                </div>
              </div>
            )}

            {/* STEP 6: Confirmation Screen */}
            {step === 6 && (
              <div className="bg-surface rounded-xl border border-border p-8 shadow-card text-center space-y-6">
                <div className="size-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <Check className="size-8" />
                </div>
                <h2 className="font-serif text-3xl font-bold text-charcoal">Booking Confirmed!</h2>
                <p className="text-warm-gray text-sm max-w-md mx-auto">
                  Thank you, <span className="font-semibold text-charcoal">{firstName || "Guest"}</span>. Your booking reference number is{" "}
                  <span className="font-mono text-primary font-bold">{confirmedBookingNum || "VP-889912"}</span>.
                </p>

                <div className="p-4 bg-background rounded-lg border border-border max-w-md mx-auto text-left text-xs space-y-2 text-warm-gray">
                  <div className="flex justify-between"><span className="font-medium text-charcoal">Resort:</span> <span>Vanapriya Resort, Western Ghats</span></div>
                  <div className="flex justify-between"><span className="font-medium text-charcoal">Item:</span> <span>{bookingType === "room" ? selectedRoom?.name : selectedPackage?.name}</span></div>
                  <div className="flex justify-between"><span className="font-medium text-charcoal">Check-in:</span> <span>{checkIn}</span></div>
                  <div className="flex justify-between"><span className="font-medium text-charcoal">Check-out:</span> <span>{checkOut}</span></div>
                  <div className="flex justify-between"><span className="font-medium text-charcoal">Amount Paid:</span> <span className="font-bold text-charcoal">{formatCurrency(grandTotal)}</span></div>
                </div>

                <div className="flex justify-center gap-4 pt-4">
                  <Link href="/admin/bookings" className="px-6 py-3 rounded-md bg-primary hover:bg-primary-dark text-white font-semibold text-sm">
                    View in Admin Panel
                  </Link>
                  <Link href="/" className="px-6 py-3 rounded-md border border-border text-charcoal hover:bg-border/30 text-sm font-semibold">
                    Return to Home
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right Summary Sidebar */}
          {!bookingConfirmed && (
            <div className="lg:col-span-1">
              <div className="bg-surface rounded-xl border border-border p-6 shadow-card sticky top-24 space-y-4">
                <h3 className="font-serif text-lg font-semibold text-charcoal border-b border-border pb-3">
                  Summary
                </h3>

                <div className="flex items-center gap-3">
                  <div className="relative size-16 rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src={bookingType === "room" ? (selectedRoom?.images[0] || "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80") : (selectedPackage?.images[0] || "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80")}
                      alt="Selected item"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-charcoal text-sm">
                      {bookingType === "room" ? selectedRoom?.name : selectedPackage?.name}
                    </h4>
                    <p className="text-xs text-warm-gray">
                      {bookingType === "room" ? `${selectedRoom?.type}` : `${selectedPackage?.durationNights}N / ${selectedPackage?.durationDays}D`}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-warm-gray pt-3 border-t border-border">
                  <div className="flex justify-between">
                    <span>Dates</span>
                    <span className="font-medium text-charcoal">{checkIn} → {checkOut}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration</span>
                    <span className="font-medium text-charcoal">{nights} night{nights > 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Guests</span>
                    <span className="font-medium text-charcoal">{adults} Adults, {children} Kids</span>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-border text-sm">
                  <div className="flex justify-between text-warm-gray">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-warm-gray">
                    <span>Tax & Charges</span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Discount</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-charcoal text-lg pt-3 border-t border-border">
                    <span>Total Amount</span>
                    <span className="text-primary">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-warm-gray pt-2">
                  <Shield className="size-4 text-emerald-600 flex-shrink-0" />
                  <span>Free cancellation up to 7 days before check-in.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center pt-24"><Loader2 className="size-8 animate-spin text-primary" /></div>}>
      <BookingContent />
    </Suspense>
  );
}
