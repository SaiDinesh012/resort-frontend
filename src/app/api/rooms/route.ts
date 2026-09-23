import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Room from "@/lib/models/Room";

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const featured = searchParams.get("featured");

    const query: any = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (featured === "true") query.featured = true;

    const rooms = await Room.find(query).sort({ createdAt: -1 });

    return NextResponse.json(rooms);
  } catch (error: any) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch rooms" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body.name || !body.basePrice) {
      return NextResponse.json({ error: "Name and Base Price are required." }, { status: 400 });
    }

    const id = body.id || `room-${Date.now()}`;
    const slug = body.slug || body.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");

    const newRoom = await Room.create({
      ...body,
      id,
      slug,
      images: body.images?.length ? body.images : ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"],
    });

    return NextResponse.json(newRoom, { status: 201 });
  } catch (error: any) {
    console.error("Error creating room:", error);
    return NextResponse.json({ error: error.message || "Failed to create room" }, { status: 500 });
  }
}
