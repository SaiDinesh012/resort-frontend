import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";
import Customer from "@/lib/models/Customer";
import Payment from "@/lib/models/Payment";
import Room from "@/lib/models/Room";
import { Package } from "@/lib/models/Package";

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const email = searchParams.get("email");
    const search = searchParams.get("search");

    const query: any = {};
    if (status && status !== "all") query.bookingStatus = status;
    if (type) query.type = type;
    if (email) {
      query["guestDetails.email"] = { $regex: new RegExp(`^${email.trim()}$`, "i") };
    }
    if (search) {
      query.$or = [
        { bookingNumber: { $regex: search.trim(), $options: "i" } },
        { "guestDetails.firstName": { $regex: search.trim(), $options: "i" } },
        { "guestDetails.lastName": { $regex: search.trim(), $options: "i" } },
        { "guestDetails.email": { $regex: search.trim(), $options: "i" } },
        { "guestDetails.phone": { $regex: search.trim(), $options: "i" } },
      ];
    }

    const bookings = await Booking.find(query).sort({ createdAt: -1 });

    return NextResponse.json(bookings);
  } catch (error: any) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    // 1. Validate dates
    if (!body.checkIn || !body.checkOut) {
      return NextResponse.json(
        { error: "Check-in and Check-out dates are required." },
        { status: 400 }
      );
    }

    const checkInDate = new Date(body.checkIn);
    const checkOutDate = new Date(body.checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format. Please use YYYY-MM-DD." },
        { status: 400 }
      );
    }

    if (checkInDate < today) {
      return NextResponse.json(
        { error: "Check-in date cannot be in the past." },
        { status: 400 }
      );
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { error: "Check-out date must be after check-in date." },
        { status: 400 }
      );
    }

    const nights = Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));
    const bookingType = body.type || (body.packageId ? "package" : "room");

    let resolvedName = body.roomName || body.packageName || "Resort Stay";
    let baseRate = 8500;

    // 2. Room Overbooking Check & Rate Resolution
    if (bookingType === "room" && body.roomId) {
      const room = await Room.findOne({
        $or: [{ id: body.roomId }, { slug: body.roomId }],
      });

      if (room) {
        resolvedName = room.name;
        baseRate = room.basePrice || 8500;

        // Check overlapping active bookings
        const overlappingCount = await Booking.countDocuments({
          roomId: room.id,
          bookingStatus: { $nin: ["cancelled"] },
          $or: [
            {
              checkIn: { $lt: body.checkOut },
              checkOut: { $gt: body.checkIn },
            },
          ],
        });

        const totalInventory = (room as any).inventory || (room as any).totalRooms || 5;
        if (overlappingCount >= totalInventory) {
          return NextResponse.json(
            {
              error: `Sorry, ${room.name} is fully booked for ${body.checkIn} to ${body.checkOut}. Please select alternate dates or choose another room.`,
            },
            { status: 409 }
          );
        }
      }
    } else if (bookingType === "package" && body.packageId) {
      const pkg = await Package.findOne({
        $or: [{ id: body.packageId }, { slug: body.packageId }],
      });
      if (pkg) {
        resolvedName = pkg.name;
        baseRate = pkg.price || 32000;
      }
    }

    // 3. Server-side authoritative price calculation
    const rawSubtotal = bookingType === "package" ? baseRate : baseRate * nights;
    let discountAmount = 0;
    const couponCode = body.priceBreakdown?.couponCode?.trim().toUpperCase();

    if (couponCode === "WELCOME10") {
      discountAmount = Math.min(rawSubtotal * 0.1, 3000);
    } else if (couponCode === "ROYALGRAND") {
      discountAmount = Math.min(5000, rawSubtotal * 0.2);
    }

    const discountedSubtotal = Math.max(0, rawSubtotal - discountAmount);
    const taxRate = 18;
    const taxAmount = Math.round(discountedSubtotal * (taxRate / 100));
    const verifiedGrandTotal = discountedSubtotal + taxAmount;

    const verifiedPriceBreakdown = {
      basePrice: baseRate,
      nights,
      subtotal: rawSubtotal,
      discountAmount,
      couponCode: discountAmount > 0 ? couponCode : undefined,
      taxRate,
      taxAmount,
      total: verifiedGrandTotal,
    };

    // 4. Determine Payment & Booking Status
    const paymentMethod = body.paymentMethod || "pay_at_resort";
    const isOnlinePaid = body.paymentStatus === "paid" && Boolean(body.paymentId || body.gatewayPaymentId);
    const paymentStatus = isOnlinePaid ? "paid" : "pending";
    const bookingStatus = "confirmed";

    const bookingId = `book-${Date.now()}`;
    const bookingNumber = `RG-${Math.floor(100000 + Math.random() * 900000)}`;

    const newBooking = await Booking.create({
      id: bookingId,
      bookingNumber,
      type: bookingType,
      roomId: body.roomId,
      roomName: bookingType === "room" ? resolvedName : undefined,
      packageId: body.packageId,
      packageName: bookingType === "package" ? resolvedName : undefined,
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      nights,
      adults: body.adults || 1,
      children: body.children || 0,
      guestDetails: body.guestDetails,
      priceBreakdown: verifiedPriceBreakdown,
      paymentStatus,
      paymentMethod,
      bookingStatus,
      notes: body.notes || "Booked online via Royalgrandin Resort Website",
      timeline: [
        {
          timestamp: new Date().toISOString(),
          event: "Booking Created",
          description: `Booking #${bookingNumber} confirmed (${paymentStatus === "paid" ? "Paid" : "Pay at Resort"})`,
          actor: `${body.guestDetails?.firstName || "Guest"} ${body.guestDetails?.lastName || ""}`,
        },
      ],
    });

    // 5. Update or create Customer
    if (body.guestDetails?.email) {
      const existingCustomer = await Customer.findOne({ email: body.guestDetails.email });
      if (existingCustomer) {
        existingCustomer.totalBookings += 1;
        existingCustomer.totalSpend += verifiedGrandTotal;
        existingCustomer.lastBookingDate = new Date().toISOString();
        await existingCustomer.save();
      } else {
        await Customer.create({
          id: `cust-${Date.now()}`,
          firstName: body.guestDetails.firstName || "Guest",
          lastName: body.guestDetails.lastName || "User",
          email: body.guestDetails.email,
          phone: body.guestDetails.phone || "+91 98765 43210",
          address: body.guestDetails.address || "",
          city: body.guestDetails.city || "Visakhapatnam",
          country: body.guestDetails.country || "India",
          totalBookings: 1,
          totalSpend: verifiedGrandTotal,
          lastBookingDate: new Date().toISOString(),
          status: "active",
        });
      }
    }

    // 6. Record Payment
    const paymentId = `PAY-${Math.floor(100000 + Math.random() * 900000)}`;
    await Payment.create({
      id: `pay-${Date.now()}`,
      paymentId,
      bookingId,
      bookingNumber,
      customerId: body.guestDetails?.email || `cust-${Date.now()}`,
      customerName: `${body.guestDetails?.firstName || "Guest"} ${body.guestDetails?.lastName || "User"}`,
      amount: verifiedGrandTotal,
      currency: "INR",
      method: (paymentMethod === "pay_at_resort" ? "bank_transfer" : paymentMethod) as any,
      status: paymentStatus === "paid" ? "success" : "pending",
      gateway: paymentMethod === "pay_at_resort" ? "manual" : "razorpay",
      gatewayOrderId: body.gatewayOrderId || `ord_${bookingNumber}`,
      gatewayPaymentId: body.gatewayPaymentId || (paymentStatus === "paid" ? paymentId : undefined),
    });

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error: any) {
    console.error("Error creating booking:", error);
    return NextResponse.json({ error: error.message || "Failed to create booking" }, { status: 500 });
  }
}
