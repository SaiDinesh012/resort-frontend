"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { useSiteSettings } from "@/context/SettingsContext";
import {
  SITE_NAME,
  SITE_PHONE,
  SITE_EMAIL,
  SITE_ADDRESS,
  SITE_TAGLINE,
} from "@/lib/constants";

const defaultQuickLinks = [
  { label: "Home", href: "/" },
  { label: "Rooms & Suites", href: "/rooms" },
  { label: "Holiday Packages", href: "/packages" },
  { label: "Experiences", href: "/resort" },
  { label: "Resort Gallery", href: "/gallery" },
  { label: "Contact & Location", href: "/contact" },
];

const fallbackPolicies = [
  { label: "Privacy Policy", href: "/legal/privacy-policy" },
  { label: "Terms & Conditions", href: "/legal/terms-and-conditions" },
  { label: "Cancellation Policy", href: "/legal/cancellation-policy" },
];

export function WebsiteFooter() {
  const { settings } = useSiteSettings();

  // Dynamic Brand & Contact Variables from Settings/MongoDB
  const siteName = settings.siteName || SITE_NAME;
  const logoUrl = settings.logoUrl;
  const phone = settings.phone || SITE_PHONE;
  const alternatePhone = settings.alternatePhone;
  const email = settings.email || SITE_EMAIL;
  const address = settings.address || SITE_ADDRESS;
  const tagline = settings.tagline || SITE_TAGLINE;
  const footerDescription =
    settings.footerDescription ||
    settings.description ||
    "Nestled amidst the lush forests and pristine hills of Maredumilli, Royal Grand IN Resorts offers a luxurious retreat where royal hospitality meets the serene wilderness.";

  const googleMapsUrl =
    settings.googleMapsUrl ||
    `https://maps.google.com/?q=${encodeURIComponent(siteName + " " + address)}`;

  // Social Links
  const instagramUrl = settings.instagramUrl || "https://instagram.com/royalgrandinresorts";
  const facebookUrl = settings.facebookUrl || "https://facebook.com/royalgrandinresorts";
  const youtubeUrl = settings.youtubeUrl || "https://youtube.com/@royalgrandinresorts";
  const whatsappNumber = settings.whatsappNumber || phone || "+91 98765 43210";
  const twitterUrl = settings.twitterUrl || settings.xUrl || "https://twitter.com/royalgrandin";
  const tripadvisorUrl = settings.tripadvisorUrl || "https://tripadvisor.com/royalgrandinresorts";
  const linkedinUrl = settings.linkedinUrl;

  // Clean WhatsApp phone number (strip spaces, symbols, plus sign)
  const cleanWhatsAppNumber = whatsappNumber
    ? whatsappNumber.replace(/[^0-9]/g, "")
    : "";
  const whatsappChatUrl = cleanWhatsAppNumber
    ? `https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent(
        `Hello ${siteName}, I would like to inquire about reservations.`
      )}`
    : "";


  // Dynamic Newsletter Text & Settings
  const newsletterEnabled = settings.newsletterEnabled !== false;
  const newsletterHeading =
    settings.newsletterHeading || "Subscribe to our Newsletter";
  const newsletterSubheading =
    settings.newsletterSubheading ||
    "Seasonal offers, curated packages and resort stories — in your inbox.";
  const newsletterButtonText = settings.newsletterButtonText || "Subscribe";
  const newsletterPlaceholder = settings.newsletterPlaceholder || "Enter your email address";
  const newsletterBadge = settings.newsletterBadge || "";
  const newsletterSuccessMessage =
    settings.newsletterSuccessMessage ||
    "Thank you for subscribing! Seasonal offers and resort stories will arrive in your inbox.";

  // Dynamic Copyright Text
  const rawCopyright =
    settings.copyrightText || "© {year} {siteName}. All rights reserved.";
  const dynamicCopyright = rawCopyright
    .replace("{year}", new Date().getFullYear().toString())
    .replace("{siteName}", siteName);

  const footerLocationNote =
    settings.footerLocationNote || "Maredumilli, East Godavari District, Andhra Pradesh, India";

  // Dynamic Legal Policies from MongoDB /api/legal
  const [legalLinks, setLegalLinks] = useState(fallbackPolicies);

  useEffect(() => {
    let isMounted = true;
    async function loadLegalLinks() {
      try {
        const res = await fetch("/api/legal?status=published");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0 && isMounted) {
            setLegalLinks(
              data.map((p: any) => ({
                label: p.title,
                href: `/legal/${p.slug}`,
              }))
            );
          }
        }
      } catch (err) {
        // Silently preserve fallbacks
      }
    }
    loadLegalLinks();
    return () => {
      isMounted = false;
    };
  }, []);

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState<
    "idle" | "success" | "error" | "already"
  >("idle");
  const [subscribeMsg, setSubscribeMsg] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      setSubscribeStatus("error");
      setSubscribeMsg("Please provide a valid email address.");
      return;
    }

    try {
      setSubscribing(true);
      setSubscribeStatus("idle");
      setSubscribeMsg("");

      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newsletterEmail.trim(),
          source: "website_footer",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.alreadySubscribed) {
          setSubscribeStatus("already");
          setSubscribeMsg(data.message || "You are already subscribed to our newsletter.");
        } else {
          setSubscribeStatus("success");
          setSubscribeMsg(data.message || "Thank you for subscribing! We look forward to welcoming you.");
          setNewsletterEmail("");
        }
      } else {
        setSubscribeStatus("error");
        setSubscribeMsg(data.error || "Subscription could not be processed. Please try again.");
      }
    } catch (err: any) {
      setSubscribeStatus("error");
      setSubscribeMsg("Failed to connect to the server. Please try again shortly.");
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-primary-dark text-white" role="contentinfo">
      {/* Dynamic Newsletter Strip */}
      {newsletterEnabled && (
        <div className="border-b border-white/[0.08]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                {newsletterBadge && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-accent/20 text-accent uppercase tracking-wider mb-2">
                    {newsletterBadge}
                  </span>
                )}
                <h3 className="font-serif text-xl sm:text-2xl font-light text-white mb-1.5 tracking-wide">
                  {newsletterHeading}
                </h3>
                <p className="font-sans text-white/50 text-xs sm:text-sm max-w-xl">
                  {newsletterSubheading}
                </p>
              </div>

              <div className="w-full md:w-auto">
                <form
                  className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto"
                  onSubmit={handleSubscribe}
                  aria-label="Newsletter subscription form"
                >
                  <div className="relative flex-1 md:w-72">
                    <label htmlFor="footer-newsletter-email" className="sr-only">
                      Email address
                    </label>
                    <input
                      id="footer-newsletter-email"
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => {
                        setNewsletterEmail(e.target.value);
                        if (subscribeStatus !== "idle") setSubscribeStatus("idle");
                      }}
                      placeholder={newsletterPlaceholder}
                      className="w-full px-4 py-3 rounded-sm bg-white/[0.06] border border-white/[0.12] text-white placeholder:text-white/35 font-sans text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors"
                      aria-required="true"
                      disabled={subscribing}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={subscribing}
                    className="px-6 py-3 rounded-sm bg-accent hover:bg-accent-dark text-white font-sans text-xs sm:text-sm font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 flex-shrink-0 shadow-sm"
                  >
                    {subscribing ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Subscribing...
                      </>
                    ) : (
                      <>{newsletterButtonText}</>
                    )}
                  </button>
                </form>

                {/* Status Message Feedback */}
                {subscribeStatus !== "idle" && (
                  <div
                    className={`mt-2.5 text-xs flex items-center gap-1.5 font-medium ${
                      subscribeStatus === "success"
                        ? "text-emerald-400"
                        : subscribeStatus === "already"
                        ? "text-amber-300"
                        : "text-rose-400"
                    }`}
                    role="alert"
                  >
                    {subscribeStatus === "success" && (
                      <CheckCircle className="size-3.5 flex-shrink-0" />
                    )}
                    {subscribeStatus === "already" && (
                      <CheckCircle className="size-3.5 flex-shrink-0" />
                    )}
                    {subscribeStatus === "error" && (
                      <AlertCircle className="size-3.5 flex-shrink-0" />
                    )}
                    <span>{subscribeMsg}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-3 mb-5 group inline-block"
              aria-label={`${siteName} — Home`}
            >
              {logoUrl ? (
                <div className="relative h-11 w-auto min-w-[40px] max-w-[180px] flex items-center">
                  <img
                    src={logoUrl}
                    alt={`${siteName} logo`}
                    className="max-h-11 max-w-full object-contain filter drop-shadow-sm group-hover:opacity-90 transition-opacity"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="flex flex-col leading-none">
                  <span className="font-serif text-xl sm:text-2xl font-light text-white tracking-wide leading-none">
                    {siteName}
                  </span>
                  <span className="font-sans text-[9px] font-semibold text-accent tracking-[0.25em] uppercase mt-1">
                    MAREDUMILLI SANCTUARY
                  </span>
                </div>
              )}
            </Link>

            <p className="font-sans text-white/50 text-xs sm:text-sm leading-relaxed mb-3">
              {footerDescription}
            </p>

            {tagline && (
              <p className="font-sans text-accent/80 text-xs italic mb-6">
                &ldquo;{tagline}&rdquo;
              </p>
            )}

            {/* Dynamic Social Links */}
            <div className="flex flex-wrap items-center gap-2.5" aria-label="Social media channels">
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  aria-label={`${siteName} on Instagram`}
                  className="size-9 rounded-sm bg-white/[0.06] hover:bg-accent flex items-center justify-center transition-colors group"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Follow us on Instagram"
                >
                  <svg
                    className="size-4 text-white/60 group-hover:text-white transition-colors"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              )}

              {facebookUrl && (
                <a
                  href={facebookUrl}
                  aria-label={`${siteName} on Facebook`}
                  className="size-9 rounded-sm bg-white/[0.06] hover:bg-accent flex items-center justify-center transition-colors group"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Follow us on Facebook"
                >
                  <svg
                    className="size-4 text-white/60 group-hover:text-white transition-colors"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              )}

              {youtubeUrl && (
                <a
                  href={youtubeUrl}
                  aria-label={`${siteName} on YouTube`}
                  className="size-9 rounded-sm bg-white/[0.06] hover:bg-accent flex items-center justify-center transition-colors group"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Watch on YouTube"
                >
                  <svg
                    className="size-4 text-white/60 group-hover:text-white transition-colors"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              )}

              {whatsappChatUrl && (
                <a
                  href={whatsappChatUrl}
                  aria-label={`Chat with ${siteName} on WhatsApp`}
                  className="size-9 rounded-sm bg-white/[0.06] hover:bg-emerald-600 flex items-center justify-center transition-colors group"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Chat with reservations on WhatsApp"
                >
                  <MessageCircle className="size-4 text-white/60 group-hover:text-white transition-colors" />
                </a>
              )}

              {twitterUrl && (
                <a
                  href={twitterUrl}
                  aria-label={`${siteName} on X / Twitter`}
                  className="size-9 rounded-sm bg-white/[0.06] hover:bg-accent flex items-center justify-center transition-colors group"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Follow us on X"
                >
                  <svg className="size-3.5 text-white/60 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              )}

              {tripadvisorUrl && (
                <a
                  href={tripadvisorUrl}
                  aria-label={`${siteName} on TripAdvisor`}
                  className="size-9 rounded-sm bg-white/[0.06] hover:bg-[#00AF87] flex items-center justify-center transition-colors group"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Review us on TripAdvisor"
                >
                  <svg
                    className="size-4 text-white/60 group-hover:text-white transition-colors"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3.1a2.8 2.8 0 0 1 2.8 2.8c0 .37-.08.72-.21 1.04.85.47 1.5 1.27 1.83 2.25.32-.13.66-.2 1.02-.2 1.55 0 2.8 1.25 2.8 2.8s-1.25 2.8-2.8 2.8c-1.29 0-2.35-.87-2.69-2.05-.58.4-1.29.65-2.05.73v-.96c.5-.07.95-.25 1.35-.51-.35-.59-.56-1.27-.56-2 0-.43.07-.83.21-1.2-.63-.36-1.14-.94-1.4-1.64-.26.7-.77 1.28-1.4 1.64.14.37.21.77.21 1.2 0 .73-.21 1.41-.56 2 .4.26.85.44 1.35.51v.96c-.76-.08-1.47-.33-2.05-.73-.34 1.18-1.4 2.05-2.69 2.05-1.55 0-2.8-1.25-2.8-2.8s1.25-2.8 2.8-2.8c.36 0 .7.07 1.02.2.33-.98.98-1.78 1.83-2.25-.13-.32-.21-.67-.21-1.04 0-1.55 1.25-2.8 2.8-2.8zm-5.46 8.7a1.26 1.26 0 1 0 0 2.52 1.26 1.26 0 0 0 0-2.52zm10.92 0a1.26 1.26 0 1 0 0 2.52 1.26 1.26 0 0 0 0-2.52z" />
                  </svg>
                </a>
              )}

              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  aria-label={`${siteName} on LinkedIn`}
                  className="size-9 rounded-sm bg-white/[0.06] hover:bg-sky-600 flex items-center justify-center transition-colors group"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Connect on LinkedIn"
                >
                  <svg className="size-3.5 text-white/60 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="font-sans font-semibold text-white text-xs uppercase tracking-[0.2em] mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3" role="list">
              {defaultQuickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-sans text-white/50 text-xs sm:text-sm hover:text-accent transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight
                      className="size-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-accent"
                      aria-hidden="true"
                    />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal / Policies Column (Dynamic from MongoDB) */}
          <div>
            <h4 className="font-sans font-semibold text-white text-xs uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
              <span>Policies & Legal</span>
            </h4>
            <ul className="space-y-3" role="list">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-sans text-white/50 text-xs sm:text-sm hover:text-accent transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight
                      className="size-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-accent"
                      aria-hidden="true"
                    />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information Column */}
          <div>
            <h4 className="font-sans font-semibold text-white text-xs uppercase tracking-[0.2em] mb-6">
              Contact & Location
            </h4>
            <ul className="space-y-4" role="list" aria-label="Contact information">
              <li className="flex items-start gap-3">
                <MapPin className="size-4 text-accent flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <address className="font-sans text-white/50 text-xs sm:text-sm leading-relaxed not-italic">
                    {address}
                  </address>
                  {googleMapsUrl && (
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-sans text-accent/80 hover:text-accent text-[11px] mt-1.5 font-medium transition-colors"
                    >
                      Get Directions <ExternalLink className="size-2.5" />
                    </a>
                  )}
                </div>
              </li>

              <li>
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="flex items-center gap-3 font-sans text-white/50 text-xs sm:text-sm hover:text-accent transition-colors"
                  aria-label={`Call primary desk: ${phone}`}
                >
                  <Phone className="size-4 text-accent flex-shrink-0" aria-hidden="true" />
                  <span>{phone}</span>
                </a>
              </li>

              {alternatePhone && (
                <li>
                  <a
                    href={`tel:${alternatePhone.replace(/\s+/g, "")}`}
                    className="flex items-center gap-3 font-sans text-white/50 text-xs sm:text-sm hover:text-accent transition-colors"
                    aria-label={`Call alternate desk: ${alternatePhone}`}
                  >
                    <Phone className="size-4 text-accent/70 flex-shrink-0" aria-hidden="true" />
                    <span className="text-white/40">{alternatePhone} (Alt)</span>
                  </a>
                </li>
              )}

              <li>
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 font-sans text-white/50 text-xs sm:text-sm hover:text-accent transition-colors"
                  aria-label={`Email reservations at ${email}`}
                >
                  <Mail className="size-4 text-accent flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{email}</span>
                </a>
              </li>

              {whatsappChatUrl && (
                <li>
                  <a
                    href={whatsappChatUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 font-sans text-emerald-400/90 hover:text-emerald-300 text-xs sm:text-sm transition-colors"
                    aria-label="Direct WhatsApp Concierge"
                  >
                    <MessageCircle className="size-4 text-emerald-400 flex-shrink-0" />
                    <span>WhatsApp Concierge</span>
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Dynamic Bottom Bar */}
      <div className="border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="font-sans text-white/35 text-xs">
            {dynamicCopyright}
          </p>
          <p className="font-sans text-white/25 text-xs">
            {footerLocationNote}
          </p>
        </div>
      </div>
    </footer>
  );
}
