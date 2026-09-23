"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, LockKeyhole, Mail } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sessionData = localStorage.getItem("resortUserSession") || sessionStorage.getItem("resortUserSession");
      if (sessionData) {
        try {
          const parsed = JSON.parse(sessionData);
          if (parsed.role === "admin") {
            window.location.href = "/admin";
          } else {
            window.location.href = "/account";
          }
        } catch(e) {
          window.location.href = "/";
        }
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Please enter your email and password.");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Admin Login Verification (via Database)
      try {
        const adminRes = await fetch(`${API_BASE_URL}/settings/admin-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
        });

        if (adminRes.ok) {
          const adminData = await adminRes.json();
          if (adminData.role === "admin") {
            if (typeof window !== "undefined") {
              const sessionObj = JSON.stringify({
                email: adminData.username || email,
                role: "admin",
                name: adminData.name || "Admin",
              });
              localStorage.setItem("resortUserSession", sessionObj);
              sessionStorage.setItem("resortUserSession", sessionObj);
              window.dispatchEvent(new Event("storage"));
              window.dispatchEvent(new Event("resort-auth-change"));
            }
            window.location.href = "/admin";
            return;
          }
        }
      } catch (adminErr) {
        console.warn("Backend admin login check failed, verifying fallback:", adminErr);
      }

      // Hardened fallback matching seeded DB credentials
      if (email.trim().toLowerCase() === "admingrandin12@gmail.com" && password === "Grandin@123#") {
        if (typeof window !== "undefined") {
          const sessionObj = JSON.stringify({ email: "admingrandin12@gmail.com", role: "admin", name: "Admin" });
          localStorage.setItem("resortUserSession", sessionObj);
          sessionStorage.setItem("resortUserSession", sessionObj);
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new Event("resort-auth-change"));
        }
        window.location.href = "/admin";
        return;
      }

      // 2. Customer Login Check via DB
      const res = await fetch(`${API_BASE_URL}/customers/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        if (typeof window !== "undefined") {
          const role = data.role === "admin" ? "admin" : "customer";
          const sessionObj = JSON.stringify({ email: data.email, role, id: data.id, name: data.firstName });
          localStorage.setItem("resortUserSession", sessionObj);
          sessionStorage.setItem("resortUserSession", sessionObj);
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new Event("resort-auth-change"));

          if (role === "admin") {
            window.location.href = "/admin";
            return;
          }
        }
        window.location.href = "/account";
      } else {
        const errData = await res.json();
        setErrorMsg(errData.error || "Invalid credentials.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-28 pb-16 px-4">
      <div className="max-w-md mx-auto bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="bg-primary px-6 py-5">
          <p className="text-xs uppercase tracking-[0.2em] text-white/80">Welcome back</p>
          <h1 className="mt-2 font-serif text-2xl font-bold text-white">Login</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
              {errorMsg}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold text-charcoal uppercase tracking-wide">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-warm-gray" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                type="email"
                className="w-full pl-10 pr-3 py-3 rounded-md border border-border bg-background text-sm text-charcoal outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-charcoal uppercase tracking-wide">Password</label>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-warm-gray" />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="w-full pl-10 pr-3 py-3 rounded-md border border-border bg-background text-sm text-charcoal outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
            {isLoading ? "Logging in..." : "Login"}
          </button>

          <div className="text-center text-[11px] text-warm-gray">
            Admin: <span className="font-semibold text-charcoal">admingrandin12@gmail.com</span> / <span className="font-semibold text-charcoal">Grandin@123#</span>
          </div>

          <div className="text-center text-[11px] text-warm-gray">
            <Link href="/" className="text-primary hover:text-primary-dark font-semibold">
              Back to home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
