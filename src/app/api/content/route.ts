import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { BlogPost, Review, FAQ, Attraction } from "@/lib/models/Content";

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "blog";
    const status = searchParams.get("status");

    if (type === "blog") {
      const query: any = {};
      if (status) query.status = status;
      const posts = await BlogPost.find(query).sort({ createdAt: -1 });
      return NextResponse.json(posts);
    }

    if (type === "review") {
      const query: any = {};
      if (status) query.status = status;
      const reviews = await Review.find(query).sort({ createdAt: -1 });
      return NextResponse.json(reviews);
    }

    if (type === "faq") {
      const faqs = await FAQ.find({}).sort({ order: 1 });
      return NextResponse.json(faqs);
    }

    if (type === "attraction") {
      const attractions = await Attraction.find({}).sort({ createdAt: -1 });
      return NextResponse.json(attractions);
    }

    return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
  } catch (error: any) {
    console.error("Error fetching content:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch content" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "blog";
    const body = await request.json();

    if (type === "blog") {
      const id = body.id || `blog-${Date.now()}`;
      const slug = body.slug || body.title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
      const newPost = await BlogPost.create({ ...body, id, slug });
      return NextResponse.json(newPost, { status: 201 });
    }

    if (type === "review") {
      const id = body.id || `rev-${Date.now()}`;
      const newReview = await Review.create({ ...body, id });
      return NextResponse.json(newReview, { status: 201 });
    }

    if (type === "faq") {
      const id = body.id || `faq-${Date.now()}`;
      const newFAQ = await FAQ.create({ ...body, id });
      return NextResponse.json(newFAQ, { status: 201 });
    }

    if (type === "attraction") {
      const id = body.id || `att-${Date.now()}`;
      const newAttraction = await Attraction.create({ ...body, id });
      return NextResponse.json(newAttraction, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
  } catch (error: any) {
    console.error("Error creating content item:", error);
    return NextResponse.json({ error: error.message || "Failed to create content item" }, { status: 500 });
  }
}
