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

import { mockRooms } from "@/data/mock/rooms";
import { mockPackages } from "@/data/mock/packages";
import { mockBookings } from "@/data/mock/bookings";
import { mockCustomers } from "@/data/mock/customers";
import { mockPayments } from "@/data/mock/payments";
import { mockBlogPosts, mockReviews, mockFAQs, mockAttractions, mockMediaItems } from "@/data/mock/content";
import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION, SITE_PHONE, SITE_EMAIL, SITE_ADDRESS } from "@/lib/constants";

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";

    const roomCount = await Room.countDocuments();
    if (roomCount > 0 && !force) {
      return NextResponse.json({
        message: "Database already seeded.",
        counts: {
          rooms: roomCount,
          packages: await Package.countDocuments(),
          bookings: await Booking.countDocuments(),
          customers: await Customer.countDocuments(),
          payments: await Payment.countDocuments(),
          media: await Media.countDocuments(),
          blogPosts: await BlogPost.countDocuments(),
          reviews: await Review.countDocuments(),
          faqs: await FAQ.countDocuments(),
          attractions: await Attraction.countDocuments(),
        },
      });
    }

    if (force) {
      await Room.deleteMany({});
      await Package.deleteMany({});
      await Booking.deleteMany({});
      await Customer.deleteMany({});
      await Payment.deleteMany({});
      await Media.deleteMany({});
      await BlogPost.deleteMany({});
      await Review.deleteMany({});
      await FAQ.deleteMany({});
      await Attraction.deleteMany({});
      await Setting.deleteMany({});
    }

    await Room.insertMany(mockRooms);
    await Package.insertMany(mockPackages);
    await Booking.insertMany(mockBookings);
    await Customer.insertMany(mockCustomers);
    await Payment.insertMany(mockPayments);
    await Media.insertMany(mockMediaItems);
    await BlogPost.insertMany(mockBlogPosts);
    await Review.insertMany(mockReviews);
    await FAQ.insertMany(mockFAQs);
    await Attraction.insertMany(mockAttractions);

    // Initial settings
    await Setting.create({
      key: "site_config",
      value: {
        siteName: SITE_NAME,
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
      },
    });

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully!",
      counts: {
        rooms: mockRooms.length,
        packages: mockPackages.length,
        bookings: mockBookings.length,
        customers: mockCustomers.length,
        payments: mockPayments.length,
        media: mockMediaItems.length,
        blogPosts: mockBlogPosts.length,
        reviews: mockReviews.length,
        faqs: mockFAQs.length,
        attractions: mockAttractions.length,
      },
    });
  } catch (error: any) {
    console.error("Database seed error:", error);
    return NextResponse.json({ error: error.message || "Failed to seed database" }, { status: 500 });
  }
}
