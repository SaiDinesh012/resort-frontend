"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, LogOut, Shield, Loader2 } from "lucide-react";
import { cn, clearLocalUserData } from "@/lib/utils";
import { NAV_LINKS, SITE_NAME } from "@/lib/constants";
import { API_BASE_URL } from "@/lib/api";

export function WebsiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();
  const [siteName, setSiteName] = useState(SITE_NAME);
  const [logoUrl, setLogoUrl] = useState("");
  const [tagline, setTagline] = useState("Western Ghats, Karnataka");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/settings?key=site_config`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data && data.siteName) {
          setSiteName(data.siteName);
        }
        if (data && typeof data === "object") {
          if (data.logoUrl) setLogoUrl(data.logoUrl);
          if (data.tagline) setTagline(data.tagline);
        }
      })
      .catch(console.error)
        .finally(() => setIsLoading(false));
  }, []);

  const syncAuthState = () => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("resortUserSession") || sessionStorage.getItem("resortUserSession");
    if (!raw) {
      setIsLoggedIn(false);
      setIsAdmin(false);
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setIsLoggedIn(true);
      setIsAdmin(parsed?.role === "admin" || parsed?.email?.includes("admin") || parsed?.email?.includes("manager"));
    } catch {
      setIsLoggedIn(true);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    syncAuthState();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleStorage = () => syncAuthState();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("resort-auth-change", handleStorage);
    syncAuthState();
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("resort-auth-change", handleStorage);
    };
  }, [pathname]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    clearLocalUserData();
    setIsLoggedIn(false);
    setIsAdmin(false);
    window.location.replace("/login");
  };

  const isHome = pathname === "/";
  const accountHref = !isLoggedIn ? "/login" : isAdmin ? "/admin" : "/account";
  const accountLabel = !isLoggedIn ? "Login" : isAdmin ? "Admin Panel" : "My Account";

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          isScrolled
            ? "bg-surface/95 backdrop-blur-md border-b border-border shadow-card"
            : isHome
            ? "bg-transparent"
            : "bg-primary-dark border-b border-white/10"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">

                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-sm bg-white/20 animate-pulse" />
                    <div className="flex flex-col gap-1">
                      <div className="h-4 w-32 bg-white/20 animate-pulse rounded" />
                      <div className="h-3 w-24 bg-white/20 animate-pulse rounded" />
                    </div>
                  </div>
                ) : (
                  <>
                    {logoUrl ? (
                      <img src={logoUrl} alt={siteName} className="h-10 w-auto object-contain" />
                    ) : (
                      <div className="size-8 rounded-sm bg-accent flex items-center justify-center font-serif font-bold text-white text-sm">
                        {siteName ? siteName.charAt(0) : "V"}
                      </div>
                    )}
                    <div>
                      <span
                        className={cn(
                          "font-serif font-bold text-lg leading-none transition-colors",
                          isScrolled ? "text-charcoal" : "text-white"
                        )}
                      >
                        {siteName}
                      </span>
                      <p
                        className={cn(
                          "text-xs leading-none transition-colors hidden sm:block mt-0.5",
                          isScrolled ? "text-warm-gray" : "text-white/80"
                        )}
                      >
                        {tagline}
                      </p>
                    </div>
                  </>
                )}
              </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-3.5 py-2 rounded-md text-sm font-semibold transition-colors",
                      isScrolled
                        ? isActive
                          ? "text-primary bg-primary/10 font-bold"
                          : "text-charcoal/90 hover:text-primary hover:bg-primary/5"
                        : isActive
                        ? "text-white bg-white/20 font-bold"
                        : "text-white/90 hover:text-white hover:bg-white/15"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right actions */}
            <div className="hidden lg:flex items-center gap-4">
              <Link
                href={accountHref}
                className={cn(
                  "flex items-center gap-1.5 text-sm font-semibold transition-colors",
                  isScrolled
                    ? "text-charcoal/90 hover:text-primary"
                    : "text-white/90 hover:text-white"
                )}
              >
                {isAdmin ? <Shield className="size-4 text-accent" /> : <User className="size-4" />}
                <span>{accountLabel}</span>
              </Link>

              {isLoggedIn && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className={cn(
                    "flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded transition-colors cursor-pointer",
                    isScrolled
                      ? "text-warm-gray hover:text-error hover:bg-red-50"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  )}
                  title="Logout and clear local saved data"
                >
                  <LogOut className="size-3.5" />
                  <span>Logout</span>
                </button>
              )}

              <Link
                href="/booking"
                className={cn(
                  "px-5 py-2.5 rounded-md text-sm font-bold transition-all shadow-sm",
                  isScrolled
                    ? "bg-primary hover:bg-primary-dark text-white"
                    : "bg-accent hover:bg-accent-dark text-white"
                )}
              >
                Book Now
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className={cn(
                "lg:hidden p-2 rounded-md transition-colors cursor-pointer",
                isScrolled ? "text-charcoal hover:bg-border/40" : "text-white hover:bg-white/10"
              )}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div
            className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute top-16 left-0 right-0 bg-surface border-b border-border shadow-panel animate-slide-up">
            <nav className="px-4 pt-3 pb-6 space-y-1" aria-label="Mobile navigation">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "block px-4 py-3 rounded-md text-sm font-semibold transition-colors",
                    pathname === link.href
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-charcoal hover:bg-border/40 hover:text-primary"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-border space-y-2">
                <Link
                  href={accountHref}
                  className="flex items-center gap-2 px-4 py-3 rounded-md text-sm font-semibold text-charcoal hover:bg-border/40 transition-colors"
                >
                  {isAdmin ? <Shield className="size-4 text-accent" /> : <User className="size-4" />}
                  {accountLabel}
                </Link>

                {isLoggedIn && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-md text-sm font-semibold text-error hover:bg-red-50 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="size-4" />
                    Logout & Clear Session
                  </button>
                )}

                <Link
                  href="/booking"
                  className="block w-full text-center px-4 py-3 rounded-md bg-primary hover:bg-primary-dark text-white text-sm font-bold transition-colors"
                >
                  Book Now
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
