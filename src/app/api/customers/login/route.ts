import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Customer from "@/lib/models/Customer";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const customer = await Customer.findOne({ email });

    if (!customer) {
      return NextResponse.json({ error: "Account not found. Please create one." }, { status: 404 });
    }

    // Verify password if the customer has one
    if (customer.password && customer.password !== password) {
      return NextResponse.json({ error: "Invalid password. Please try again." }, { status: 401 });
    }

    return NextResponse.json(customer);
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: error.message || "Failed to login" }, { status: 500 });
  }
}
