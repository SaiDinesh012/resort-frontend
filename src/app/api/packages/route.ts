import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Package from "@/lib/models/Package";

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const featured = searchParams.get("featured");

    const query: any = {};
    if (status) query.status = status;
    if (featured === "true") query.featured = true;

    const packages = await Package.find(query).sort({ createdAt: -1 });

    return NextResponse.json(packages);
  } catch (error: any) {
    console.error("Error fetching packages:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch packages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body.name || !body.price) {
      return NextResponse.json({ error: "Package Name and Price are required." }, { status: 400 });
    }

    const id = body.id || `pkg-${Date.now()}`;
    const slug = body.slug || body.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");

    const newPackage = await Package.create({
      ...body,
      id,
      slug,
      images: body.images?.length ? body.images : ["https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80"],
    });

    return NextResponse.json(newPackage, { status: 201 });
  } catch (error: any) {
    console.error("Error creating package:", error);
    return NextResponse.json({ error: error.message || "Failed to create package" }, { status: 500 });
  }
}
