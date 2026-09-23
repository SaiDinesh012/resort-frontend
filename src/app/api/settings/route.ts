import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
import connectDB from "@/lib/mongodb";
import Setting from "@/lib/models/Setting";
import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION, SITE_PHONE, SITE_EMAIL, SITE_ADDRESS } from "@/lib/constants";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key") || "site_config";

    const setting = await Setting.findOne({ key });

    if (key === "site_config") {
      const defaults = {
        siteName: SITE_NAME,
        logoUrl: "",
        tagline: SITE_TAGLINE,
        description: SITE_DESCRIPTION,
        phone: SITE_PHONE,
        email: SITE_EMAIL,
        address: SITE_ADDRESS,
        taxRate: 18,
        currency: "INR",
        heroImage: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&q=80",
        heroTitle: "Luxury Escape in the Western Ghats",
        heroSubtitle: "Where Wilderness Meets Unrivaled Sophistication",
        heroTextColor: "#ffffff",
      };

      if (!setting) {
        const created = await Setting.create({ key, value: defaults });
        return NextResponse.json(created.value);
      }

      return NextResponse.json({ ...defaults, ...setting.value });
    }

    if (!setting) {
      return NextResponse.json(null);
    }

    revalidatePath("/", "layout");
    return NextResponse.json(setting.value);
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key") || "site_config";
    const body = await request.json();

    const setting = await Setting.findOneAndUpdate(
      { key },
      { key, value: body },
      { upsert: true, new: true }
    );

    return NextResponse.json(setting.value);
  } catch (error: any) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: error.message || "Failed to update settings" }, { status: 500 });
  }
}
