import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Media from "@/lib/models/Media";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params;

    const media = await Media.findOne({ id });

    if (!media) {
      return NextResponse.json({ error: "Media item not found" }, { status: 404 });
    }

    return NextResponse.json(media);
  } catch (error: any) {
    console.error("Error fetching media item:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch media item" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params;
    const body = await request.json();

    const updatedMedia = await Media.findOneAndUpdate({ id }, { $set: body }, { new: true });

    if (!updatedMedia) {
      return NextResponse.json({ error: "Media item not found" }, { status: 404 });
    }

    return NextResponse.json(updatedMedia);
  } catch (error: any) {
    console.error("Error updating media item:", error);
    return NextResponse.json({ error: error.message || "Failed to update media item" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params;

    const deletedMedia = await Media.findOneAndDelete({ id });

    if (!deletedMedia) {
      return NextResponse.json({ error: "Media item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Media item deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting media item:", error);
    return NextResponse.json({ error: error.message || "Failed to delete media item" }, { status: 500 });
  }
}
