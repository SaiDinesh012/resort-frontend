import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Setting from "@/lib/models/Setting";

export async function POST(request: Request) {
  try {
    const { email, username, password } = await request.json();
    const inputUser = (email || username || "").trim().toLowerCase();

    let adminDoc = null;
    try {
      await connectDB();
      adminDoc = await Setting.findOne({ key: "admin_auth" });
    } catch (dbErr) {
      console.warn("DB connection warning during admin login:", dbErr);
    }

    const expectedUser = (adminDoc?.value?.username || adminDoc?.value?.email || "admingrandin12@gmail.com").trim().toLowerCase();
    const expectedPass = adminDoc?.value?.password || "Grandin@123#";

    if (inputUser === expectedUser && password === expectedPass) {
      return NextResponse.json({
        success: true,
        role: "admin",
        username: expectedUser,
        message: "Admin authentication successful",
      });
    }

    return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Admin login verification failed" }, { status: 500 });
  }
}
