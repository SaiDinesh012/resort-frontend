"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Check, Calendar, Users, Shield, CreditCard, ChevronRight, ArrowLeft, Loader2, X, User, Eye, EyeOff } from "lucide-react";
import { formatCurrency, calculateNights } from "@/lib/utils";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import type { Room } from "@/types/room";
import type { Package } from "@/types/package";

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomParam = searchParams.get("room");
  const checkInParam = searchParams.get("checkIn");
  const checkOutParam = searchParams.get("checkOut");
  const adultsParam = searchParams.get("adults");
  const childrenParam = searchParams.get("children");
  const packageParam = searchParams.get("package");
  const hasPreselectedItem = !!(roomParam || packageParam);
  const [step, setStep] = useState(hasPreselectedItem ? 2 : 1);
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

  // Auth & Guest Info
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [showAccountPassword, setShowAccountPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Toast State
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const showToastMsg = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4500);
  };

  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
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



  const selectedRoom = rooms.find((r) => r.slug === selectedItemSlug || r.id === selectedItemSlug) || null;
  const selectedPackage = packages.find((p) => p.slug === selectedItemSlug || p.id === selectedItemSlug) || null;

  // Check if user is logged in to auto-fill details
  useEffect(() => {
    const syncUser = async () => {
      const session = localStorage.getItem("resortUserSession") || sessionStorage.getItem("resortUserSession");
      if (session) {
        try {
          const parsed = JSON.parse(session);
          if (parsed.email) {
            setIsLoggedIn(true);
            const res = await fetch(`/api/customers/${parsed.email}`);
            if (res.ok) {
              const data = await res.json();
              setFirstName(f => f || data.firstName || "");
              setLastName(l => l || data.lastName || "");
              setEmail(e => e || data.email || "");
              setPhone(p => p || data.phone || "");
            }
          }
        } catch (e) {}
      }
    };
    syncUser();
  }, []);
  // Automatically check if email exists when user types it
  useEffect(() => {
    // Only check if it's a valid-looking email and user is not logged in
    if (isLoggedIn || !email || !email.includes("@") || !email.includes(".")) {
      if (!email) setEmailExists(null);
      return;
    }
    
    const timeoutId = setTimeout(async () => {
      setCheckingEmail(true);
      try {
        const res = await fetch(`/api/customers/${email}`);
        if (res.ok) {
          setEmailExists(true);
          setLoginEmail(email);
          setLoginError("This email is already registered. Please log in to continue.");
          setShowLoginPopup(true);
        } else {
          setEmailExists(false);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setCheckingEmail(false);
      }
    }, 600); // Wait 600ms after user stops typing
    
    return () => clearTimeout(timeoutId);
  }, [email, isLoggedIn]);

  const handleContinueToGuestDetails = () => {
    if (isLoggedIn) {
      setStep(3);
    } else {
      setShowLoginPopup(true);
    }
  };

  const handleQuickLogin = async () => {
    if (!loginEmail || !loginPassword) {
      setLoginError("Please enter your email and password.");
      return;
    }
    setIsLoggingIn(true);
    try {
      const res = await fetch(`/api/customers/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("resortUserSession", JSON.stringify({ email: data.email, role: "customer" }));
        setIsLoggedIn(true);
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setLoginError("");
        setShowLoginPopup(false);
        setStep(3);
      } else {
        const errorData = await res.json();
        setLoginError(errorData.error || "Login failed.");
      }
    } catch (e) {
      setLoginError("Error verifying account.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Auto-sync checkout date for packages based on duration
  useEffect(() => {
    if (bookingType === "package" && selectedPackage) {
      const d = new Date(checkIn);
      d.setDate(d.getDate() + (selectedPackage.durationNights || 2));
      const newCheckOut = d.toISOString().split("T")[0];
      if (checkOut !== newCheckOut) {
        setCheckOut(newCheckOut);
      }
    }
  }, [bookingType, selectedPackage, checkIn, checkOut]);



  const nights = calculateNights(checkIn, checkOut) || 1;
  const totalGuests = adults + children;
  
  let subtotal = 0;
  if (bookingType === "room") {
    const baseRate = selectedRoom?.basePrice || 8500;
    subtotal = baseRate * nights;
  } else {
    const baseRate = selectedPackage?.price || 32000;
    const pType = selectedPackage?.priceType || "per_couple";
    const pNights = selectedPackage?.durationNights || 1;
    const perNightRate = baseRate / pNights;
    
    if (pType === "per_person") {
      subtotal = perNightRate * totalGuests * nights;
    } else if (pType === "per_couple") {
      subtotal = perNightRate * Math.ceil(totalGuests / 2) * nights;
    } else {
      subtotal = perNightRate * nights;
    }
  }
  
  const baseRate = bookingType === "room" ? (selectedRoom?.basePrice || 8500) : (selectedPackage?.price || 32000);
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

  const handleContinueToSummary = () => {
    if (!firstName || !lastName || !email || !phone) {
      showToastMsg("Please fill in all required guest details.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToastMsg("Please enter a valid email address (e.g., name@example.com).");
      return;
    }

    // Phone validation
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      showToastMsg("Please enter a valid phone number (at least 10 digits).");
      return;
    }

    if (!isLoggedIn && emailExists === false && !accountPassword) {
      showToastMsg("Please set a secure password to create your account.");
      return;
    }
    setStep(4);
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
          password: accountPassword,
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

            // Automatically log the user in if they just created an account
      if (!isLoggedIn && accountPassword) {
        localStorage.setItem("resortUserSession", JSON.stringify({ email: email, role: "customer" }));
        setIsLoggedIn(true);
      }
      
      setBookingConfirmed(true);
      setStep(6);
    } catch (err) {
      console.error("Booking error:", err);
      setConfirmedBookingNum(`VP-${Math.floor(100000 + Math.random() * 900000)}`);
            // Automatically log the user in if they just created an account
      if (!isLoggedIn && accountPassword) {
        localStorage.setItem("resortUserSession", JSON.stringify({ email: email, role: "customer" }));
        setIsLoggedIn(true);
      }
      
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
            {/* STEP 1: Select Room / Package */}
            {step === 1 && (
              <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-2xl font-semibold text-charcoal">Choose Accommodation / Package</h2>
                  <div className="flex rounded-md border border-border overflow-hidden">
                    <button
                      onClick={() => { setBookingType("room"); setSelectedItemSlug(""); }}
                      className={`px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                        bookingType === "room" ? "bg-primary text-white" : "bg-background text-warm-gray"
                      }`}
                    >
                      Rooms
                    </button>
                    <button
                      onClick={() => { setBookingType("package"); setSelectedItemSlug(""); }}
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
                          <p className="text-xs text-accent font-medium">{pkg.durationNights}N / {pkg.durationDays}D (Base)</p>
                          <p className="text-xs text-warm-gray line-clamp-1 mt-1">{pkg.description}</p>
                        </div>
                        <div className="text-right sm:border-l sm:border-border sm:pl-4">
                          <p className="text-lg font-bold text-charcoal">{formatCurrency(pkg.price)}</p>
                          <p className="text-xs text-warm-gray">{pkg.priceType === "per_person" ? "per person" : pkg.priceType === "per_couple" ? "per couple" : "total package"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => router.back()}
                    className="px-5 py-2.5 rounded-md border border-border text-charcoal text-sm font-medium hover:bg-border/30 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="size-4" /> Back
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    disabled={!selectedItemSlug}
                    className={`px-6 py-3 rounded-md font-semibold text-sm transition-colors flex items-center gap-2 ${!selectedItemSlug ? "bg-warm-gray/50 text-white cursor-not-allowed" : "bg-primary hover:bg-primary-dark text-white cursor-pointer"}`}
                  >
                    Continue to Select Dates <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Select Dates & Guests */}
            {step === 2 && (
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
                      onChange={(e) => {
                        if (bookingType !== "package") setCheckOut(e.target.value);
                      }}
                      readOnly={bookingType === "package"}
                      className={`w-full px-4 py-3 rounded-md border border-border text-charcoal focus:outline-none ${bookingType === "package" ? "bg-warm-gray/10 opacity-70 cursor-not-allowed" : "bg-background focus:ring-2 focus:ring-primary/20"}`}
                    />
                    {bookingType === "package" && (
                      <p className="text-[10px] text-primary mt-1 font-semibold flex items-center gap-1">
                        Fixed {selectedPackage?.durationNights} nights package
                      </p>
                    )}
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

                <div className="pt-4 flex justify-between">
                  <button onClick={() => hasPreselectedItem ? router.back() : setStep(1)} className="px-5 py-2.5 rounded-md border border-border text-charcoal text-sm font-medium hover:bg-border/30 transition-colors flex items-center gap-1 cursor-pointer"><ArrowLeft className="size-4" /> Back</button>
                  <button
                    onClick={handleContinueToGuestDetails}
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
                      onChange={(e) => {
                        setEmail(e.target.value.toLowerCase());
                        if (emailExists !== null) setEmailExists(null);
                      }}
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
                      onChange={(e) => setPhone(e.target.value.replace(/[^0-9+ ]/g, ''))}
                      className="w-full px-4 py-2.5 rounded-md border border-border text-charcoal bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  {!isLoggedIn && emailExists === false && (
                    <div className="sm:col-span-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 mb-4">
                        <p className="text-sm text-emerald-800 font-medium">✨ Great! You're a new customer.</p>
                        <p className="text-xs text-emerald-600 mt-1">Please set a secure password to create your account and complete this booking.</p>
                      </div>
                      <label className="block text-xs font-semibold text-warm-gray uppercase tracking-wider mb-2 flex items-center gap-2">
                        Create Account Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showAccountPassword ? "text" : "password"}
                          required
                          value={accountPassword}
                          onChange={(e) => setAccountPassword(e.target.value)}
                          className="w-full px-4 py-3 pr-10 rounded-md border border-border text-charcoal bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                          placeholder="••••••••"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowAccountPassword(!showAccountPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          {showAccountPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>
                  )}

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
                    onClick={handleContinueToSummary} className="px-6 py-3 rounded-md bg-primary hover:bg-primary-dark text-white font-semibold text-sm transition-colors flex items-center gap-2 cursor-pointer">Review Booking Summary <ChevronRight className="size-4" />
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
                  <div className="flex justify-between"><span className="font-medium text-charcoal">Check-in:</span> <span>{checkIn.split("-").reverse().join("/")}</span></div>
                  <div className="flex justify-between"><span className="font-medium text-charcoal">Check-out:</span> <span>{checkOut.split("-").reverse().join("/")}</span></div>
                  <div className="flex justify-between"><span className="font-medium text-charcoal">Amount Paid:</span> <span className="font-bold text-charcoal">{formatCurrency(grandTotal)}</span></div>
                </div>

                <div className="flex justify-center gap-4 pt-4">
                  <Link href="/account" className="px-6 py-3 rounded-md bg-primary hover:bg-primary-dark text-white font-semibold text-sm">
                    View Details
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

                {!selectedRoom && !selectedPackage ? (
                  <div className="text-sm text-warm-gray py-6 text-center italic border border-dashed border-border rounded-lg bg-background/50">
                    Please select an accommodation to view summary.
                  </div>
                ) : (
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
                        {bookingType === "room" ? `${selectedRoom?.type}` : `${nights}N / ${nights + 1}D`}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2 text-xs text-warm-gray pt-3 border-t border-border">
                  <div className="flex justify-between">
                    <span>Dates</span>
                    <span className="font-medium text-charcoal">{checkIn.split("-").reverse().join("/")} → {checkOut.split("-").reverse().join("/")}</span>
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
                    <span className="flex flex-col">
                      <span>Subtotal</span>
                      <span className="text-[10px] opacity-70">
                        {bookingType === "room" 
                          ? `(${formatCurrency(selectedRoom?.basePrice || 0)} × ${nights} night${nights > 1 ? 's' : ''})`
                          : selectedPackage?.priceType === "per_person"
                            ? `(${formatCurrency((selectedPackage?.price || 0) / (selectedPackage?.durationNights || 1))} × ${adults + children} guests × ${nights} nights)`
                            : selectedPackage?.priceType === "per_couple"
                              ? `(${formatCurrency((selectedPackage?.price || 0) / (selectedPackage?.durationNights || 1))} × ${Math.ceil((adults + children)/2)} couple${Math.ceil((adults + children)/2) > 1 ? 's' : ''} × ${nights} nights)`
                              : `(${formatCurrency((selectedPackage?.price || 0) / (selectedPackage?.durationNights || 1))} × ${nights} nights)`}
                      </span>
                    </span>
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

      {/* Login Popup Modal */}
      {showLoginPopup && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowLoginPopup(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full p-8 relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Close Button */}
            <button 
              onClick={() => setShowLoginPopup(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="size-5" />
            </button>

            <div className="text-center mb-8">
              <div className="mx-auto size-12 bg-primary/10 text-primary flex items-center justify-center rounded-full mb-4">
                <User className="size-6" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-sm text-gray-500">Log in to auto-fill your saved details and track your reservation.</p>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value.toLowerCase())}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 pl-4 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <input 
                    type={showLoginPassword ? "text" : "password"} 
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pl-4 pr-10 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showLoginPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              
              {loginError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg flex items-start gap-2">
                  <span className="mt-0.5 font-bold">!</span>
                  <span>{loginError}</span>
                </div>
              )}
              
              <button 
                onClick={handleQuickLogin}
                disabled={isLoggingIn}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${isLoggingIn ? "bg-primary/70 cursor-not-allowed shadow-none text-white/90" : "bg-primary hover:bg-primary-dark text-white shadow-primary/20 hover:shadow-primary/30"}`}
              >
                {isLoggingIn ? <Loader2 className="size-5 animate-spin" /> : "Log In Securely"}
              </button>
              
              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-xs font-medium text-gray-400 uppercase tracking-widest">Or</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>
              
              <button 
                onClick={() => {
                  setShowLoginPopup(false);
                  setStep(3);
                }}
                className="w-full py-3.5 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-bold text-sm transition-all"
              >
                Continue as Guest
              </button>
            </div>
          </div>
        </div>
      )}
        
      {/* Animated Toast Notification */}
      <div className={`fixed top-24 right-4 z-[200] transition-all duration-500 ease-in-out ${showToast ? 'translate-x-0 opacity-100' : 'translate-x-[150%] opacity-0'}`}>
        <div className="bg-white rounded-xl shadow-2xl border-l-4 border-red-500 p-4 flex items-start gap-3 min-w-[320px] max-w-sm">
          <div className="bg-red-50 text-red-500 rounded-full p-2 flex-shrink-0 mt-0.5">
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-gray-900 mb-0.5">Wait a moment!</h4>
            <p className="text-sm text-gray-600 leading-snug">{toastMessage}</p>
          </div>
          <button onClick={() => setShowToast(false)} className="flex-shrink-0 text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors">
            <X className="size-4" />
          </button>
        </div>
      </div>
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