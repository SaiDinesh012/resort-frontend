"use client";

import { useState } from "react";
import { Search, Globe, Link2, FileCode, CheckCircle2 } from "lucide-react";

export default function SeoManagementPage() {
  const [activeTab, setActiveTab] = useState<"pages" | "redirects" | "schema" | "sitemap">("pages");

  const seoPages = [
    { page: "Home Page", url: "/", title: "Royal Gradin — Western Ghats Luxury Escape", meta: "Luxury resort in Chikmagalur with private pools and forest views.", status: "Indexed" },
    { page: "Rooms & Suites", url: "/rooms", title: "Luxury Rooms & Villas in Chikmagalur | Royal Gradin", meta: "Explore our deluxe forest rooms, suites, and private villas.", status: "Indexed" },
    { page: "Holiday Packages", url: "/packages", title: "Resort Packages & Honeymoon Offers | Royal Gradin", meta: "Curated 3N/4D packages for couples, nature lovers, and families.", status: "Indexed" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-charcoal">SEO & Meta Management</h1>
        <p className="text-xs text-warm-gray mt-1">Configure page titles, meta descriptions, 301 redirects, JSON-LD Schema, and sitemaps</p>
      </div>

      <div className="flex border-b border-border">
        {[
          { id: "pages", label: "Page Metadata" },
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
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-background border-b border-border text-warm-gray font-semibold uppercase">
                <th className="p-3.5">Page</th>
                <th className="p-3.5">SEO Title</th>
                <th className="p-3.5">Meta Description</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {seoPages.map((sp) => (
                <tr key={sp.url} className="hover:bg-background/50">
                  <td className="p-3.5 font-bold text-charcoal">{sp.page}<p className="text-[10px] text-warm-gray font-mono">{sp.url}</p></td>
                  <td className="p-3.5 font-medium">{sp.title}</td>
                  <td className="p-3.5 text-warm-gray max-w-xs truncate">{sp.meta}</td>
                  <td className="p-3.5 text-success font-semibold flex items-center gap-1"><CheckCircle2 className="size-3.5" /> {sp.status}</td>
                  <td className="p-3.5 text-right"><button className="px-2.5 py-1 rounded border border-border">Edit Metadata</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === "redirects" && (
          <div className="p-6 text-xs text-warm-gray space-y-4">
            <h3 className="font-semibold text-charcoal text-sm">Active 301 Redirect Rules</h3>
            <div className="p-3 bg-background rounded border border-border font-mono">
              /old-resort-stay → /rooms (301 Permanent)
            </div>
            <button className="px-4 py-2 bg-primary text-white font-semibold rounded text-xs">Add Redirect Rule</button>
          </div>
        )}

        {activeTab === "schema" && (
          <div className="p-6 text-xs space-y-3">
            <h3 className="font-semibold text-charcoal text-sm">Resort JSON-LD Structured Data</h3>
            <pre className="p-4 bg-charcoal text-accent rounded-lg font-mono text-[11px] overflow-x-auto">
{`{
  "@context": "https://schema.org",
  "@type": "Resort",
  "name": "Royal Gradin",
  "image": "https://royalgradin.com/hero.jpg",
  "telephone": "+919876543210",
  "priceRange": "₹8500 - ₹80000"
}`}
            </pre>
          </div>
        )}

        {activeTab === "sitemap" && (
          <div className="p-6 text-xs space-y-3 text-warm-gray">
            <p className="font-semibold text-charcoal text-sm">XML Sitemap Status</p>
            <p className="text-success font-semibold flex items-center gap-1"><CheckCircle2 className="size-4" /> sitemap.xml generated with 24 active URLs</p>
          </div>
        )}
      </div>
    </div>
  );
}
