import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Room from "@/lib/models/Room";
import Package from "@/lib/models/Package";
import Booking from "@/lib/models/Booking";
import Customer from "@/lib/models/Customer";
import Payment from "@/lib/models/Payment";
import Media from "@/lib/models/Media";
import { BlogPost, Review, FAQ, Attraction } from "@/lib/models/Content";
import Setting from "@/lib/models/Setting";

export async function GET(request: Request) {
  try {
    await connectDB();

    const [
      rooms,
      packages,
      bookings,
      customers,
      payments,
      media,
      blogPosts,
      reviews,
      faqs,
      attractions,
      settings,
    ] = await Promise.all([
      Room.countDocuments(),
      Package.countDocuments(),
      Booking.countDocuments(),
      Customer.countDocuments(),
      Payment.countDocuments(),
      Media.countDocuments(),
      BlogPost.countDocuments(),
      Review.countDocuments(),
      FAQ.countDocuments(),
      Attraction.countDocuments(),
      Setting.countDocuments(),
    ]);

    return NextResponse.json({
      status: "connected",
      message: "MongoDB Atlas live database connected. All data is managed directly in database.",
      counts: {
        rooms,
        packages,
        bookings,
        customers,
        payments,
        media,
        blogPosts,
        reviews,
        faqs,
        attractions,
        settings,
      },
    });
  } catch (error: any) {
    console.error("Database status error:", error);
    return NextResponse.json({ error: error.message || "Failed to check database status" }, { status: 500 });
  }
}
