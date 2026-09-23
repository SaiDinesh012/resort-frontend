import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Package from "@/lib/models/Package";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params;

    const filter = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { slug: id }, { _id: id }] }
      : { $or: [{ id }, { slug: id }] };

    const pkg = await Package.findOne(filter);

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

    const filter = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { _id: id }] }
      : { id };

    const updatedPackage = await Package.findOneAndUpdate(
      filter,
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

    const filter = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { _id: id }] }
      : { id };

    const deletedPackage = await Package.findOneAndDelete(filter);

    if (!deletedPackage) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Package deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting package:", error);
    return NextResponse.json({ error: error.message || "Failed to delete package" }, { status: 500 });
  }
}
