"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admingrandin12@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid login credentials. Please try again.");
        setLoading(false);
        return;
      }

      // Hard redirect to ensure middleware/layout picks up the new HttpOnly cookie
      window.location.href = "/admin";
    } catch (err: any) {
      setError(err.message || "Network error. Please check connection.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-dark flex flex-col justify-center items-center p-4 sm:p-6">
      {/* Background glow overlay */}
      <div className="absolute inset-0 bg-radial-[at_50%_40%] from-primary/30 via-transparent to-transparent pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-4 shadow-lg">
            <ShieldCheck className="size-8 text-accent" />
          </div>
          <h1 className="font-serif text-3xl font-light text-white tracking-wide">
            Royalgrandin Resort
          </h1>
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-accent mt-1">
            Admin Management Console
          </p>
          <p className="font-sans text-xs text-white/60 mt-2">
            Secure sign-in for resort managers and staff
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface rounded-2xl border border-border p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <span className="font-bold text-red-500">✕</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-2">
                Manager Email / Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-warm-gray" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin@royalgrandin.com"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border text-charcoal text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 bg-background transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-warm-gray" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-lg border border-border text-charcoal text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 bg-background transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-warm-gray hover:text-charcoal cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-lg bg-primary hover:bg-primary-dark text-white font-sans font-semibold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin text-accent" />
                  Verifying Credentials...
                </>
              ) : (
                "Sign In to Admin Console"
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <Link
              href="/"
              className="text-xs text-warm-gray hover:text-accent transition-colors"
            >
              ← Back to Guest Website
            </Link>
          </div>
        </div>

        <p className="text-center text-[11px] text-white/40 mt-6 font-sans">
          Protected by Royalgrandin Resort Security Architecture • Maredumilli
        </p>
      </div>
    </div>
  );
}
