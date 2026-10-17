"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Clock,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { SITE_ADDRESS, SITE_EMAIL, SITE_PHONE, SITE_NAME } from "@/lib/constants";
import { useSiteSettings } from "@/context/SettingsContext";

const SUBJECT_OPTIONS = [
  "Room Reservation Inquiry",
  "Holiday Package Customization",
  "Private Forest Dining or Celebration",
  "Waterfall Treks & Guided Excursions",
  "Corporate Retreat / Group Booking",
  "General Concierge Question",
];

export default function ContactPage() {
  const { settings } = useSiteSettings();
  const siteName = settings.siteName || SITE_NAME;
  const address = settings.address || SITE_ADDRESS;
  const phone = settings.phone || SITE_PHONE;
  const email = settings.email || SITE_EMAIL;
  const checkInTime = settings.checkInTime || "02:00 PM";
  const checkOutTime = settings.checkOutTime || "11:00 AM";

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: SUBJECT_OPTIONS[0],
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill form from query params if coming from Experiences or Account
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const subjectParam = params.get("subject");
      const bookingParam = params.get("booking");
      const experienceParam = params.get("experience");

      if (subjectParam) {
        setFormData((prev) => ({
          ...prev,
          subject: subjectParam,
        }));
      }
      if (bookingParam) {
        setFormData((prev) => ({
          ...prev,
          subject: "Room Reservation Inquiry",
          message: `Inquiring regarding my booking reference #${bookingParam}. `,
        }));
      } else if (experienceParam) {
        setFormData((prev) => ({
          ...prev,
          subject: "Private Forest Dining or Celebration",
          message: `I would like to inquire about reserving the "${experienceParam}" experience. `,
        }));
      }
    }
  }, []);

  // Clean phone digits for WhatsApp and Tel
  const cleanPhoneDigits = phone.replace(/[^\d]/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhoneDigits.length === 10 ? "91" + cleanPhoneDigits : cleanPhoneDigits}?text=${encodeURIComponent(
    `Hello ${siteName}, I would like to inquire about reservations.`
  )}`;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${siteName}, ${address}`
  )}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to send message at this time.");
      }

      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: SUBJECT_OPTIONS[0],
        message: "",
      });
    } catch (err: any) {
      console.error("Contact form error:", err);
      setError(err.message || "Failed to deliver message. Please call our desk directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* ══════════════════════════════════════════════════════
          HERO HEADER
      ══════════════════════════════════════════════════════ */}
      <div className="bg-primary-dark text-white pt-28 pb-14 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Contact Us" }]} variant="dark" className="mb-4" />
          <h1 className="font-serif text-3xl sm:text-5xl font-light text-white mb-3">
            Get in Touch
          </h1>
          <div className="w-12 h-px bg-accent mb-4" />
          <p className="font-sans text-white/75 max-w-xl text-sm sm:text-base leading-relaxed">
            Our concierge team is at your service to curate custom stays, waterfall excursions, and memorable forest escapes.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* ══════════════════════════════════════════════════════
              LEFT COLUMN: Live Resort Desk Details
          ══════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="font-sans text-xs uppercase tracking-widest text-muted-sage font-semibold">
                Guest Services
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-light text-charcoal mt-1 mb-4">
                Resort Desk & Reservations
              </h2>
              <p className="font-sans text-warm-gray text-sm leading-relaxed">
                Connect directly with our dedicated resort staff in Maredumilli. We are available 7 days a week to ensure every detail of your visit is seamless.
              </p>
            </div>

            <div className="space-y-4">
              {/* Address card */}
              <div className="bg-surface p-5 rounded-sm border border-border flex items-start gap-4 shadow-2xs hover:border-accent/40 transition-colors">
                <div className="size-10 rounded-sm bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="size-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-sans font-semibold text-charcoal text-xs uppercase tracking-wider">
                    Resort Sanctuary
                  </h3>
                  <p className="font-sans text-sm text-warm-gray mt-1 leading-relaxed">
                    {address}
                  </p>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:text-accent mt-2 transition-colors"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>

              {/* Phone card */}
              <div className="bg-surface p-5 rounded-sm border border-border flex items-start gap-4 shadow-2xs hover:border-accent/40 transition-colors">
                <div className="size-10 rounded-sm bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone className="size-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-sans font-semibold text-charcoal text-xs uppercase tracking-wider">
                    Direct Concierge Phone
                  </h3>
                  <a
                    href={`tel:${phone}`}
                    className="block font-sans text-base font-semibold text-charcoal hover:text-primary mt-1 transition-colors"
                  >
                    {phone}
                  </a>
                  <p className="font-sans text-xs text-warm-gray mt-0.5">
                    Available 24/7 for guest assistance & transfers
                  </p>
                </div>
              </div>

              {/* Email card */}
              <div className="bg-surface p-5 rounded-sm border border-border flex items-start gap-4 shadow-2xs hover:border-accent/40 transition-colors">
                <div className="size-10 rounded-sm bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="size-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-sans font-semibold text-charcoal text-xs uppercase tracking-wider">
                    Email Reservations
                  </h3>
                  <a
                    href={`mailto:${email}`}
                    className="block font-sans text-sm font-semibold text-charcoal hover:text-primary mt-1 transition-colors"
                  >
                    {email}
                  </a>
                  <p className="font-sans text-xs text-warm-gray mt-0.5">
                    Written inquiries replied within 2 hours
                  </p>
                </div>
              </div>

              {/* Check-in Times card */}
              <div className="bg-surface p-5 rounded-sm border border-border flex items-start gap-4 shadow-2xs">
                <div className="size-10 rounded-sm bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="size-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-sans font-semibold text-charcoal text-xs uppercase tracking-wider">
                    Resort Timings
                  </h3>
                  <div className="flex items-center gap-6 mt-1 text-sm text-charcoal font-medium">
                    <span>Check-in: <strong>{checkInTime}</strong></span>
                    <span>Check-out: <strong>{checkOutTime}</strong></span>
                  </div>
                </div>
              </div>

              {/* WhatsApp direct action */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-sm bg-emerald-800 hover:bg-emerald-900 text-white font-sans text-xs uppercase tracking-wider font-semibold transition-colors shadow-xs"
              >
                <MessageSquare className="size-4" />
                <span>Chat Instantly via WhatsApp</span>
              </a>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              RIGHT COLUMN: Interactive Dynamic Contact Form
          ══════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 bg-surface rounded-sm border border-border p-8 sm:p-10 shadow-xs">
            {submitted ? (
              <div className="text-center py-12 space-y-5">
                <div className="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <CheckCircle2 className="size-8" />
                </div>
                <div>
                  <h3 className="font-serif text-3xl font-light text-charcoal mb-2">
                    Message Received
                  </h3>
                  <div className="w-8 h-px bg-accent mx-auto mb-4" />
                  <p className="font-sans text-sm text-warm-gray max-w-md mx-auto leading-relaxed">
                    Thank you for reaching out to <strong>{siteName}</strong>. Your message has been logged in our reservation desk system. Our team will contact you shortly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 rounded-sm bg-primary hover:bg-primary-dark text-white font-sans text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h2 className="font-serif text-2xl font-light text-charcoal mb-1">
                    Send Us a Message
                  </h2>
                  <p className="font-sans text-xs text-warm-gray">
                    Fill out the form below and our reservations desk will respond promptly.
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3.5 bg-red-50 text-red-700 text-xs rounded-sm border border-red-200">
                    <AlertCircle className="size-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-sage uppercase tracking-wider mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Arjun Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-sm border border-border text-sm text-charcoal bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-sage uppercase tracking-wider mb-1.5">
                      Email Address *
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="e.g. arjun@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-sm border border-border text-sm text-charcoal bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-sage uppercase tracking-wider mb-1.5">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-sm border border-border text-sm text-charcoal bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-sage uppercase tracking-wider mb-1.5">
                      Inquiry Topic
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-sm border border-border text-sm text-charcoal bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                    >
                      {SUBJECT_OPTIONS.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-[11px] font-semibold text-muted-sage uppercase tracking-wider mb-1.5">
                    How Can We Assist You? *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us about your planned travel dates, guests, or special requests..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-sm border border-border text-sm text-charcoal bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-y"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-sm bg-accent hover:bg-accent-dark text-white font-sans font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Transmitting Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      <span>Send Message to Concierge</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
