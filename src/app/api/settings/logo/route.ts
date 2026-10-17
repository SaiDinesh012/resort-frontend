import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Setting from "@/lib/models/Setting";
import cloudinary from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const imageToUpload = body.fileData || body.url;

    if (!imageToUpload) {
      return NextResponse.json({ error: "No image file data or URL provided" }, { status: 400 });
    }

    let finalLogoUrl = body.url;

    if (imageToUpload.startsWith("data:image/") || !body.url) {
      try {
        const uploadRes = await cloudinary.uploader.upload(imageToUpload, {
          folder: "resort-booking/logo",
          resource_type: "auto",
        });
        finalLogoUrl = uploadRes.secure_url;
      } catch (cloudErr: any) {
        console.error("Cloudinary logo upload error:", cloudErr);
        return NextResponse.json({ error: "Failed to upload image to Cloudinary: " + cloudErr.message }, { status: 500 });
      }
    }

    // Save directly to site_config setting
    const key = "site_config";
    let existing = await Setting.findOne({ key });
    const existingVal = (existing && existing.value ? existing.value : {}) as Record<string, any>;
    const updatedValue = { ...existingVal, logoUrl: finalLogoUrl };

    const setting = await Setting.findOneAndUpdate(
      { key },
      { key, value: updatedValue },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      logoUrl: finalLogoUrl,
      settings: setting.value,
    });
  } catch (error: any) {
    console.error("Error uploading logo:", error);
    return NextResponse.json({ error: error.message || "Failed to upload logo" }, { status: 500 });
  }
}
