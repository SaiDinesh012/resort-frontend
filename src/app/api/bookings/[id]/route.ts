import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";

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
        event: "Status Changed",
        description: `Booking status updated from ${booking.bookingStatus} to ${body.bookingStatus}`,
        actor: "Admin",
      });
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
