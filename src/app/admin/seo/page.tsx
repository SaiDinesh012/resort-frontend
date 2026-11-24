"use client";

import { useState } from "react";
import { Search, Globe, Link2, FileCode, CheckCircle2 } from "lucide-react";

export default function SeoManagementPage() {
  const [activeTab, setActiveTab] = useState<"pages" | "redirects" | "schema" | "sitemap">("pages");

  const seoPages = [
    {
      page: "Home Page",
      url: "/",
      title: "Royalgrandin Resort — Maredumilli Luxury Forest Escape",
      meta: "Luxury eco-resort in Maredumilli, Andhra Pradesh with private pool villas, authentic bamboo dining, and pristine forest views.",
      status: "Indexed",
    },
    {
      page: "Rooms & Suites",
      url: "/rooms",
      title: "Luxury Rooms & Forest Villas in Maredumilli | Royalgrandin Resort",
      meta: "Explore our Deluxe Forest Rooms, Premium Forest Suites, and private pool Jungle Villas in Maredumilli.",
      status: "Indexed",
    },
    {
      page: "Deluxe Forest Room",
      url: "/rooms/deluxe-forest-room",
      title: "Deluxe Forest Room | Royalgrandin Resort Maredumilli",
      meta: "Wake up to nature with king bed, balcony, and forest views in Maredumilli.",
      status: "Indexed",
    },
    {
      page: "Premium Forest Suite",
      url: "/rooms/premium-suite",
      title: "Premium Forest Suite | Royalgrandin Resort Maredumilli",
      meta: "Spacious luxury suite with plunge pool terrace and panoramic forest views.",
      status: "Indexed",
    },
    {
      page: "Jungle Villa",
      url: "/rooms/jungle-villa",
      title: "Jungle Villa with Private Pool | Royalgrandin Resort",
      meta: "Standalone sanctuary nestled deep within Maredumilli forest with private swimming pool and dedicated butler.",
      status: "Indexed",
    },
    {
      page: "Holiday Packages",
      url: "/packages",
      title: "Resort Packages & Jungle Retreats | Royalgrandin Resort",
      meta: "Curated experiential packages in Maredumilli for couples, nature lovers, waterfall excursions, and families.",
      status: "Indexed",
    },
    {
      page: "Wilderness Escape",
      url: "/packages/wilderness-escape",
      title: "Wilderness & Wellness Escape | Royalgrandin Resort",
      meta: "3 Days / 2 Nights signature retreat with guided treks, bamboo dining, and wildlife safari.",
      status: "Indexed",
    },
    {
      page: "Resort Experiences",
      url: "/resort",
      title: "Curated Forest Experiences & Dining | Royalgrandin Resort",
      meta: "Ayurvedic forest wellness, authentic Bamboo Chicken dining, waterfall treks, and guided nature trails.",
      status: "Indexed",
    },
    {
      page: "Photo Gallery",
      url: "/gallery",
      title: "Photo & Video Gallery | Royalgrandin Resort Maredumilli",
      meta: "Explore high-resolution photographs of our luxury villas, forest canopy, and serene resort grounds.",
      status: "Indexed",
    },
    {
      page: "Sightseeing & Waterfalls",
      url: "/locations",
      title: "Nearby Waterfalls & Attractions | Royalgrandin Resort Maredumilli",
      meta: "Discover Jalatarangini Waterfalls, Amruthadhara, Rampa Falls, and Papikondalu boat cruises.",
      status: "Indexed",
    },
    {
      page: "Contact & Concierge",
      url: "/contact",
      title: "Contact & Reservations | Royalgrandin Resort Maredumilli",
      meta: "Direct resort desk contact, reservation inquiries, and scenic route directions from Rajahmundry & Vizag.",
      status: "Indexed",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-charcoal">SEO & Meta Management</h1>
        <p className="text-xs text-warm-gray mt-1">
          Configure page titles, meta descriptions, slugs, 301 redirects, JSON-LD Schema, and sitemaps
        </p>
      </div>

      <div className="flex border-b border-border">
        {[
          { id: "pages", label: "Page Slugs & Metadata" },
          { id: "redirects", label: "301 Redirects" },
          { id: "schema", label: "JSON-LD Schema" },
          { id: "sitemap", label: "Sitemap Status" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-5 py-2.5 font-medium text-xs border-b-2 transition-colors ${
              activeTab === t.id ? "border-primary text-primary font-bold" : "border-transparent text-warm-gray"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden">
        {activeTab === "pages" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-background border-b border-border text-warm-gray font-semibold uppercase">
                  <th className="p-3.5">Page Name</th>
                  <th className="p-3.5">Live Slug / URL</th>
                  <th className="p-3.5">SEO Title</th>
                  <th className="p-3.5">Meta Description</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {seoPages.map((sp) => (
                  <tr key={sp.url} className="hover:bg-background/50">
                    <td className="p-3.5 font-bold text-charcoal">{sp.page}</td>
                    <td className="p-3.5 font-mono text-[11px] text-primary">{sp.url}</td>
                    <td className="p-3.5 font-medium max-w-xs">{sp.title}</td>
                    <td className="p-3.5 text-warm-gray max-w-sm truncate">{sp.meta}</td>
                    <td className="p-3.5 text-success font-semibold flex items-center gap-1">
                      <CheckCircle2 className="size-3.5" /> {sp.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "redirects" && (
          <div className="p-6 text-xs text-warm-gray space-y-4">
            <h3 className="font-semibold text-charcoal text-sm">Active 301 Redirect Rules</h3>
            <div className="p-3 bg-background rounded border border-border font-mono space-y-1 text-charcoal">
              <div>/experiences → /resort (301 Permanent)</div>
              <div>/old-resort-stay → /rooms (301 Permanent)</div>
            </div>
            <button className="px-4 py-2 bg-primary text-white font-semibold rounded text-xs cursor-pointer">
              Add Redirect Rule
            </button>
          </div>
        )}

        {activeTab === "schema" && (
          <div className="p-6 text-xs space-y-3">
            <h3 className="font-semibold text-charcoal text-sm">Resort JSON-LD Structured Data</h3>
            <pre className="p-4 bg-charcoal text-accent rounded-lg font-mono text-[11px] overflow-x-auto">
{`{
  "@context": "https://schema.org",
  "@type": "Resort",
  "name": "Royalgrandin Resort",
  "url": "https://royalgrandin.com",
  "telephone": "+919876543210",
  "email": "reservations@royalgrandin.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Maredumilli",
    "addressLocality": "Alluri Sitharama Raju District",
    "addressRegion": "Andhra Pradesh",
    "postalCode": "533288",
    "addressCountry": "IN"
  },
  "priceRange": "₹8500 - ₹35000"
}`}
            </pre>
          </div>
        )}

        {activeTab === "sitemap" && (
          <div className="p-6 text-xs space-y-3 text-warm-gray">
            <p className="font-semibold text-charcoal text-sm">XML Sitemap Status</p>
            <p className="text-success font-semibold flex items-center gap-1">
              <CheckCircle2 className="size-4" /> sitemap.xml active with all room, package, blog, and legal slugs indexed
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
