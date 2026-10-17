"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/context/SettingsContext";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Rooms", href: "/rooms" },
  { label: "Packages", href: "/packages" },
  { label: "Experiences", href: "/resort" },
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function WebsiteHeader() {
  const { settings } = useSiteSettings();
  const siteName = settings.siteName || "Royal Grand IN Resorts";
  const logoUrl = settings.logoUrl;
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const isHome = pathname === "/";
  // On homepage — transparent until scrolled; on other pages — always dark
  const isTransparent = isHome && !isScrolled;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-500",
          isTransparent
            ? "bg-transparent"
            : "bg-primary-dark/97 backdrop-blur-md border-b border-white/10 shadow-sm"
        )}
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Logo / Brand */}
            <Link
              href="/"
              className="flex items-center gap-3 flex-shrink-0 group"
              aria-label={`${siteName} — Home`}
            >
              {logoUrl ? (
                <div className="relative h-10 w-auto min-w-[40px] max-w-[160px] flex items-center">
                  <img
                    src={logoUrl}
                    alt={`${siteName} logo`}
                    className="max-h-10 max-w-full object-contain"
                    loading="eager"
                  />
                </div>
              ) : (
                /* Text-only logo when no image uploaded */
                <div className="flex flex-col leading-none">
                  <span className="font-serif text-lg font-light text-white tracking-wide leading-none">
                    Royal Grand IN
                  </span>
                  <span className="font-sans text-[9px] font-medium text-accent/80 tracking-[0.25em] uppercase mt-0.5">
                    RESORTS
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-0.5" aria-label="Primary navigation">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={`${link.href}-${link.label}`}
                    href={link.href}
                    className={cn(
                      "px-3.5 py-2 rounded-sm font-sans text-sm font-medium transition-colors",
                      isActive
                        ? "text-accent"
                        : "text-white/75 hover:text-white"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right side actions */}
            <div className="hidden lg:flex items-center gap-4">
              <Link
                href="/account"
                className="flex items-center gap-1.5 font-sans text-sm font-medium text-white/70 hover:text-white transition-colors"
                aria-label="My Account"
              >
                <User className="size-4" aria-hidden="true" />
                <span>My Account</span>
              </Link>
              <Link
                href="/booking"
                className="px-5 py-2.5 rounded-sm bg-accent hover:bg-accent-dark text-white font-sans font-semibold text-sm tracking-wide transition-all"
                aria-label="Book Now"
              >
                Book Now
              </Link>
            </div>

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2 rounded-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav"
            >
              {isMobileMenuOpen ? <X className="size-6" aria-hidden="true" /> : <Menu className="size-6" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div
          id="mobile-nav"
          className="fixed inset-0 z-30 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-primary-dark/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer panel */}
          <div className="absolute top-16 left-0 right-0 bg-primary-dark border-b border-white/10 shadow-panel animate-slide-up">
            <nav className="px-4 pt-4 pb-8 space-y-1" aria-label="Mobile navigation">
              {NAV_LINKS.map((link) => (
                <Link
                  key={`mobile-${link.href}-${link.label}`}
                  href={link.href}
                  className={cn(
                    "block px-4 py-3.5 rounded-sm font-sans text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "text-accent bg-white/5"
                      : "text-white/75 hover:text-white hover:bg-white/5"
                  )}
                  aria-current={pathname === link.href ? "page" : undefined}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-white/10 space-y-2 mt-2">
                <Link
                  href="/account"
                  className="flex items-center gap-2 px-4 py-3.5 rounded-sm font-sans text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <User className="size-4" aria-hidden="true" />
                  My Account
                </Link>
                <Link
                  href="/booking"
                  className="block w-full text-center px-4 py-3.5 rounded-sm bg-accent hover:bg-accent-dark text-white font-sans text-sm font-semibold transition-colors"
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
