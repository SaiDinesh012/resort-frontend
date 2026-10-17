import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import LegalPage from "@/lib/models/LegalPage";
import { initialLegalPolicies } from "@/data/mock/legal";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const query: any = {};
    if (status && status !== "all") query.status = status;

    let pages = await LegalPage.find(query).sort({ order: 1, createdAt: 1 });

    // Seed defaults into MongoDB if collection is currently empty
    if (pages.length === 0 && Object.keys(query).length === 0) {
      await LegalPage.insertMany(initialLegalPolicies);
      pages = await LegalPage.find({}).sort({ order: 1, createdAt: 1 });
    }

    return NextResponse.json(pages);
  } catch (error: any) {
    console.error("Error fetching legal pages:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch legal pages" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: "Title and content are required." },
        { status: 400 }
      );
    }

    const slug =
      body.slug ||
      body.title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");

    const existing = await LegalPage.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { error: "A legal page with this slug already exists." },
        { status: 409 }
      );
    }

    const newPage = await LegalPage.create({
      ...body,
      slug,
      lastUpdated: body.lastUpdated || "October 2026",
      status: body.status || "published",
    });

    return NextResponse.json(newPage, { status: 201 });
  } catch (error: any) {
    console.error("Error creating legal page:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create legal page" },
      { status: 500 }
    );
  }
}
