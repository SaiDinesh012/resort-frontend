import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import LegalPage from "@/lib/models/LegalPage";
import { initialLegalPolicies } from "@/data/mock/legal";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await context.params;

    let page = await LegalPage.findOne({ slug });

    if (!page) {
      // Check if it's one of the initial defaults and seed it
      const fallback = initialLegalPolicies.find((p) => p.slug === slug);
      if (fallback) {
        page = await LegalPage.create(fallback);
      }
    }

    if (!page) {
      return NextResponse.json({ error: "Legal policy page not found" }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error: any) {
    console.error("Error fetching legal page:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch legal page" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await context.params;
    const body = await request.json();

    const updated = await LegalPage.findOneAndUpdate(
      { slug },
      {
        $set: {
          ...body,
          updatedAt: new Date(),
        },
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Legal page updated successfully",
      page: updated,
    });
  } catch (error: any) {
    console.error("Error updating legal page:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update legal page" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await context.params;

    await LegalPage.findOneAndDelete({ slug });
    return NextResponse.json({ success: true, message: "Legal page deleted" });
  } catch (error: any) {
    console.error("Error deleting legal page:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete legal page" },
      { status: 500 }
    );
  }
}
