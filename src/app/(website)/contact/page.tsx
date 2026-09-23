"use client";

import { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { SITE_ADDRESS, SITE_EMAIL, SITE_PHONE } from "@/lib/constants";
import { API_BASE_URL } from "@/lib/api";

export default function ContactPage() {
  const [siteConfig, setSiteConfig] = useState({
    phone: SITE_PHONE,
    email: SITE_EMAIL,
    address: SITE_ADDRESS,
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/settings?key=site_config`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === "object") {
          setSiteConfig(prev => ({ ...prev, ...data }));
        }
      })
      .catch(console.error);
  }, []);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="bg-background min-h-screen">
      <div className="bg-primary-dark text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Contact Us" }]} variant="dark" className="mb-4" />
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-3">Get in Touch</h1>
          <p className="text-white/70 max-w-xl">We are here to assist with reservations, custom packages, and general enquiries.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Details */}
          <div className="space-y-8">
            <div>
              <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">Resort Desk & Reservations</h2>
              <p className="text-warm-gray leading-relaxed">
                Reach out to our dedicated concierge team to plan your stay, request custom arrangements, or arrange airport transfers.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <MapPin className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal text-sm">Resort Address</h3>
                  <p className="text-sm text-warm-gray mt-1 leading-relaxed">{siteConfig.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Phone className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal text-sm">Phone</h3>
                  <p className="text-sm text-warm-gray mt-1">{siteConfig.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Mail className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal text-sm">Email</h3>
                  <p className="text-sm text-warm-gray mt-1">{siteConfig.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-surface rounded-xl border border-border p-8 shadow-card">
            {submitted ? (
              <div className="text-center py-12 space-y-3">
                <h3 className="font-serif text-2xl font-bold text-primary">Message Received!</h3>
                <p className="text-sm text-warm-gray">Thank you for writing to us. Our desk will contact you within 2 hours.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
                <h2 className="font-serif text-xl font-bold text-charcoal mb-4">Send Us a Message</h2>
                <div>
                  <label className="block text-xs font-semibold text-warm-gray uppercase tracking-wider mb-1">Your Name</label>
                  <input required type="text" placeholder="Arjun Sharma" className="w-full px-4 py-2.5 rounded-md border border-border text-sm text-charcoal bg-background focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-warm-gray uppercase tracking-wider mb-1">Email Address</label>
                  <input required type="email" placeholder="arjun@example.com" className="w-full px-4 py-2.5 rounded-md border border-border text-sm text-charcoal bg-background focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-warm-gray uppercase tracking-wider mb-1">Subject</label>
                  <input type="text" placeholder="Reservation Inquiry" className="w-full px-4 py-2.5 rounded-md border border-border text-sm text-charcoal bg-background focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-warm-gray uppercase tracking-wider mb-1">Message</label>
                  <textarea required rows={4} placeholder="How can we assist you?" className="w-full px-4 py-2.5 rounded-md border border-border text-sm text-charcoal bg-background focus:outline-none" />
                </div>
                <button type="submit" className="w-full py-3 rounded-md bg-primary hover:bg-primary-dark text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                  <Send className="size-4" /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
