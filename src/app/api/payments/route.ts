import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Payment from "@/lib/models/Payment";

export async function GET(request: Request) {
  try {
    await connectDB();
    const payments = await Payment.find({}).sort({ createdAt: -1 });
    return NextResponse.json(payments);
  } catch (error: any) {
    console.error("Error fetching payments:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch payments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const id = body.id || `pay-${Date.now()}`;
    const paymentId = body.paymentId || `PAY-${Math.floor(100000 + Math.random() * 900000)}`;

    const newPayment = await Payment.create({
      ...body,
      id,
      paymentId,
    });

    return NextResponse.json(newPayment, { status: 201 });
  } catch (error: any) {
    console.error("Error creating payment:", error);
    return NextResponse.json({ error: error.message || "Failed to create payment" }, { status: 500 });
  }
}
