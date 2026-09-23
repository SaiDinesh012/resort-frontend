"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Save, CheckCircle, Loader2, Image as ImageIcon } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import "@/styles/ck-content.css";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"resort" | "about" | "email" | "payment" | "analytics" | "features">("resort");

  const [isLocalhost, setIsLocalhost] = useState(false);
  const [settings, setSettings] = useState({
    siteName: "",
    logoUrl: "",
    tagline: "",
    phone: "",
    email: "",
    address: "",
    checkInTime: "",
    checkOutTime: "",
    heroTitle: "",
    heroSubtitle: "",
    heroTextColor: "#ffffff",
    heroImage: "",
    taxRate: 18,
    currency: "INR",
    gaMeasurementId: "",
    gtmContainerId: "",
    razorpayKeyId: "",
    smtpSender: "",
  });

  const [aboutSection, setAboutSection] = useState({
    aboutBadge: "",
    aboutTitle: "",
    aboutBody: "",
    aboutImage: "",
    aboutYearsNumber: "",
    aboutYearsLabel: "",
    aboutLink: "",
    aboutLinkText: "",
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
    setIsLocalhost(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/settings?key=site_config`);
        const data = await res.json();
        if (data && typeof data === "object") {
          // Directly set from DB — no frontend fallbacks
          setSettings((prev) => ({
            ...prev,
            siteName: data.siteName ?? prev.siteName,
            logoUrl: data.logoUrl ?? prev.logoUrl,
            tagline: data.tagline ?? prev.tagline,
            phone: data.phone ?? prev.phone,
            email: data.email ?? prev.email,
            address: data.address ?? prev.address,
            checkInTime: data.checkInTime ?? prev.checkInTime,
            checkOutTime: data.checkOutTime ?? prev.checkOutTime,
            heroTitle: data.heroTitle ?? prev.heroTitle,
            heroSubtitle: data.heroSubtitle ?? prev.heroSubtitle,
            heroTextColor: data.heroTextColor ?? prev.heroTextColor,
            heroImage: data.heroImage ?? prev.heroImage,
            taxRate: data.taxRate ?? prev.taxRate,
            currency: data.currency ?? prev.currency,
            gaMeasurementId: data.gaMeasurementId ?? prev.gaMeasurementId,
            gtmContainerId: data.gtmContainerId ?? prev.gtmContainerId,
            razorpayKeyId: data.razorpayKeyId ?? prev.razorpayKeyId,
            smtpSender: data.smtpSender ?? prev.smtpSender,
          }));
          // About section — directly from DB
          setAboutSection({
            aboutBadge: data.aboutBadge ?? "",
            aboutTitle: data.aboutTitle ?? "",
            aboutBody: data.aboutBody ?? "",
            aboutImage: data.aboutImage ?? "",
            aboutYearsNumber: data.aboutYearsNumber ?? "",
            aboutYearsLabel: data.aboutYearsLabel ?? "",
            aboutLink: data.aboutLink ?? "",
            aboutLinkText: data.aboutLinkText ?? "",
          });
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);


  const handleAboutImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result;
        if (!base64) return;
        const res = await fetch(`${API_BASE_URL}/media`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `About Section Image ${Date.now()}`,
            category: "image",
            fileData: base64,
          }),
        });
        const data = await res.json();
        if (data?.url) {
          setAboutSection((prev) => ({ ...prev, aboutImage: data.url }));
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("About image upload failed", err);
      alert("Failed to upload image. Please try again.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: "logoUrl" | "heroImage") => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result;
        if (!base64) return;

        // Upload to our media API which hooks into Cloudinary
        const res = await fetch(`${API_BASE_URL}/media`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `Settings ${fieldName} ${Date.now()}`,
            category: "image",
            fileData: base64,
          }),
        });

        const data = await res.json();
        if (data && data.url) {
          setSettings((prev) => ({ ...prev, [fieldName]: data.url }));
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload image. Please try again.");
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await fetch(`${API_BASE_URL}/settings?key=site_config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, features, ...aboutSection }),
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
      <div className="flex border-b border-border overflow-x-auto">
        {[
          { id: "resort", label: "Resort & Hero Setup" },
          { id: "about", label: "About Section" },
          { id: "email", label: "Email & SMTP" },
          { id: "payment", label: "Razorpay Config" },
          { id: "analytics", label: "GA4 & GTM" },
          { id: "features", label: "Feature Flags" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-5 py-2.5 font-medium text-xs border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
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
                    <label className="block text-warm-gray font-semibold mb-1">Custom Image (URL or Upload) *</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={settings.heroImage}
                        onChange={(e) => setSettings({ ...settings, heroImage: e.target.value })}
                        className="flex-1 px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary font-mono text-[11px]"
                        placeholder="https://..."
                      />
                      <label className="cursor-pointer bg-charcoal text-white px-3 py-2 rounded flex items-center justify-center text-sm font-semibold hover:bg-charcoal/90 transition-colors">
                        Upload
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, "heroImage")} 
                        />
                      </label>
                    </div>
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

              
              {isLocalhost && (
              <div>
                <label className="block text-warm-gray font-semibold mb-1 flex items-center justify-between">
                  Resort Name
                  <span className="text-[10px] font-normal text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Editable</span>
                </label>
                <input
                  type="text"
                  value={settings.siteName || ""}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary"
                />
              </div>
              )}

              <div>
                <label className="block text-warm-gray font-semibold mb-1">Header Location / Tagline</label>
                <input
                  type="text"
                  value={settings.tagline || ""}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary"
                />
              </div>

                            {isLocalhost && (
<div>
                <label className="block text-warm-gray font-semibold mb-1">Resort Logo (URL or Upload)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://..."
                    value={settings.logoUrl || ""}
                    onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                    className="flex-1 px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary font-mono text-[11px]"
                  />
                  <label className="cursor-pointer bg-charcoal text-white px-3 py-2 rounded flex items-center justify-center text-sm font-semibold hover:bg-charcoal/90 transition-colors">
                    Upload
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, "logoUrl")} 
                    />
                  </label>
                </div>
                {settings.logoUrl && (
                  <div className="mt-2 p-2 border border-border rounded bg-white inline-block">
                    <img src={settings.logoUrl} alt="Logo Preview" className="h-8 object-contain" />
                  </div>
                )}
              </div>
              )}
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

          {/* ─── ABOUT SECTION TAB ─────────────────────────────── */}
          {activeTab === "about" && (
            <div className="space-y-6 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-charcoal text-sm">About Section Editor</h2>
                  <p className="text-warm-gray mt-0.5">Edit the homepage \u201cAbout the Resort\u201d section. Use the rich text editor to format content exactly as it will appear on the website.</p>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">Live MongoDB Sync</span>
              </div>

              {/* Image */}
              <div className="p-4 rounded-lg border border-border bg-background space-y-3">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <ImageIcon className="size-4" /> Section Image
                </div>
                <p className="text-warm-gray text-[11px]">This is the large image displayed on the left side of the About section. Upload from your device (auto-synced to Cloudinary) or paste a URL.</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aboutSection.aboutImage}
                    onChange={(e) => setAboutSection({ ...aboutSection, aboutImage: e.target.value })}
                    className="flex-1 px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary font-mono text-[11px]"
                    placeholder="https://... or upload below"
                  />
                  <label className="cursor-pointer bg-charcoal text-white px-3 py-2 rounded flex items-center justify-center text-sm font-semibold hover:bg-charcoal/90 transition-colors">
                    Upload
                    <input type="file" accept="image/*" className="hidden" onChange={handleAboutImageUpload} />
                  </label>
                </div>
                {aboutSection.aboutImage && (
                  <div className="relative aspect-[4/5] w-40 rounded-md overflow-hidden border border-border shadow-xs">
                    <Image src={aboutSection.aboutImage} alt="About section preview" fill className="object-cover" />
                  </div>
                )}
              </div>

              {/* Text Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-warm-gray font-semibold mb-1">Badge Label <span className="text-[10px] font-normal">(small caps above title)</span></label>
                  <input
                    type="text"
                    value={aboutSection.aboutBadge}
                    onChange={(e) => setAboutSection({ ...aboutSection, aboutBadge: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary"
                    placeholder="About the Resort"
                  />
                </div>
                <div>
                  <label className="block text-warm-gray font-semibold mb-1">Section Title</label>
                  <input
                    type="text"
                    value={aboutSection.aboutTitle}
                    onChange={(e) => setAboutSection({ ...aboutSection, aboutTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary"
                    placeholder="A Forest Retreat Like No Other"
                  />
                </div>
                <div>
                  <label className="block text-warm-gray font-semibold mb-1">Years Badge — Number</label>
                  <input
                    type="text"
                    value={aboutSection.aboutYearsNumber}
                    onChange={(e) => setAboutSection({ ...aboutSection, aboutYearsNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary"
                    placeholder="15+"
                  />
                </div>
                <div>
                  <label className="block text-warm-gray font-semibold mb-1">Years Badge — Label</label>
                  <input
                    type="text"
                    value={aboutSection.aboutYearsLabel}
                    onChange={(e) => setAboutSection({ ...aboutSection, aboutYearsLabel: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary"
                    placeholder="Years of Luxury Hospitality"
                  />
                </div>
                <div>
                  <label className="block text-warm-gray font-semibold mb-1">CTA Link URL</label>
                  <input
                    type="text"
                    value={aboutSection.aboutLink}
                    onChange={(e) => setAboutSection({ ...aboutSection, aboutLink: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary font-mono"
                    placeholder="/resort"
                  />
                </div>
                <div>
                  <label className="block text-warm-gray font-semibold mb-1">CTA Link Text</label>
                  <input
                    type="text"
                    value={aboutSection.aboutLinkText}
                    onChange={(e) => setAboutSection({ ...aboutSection, aboutLinkText: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary"
                    placeholder="Discover More About Us"
                  />
                </div>
              </div>

              {/* CKEditor Body */}
              <div>
                <label className="block text-warm-gray font-semibold mb-2 text-sm">
                  Body Content
                  <span className="ml-2 text-[10px] font-normal text-warm-gray">(supports bold, italic, lists, links, headings, blockquotes)</span>
                </label>
                <RichTextEditor
                  value={aboutSection.aboutBody}
                  onChange={(html) => setAboutSection((prev) => ({ ...prev, aboutBody: html }))}
                  placeholder="Write the about section content here..."
                  minHeight={300}
                />
              </div>

              {/* Live HTML preview */}
              <div>
                <label className="block text-warm-gray font-semibold mb-2">Live Preview <span className="text-[10px] font-normal">(exactly as it renders on the homepage)</span></label>
                <div
                  className="ck-content p-4 rounded-lg border border-border bg-white"
                  dangerouslySetInnerHTML={{ __html: aboutSection.aboutBody }}
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
