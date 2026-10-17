import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { BlogPost, Review, FAQ, Attraction, Experience } from "@/lib/models/Content";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectDB();
    const { id } = await Promise.resolve(params);
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "experience";

    let result = null;

    if (type === "experience") {
      result = await Experience.findOneAndDelete({ $or: [{ id }, { _id: id }] });
    } else if (type === "blog") {
      result = await BlogPost.findOneAndDelete({ $or: [{ id }, { slug: id }, { _id: id }] });
    } else if (type === "faq") {
      result = await FAQ.findOneAndDelete({ $or: [{ id }, { _id: id }] });
    } else if (type === "attraction") {
      result = await Attraction.findOneAndDelete({ $or: [{ id }, { _id: id }] });
    } else if (type === "review") {
      result = await Review.findOneAndDelete({ $or: [{ id }, { _id: id }] });
    }

    if (!result) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Item deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting content item:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete item" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectDB();
    const { id } = await Promise.resolve(params);
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "experience";
    const body = await request.json();

    let updated = null;

    if (type === "experience") {
      updated = await Experience.findOneAndUpdate(
        { $or: [{ id }, { _id: id }] },
        { $set: body },
        { new: true }
      );
    } else if (type === "blog") {
      updated = await BlogPost.findOneAndUpdate(
        { $or: [{ id }, { slug: id }, { _id: id }] },
        { $set: body },
        { new: true }
      );
    } else if (type === "faq") {
      updated = await FAQ.findOneAndUpdate(
        { $or: [{ id }, { _id: id }] },
        { $set: body },
        { new: true }
      );
    } else if (type === "attraction") {
      updated = await Attraction.findOneAndUpdate(
        { $or: [{ id }, { _id: id }] },
        { $set: body },
        { new: true }
      );
    } else if (type === "review") {
      updated = await Review.findOneAndUpdate(
        { $or: [{ id }, { _id: id }] },
        { $set: body },
        { new: true }
      );
    }

    if (!updated) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating content item:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update item" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await connectDB();
    const { id } = await Promise.resolve(params);
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "experience";

    let item = null;

    if (type === "experience") {
      item = await Experience.findOne({ $or: [{ id }, { _id: id }] });
    } else if (type === "blog") {
      item = await BlogPost.findOne({ $or: [{ id }, { slug: id }, { _id: id }] });
    } else if (type === "faq") {
      item = await FAQ.findOne({ $or: [{ id }, { _id: id }] });
    } else if (type === "attraction") {
      item = await Attraction.findOne({ $or: [{ id }, { _id: id }] });
    } else if (type === "review") {
      item = await Review.findOne({ $or: [{ id }, { _id: id }] });
    }

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get item" },
      { status: 500 }
    );
  }
}
