"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Save, CheckCircle, Loader2, Image as ImageIcon } from "lucide-react";
import { SITE_NAME, SITE_ADDRESS, SITE_EMAIL, SITE_PHONE } from "@/lib/constants";
import { API_BASE_URL } from "@/lib/api";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"resort" | "email" | "payment" | "analytics" | "features">("resort");

  const [settings, setSettings] = useState({
    siteName: SITE_NAME,
    phone: SITE_PHONE,
    email: SITE_EMAIL,
    address: SITE_ADDRESS,
    checkInTime: "02:00 PM",
    checkOutTime: "11:00 AM",
    heroTitle: "Luxury Escape in the Western Ghats",
    heroSubtitle: "Where Wilderness Meets Unrivaled Sophistication",
    heroImage: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&q=80",
    taxRate: 18,
    currency: "INR",
    gaMeasurementId: "G-VNP8899XX",
    gtmContainerId: "GTM-VNP123",
    razorpayKeyId: "rzp_test_9876543210ABC",
    smtpSender: "Vanapriya Reservations",
  });

  const [features, setFeatures] = useState({
    roomBooking: true,
    packageBooking: true,
    coupons: true,
    reviews: true,
    onlinePayment: true,
    whatsappWidget: false,
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/settings?key=site_config`);
        const data = await res.json();
        if (data && typeof data === "object") {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await fetch(`${API_BASE_URL}/settings?key=site_config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, features }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save settings", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Resort & Platform Settings</h1>
          <p className="text-xs text-warm-gray mt-1">Configure general details, hero background image, payment gateway keys, analytics tags, and feature flags live in MongoDB Atlas</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-md bg-primary hover:bg-primary-dark text-white font-semibold text-xs shadow-xs cursor-pointer disabled:opacity-50"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save Settings
        </button>
      </div>

      {saved && (
        <div className="p-3 bg-green-50 border border-green-200 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-2">
          <CheckCircle className="size-4" /> Settings updated & saved to database successfully!
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border">
        {[
          { id: "resort", label: "Resort & Hero Setup" },
          { id: "email", label: "Email & SMTP" },
          { id: "payment", label: "Razorpay Config" },
          { id: "analytics", label: "GA4 & GTM" },
          { id: "features", label: "Feature Flags" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-5 py-2.5 font-medium text-xs border-b-2 transition-colors cursor-pointer ${
              activeTab === t.id ? "border-primary text-primary font-bold" : "border-transparent text-warm-gray"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {loading ? (
        <div className="flex justify-center items-center py-20 text-warm-gray gap-2 bg-surface rounded-xl border border-border">
          <Loader2 className="size-5 animate-spin text-primary" /> Loading settings from MongoDB...
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border p-6 shadow-card">
          {activeTab === "resort" && (
            <div className="space-y-5 max-w-2xl text-xs">
              {/* Hero Image Section */}
              <div className="p-4 rounded-lg border border-border bg-background space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <ImageIcon className="size-4" /> Homepage Hero Background Image
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Live MongoDB Sync
                  </span>
                </div>
                <p className="text-warm-gray text-[11px]">
                  Manage the background image displayed on the guest homepage hero banner. Choose a curated resort preset or enter your custom image URL below.
                </p>

                {/* Quick Presets */}
                <div>
                  <label className="block text-warm-gray font-semibold mb-1 text-[11px]">Select Preset Hero Background:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { name: "Infinity Pool Resort", url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&q=90" },
                      { name: "Forest Sanctuary", url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=90" },
                      { name: "Misty Mountain Villa", url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=90" },
                      { name: "Sunset Luxury Pool", url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920&q=90" },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setSettings({ ...settings, heroImage: preset.url })}
                        className={`group relative aspect-[16/9] rounded border overflow-hidden text-left cursor-pointer transition-all ${
                          settings.heroImage === preset.url ? "ring-2 ring-primary border-primary" : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Image src={preset.url} alt={preset.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/40 p-1 flex items-end">
                          <span className="text-[10px] text-white font-bold truncate">{preset.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-warm-gray font-semibold mb-1">Custom Image URL *</label>
                  <input
                    type="text"
                    value={settings.heroImage}
                    onChange={(e) => setSettings({ ...settings, heroImage: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary font-mono text-[11px]"
                    placeholder="https://..."
                  />
                </div>
                {settings.heroImage && (
                  <div>
                    <label className="block text-warm-gray font-semibold mb-1 text-[11px]">Live Preview:</label>
                    <div className="relative aspect-[21/9] rounded-md overflow-hidden border border-border shadow-xs">
                      <Image
                        src={settings.heroImage}
                        alt="Hero background preview"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 flex items-center justify-center text-white font-bold text-sm text-shadow">
                        Homepage Hero Preview
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-warm-gray font-semibold mb-1">Resort Name</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-warm-gray font-semibold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-warm-gray font-semibold mb-1">Reservations Email</label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-warm-gray font-semibold mb-1">Physical Address</label>
                <textarea
                  rows={2}
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-warm-gray font-semibold mb-1">Standard Check-in Time</label>
                  <input
                    type="text"
                    value={settings.checkInTime}
                    onChange={(e) => setSettings({ ...settings, checkInTime: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-warm-gray font-semibold mb-1">Standard Check-out Time</label>
                  <input
                    type="text"
                    value={settings.checkOutTime}
                    onChange={(e) => setSettings({ ...settings, checkOutTime: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-warm-gray font-semibold mb-1">Hero Main Title Text</label>
                <input
                  type="text"
                  value={settings.heroTitle}
                  onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-warm-gray font-semibold mb-1">Hero Subtitle Text</label>
                <textarea
                  rows={2}
                  value={settings.heroSubtitle}
                  onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          )}

          {activeTab === "email" && (
            <div className="space-y-4 max-w-xl text-xs">
              <p className="text-warm-gray">Configure transactional email sender (SendGrid, Postmark, or Custom SMTP).</p>
              <div>
                <label className="block text-warm-gray font-semibold mb-1">From Sender Name</label>
                <input
                  type="text"
                  value={settings.smtpSender}
                  onChange={(e) => setSettings({ ...settings, smtpSender: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-warm-gray font-semibold mb-1">SMTP Server Host</label>
                <input type="text" placeholder="smtp.sendgrid.net" className="w-full px-3 py-2 rounded border border-border text-charcoal" />
              </div>
            </div>
          )}

          {activeTab === "payment" && (
            <div className="space-y-4 max-w-xl text-xs">
              <p className="text-warm-gray">Configure Razorpay payment gateway credentials for online bookings.</p>
              <div>
                <label className="block text-warm-gray font-semibold mb-1">Razorpay Key ID</label>
                <input
                  type="text"
                  value={settings.razorpayKeyId}
                  onChange={(e) => setSettings({ ...settings, razorpayKeyId: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-border text-charcoal font-mono"
                />
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-4 max-w-xl text-xs">
              <p className="text-warm-gray">Configure tracking codes for analytics and marketing tools.</p>
              <div>
                <label className="block text-warm-gray font-semibold mb-1">Google Analytics 4 (GA4) Measurement ID</label>
                <input
                  type="text"
                  value={settings.gaMeasurementId}
                  onChange={(e) => setSettings({ ...settings, gaMeasurementId: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-border text-charcoal font-mono"
                />
              </div>
            </div>
          )}

          {activeTab === "features" && (
            <div className="space-y-3 max-w-xl text-xs">
              <p className="text-warm-gray mb-2">Enable or disable specific features dynamically across the website.</p>
              {[
                { id: "roomBooking", label: "Online Room Bookings" },
                { id: "packageBooking", label: "Package Booking Engine" },
                { id: "coupons", label: "Promotional Coupon System" },
                { id: "reviews", label: "Guest Reviews Display" },
                { id: "onlinePayment", label: "Razorpay Checkout" },
                { id: "whatsappWidget", label: "WhatsApp Concierge Widget" },
              ].map((f) => (
                <label key={f.id} className="flex items-center justify-between p-3 rounded border border-border bg-background cursor-pointer">
                  <span className="font-semibold text-charcoal">{f.label}</span>
                  <input
                    type="checkbox"
                    checked={(features as any)[f.id]}
                    onChange={() => setFeatures({ ...features, [f.id]: !(features as any)[f.id] })}
                    className="size-4 accent-primary"
                  />
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
