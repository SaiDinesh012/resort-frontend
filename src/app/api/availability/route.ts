import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Room from "@/lib/models/Room";
import Booking from "@/lib/models/Booking";

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const adults = parseInt(searchParams.get("adults") || "1", 10);
    const children = parseInt(searchParams.get("children") || "0", 10);
    const requestedRooms = parseInt(searchParams.get("rooms") || "1", 10);

    if (!checkIn || !checkOut) {
      return NextResponse.json(
        { error: "Check-in and Check-out dates are required." },
        { status: 400 }
      );
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
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

    const totalGuests = adults + children;
    const nights = Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Fetch rooms
    const allRooms = await Room.find({ status: { $ne: "maintenance" } });

    // Check existing overlapping bookings
    const overlappingBookings = await Booking.find({
      bookingStatus: { $nin: ["cancelled"] } as any,
      $or: [
        {
          checkIn: { $lt: checkOut },
          checkOut: { $gt: checkIn },
        },
      ],
    });

    const bookingsByRoom: Record<string, number> = {};
    overlappingBookings.forEach((b: any) => {
      const rId = b.roomId;
      if (rId) {
        bookingsByRoom[rId] = (bookingsByRoom[rId] || 0) + 1;
      }
    });

    const availableRooms = allRooms
      .filter((room: any) => {
        if (room.maxOccupancy && room.maxOccupancy < totalGuests) {
          return false;
        }
        const totalInventory = room.inventory || room.totalRooms || 5;
        const bookedCount = bookingsByRoom[room.id] || 0;
        return totalInventory - bookedCount >= requestedRooms;
      })
      .map((room: any) => {
        const totalInventory = room.inventory || room.totalRooms || 5;
        const bookedCount = bookingsByRoom[room.id] || 0;
        const remainingInventory = Math.max(0, totalInventory - bookedCount);
        const totalPrice = (room.basePrice || 0) * nights;

        return {
          ...room.toObject(),
          availableInventory: remainingInventory,
          nights,
          totalPrice,
          isAvailable: remainingInventory > 0,
        };
      });

    return NextResponse.json({
      success: true,
      checkIn,
      checkOut,
      nights,
      adults,
      children,
      totalAvailable: availableRooms.length,
      rooms: availableRooms,
    });
  } catch (error: any) {
    console.error("Availability API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check room availability" },
      { status: 500 }
    );
  }
}
