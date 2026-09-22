import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Package from "@/lib/models/Package";
import { mockPackages } from "@/data/mock/packages";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params;

    let pkg = await Package.findOne({ $or: [{ id }, { slug: id }] });

    if (!pkg) {
      const mockMatch = mockPackages.find((p) => p.id === id || p.slug === id);
      if (mockMatch) {
        await Package.create(mockMatch);
        pkg = await Package.findOne({ $or: [{ id }, { slug: id }] });
      }
    }

    if (!pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    return NextResponse.json(pkg);
  } catch (error: any) {
    console.error("Error fetching package:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch package" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params;
    const body = await request.json();

    const updatedPackage = await Package.findOneAndUpdate(
      { $or: [{ id }, { _id: id }] },
      { $set: body },
      { new: true }
    );

    if (!updatedPackage) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    return NextResponse.json(updatedPackage);
  } catch (error: any) {
    console.error("Error updating package:", error);
    return NextResponse.json({ error: error.message || "Failed to update package" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params;

    const deletedPackage = await Package.findOneAndDelete({ $or: [{ id }, { _id: id }] });

    if (!deletedPackage) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Package deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting package:", error);
    return NextResponse.json({ error: error.message || "Failed to delete package" }, { status: 500 });
  }
}
