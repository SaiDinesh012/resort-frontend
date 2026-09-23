"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Share2, Globe, MessageCircle, Video } from "lucide-react";
import { SITE_NAME, SITE_PHONE, SITE_EMAIL, SITE_ADDRESS } from "@/lib/constants";
import { API_BASE_URL } from "@/lib/api";

const quickLinks = [
  { label: "Rooms & Suites", href: "/rooms" },
  { label: "Packages", href: "/packages" },
  { label: "Experiences", href: "/resort" },
  { label: "Gallery", href: "/gallery" },
  { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
];

const policies = [
  { label: "Cancellation Policy", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms & Conditions", href: "#" },
  { label: "Cookie Policy", href: "#" },
];

export function WebsiteFooter() {
  const [siteConfig, setSiteConfig] = useState({
    siteName: SITE_NAME,
    phone: SITE_PHONE,
    email: SITE_EMAIL,
    address: SITE_ADDRESS,
  });

  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/settings?key=site_config`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === "object") {
          setSiteConfig(prev => ({ ...prev, ...data }));
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <footer className="bg-primary-dark text-white py-24 flex justify-center"><div className="size-8 border-2 border-white/20 border-t-accent rounded-full animate-spin" /></footer>;
  }

  return (
    <footer className="bg-primary-dark text-white">
      {/* Newsletter strip */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-serif text-xl font-semibold text-white mb-1">
                Subscribe to our Newsletter
              </h3>
              <p className="text-white/60 text-sm">
                Exclusive offers, seasonal packages, and travel inspiration — straight to your inbox.
              </p>
            </div>
            <form
              className="flex gap-3 w-full md:w-auto"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 md:w-72 px-4 py-2.5 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-colors"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-md bg-accent hover:bg-accent-dark text-white text-sm font-semibold transition-colors flex-shrink-0"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="size-8 rounded-sm bg-accent flex items-center justify-center flex-shrink-0">
                <span className="text-white font-serif font-bold text-sm">V</span>
              </div>
              <span className="font-serif font-semibold text-lg text-white">{siteConfig.siteName}</span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              A luxury forest retreat nestled in the pristine Western Ghats of Karnataka, offering an unparalleled escape into nature.
            </p>
            {/* Social links */}
            <div className="flex gap-3">
              {[
                { icon: Globe, label: "Website", href: "#" },
                { icon: MessageCircle, label: "Community", href: "#" },
                { icon: Share2, label: "Share", href: "#" },
                { icon: Video, label: "Videos", href: "#" },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="size-9 rounded-md bg-white/10 hover:bg-accent flex items-center justify-center transition-colors"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-sans font-semibold text-white mb-5 text-sm uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/60 text-sm hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-sans font-semibold text-white mb-5 text-sm uppercase tracking-wider">
              Policies
            </h4>
            <ul className="space-y-2.5">
              {policies.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/60 text-sm hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-sans font-semibold text-white mb-5 text-sm uppercase tracking-wider">
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="size-4 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-white/60 text-sm leading-relaxed">{siteConfig.address}</span>
              </li>
              <li>
                <a
                  href={`tel:${siteConfig.phone}`}
                  className="flex items-center gap-3 text-white/60 text-sm hover:text-accent transition-colors"
                >
                  <Phone className="size-4 text-accent flex-shrink-0" />
                  {siteConfig.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="flex items-center gap-3 text-white/60 text-sm hover:text-accent transition-colors"
                >
                  <Mail className="size-4 text-accent flex-shrink-0" />
                  {siteConfig.email}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-sm text-center">
            © {new Date().getFullYear()} {siteConfig.siteName}. All rights reserved.
          </p>
          <p className="text-white/30 text-xs">
            Crafted with care for nature & luxury.
          </p>
        </div>
      </div>
    </footer>
  );
}
