import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Customer from "@/lib/models/Customer";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params;

    const customer = await Customer.findOne({ $or: [{ id }, { email: id }] });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error: any) {
    console.error("Error fetching customer:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch customer" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params;
    const body = await request.json();

    const updatedCustomer = await Customer.findOneAndUpdate(
      { $or: [{ id }, { email: id }] },
      { $set: body },
      { new: true }
    );

    if (!updatedCustomer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json(updatedCustomer);
  } catch (error: any) {
    console.error("Error updating customer:", error);
    return NextResponse.json({ error: error.message || "Failed to update customer" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params;

    const deletedCustomer = await Customer.findOneAndDelete({ $or: [{ id }, { email: id }] });

    if (!deletedCustomer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Customer deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting customer:", error);
    return NextResponse.json({ error: error.message || "Failed to delete customer" }, { status: 500 });
  }
}
