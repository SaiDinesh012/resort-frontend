import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Room from "@/lib/models/Room";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params;

    const room = await Room.findOne({ $or: [{ id }, { slug: id }] });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json(room);
  } catch (error: any) {
    console.error("Error fetching room:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch room" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params;
    const body = await request.json();

    const updatedRoom = await Room.findOneAndUpdate(
      { $or: [{ id }, { _id: id }] },
      { $set: body },
      { new: true }
    );

    if (!updatedRoom) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json(updatedRoom);
  } catch (error: any) {
    console.error("Error updating room:", error);
    return NextResponse.json({ error: error.message || "Failed to update room" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params;

    const deletedRoom = await Room.findOneAndDelete({ $or: [{ id }, { _id: id }] });

    if (!deletedRoom) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Room deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting room:", error);
    return NextResponse.json({ error: error.message || "Failed to delete room" }, { status: 500 });
  }
}
