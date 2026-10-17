import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import NewsletterSubscriber from "@/lib/models/NewsletterSubscriber";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { email, source = "website_footer" } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if already subscribed
    let subscriber = await NewsletterSubscriber.findOne({ email: normalizedEmail });

    if (subscriber) {
      if (subscriber.status === "unsubscribed") {
        subscriber.status = "active";
        subscriber.subscribedAt = new Date();
        await subscriber.save();
        return NextResponse.json({
          success: true,
          message: "Welcome back! Your subscription to Royal Grand IN Resorts has been reactivated.",
        });
      }
      return NextResponse.json({
        success: true,
        alreadySubscribed: true,
        message: "You are already subscribed! Thank you for staying connected with Royal Grand IN Resorts.",
      });
    }

    subscriber = await NewsletterSubscriber.create({
      email: normalizedEmail,
      source,
      status: "active",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for subscribing! Seasonal offers and resort stories will arrive in your inbox.",
        subscriber,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Newsletter subscription error in Next.js API:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process newsletter subscription." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const subscribers = await NewsletterSubscriber.find().sort({ createdAt: -1 });
    return NextResponse.json({
      count: subscribers.length,
      subscribers,
    });
  } catch (error: any) {
    console.error("Fetch subscribers error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch subscribers." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, email, status } = body;

    if (!id && !email) {
      return NextResponse.json(
        { error: "Subscriber id or email is required." },
        { status: 400 }
      );
    }

    const query: any = id ? { _id: id } : { email: email.toLowerCase().trim() };
    const updated = await NewsletterSubscriber.findOneAndUpdate(
      query,
      { $set: { status: status || "active" } },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Subscriber not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, subscriber: updated });
  } catch (error: any) {
    console.error("Update subscriber error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update subscriber." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const email = searchParams.get("email");

    if (!id && !email) {
      // Also check body if present
      let bodyId = null;
      try {
        const body = await request.json();
        bodyId = body?.id || body?.email;
      } catch (e) {}

      if (!bodyId) {
        return NextResponse.json(
          { error: "Subscriber id or email is required to delete." },
          { status: 400 }
        );
      }
    }

    const query: any = id ? { _id: id } : { email: email?.toLowerCase().trim() };
    const deleted = await NewsletterSubscriber.findOneAndDelete(query);

    if (!deleted) {
      return NextResponse.json({ error: "Subscriber not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Subscriber removed successfully." });
  } catch (error: any) {
    console.error("Delete subscriber error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete subscriber." },
      { status: 500 }
    );
  }
}

