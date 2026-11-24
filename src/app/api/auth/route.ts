import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";
import { signSessionToken, verifySessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username/Email and password are required." },
        { status: 400 }
      );
    }

    let isValid = false;
    let userEmail = username.trim().toLowerCase();

    // 1. Try checking against MongoDB Atlas admin_auth collection
    try {
      await connectDB();
      const adminAuthCollection = mongoose.connection.db?.collection("admin_auth");
      if (adminAuthCollection) {
        const found = await adminAuthCollection.findOne({
          $or: [
            { username: username.trim() },
            { email: userEmail },
          ],
        });

        if (found && found.password === password) {
          isValid = true;
          userEmail = found.email || userEmail;
        }
      }
    } catch (dbErr) {
      console.warn("DB check for admin_auth failed, checking fallback:", dbErr);
    }

    // 2. Default hardcoded admin fallback for resilience
    if (!isValid) {
      if (
        (userEmail === "admingrandin12@gmail.com" || userEmail === "admin") &&
        password === "Grandin@123#"
      ) {
        isValid = true;
        userEmail = "admingrandin12@gmail.com";
      }
    }

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid username or password. Please try again." },
        { status: 401 }
      );
    }

    // 3. Generate signed session token
    const token = signSessionToken({ email: userEmail, role: "admin" });

    // 4. Set HttpOnly secure cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Authentication successful.",
      user: {
        email: userEmail,
        role: "admin",
      },
    });
  } catch (error: any) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: error.message || "Authentication failed." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const session = verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        email: session.email,
        role: session.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");
    return NextResponse.json({ success: true, message: "Logged out successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
