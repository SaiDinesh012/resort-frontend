"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_LINKS, SITE_NAME } from "@/lib/constants";

export function WebsiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const isHome = pathname === "/";
  const isDarkHeaderAtTop = !isScrolled && !isHome;

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
              <div className="size-8 rounded-sm bg-accent flex items-center justify-center font-serif font-bold text-white text-sm">
                V
              </div>
              <div>
                <span
                  className={cn(
                    "font-serif font-bold text-lg leading-none transition-colors",
                    isScrolled ? "text-charcoal" : "text-white"
                  )}
                >
                  {SITE_NAME}
                </span>
                <p
                  className={cn(
                    "text-xs leading-none transition-colors hidden sm:block mt-0.5",
                    isScrolled ? "text-warm-gray" : "text-white/80"
                  )}
                >
                  Western Ghats, Karnataka
                </p>
              </div>
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
                href="/account"
                className={cn(
                  "flex items-center gap-1.5 text-sm font-semibold transition-colors",
                  isScrolled
                    ? "text-charcoal/90 hover:text-primary"
                    : "text-white/90 hover:text-white"
                )}
              >
                <User className="size-4" />
                <span>My Account</span>
              </Link>
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
                "lg:hidden p-2 rounded-md transition-colors",
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
                  href="/account"
                  className="flex items-center gap-2 px-4 py-3 rounded-md text-sm font-semibold text-charcoal hover:bg-border/40 transition-colors"
                >
                  <User className="size-4" />
                  My Account
                </Link>
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
