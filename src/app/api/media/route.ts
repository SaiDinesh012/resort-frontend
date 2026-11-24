import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Media from "@/lib/models/Media";
import cloudinary from "@/lib/cloudinary";

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const query: any = {};
    if (category && category !== "all") query.category = category;

    const mediaItems = await Media.find(query).sort({ createdAt: -1 });

    return NextResponse.json(mediaItems);
  } catch (error: any) {
    console.error("Error fetching media:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch media" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const imageToUpload = body.fileData || body.url;
    let finalUrl = body.url;
    let finalThumbnail = body.thumbnailUrl || body.url;
    let width = body.width || 1200;
    let height = body.height || 800;
    let fileSizeKb = body.fileSizeKb || 250;
    let format = body.format || "jpg";

    if (imageToUpload) {
      try {
        const uploadRes = await cloudinary.uploader.upload(imageToUpload, {
          folder: "resort-booking",
          resource_type: "auto",
        });
        finalUrl = uploadRes.secure_url;
        finalThumbnail = uploadRes.secure_url;
        width = uploadRes.width;
        height = uploadRes.height;
        fileSizeKb = Math.round(uploadRes.bytes / 1024);
        format = uploadRes.format || "jpg";
      } catch (cloudErr: any) {
        console.warn("Cloudinary upload warning:", cloudErr.message);
      }
    }

    if (!body.title || !finalUrl) {
      return NextResponse.json({ error: "Title and valid image file or URL are required." }, { status: 400 });
    }

    const id = body.id || `med-${Date.now()}`;
    const newMedia = await Media.create({
      ...body,
      id,
      url: finalUrl,
      thumbnailUrl: finalThumbnail,
      width,
      height,
      fileSizeKb,
      format,
      fileName: body.fileName || `resort-${Date.now()}.${format}`,
    });

    return NextResponse.json(newMedia, { status: 201 });
  } catch (error: any) {
    console.error("Error creating media item:", error);
    return NextResponse.json({ error: error.message || "Failed to create media item" }, { status: 500 });
  }
}
