import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Inquiry from "@/lib/models/Inquiry";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const { name, email, phone, subject, message } = body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Please provide your name." }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Please enter your message." }, { status: 400 });
    }

    const id = `inq-${Date.now()}`;
    const newInquiry = await Inquiry.create({
      id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : "",
      subject: subject ? subject.trim() : "Reservation Inquiry",
      message: message.trim(),
      status: "new",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your message has been received. Our concierge desk will contact you within 2 hours.",
        inquiry: newInquiry,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating inquiry:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process your request." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const query: any = {};
    if (status && status !== "all") query.status = status;

    const inquiries = await Inquiry.find(query).sort({ createdAt: -1 });
    return NextResponse.json(inquiries);
  } catch (error: any) {
    console.error("Error fetching inquiries:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch inquiries" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Inquiry ID required" }, { status: 400 });
    }

    await Inquiry.findOneAndDelete({ id });
    return NextResponse.json({ success: true, message: "Inquiry deleted" });
  } catch (error: any) {
    console.error("Error deleting inquiry:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete inquiry" },
      { status: 500 }
    );
  }
}
