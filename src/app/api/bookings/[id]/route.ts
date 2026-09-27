import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";
import Room from "@/lib/models/Room";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params;

    const booking = await Booking.findOne({ $or: [{ id }, { bookingNumber: id }] });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error: any) {
    console.error("Error fetching booking:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch booking" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params;
    const body = await request.json();

    const booking = await Booking.findOne({ $or: [{ id }, { bookingNumber: id }] });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (body.bookingStatus && body.bookingStatus !== booking.bookingStatus) {
      booking.timeline.push({
        timestamp: new Date().toISOString(),
        event: `Status: ${body.bookingStatus}`,
        description: `Booking status updated from ${booking.bookingStatus} to ${body.bookingStatus}`,
        actor: body.actor || "Admin",
      });

      // Synchronize Room status with booking progression
      if (booking.roomId) {
        try {
          if (body.bookingStatus === "checked-in") {
            if (!body.actualCheckIn) body.actualCheckIn = new Date().toISOString();
            await Room.findOneAndUpdate(
              { $or: [{ id: booking.roomId }, { _id: booking.roomId }] },
              { status: "occupied", currentBookingId: booking.id, lockedUntil: booking.checkOut }
            );
          } else if (body.bookingStatus === "checked-out" || body.bookingStatus === "completed") {
            if (!body.actualCheckOut) body.actualCheckOut = new Date().toISOString();
            await Room.findOneAndUpdate(
              { $or: [{ id: booking.roomId }, { _id: booking.roomId }] },
              { status: "cleaning", currentBookingId: null }
            );
          } else if (body.bookingStatus === "cancelled") {
            await Room.findOneAndUpdate(
              { $or: [{ id: booking.roomId }, { _id: booking.roomId }] },
              { status: "available", currentBookingId: null, lockedUntil: null }
            );
          }
        } catch (rErr) {
          console.warn("Could not sync room status on booking update:", rErr);
        }
      }
    }

    Object.assign(booking, body);
    await booking.save();

    return NextResponse.json(booking);
  } catch (error: any) {
    console.error("Error updating booking:", error);
    return NextResponse.json({ error: error.message || "Failed to update booking" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params;

    const deletedBooking = await Booking.findOneAndDelete({ $or: [{ id }, { bookingNumber: id }] });

    if (!deletedBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Booking deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting booking:", error);
    return NextResponse.json({ error: error.message || "Failed to delete booking" }, { status: 500 });
  }
}
