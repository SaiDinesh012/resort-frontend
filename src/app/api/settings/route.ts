import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Setting from "@/lib/models/Setting";
import cloudinary from "@/lib/cloudinary";

// Initial config seeded into MongoDB only on first run (not used as a static fallback)
const INITIAL_SITE_CONFIG = {
  siteName: "Royal Grand IN Resorts",
  tagline: "Stay Once, Carry Memories Forever",
  description:
    "Nestled amidst the lush forests and serene landscapes of Maredumilli, Royal Grand IN Resorts offers an unparalleled luxury escape where royalty meets the wild.",
  footerDescription:
    "Nestled amidst the lush forests and tranquil canopy of Maredumilli, Royal Grand IN Resorts offers a refined sanctuary where luxury harmonizes with pristine nature.",
  logoUrl: "",
  phone: "+91 98765 43210",
  alternatePhone: "+91 94949 12345",
  email: "reservations@royalgrandin.com",
  address: "Maredumilli, East Godavari District, Andhra Pradesh 533288, India",
  googleMapsUrl: "https://maps.google.com/?q=Royal+Grand+IN+Resorts+Maredumilli+Andhra+Pradesh",
  instagramUrl: "https://instagram.com/royalgrandinresorts",
  facebookUrl: "https://facebook.com/royalgrandinresorts",
  youtubeUrl: "https://youtube.com/@royalgrandinresorts",
  whatsappNumber: "+91 98765 43210",
  tripadvisorUrl: "",
  newsletterHeading: "Subscribe to our Newsletter",
  newsletterSubheading: "Seasonal offers, curated packages and resort stories — in your inbox.",
  copyrightText: "© {year} Royal Grand IN Resorts. All rights reserved.",
  footerLocationNote: "Maredumilli, East Godavari District, Andhra Pradesh, India",
  taxRate: 18,
  currency: "INR",
  checkInTime: "02:00 PM",
  checkOutTime: "11:00 AM",
  heroImage:
    "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=90",
  heroTitle: "Where Royalty Meets the Wild",
  heroSubtitle:
    "A luxurious retreat surrounded by lush forests, misty hills and the untouched beauty of Maredumilli.",
};

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key") || "site_config";

    let setting = await Setting.findOne({ key });

    if (!setting) {
      // First time: write initial config to MongoDB — all subsequent reads come from DB
      setting = await Setting.create({
        key,
        value: INITIAL_SITE_CONFIG,
      });
      return NextResponse.json(setting.value);
    }

    let val = (setting.value as Record<string, any>) || {};
    let needsMigration = false;

    // Auto-migrate legacy placeholder names stored in DB
    if (val.siteName === "Vanapriya Resort" || val.siteName === "Royal Gradin" || !val.siteName) {
      val.siteName = "Royal Grand IN Resorts";
      needsMigration = true;
    }
    if (val.tagline === "Where Wilderness Meets Luxury" || val.tagline === "Mothugudem, Andhra Pradesh" || !val.tagline) {
      val.tagline = "Stay Once, Carry Memories Forever";
      needsMigration = true;
    }
    if (val.email === "reservations@vanapriya.com" || val.email === "reservations@royalgradin.com" || !val.email) {
      val.email = "reservations@royalgrandin.com";
      needsMigration = true;
    }
    if (!val.address || val.address.includes("Chikmagalur") || val.address.includes("Mothugudem")) {
      val.address = "Maredumilli, East Godavari District, Andhra Pradesh 533288, India";
      needsMigration = true;
    }
    if (!val.heroTitle || val.heroTitle.includes("Western Ghats") || val.heroTitle.includes("Royal Gradin")) {
      val.heroTitle = "Where Royalty Meets the Wild";
      val.heroSubtitle = "A luxurious retreat surrounded by lush forests, misty hills and the untouched beauty of Maredumilli.";
      needsMigration = true;
    }

    // Persist migration to DB so it's clean from now on
    if (needsMigration) {
      await Setting.findOneAndUpdate({ key }, { value: val }, { new: true });
    }

    return NextResponse.json(val);
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key") || "site_config";
    const body = await request.json();

    // If logo data (base64) is provided, upload directly to Cloudinary
    const logoToUpload =
      body.logoData ||
      (body.logoUrl && body.logoUrl.startsWith("data:image/")
        ? body.logoUrl
        : null);

    if (logoToUpload) {
      try {
        const uploadRes = await cloudinary.uploader.upload(logoToUpload, {
          folder: "resort-booking/logo",
          resource_type: "auto",
        });
        body.logoUrl = uploadRes.secure_url;
        delete body.logoData;
      } catch (cloudErr: any) {
        console.warn(
          "Cloudinary logo upload warning in Next API route:",
          cloudErr.message
        );
      }
    }

    // Fetch existing DB value (no static fallback — only what's in DB)
    const existing = await Setting.findOne({ key });
    const existingVal = (
      existing && existing.value ? existing.value : {}
    ) as Record<string, any>;
    const updatedValue = { ...existingVal, ...body };

    const setting = await Setting.findOneAndUpdate(
      { key },
      { key, value: updatedValue },
      { upsert: true, new: true }
    );

    return NextResponse.json(setting.value);
  } catch (error: any) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
