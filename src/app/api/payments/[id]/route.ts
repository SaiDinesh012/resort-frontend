import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Payment from "@/lib/models/Payment";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params;

    const payment = await Payment.findOne({ $or: [{ id }, { paymentId: id }] });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json(payment);
  } catch (error: any) {
    console.error("Error fetching payment:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch payment" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params;
    const body = await request.json();

    const updatedPayment = await Payment.findOneAndUpdate(
      { $or: [{ id }, { paymentId: id }] },
      { $set: body },
      { new: true }
    );

    if (!updatedPayment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json(updatedPayment);
  } catch (error: any) {
    console.error("Error updating payment:", error);
    return NextResponse.json({ error: error.message || "Failed to update payment" }, { status: 500 });
  }
}
