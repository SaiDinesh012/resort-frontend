"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Loader2, Edit, X } from "lucide-react";

interface SeoPage {
  page: string;
  url: string;
  title: string;
  meta: string;
  status: string;
}

export default function SeoManagementPage() {
  const [activeTab, setActiveTab] = useState<"pages" | "redirects" | "schema" | "sitemap">("pages");
  const [seoPages, setSeoPages] = useState<SeoPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingPage, setEditingPage] = useState<SeoPage | null>(null);

  const fetchSeoConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings?key=seo_config");
      const data = await res.json();
      if (Array.isArray(data)) {
        setSeoPages(data);
      } else {
        setSeoPages([]);
      }
    } catch (err) {
      console.error("Failed to load SEO config from MongoDB", err);
      setSeoPages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeoConfig();
  }, []);

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;
    try {
      setSaving(true);
      const updated = seoPages.map((p) => (p.url === editingPage.url ? editingPage : p));
      await fetch("/api/settings?key=seo_config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      setSeoPages(updated);
      setEditingPage(null);
    } catch {
      alert("Failed to save SEO config to database");
    } finally {
      setSaving(false);
    }
  };

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
            className={`px-5 py-2.5 font-medium text-xs border-b-2 transition-colors cursor-pointer ${
              activeTab === t.id ? "border-primary text-primary font-bold" : "border-transparent text-warm-gray"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-warm-gray flex flex-col items-center gap-2">
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="text-xs">Loading SEO config from MongoDB...</p>
          </div>
        ) : activeTab === "pages" ? (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-background border-b border-border text-warm-gray font-semibold uppercase">
                <th className="p-3.5">Page</th>
                <th className="p-3.5">SEO Title</th>
                <th className="p-3.5">Meta Description</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {seoPages.map((sp) => (
                <tr key={sp.url} className="hover:bg-background/50">
                  <td className="p-3.5 font-bold text-charcoal">
                    {sp.page}
                    <p className="text-[10px] text-warm-gray font-mono">{sp.url}</p>
                  </td>
                  <td className="p-3.5 font-medium">{sp.title}</td>
                  <td className="p-3.5 text-warm-gray max-w-xs truncate">{sp.meta}</td>
                  <td className="p-3.5 text-success font-semibold flex items-center gap-1">
                    <CheckCircle2 className="size-3.5" /> {sp.status}
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setEditingPage(sp)}
                      className="px-2.5 py-1 rounded border border-border hover:bg-background transition-colors text-charcoal font-semibold cursor-pointer inline-flex items-center gap-1"
                    >
                      <Edit className="size-3" /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : activeTab === "redirects" ? (
          <div className="p-6 text-xs text-warm-gray space-y-4">
            <h3 className="font-semibold text-charcoal text-sm">Active 301 Redirect Rules</h3>
            <div className="p-3 bg-background rounded border border-border font-mono text-charcoal">
              /old-resort-stay → /rooms (301 Permanent)
            </div>
            <p className="text-xs text-warm-gray">No custom redirects required currently. Standard routing is enabled.</p>
          </div>
        ) : activeTab === "schema" ? (
          <div className="p-6 text-xs text-warm-gray space-y-3 font-mono bg-background">
            <h3 className="font-semibold text-charcoal text-sm font-sans">JSON-LD Schema Markup</h3>
            <pre className="p-4 bg-surface rounded border border-border overflow-x-auto text-[11px] text-charcoal">
{`{
  "@context": "https://schema.org",
  "@type": "Resort",
  "name": "Vanapriya Resort",
  "image": "https://images.unsplash.com/photo-1571896349842-33c89424de2d",
  "priceRange": "₹₹₹₹",
  "address": {
    "@type": "PostalAddress",
    "addressRegion": "Karnataka",
    "addressCountry": "IN"
  }
}`}
            </pre>
          </div>
        ) : (
          <div className="p-6 text-xs text-warm-gray space-y-2">
            <h3 className="font-semibold text-charcoal text-sm">XML Sitemap Generation</h3>
            <p>Automatic sitemap is generated dynamically at <code className="bg-background px-2 py-0.5 rounded border border-border">/sitemap.xml</code>.</p>
            <p className="text-success font-semibold flex items-center gap-1"><CheckCircle2 className="size-3.5" /> All published rooms and packages are indexed.</p>
          </div>
        )}
      </div>

      {/* Edit SEO Modal */}
      {editingPage && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl border border-border max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h2 className="font-serif text-lg font-bold text-charcoal">Edit SEO: {editingPage.page}</h2>
              <button onClick={() => setEditingPage(null)} className="text-warm-gray hover:text-charcoal cursor-pointer">
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleSavePage} className="space-y-3 text-xs">
              <div>
                <label className="block text-warm-gray font-semibold mb-1 uppercase">Target URL</label>
                <input
                  disabled
                  type="text"
                  value={editingPage.url}
                  className="w-full px-3 py-2 rounded border border-border font-mono text-warm-gray bg-background/50 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-warm-gray font-semibold mb-1 uppercase">SEO Title Tag</label>
                <input
                  required
                  type="text"
                  value={editingPage.title}
                  onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-border text-charcoal bg-background"
                />
              </div>
              <div>
                <label className="block text-warm-gray font-semibold mb-1 uppercase">Meta Description</label>
                <textarea
                  required
                  rows={3}
                  value={editingPage.meta}
                  onChange={(e) => setEditingPage({ ...editingPage, meta: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-border text-charcoal bg-background"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingPage(null)}
                  className="px-4 py-2 border border-border rounded text-charcoal hover:bg-background cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-white rounded font-semibold hover:bg-primary-dark cursor-pointer"
                >
                  {saving ? "Saving..." : "Save Metadata"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
