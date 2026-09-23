import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Customer from "@/lib/models/Customer";

export async function GET(request: Request) {
  try {
    await connectDB();
    const customers = await Customer.find({}).sort({ createdAt: -1 });
    return NextResponse.json(customers);
  } catch (error: any) {
    console.error("Error fetching customers:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch customers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body.firstName || !body.email || !body.phone) {
      return NextResponse.json({ error: "First Name, Email, and Phone are required." }, { status: 400 });
    }

    const id = body.id || `cust-${Date.now()}`;
    const newCustomer = await Customer.create({
      ...body,
      id,
    });

    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error: any) {
    console.error("Error creating customer:", error);
    return NextResponse.json({ error: error.message || "Failed to create customer" }, { status: 500 });
  }
}
