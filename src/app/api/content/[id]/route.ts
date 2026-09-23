import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { BlogPost, Review, FAQ, Attraction } from "@/lib/models/Content";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "blog";

    if (type === "blog") {
      const post = await BlogPost.findOne({ $or: [{ id }, { slug: id }] });
      if (!post) return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
      return NextResponse.json(post);
    }

    if (type === "review") {
      const review = await Review.findOne({ id });
      if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });
      return NextResponse.json(review);
    }

    if (type === "faq") {
      const faq = await FAQ.findOne({ id });
      if (!faq) return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
      return NextResponse.json(faq);
    }

    if (type === "attraction") {
      const attraction = await Attraction.findOne({ id });
      if (!attraction) return NextResponse.json({ error: "Attraction not found" }, { status: 404 });
      return NextResponse.json(attraction);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error: any) {
    console.error("Error fetching content item:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch content item" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "blog";
    const body = await request.json();

    if (type === "blog") {
      const updated = await BlogPost.findOneAndUpdate({ $or: [{ id }, { slug: id }] }, { $set: body }, { new: true });
      return NextResponse.json(updated);
    }

    if (type === "review") {
      const updated = await Review.findOneAndUpdate({ id }, { $set: body }, { new: true });
      return NextResponse.json(updated);
    }

    if (type === "faq") {
      const updated = await FAQ.findOneAndUpdate({ id }, { $set: body }, { new: true });
      return NextResponse.json(updated);
    }

    if (type === "attraction") {
      const updated = await Attraction.findOneAndUpdate({ id }, { $set: body }, { new: true });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error: any) {
    console.error("Error updating content item:", error);
    return NextResponse.json({ error: error.message || "Failed to update content item" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "blog";

    if (type === "blog") {
      await BlogPost.findOneAndDelete({ $or: [{ id }, { slug: id }] });
      return NextResponse.json({ success: true, message: "Blog post deleted" });
    }

    if (type === "review") {
      await Review.findOneAndDelete({ id });
      return NextResponse.json({ success: true, message: "Review deleted" });
    }

    if (type === "faq") {
      await FAQ.findOneAndDelete({ id });
      return NextResponse.json({ success: true, message: "FAQ deleted" });
    }

    if (type === "attraction") {
      await Attraction.findOneAndDelete({ id });
      return NextResponse.json({ success: true, message: "Attraction deleted" });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error: any) {
    console.error("Error deleting content item:", error);
    return NextResponse.json({ error: error.message || "Failed to delete content item" }, { status: 500 });
  }
}
