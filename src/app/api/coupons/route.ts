import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Coupon from "@/lib/models/Coupon";

const initialCoupons = [
  {
    id: "coup-001",
    code: "WELCOME10",
    discountType: "percentage",
    discountValue: 10,
    minBookingAmount: 10000,
    maxDiscount: 3000,
    usageLimit: 100,
    usedCount: 24,
    status: "active",
    description: "Welcome discount of 10% up to ₹3,000 on stays above ₹10,000",
  },
  {
    id: "coup-002",
    code: "ROYALGRAND",
    discountType: "flat",
    discountValue: 5000,
    minBookingAmount: 35000,
    maxDiscount: 5000,
    usageLimit: 50,
    usedCount: 8,
    status: "active",
    description: "Flat ₹5,000 luxury discount on premium bookings above ₹35,000",
  },
  {
    id: "coup-003",
    code: "MONSOON15",
    discountType: "percentage",
    discountValue: 15,
    minBookingAmount: 15000,
    maxDiscount: 4500,
    usageLimit: 75,
    usedCount: 12,
    status: "active",
    description: "Special seasonal 15% retreat offer on stays above ₹15,000",
  },
];

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const validateCode = searchParams.get("validate");
    const amountStr = searchParams.get("amount");

    // 1. Validation mode for checkout
    if (validateCode) {
      const code = validateCode.trim().toUpperCase();
      const amount = parseFloat(amountStr || "0") || 0;

      let coupon = await Coupon.findOne({ code });
      if (!coupon) {
        // Check fallback initial coupons
        const fallback = initialCoupons.find((c) => c.code === code);
        if (fallback) {
          coupon = await Coupon.create(fallback as any);
        }
      }

      if (!coupon) {
        return NextResponse.json(
          { valid: false, error: `Coupon '${code}' is invalid.` },
          { status: 400 }
        );
      }

      if (coupon.status !== "active") {
        return NextResponse.json(
          { valid: false, error: `Coupon '${code}' is no longer active.` },
          { status: 400 }
        );
      }

      if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
        return NextResponse.json(
          { valid: false, error: `Coupon '${code}' has expired.` },
          { status: 400 }
        );
      }

      if (coupon.minBookingAmount && amount < coupon.minBookingAmount) {
        return NextResponse.json(
          {
            valid: false,
            error: `Coupon '${code}' requires a minimum booking amount of ₹${coupon.minBookingAmount.toLocaleString("en-IN")}.`,
          },
          { status: 400 }
        );
      }

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return NextResponse.json(
          { valid: false, error: `Coupon '${code}' usage limit has been reached.` },
          { status: 400 }
        );
      }

      // Calculate discount amount
      let discountAmount = 0;
      if (coupon.discountType === "percentage") {
        discountAmount = (amount * coupon.discountValue) / 100;
        if (coupon.maxDiscount && coupon.maxDiscount > 0) {
          discountAmount = Math.min(discountAmount, coupon.maxDiscount);
        }
      } else {
        discountAmount = coupon.discountValue;
      }

      discountAmount = Math.min(discountAmount, amount);

      return NextResponse.json({
        valid: true,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: Math.round(discountAmount),
        message: `Coupon '${coupon.code}' applied successfully!`,
      });
    }

    // 2. List mode
    let coupons = await Coupon.find({}).sort({ createdAt: -1 });
    if (coupons.length === 0) {
      await Coupon.insertMany(initialCoupons);
      coupons = await Coupon.find({}).sort({ createdAt: -1 });
    }

    return NextResponse.json(coupons);
  } catch (error: any) {
    console.error("Coupons GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to load coupons" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body.code || !body.discountValue) {
      return NextResponse.json({ error: "Coupon code and discount value are required." }, { status: 400 });
    }

    const code = body.code.trim().toUpperCase();
    const existing = await Coupon.findOne({ code });
    if (existing) {
      return NextResponse.json({ error: `Coupon code '${code}' already exists.` }, { status: 400 });
    }

    const id = `coup-${Date.now()}`;
    const newCoupon = await Coupon.create({
      id,
      code,
      discountType: body.discountType || "percentage",
      discountValue: parseFloat(body.discountValue) || 10,
      minBookingAmount: parseFloat(body.minBookingAmount) || 0,
      maxDiscount: parseFloat(body.maxDiscount) || 0,
      usageLimit: parseInt(body.usageLimit, 10) || 100,
      usedCount: 0,
      status: body.status || "active",
      description: body.description || "",
      validUntil: body.validUntil || "",
    });

    return NextResponse.json(newCoupon, { status: 201 });
  } catch (error: any) {
    console.error("Coupons POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to create coupon" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });
    }

    const updated = await Coupon.findOneAndUpdate(
      { $or: [{ id }, { _id: id }] },
      { $set: updates },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update coupon" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });
    }

    const deleted = await Coupon.findOneAndDelete({ $or: [{ id }, { _id: id }] });
    if (!deleted) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Coupon deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete coupon" }, { status: 500 });
  }
}
