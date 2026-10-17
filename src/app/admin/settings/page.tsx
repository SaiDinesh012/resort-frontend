"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Save,
  CheckCircle,
  Loader2,
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  Building,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  Share2,
  MessageCircle,
  Globe,
  ExternalLink,
} from "lucide-react";
import { SITE_NAME, SITE_ADDRESS, SITE_EMAIL, SITE_PHONE, SITE_TAGLINE } from "@/lib/constants";
import { getSiteSettings, saveSiteSettings, uploadLogoFile } from "@/lib/api";
import { useSiteSettings } from "@/context/SettingsContext";

export default function SettingsPage() {
  const { refreshSettings } = useSiteSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoSuccessMsg, setLogoSuccessMsg] = useState("");
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"resort" | "footer" | "email" | "payment" | "analytics" | "features">("resort");

  const [settings, setSettings] = useState({
    siteName: "Royal Grand IN Resorts",
    tagline: SITE_TAGLINE || "Stay Once, Carry Memories Forever",
    logoUrl: "",
    phone: SITE_PHONE,
    alternatePhone: "+91 94949 12345",
    email: SITE_EMAIL,
    address: SITE_ADDRESS,
    googleMapsUrl: "https://maps.google.com/?q=Royal+Grand+IN+Resorts+Maredumilli+Andhra+Pradesh",
    footerDescription:
      "Nestled amidst the lush forests and tranquil canopy of Maredumilli, Royal Grand IN Resorts offers a refined sanctuary where luxury harmonizes with pristine nature.",
    instagramUrl: "https://instagram.com/royalgrandinresorts",
    facebookUrl: "https://facebook.com/royalgrandinresorts",
    youtubeUrl: "https://youtube.com/@royalgrandinresorts",
    whatsappNumber: "+91 98765 43210",
    twitterUrl: "https://twitter.com/royalgrandin",
    tripadvisorUrl: "https://tripadvisor.com/royalgrandinresorts",
    linkedinUrl: "",
    newsletterHeading: "Subscribe to our Newsletter",
    newsletterSubheading: "Seasonal offers, curated packages and resort stories — in your inbox.",
    newsletterButtonText: "Subscribe",
    newsletterPlaceholder: "Enter your email address",
    faqHeading: "Frequently Asked Questions",
    faqSubheading: "Support",
    faqEnabled: true,
    copyrightText: "© {year} Royal Grand IN Resorts. All rights reserved.",
    footerLocationNote: "Maredumilli, East Godavari District, Andhra Pradesh, India",
    checkInTime: "02:00 PM",
    checkOutTime: "11:00 AM",
    heroTitle: "Where Royalty Meets the Wild",
    heroSubtitle: "A luxurious retreat surrounded by lush forests, misty hills and the untouched beauty of Maredumilli.",
    heroImage: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=90",
    taxRate: 18,
    currency: "INR",
    gaMeasurementId: "G-VNP8899XX",
    gtmContainerId: "GTM-VNP123",
    razorpayKeyId: "rzp_test_9876543210ABC",
    smtpSender: "Royal Grand IN Resorts Reservations",
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
    async function load() {
      try {
        setLoading(true);
        const data = await getSiteSettings("site_config");
        if (data && typeof data === "object") {
          setSettings((prev) => ({
            ...prev,
            ...data,
            siteName: (data.siteName === "Royal Gradin" || data.siteName === "Vanapriya Resort" || !data.siteName)
              ? "Royal Grand IN Resorts"
              : data.siteName,
            email: (data.email === "reservations@vanapriya.com" || data.email === "reservations@royalgradin.com" || !data.email)
              ? "reservations@royalgrandin.com"
              : data.email,
          }));
          if (data.features && typeof data.features === "object") {
            setFeatures((prev) => ({ ...prev, ...data.features }));
          }
        }

        // Fetch newsletter subscribers count
        try {
          const subRes = await fetch("/api/newsletter");
          if (subRes.ok) {
            const subData = await subRes.json();
            if (typeof subData.count === "number") {
              setSubscriberCount(subData.count);
            }
          }
        } catch (e) {
          // ignore
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setLoading(false);
      }
    }
    load();

    // Sync tab with URL query parameter
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") as any;
      if (tabParam && ["resort", "footer", "email", "payment", "analytics", "features"].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (.png, .jpg, .jpeg, .svg, .webp)");
      return;
    }

    try {
      setUploadingLogo(true);
      setLogoSuccessMsg("");

      // Read file as base64 data URL
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          // Upload to backend / Cloudinary
          const res = await uploadLogoFile({ fileData: base64Data });
          if (res && res.logoUrl) {
            setSettings((prev) => ({ ...prev, logoUrl: res.logoUrl }));
            setLogoSuccessMsg("Logo uploaded and saved to MongoDB & Cloudinary successfully!");
            setTimeout(() => setLogoSuccessMsg(""), 4000);
            refreshSettings();
            window.dispatchEvent(new Event("resort-settings-updated"));
          }
        } catch (err: any) {
          console.error("Failed to upload logo:", err);
          alert("Failed to upload logo: " + (err.message || "Unknown error"));
        } finally {
          setUploadingLogo(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadingLogo(false);
      alert("Error reading file: " + err.message);
    }
  };

  const handleRemoveLogo = () => {
    if (confirm("Are you sure you want to remove the custom logo?")) {
      setSettings((prev) => ({ ...prev, logoUrl: "" }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveSiteSettings({ ...settings, features }, "site_config");
      setSaved(true);
      refreshSettings();
      window.dispatchEvent(new Event("resort-settings-updated"));
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      console.error("Failed to save settings", err);
      alert("Failed to save settings to database. Please check your network connection.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Resort & Platform Settings</h1>
          <p className="text-xs text-warm-gray mt-1">
            Configure resort name, brand logo, contact details, hero presentation, and database configurations live in MongoDB
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-md bg-primary hover:bg-primary-dark text-white font-semibold text-xs shadow-xs cursor-pointer disabled:opacity-50 transition-all"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save All Settings
        </button>
      </div>

      {saved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="size-4 text-emerald-600" />
          Settings, resort name, logo, and contact details saved to MongoDB database successfully!
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border">
        {[
          { id: "resort", label: "Resort Brand & Identity" },
          { id: "footer", label: "Footer & Social Links" },
          { id: "email", label: "Email & SMTP" },
          { id: "payment", label: "Razorpay Gateway" },
          { id: "analytics", label: "GA4 & Tracking" },
          { id: "features", label: "Feature Flags" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-5 py-2.5 font-medium text-xs border-b-2 transition-colors cursor-pointer ${
              activeTab === t.id ? "border-primary text-primary font-bold" : "border-transparent text-warm-gray hover:text-charcoal"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {loading ? (
        <div className="flex justify-center items-center py-20 text-warm-gray gap-2 bg-surface rounded-xl border border-border">
          <Loader2 className="size-5 animate-spin text-primary" /> Loading resort settings from MongoDB Atlas...
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border p-6 shadow-card">
          {activeTab === "resort" && (
            <div className="space-y-6 max-w-3xl text-xs">

              {/* 1. BRAND LOGO UPLOAD SECTION */}
              <div className="p-5 rounded-xl border-2 border-primary/20 bg-primary/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <Sparkles className="size-4 text-accent" /> Resort Logo & Brand Asset
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Live Backend & Cloudinary
                  </span>
                </div>
                <p className="text-warm-gray text-[11px] leading-relaxed">
                  Upload the official resort logo from your device. It is securely saved to Cloudinary and MongoDB, automatically updating the website header, footer, and admin sidebar in real time.
                </p>

                {logoSuccessMsg && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold rounded flex items-center gap-2">
                    <CheckCircle className="size-3.5 text-emerald-600" /> {logoSuccessMsg}
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4 items-center pt-2">
                  {/* Current Logo Preview */}
                  <div>
                    <label className="block text-warm-gray font-semibold mb-1.5 text-[11px]">Current Logo Preview:</label>
                    <div className="flex items-center gap-3">
                      {/* Light preview */}
                      <div className="h-16 w-36 rounded-lg border border-border bg-white flex items-center justify-center p-2 shadow-xs">
                        {settings.logoUrl ? (
                          <img
                            src={settings.logoUrl}
                            alt="Resort Logo Light"
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <div className="size-6 rounded bg-accent text-white font-serif font-bold text-xs flex items-center justify-center">
                              {settings.siteName ? settings.siteName.charAt(0) : "R"}
                            </div>
                            <span className="font-serif font-bold text-xs text-charcoal truncate">
                              {settings.siteName}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Dark preview */}
                      <div className="h-16 w-36 rounded-lg border border-primary-dark bg-primary-dark flex items-center justify-center p-2 shadow-xs">
                        {settings.logoUrl ? (
                          <img
                            src={settings.logoUrl}
                            alt="Resort Logo Dark"
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <div className="size-6 rounded bg-accent text-white font-serif font-bold text-xs flex items-center justify-center">
                              {settings.siteName ? settings.siteName.charAt(0) : "R"}
                            </div>
                            <span className="font-serif font-bold text-xs text-white truncate">
                              {settings.siteName}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-warm-gray mt-1 block">Light header vs Dark header preview</span>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <label className="block text-warm-gray font-semibold text-[11px]">Upload or Change Logo:</label>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingLogo}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary hover:bg-primary-dark text-white font-semibold text-xs shadow-xs cursor-pointer disabled:opacity-50 transition-colors"
                      >
                        {uploadingLogo ? (
                          <>
                            <Loader2 className="size-3.5 animate-spin" /> Uploading to Cloudinary...
                          </>
                        ) : (
                          <>
                            <UploadCloud className="size-3.5" /> Upload Logo File
                          </>
                        )}
                      </button>

                      {settings.logoUrl && (
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold cursor-pointer transition-colors"
                        >
                          <Trash2 className="size-3.5" /> Remove
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-warm-gray">Supports PNG, JPG, SVG, WebP (Transparent PNG recommended)</p>
                  </div>
                </div>

                {/* Custom Logo URL input */}
                <div className="pt-2 border-t border-primary/10">
                  <label className="block text-warm-gray font-semibold mb-1 text-[11px]">Or Paste Logo Image URL directly:</label>
                  <input
                    type="text"
                    value={settings.logoUrl}
                    onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-border text-charcoal bg-white focus:outline-none focus:border-primary font-mono text-[11px]"
                    placeholder="https://res.cloudinary.com/... or https://example.com/logo.png"
                  />
                </div>
              </div>

              {/* 2. RESORT IDENTITY & CONTACT DETAILS */}
              <div className="p-5 rounded-xl border border-border bg-background space-y-4">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <Building className="size-4" /> Resort Identity & Contact Information
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-warm-gray font-semibold mb-1">
                      Resort Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={settings.siteName}
                      onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                      className="w-full px-3 py-2 rounded border border-border text-charcoal font-semibold focus:outline-none focus:border-primary bg-white text-sm"
                      placeholder="Royal Gradin"
                    />
                  </div>
                  <div>
                    <label className="block text-warm-gray font-semibold mb-1">Resort Tagline</label>
                    <input
                      type="text"
                      value={settings.tagline}
                      onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                      className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary bg-white"
                      placeholder="Where Wilderness Meets Luxury"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-warm-gray font-semibold mb-1">
                      Contact Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-warm-gray" />
                      <input
                        type="text"
                        value={settings.phone}
                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary bg-white"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-warm-gray font-semibold mb-1">
                      Reservations Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-warm-gray" />
                      <input
                        type="email"
                        value={settings.email}
                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary bg-white"
                        placeholder="reservations@royalgradin.com"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-warm-gray font-semibold mb-1">
                    Physical Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 size-3.5 text-warm-gray" />
                    <textarea
                      rows={2}
                      value={settings.address}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary bg-white"
                      placeholder="Survey No. 45, Chikmagalur-Koppa Road, Karnataka 577111, India"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-warm-gray font-semibold mb-1">Standard Check-in Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-warm-gray" />
                      <input
                        type="text"
                        value={settings.checkInTime}
                        onChange={(e) => setSettings({ ...settings, checkInTime: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-warm-gray font-semibold mb-1">Standard Check-out Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-warm-gray" />
                      <input
                        type="text"
                        value={settings.checkOutTime}
                        onChange={(e) => setSettings({ ...settings, checkOutTime: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. HERO BANNER SECTION */}
              <div className="p-5 rounded-xl border border-border bg-background space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <ImageIcon className="size-4" /> Homepage Hero Presentation
                  </div>
                </div>

                <div>
                  <label className="block text-warm-gray font-semibold mb-1">Hero Main Title Text</label>
                  <input
                    type="text"
                    value={settings.heroTitle}
                    onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary bg-white"
                  />
                </div>
                <div>
                  <label className="block text-warm-gray font-semibold mb-1">Hero Subtitle Text</label>
                  <textarea
                    rows={2}
                    value={settings.heroSubtitle}
                    onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary bg-white"
                  />
                </div>

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
                  <label className="block text-warm-gray font-semibold mb-1">Custom Hero Background Image URL</label>
                  <input
                    type="text"
                    value={settings.heroImage}
                    onChange={(e) => setSettings({ ...settings, heroImage: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary font-mono text-[11px] bg-white"
                    placeholder="https://..."
                  />
                </div>

                {settings.heroImage && (
                  <div>
                    <label className="block text-warm-gray font-semibold mb-1 text-[11px]">Live Hero Banner Preview:</label>
                    <div className="relative aspect-[21/9] rounded-md overflow-hidden border border-border shadow-xs">
                      <Image
                        src={settings.heroImage}
                        alt="Hero background preview"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70 flex flex-col items-center justify-center text-center p-4">
                        <span className="text-white font-serif font-bold text-base sm:text-lg mb-1 drop-shadow-md">
                          {settings.heroTitle}
                        </span>
                        <span className="text-white/80 text-[11px] max-w-md drop-shadow">
                          {settings.heroSubtitle}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {activeTab === "footer" && (
            <div className="space-y-6 max-w-3xl text-xs">
              {/* 1. FOOTER BIO & BRAND PRESENTATION */}
              <div className="p-5 rounded-xl border border-border bg-background space-y-4">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <Globe className="size-4" /> Footer Brand Presentation & About Copy
                </div>
                <p className="text-warm-gray text-[11px]">
                  Customize the description that appears in the first column of the footer across the entire resort website.
                </p>

                <div>
                  <label className="block text-warm-gray font-semibold mb-1">
                    Footer About / Description
                  </label>
                  <textarea
                    rows={3}
                    value={settings.footerDescription}
                    onChange={(e) => setSettings({ ...settings, footerDescription: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary bg-white text-xs leading-relaxed"
                    placeholder="Nestled amidst the lush forests..."
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-warm-gray font-semibold mb-1">
                      Footer Location Note
                    </label>
                    <input
                      type="text"
                      value={settings.footerLocationNote}
                      onChange={(e) => setSettings({ ...settings, footerLocationNote: e.target.value })}
                      className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary bg-white"
                      placeholder="Maredumilli, East Godavari District, Andhra Pradesh, India"
                    />
                  </div>

                  <div>
                    <label className="block text-warm-gray font-semibold mb-1">
                      Copyright Notice Text
                    </label>
                    <input
                      type="text"
                      value={settings.copyrightText}
                      onChange={(e) => setSettings({ ...settings, copyrightText: e.target.value })}
                      className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary bg-white"
                      placeholder="© {year} Royal Grand IN Resorts. All rights reserved."
                    />
                    <span className="text-[10px] text-warm-gray mt-1 block">
                      Tip: Use &#123;year&#125; and &#123;siteName&#125; tokens to automatically fill the current year and resort name.
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. SOCIAL MEDIA & CONCIERGE CHANNELS */}
              <div className="p-5 rounded-xl border border-border bg-background space-y-4">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <Share2 className="size-4" /> Social Media & Concierge Channels
                </div>
                <p className="text-warm-gray text-[11px]">
                  Configure your official social profiles. Social icons in the footer and contact sections will open these exact links.
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-warm-gray font-semibold mb-1">Instagram Profile URL</label>
                    <input
                      type="url"
                      value={settings.instagramUrl}
                      onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary bg-white font-mono text-[11px]"
                      placeholder="https://instagram.com/royalgrandinresorts"
                    />
                  </div>

                  <div>
                    <label className="block text-warm-gray font-semibold mb-1">Facebook Page URL</label>
                    <input
                      type="url"
                      value={settings.facebookUrl}
                      onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary bg-white font-mono text-[11px]"
                      placeholder="https://facebook.com/royalgrandinresorts"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-warm-gray font-semibold mb-1">YouTube Channel URL</label>
                    <input
                      type="url"
                      value={settings.youtubeUrl}
                      onChange={(e) => setSettings({ ...settings, youtubeUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary bg-white font-mono text-[11px]"
                      placeholder="https://youtube.com/@royalgrandinresorts"
                    />
                  </div>

                  <div>
                    <label className="block text-warm-gray font-semibold mb-1">
                      WhatsApp Concierge Number
                    </label>
                    <div className="relative">
                      <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-emerald-600" />
                      <input
                        type="text"
                        value={settings.whatsappNumber}
                        onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary bg-white"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-warm-gray font-semibold mb-1">Google Maps / Directions Link</label>
                    <input
                      type="url"
                      value={settings.googleMapsUrl}
                      onChange={(e) => setSettings({ ...settings, googleMapsUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary bg-white font-mono text-[11px]"
                      placeholder="https://maps.google.com/?q=..."
                    />
                  </div>

                  <div>
                    <label className="block text-warm-gray font-semibold mb-1">TripAdvisor Profile</label>
                    <input
                      type="url"
                      value={settings.tripadvisorUrl || ""}
                      onChange={(e) => setSettings({ ...settings, tripadvisorUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary bg-white font-mono text-[11px]"
                      placeholder="https://tripadvisor.com/royalgrandinresorts"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-warm-gray font-semibold mb-1">X / Twitter Profile URL</label>
                    <input
                      type="url"
                      value={settings.twitterUrl || ""}
                      onChange={(e) => setSettings({ ...settings, twitterUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary bg-white font-mono text-[11px]"
                      placeholder="https://twitter.com/royalgrandin"
                    />
                  </div>

                  <div>
                    <label className="block text-warm-gray font-semibold mb-1">LinkedIn Page URL (Optional)</label>
                    <input
                      type="url"
                      value={settings.linkedinUrl || ""}
                      onChange={(e) => setSettings({ ...settings, linkedinUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary bg-white font-mono text-[11px]"
                      placeholder="https://linkedin.com/company/royalgrandinresorts"
                    />
                  </div>
                </div>

                {/* Live Social Channels Preview */}
                <div className="pt-3 border-t border-border/60">
                  <div className="text-[11px] font-bold text-warm-gray uppercase tracking-wider mb-2">
                    Live Footer Social Icons Preview &amp; Test:
                  </div>
                  <div className="p-4 rounded-lg bg-[#0d231b] flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {settings.instagramUrl && (
                        <a
                          href={settings.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="size-8 rounded bg-white/10 hover:bg-[#E1306C] text-white flex items-center justify-center transition-all"
                          title="Instagram"
                        >
                          <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                        </a>
                      )}
                      {settings.facebookUrl && (
                        <a
                          href={settings.facebookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="size-8 rounded bg-white/10 hover:bg-[#1877F2] text-white flex items-center justify-center transition-all"
                          title="Facebook"
                        >
                          <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                        </a>
                      )}
                      {settings.youtubeUrl && (
                        <a
                          href={settings.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="size-8 rounded bg-white/10 hover:bg-[#FF0000] text-white flex items-center justify-center transition-all"
                          title="YouTube"
                        >
                          <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                          </svg>
                        </a>
                      )}
                      {settings.whatsappNumber && (
                        <a
                          href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="size-8 rounded bg-white/10 hover:bg-[#25D366] text-white flex items-center justify-center transition-all"
                          title="WhatsApp Chat"
                        >
                          <MessageCircle className="size-3.5" />
                        </a>
                      )}
                      {settings.twitterUrl && (
                        <a
                          href={settings.twitterUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="size-8 rounded bg-white/10 hover:bg-black text-white flex items-center justify-center transition-all"
                          title="X / Twitter"
                        >
                          <svg className="size-3 fill-current" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                        </a>
                      )}
                      {settings.tripadvisorUrl && (
                        <a
                          href={settings.tripadvisorUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="size-8 rounded bg-white/10 hover:bg-[#00AF87] text-white flex items-center justify-center transition-all"
                          title="TripAdvisor"
                        >
                          <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3.1a2.8 2.8 0 0 1 2.8 2.8c0 .37-.08.72-.21 1.04.85.47 1.5 1.27 1.83 2.25.32-.13.66-.2 1.02-.2 1.55 0 2.8 1.25 2.8 2.8s-1.25 2.8-2.8 2.8c-1.29 0-2.35-.87-2.69-2.05-.58.4-1.29.65-2.05.73v-.96c.5-.07.95-.25 1.35-.51-.35-.59-.56-1.27-.56-2 0-.43.07-.83.21-1.2-.63-.36-1.14-.94-1.4-1.64-.26.7-.77 1.28-1.4 1.64.14.37.21.77.21 1.2 0 .73-.21 1.41-.56 2 .4.26.85.44 1.35.51v.96c-.76-.08-1.47-.33-2.05-.73-.34 1.18-1.4 2.05-2.69 2.05-1.55 0-2.8-1.25-2.8-2.8s1.25-2.8 2.8-2.8c.36 0 .7.07 1.02.2.33-.98.98-1.78 1.83-2.25-.13-.32-.21-.67-.21-1.04 0-1.55 1.25-2.8 2.8-2.8zm-5.46 8.7a1.26 1.26 0 1 0 0 2.52 1.26 1.26 0 0 0 0-2.52zm10.92 0a1.26 1.26 0 1 0 0 2.52 1.26 1.26 0 0 0 0-2.52z" />
                          </svg>
                        </a>
                      )}
                      {settings.linkedinUrl && (
                        <a
                          href={settings.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="size-8 rounded bg-white/10 hover:bg-[#0A66C2] text-white flex items-center justify-center transition-all"
                          title="LinkedIn"
                        >
                          <svg className="size-3 fill-current" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                          </svg>
                        </a>
                      )}
                    </div>
                    <span className="text-[10px] text-white/50 italic">
                      Click any icon to test its destination in a new tab
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. NEWSLETTER BANNER SETTINGS */}
              {/* Newsletter Banner */}
              <div className="p-5 rounded-xl border border-border bg-background space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <Mail className="size-4" /> Newsletter Banner & Subscriber Management
                  </div>
                  <div className="flex items-center gap-2">
                    {subscriberCount !== null && (
                      <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-bold text-[11px]">
                        {subscriberCount} Active Subscribers
                      </span>
                    )}
                    <a
                      href="/admin/subscriptions"
                      className="px-3 py-1 bg-primary text-white rounded text-xs font-semibold hover:bg-primary-dark transition-colors inline-flex items-center gap-1"
                    >
                      Open Subscriptions Studio &rarr;
                    </a>
                  </div>
                </div>
                <p className="text-warm-gray text-[11px]">
                  Guests subscribing through the footer form are directly saved to the MongoDB database.
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-warm-gray font-semibold mb-1">
                      Newsletter Strip Heading
                    </label>
                    <input
                      type="text"
                      value={settings.newsletterHeading}
                      onChange={(e) => setSettings({ ...settings, newsletterHeading: e.target.value })}
                      className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary bg-white"
                      placeholder="Subscribe to our Newsletter"
                    />
                  </div>

                  <div>
                    <label className="block text-warm-gray font-semibold mb-1">
                      Newsletter Strip Subtitle
                    </label>
                    <input
                      type="text"
                      value={settings.newsletterSubheading}
                      onChange={(e) => setSettings({ ...settings, newsletterSubheading: e.target.value })}
                      className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary bg-white"
                      placeholder="Seasonal offers, curated packages and resort stories — in your inbox."
                    />
                  </div>
                </div>
              </div>

              {/* FAQ Section Settings */}
              <div className="p-5 rounded-xl border border-border bg-background space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <span className="size-4 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-bold">?</span>
                    Website FAQ Accordion Section
                  </div>
                  <a
                    href="/admin/content/faqs"
                    className="px-3 py-1 bg-accent hover:bg-accent-dark text-white rounded text-xs font-semibold transition-colors inline-flex items-center gap-1"
                  >
                    Manage & Reorder Questions &rarr;
                  </a>
                </div>
                <p className="text-warm-gray text-[11px]">
                  Configure the title and subtitle of the FAQs accordion section on the website homepage.
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-warm-gray font-semibold mb-1">
                      FAQ Section Subheading (Badge)
                    </label>
                    <input
                      type="text"
                      value={settings.faqSubheading || "Support"}
                      onChange={(e) => setSettings({ ...settings, faqSubheading: e.target.value })}
                      className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary bg-white"
                      placeholder="e.g. Support"
                    />
                  </div>

                  <div>
                    <label className="block text-warm-gray font-semibold mb-1">
                      FAQ Section Main Heading
                    </label>
                    <input
                      type="text"
                      value={settings.faqHeading || "Frequently Asked Questions"}
                      onChange={(e) => setSettings({ ...settings, faqHeading: e.target.value })}
                      className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary bg-white"
                      placeholder="e.g. Frequently Asked Questions"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "email" && (
            <div className="space-y-4 max-w-xl text-xs">
              <p className="text-warm-gray">Configure transactional email sender and notifications for bookings.</p>
              <div>
                <label className="block text-warm-gray font-semibold mb-1">From Sender Name</label>
                <input
                  type="text"
                  value={settings.smtpSender}
                  onChange={(e) => setSettings({ ...settings, smtpSender: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-warm-gray font-semibold mb-1">From Email Address</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-border text-charcoal bg-white"
                />
              </div>
              <div>
                <label className="block text-warm-gray font-semibold mb-1">SMTP Server Host</label>
                <input type="text" placeholder="smtp.sendgrid.net" className="w-full px-3 py-2 rounded border border-border text-charcoal bg-white" />
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
                  className="w-full px-3 py-2 rounded border border-border text-charcoal font-mono bg-white"
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
                  className="w-full px-3 py-2 rounded border border-border text-charcoal font-mono bg-white"
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
