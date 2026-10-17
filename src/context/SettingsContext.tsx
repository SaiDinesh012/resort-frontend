"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  SITE_NAME,
  SITE_PHONE,
  SITE_EMAIL,
  SITE_ADDRESS,
  SITE_TAGLINE,
  SITE_DESCRIPTION,
} from "@/lib/constants";
import { getSiteSettings } from "@/lib/api";

export interface SiteSettings {
  siteName: string;
  tagline: string;
  description: string;
  footerDescription?: string;
  logoUrl?: string;
  phone: string;
  alternatePhone?: string;
  email: string;
  address: string;
  googleMapsUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  whatsappNumber?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  tripadvisorUrl?: string;
  newsletterHeading?: string;
  newsletterSubheading?: string;
  newsletterButtonText?: string;
  newsletterPlaceholder?: string;
  newsletterBadge?: string;
  newsletterSuccessMessage?: string;
  newsletterEnabled?: boolean;
  faqHeading?: string;
  faqSubheading?: string;
  faqEnabled?: boolean;
  copyrightText?: string;
  footerLocationNote?: string;
  checkInTime: string;
  checkOutTime: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  taxRate?: number;
  currency?: string;
  [key: string]: any;
}

const defaultSettings: SiteSettings = {
  siteName: SITE_NAME,
  tagline: SITE_TAGLINE,
  description: SITE_DESCRIPTION,
  footerDescription:
    "Nestled amidst the lush forests and tranquil canopy of Maredumilli, Royal Grand IN Resorts offers a refined sanctuary where luxury harmonizes with pristine nature.",
  logoUrl: "",
  phone: SITE_PHONE,
  alternatePhone: "+91 94949 12345",
  email: SITE_EMAIL,
  address: SITE_ADDRESS,
  googleMapsUrl: "https://maps.google.com/?q=Royal+Grand+IN+Resorts+Maredumilli+Andhra+Pradesh",
  instagramUrl: "https://instagram.com/royalgrandinresorts",
  facebookUrl: "https://facebook.com/royalgrandinresorts",
  youtubeUrl: "https://youtube.com/@royalgrandinresorts",
  whatsappNumber: "+91 98765 43210",
  twitterUrl: "https://twitter.com/royalgrandin",
  linkedinUrl: "",
  tripadvisorUrl: "https://tripadvisor.com/royalgrandinresorts",
  newsletterHeading: "Subscribe to our Newsletter",
  newsletterSubheading: "Seasonal offers, curated packages and resort stories — in your inbox.",
  newsletterButtonText: "Subscribe",
  newsletterPlaceholder: "Enter your email address",
  newsletterBadge: "",
  newsletterSuccessMessage: "Thank you for subscribing! Seasonal offers and resort stories will arrive in your inbox.",
  newsletterEnabled: true,
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
};

interface SettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettingsState: (partial: Partial<SiteSettings>) => void;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {},
  updateSettingsState: () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await getSiteSettings("site_config");
      if (data && typeof data === "object") {
        setSettings((prev) => ({
          ...prev,
          ...data,
          // Ensure correct brand name
          siteName: (data.siteName === "Royal Gradin" || !data.siteName)
            ? "Royal Grand IN Resorts"
            : data.siteName,
          tagline: data.tagline || prev.tagline,
          logoUrl: data.logoUrl !== undefined ? data.logoUrl : prev.logoUrl,
          phone: data.phone || prev.phone,
          email: data.email || prev.email,
          address: data.address || prev.address,
        }));
      }
    } catch (err) {
      console.warn("Could not load backend site settings, using defaults", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();

    // Listen for custom event when settings are saved in admin console
    const handleSettingsUpdated = () => {
      fetchSettings();
    };
    window.addEventListener("resort-settings-updated", handleSettingsUpdated);
    return () => {
      window.removeEventListener("resort-settings-updated", handleSettingsUpdated);
    };
  }, [fetchSettings]);

  const updateSettingsState = useCallback((partial: Partial<SiteSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: fetchSettings,
        updateSettingsState,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SettingsContext);
}
