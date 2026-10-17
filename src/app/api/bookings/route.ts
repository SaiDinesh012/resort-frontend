import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";
import Customer from "@/lib/models/Customer";
import Payment from "@/lib/models/Payment";
import { mockBookings } from "@/data/mock/bookings";

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

    let bookings = await Booking.find(query).sort({ createdAt: -1 });

    if (bookings.length === 0 && Object.keys(query).length === 0) {
      await Booking.insertMany(mockBookings);
      bookings = await Booking.find({}).sort({ createdAt: -1 });
    }

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

    const bookingId = `book-${Date.now()}`;
    const bookingNumber = `RG-${Math.floor(100000 + Math.random() * 900000)}`;

    const newBooking = await Booking.create({
      id: bookingId,
      bookingNumber,
      type: body.type || "room",
      roomId: body.roomId,
      roomName: body.roomName,
      packageId: body.packageId,
      packageName: body.packageName,
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      nights: body.nights || 1,
      adults: body.adults || 1,
      children: body.children || 0,
      guestDetails: body.guestDetails,
      priceBreakdown: body.priceBreakdown,
      paymentStatus: body.paymentStatus || "paid",
      paymentMethod: body.paymentMethod || "card",
      bookingStatus: "confirmed",
      notes: body.notes || "Booked online via Royal Gradin Website",
      timeline: [
        {
          timestamp: new Date().toISOString(),
          event: "Booking Created",
          description: `Booking #${bookingNumber} created successfully`,
          actor: `${body.guestDetails?.firstName} ${body.guestDetails?.lastName}`,
        },
      ],
    });

    // Auto update or create Customer
    if (body.guestDetails?.email) {
      const existingCustomer = await Customer.findOne({ email: body.guestDetails.email });
      if (existingCustomer) {
        existingCustomer.totalBookings += 1;
        existingCustomer.totalSpend += body.priceBreakdown?.total || 0;
        existingCustomer.lastBookingDate = new Date().toISOString();
        await existingCustomer.save();
      } else {
        await Customer.create({
          id: `cust-${Date.now()}`,
          firstName: body.guestDetails.firstName,
          lastName: body.guestDetails.lastName,
          email: body.guestDetails.email,
          phone: body.guestDetails.phone,
          address: body.guestDetails.address,
          city: body.guestDetails.city,
          country: body.guestDetails.country || "India",
          totalBookings: 1,
          totalSpend: body.priceBreakdown?.total || 0,
          lastBookingDate: new Date().toISOString(),
          status: "active",
        });
      }
    }

    // Auto create Payment record
    const paymentId = `PAY-${Math.floor(100000 + Math.random() * 900000)}`;
    await Payment.create({
      id: `pay-${Date.now()}`,
      paymentId,
      bookingId,
      bookingNumber,
      customerId: body.guestDetails?.email || `cust-${Date.now()}`,
      customerName: `${body.guestDetails?.firstName} ${body.guestDetails?.lastName}`,
      amount: body.priceBreakdown?.total || 0,
      currency: "INR",
      method: body.paymentMethod || "card",
      status: "success",
      gateway: "razorpay",
      gatewayOrderId: `order_${Math.random().toString(36).substring(7)}`,
      gatewayPaymentId: `pay_${Math.random().toString(36).substring(7)}`,
    });

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error: any) {
    console.error("Error creating booking:", error);
    return NextResponse.json({ error: error.message || "Failed to create booking" }, { status: 500 });
  }
}
