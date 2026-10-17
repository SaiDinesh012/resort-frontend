"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Save,
  Check,
  Loader2,
  ExternalLink,
  Eye,
  Edit3,
  Calendar,
  AlertCircle,
  FileText,
  RotateCcw,
} from "lucide-react";
import { initialLegalPolicies } from "@/data/mock/legal";

interface LegalDoc {
  slug: string;
  title: string;
  subtitle?: string;
  content: string;
  lastUpdated: string;
  status: "published" | "draft";
}

export default function AdminLegalManagementPage() {
  const [policies, setPolicies] = useState<LegalDoc[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("privacy-policy");
  const [activeView, setActiveView] = useState<"edit" | "preview">("edit");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<LegalDoc>({
    slug: "privacy-policy",
    title: "",
    subtitle: "",
    content: "",
    lastUpdated: "October 2026",
    status: "published",
  });

  // Fetch policies
  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/legal");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setPolicies(data);
        const current = data.find((p: any) => p.slug === selectedSlug) || data[0];
        setFormData({
          slug: current.slug,
          title: current.title,
          subtitle: current.subtitle || "",
          content: current.content,
          lastUpdated: current.lastUpdated || "October 2026",
          status: current.status || "published",
        });
        setSelectedSlug(current.slug);
      } else {
        // Fallback to initial seed
        setPolicies(initialLegalPolicies);
        const first = initialLegalPolicies[0];
        setFormData(first);
        setSelectedSlug(first.slug);
      }
    } catch (err) {
      console.error("Failed to load legal policies:", err);
      setPolicies(initialLegalPolicies);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleSelectPolicy = (slug: string) => {
    setSelectedSlug(slug);
    setSavedSuccess(false);
    setError(null);
    const policy = policies.find((p) => p.slug === slug);
    if (policy) {
      setFormData({
        slug: policy.slug,
        title: policy.title,
        subtitle: policy.subtitle || "",
        content: policy.content,
        lastUpdated: policy.lastUpdated || "October 2026",
        status: policy.status || "published",
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedSuccess(false);

    try {
      const res = await fetch(`/api/legal/${selectedSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to update legal policy");
      }

      setSavedSuccess(true);
      // update local list
      setPolicies((prev) =>
        prev.map((p) => (p.slug === selectedSlug ? { ...p, ...formData } : p))
      );
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err.message || "Failed to save policy changes");
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = () => {
    if (!confirm("Reset this document to official resort default template?")) return;
    const def = initialLegalPolicies.find((p) => p.slug === selectedSlug);
    if (def) {
      setFormData({
        slug: def.slug,
        title: def.title,
        subtitle: def.subtitle || "",
        content: def.content,
        lastUpdated: def.lastUpdated,
        status: def.status,
      });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            <h1 className="font-serif text-2xl font-bold text-charcoal">
              Legal & Policy Management
            </h1>
          </div>
          <p className="text-xs text-warm-gray mt-1">
            Manage terms, privacy policies, and cancellation guidelines rendered on the customer website.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/legal/${selectedSlug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-border text-charcoal hover:bg-background text-xs font-semibold transition-colors"
          >
            <span>View Live Page</span>
            <ExternalLink className="size-3.5 text-warm-gray" />
          </Link>
        </div>
      </div>

      {/* Policy Selector Tabs */}
      <div className="flex border-b border-border overflow-x-auto scrollbar-none">
        {[
          { slug: "privacy-policy", label: "Privacy Policy" },
          { slug: "terms-and-conditions", label: "Terms & Conditions" },
          { slug: "cancellation-policy", label: "Cancellation Policy" },
        ].map((item) => (
          <button
            key={item.slug}
            onClick={() => handleSelectPolicy(item.slug)}
            className={`px-5 py-3 font-medium text-xs border-b-2 transition-colors cursor-pointer min-w-max flex items-center gap-2 ${
              selectedSlug === item.slug
                ? "border-primary text-primary font-bold bg-primary/5"
                : "border-transparent text-warm-gray hover:text-charcoal"
            }`}
          >
            <FileText className="size-3.5" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24 text-warm-gray gap-2 bg-surface rounded-xl border border-border">
          <Loader2 className="size-5 animate-spin text-primary" />
          <span className="text-xs">Loading legal policy data...</span>
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden">
          {/* Status banner */}
          {savedSuccess && (
            <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 flex items-center gap-2 text-emerald-800 text-xs font-medium">
              <Check className="size-4 text-emerald-600" />
              <span>
                Changes saved successfully! The live website policy at <strong>/legal/{selectedSlug}</strong> has been updated.
              </span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-center gap-2 text-red-800 text-xs font-medium">
              <AlertCircle className="size-4 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Edit / Preview Controls Header */}
          <div className="p-5 border-b border-border flex flex-wrap items-center justify-between gap-4 bg-background/50">
            <div className="flex items-center gap-2 bg-surface p-1 rounded-md border border-border">
              <button
                type="button"
                onClick={() => setActiveView("edit")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  activeView === "edit"
                    ? "bg-primary text-white shadow-2xs"
                    : "text-warm-gray hover:text-charcoal"
                }`}
              >
                <Edit3 className="size-3.5" />
                <span>Editor</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveView("preview")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  activeView === "preview"
                    ? "bg-primary text-white shadow-2xs"
                    : "text-warm-gray hover:text-charcoal"
                }`}
              >
                <Eye className="size-3.5" />
                <span>Live Preview</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetToDefault}
                className="inline-flex items-center gap-1 text-xs text-warm-gray hover:text-charcoal transition-colors cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                <span>Reset to Default Template</span>
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary hover:bg-primary-dark text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="size-3.5" />
                    <span>Save Policy Document</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* VIEW: EDIT MODE */}
          {activeView === "edit" ? (
            <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-6 text-xs">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-charcoal mb-1">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">
                    Effective / Last Updated Date
                  </label>
                  <input
                    type="text"
                    value={formData.lastUpdated}
                    onChange={(e) => setFormData({ ...formData, lastUpdated: e.target.value })}
                    placeholder="e.g. October 2026"
                    className="w-full px-3 py-2 rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-charcoal mb-1">
                    Subtitle / Summary Statement
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Brief description shown under header"
                    className="w-full px-3 py-2 rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">
                    Publication Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary text-sm font-medium cursor-pointer"
                  >
                    <option value="published">Published (Live on Website)</option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-semibold text-charcoal">
                    Policy Content (Markdown / Text) *
                  </label>
                  <span className="text-[11px] text-warm-gray">
                    Supports <code>## Heading</code>, <code>- List items</code>, and <code>**bold text**</code>
                  </span>
                </div>
                <textarea
                  required
                  rows={16}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-3 rounded border border-border bg-background font-mono text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded bg-primary hover:bg-primary-dark text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                  <span>Save Policy Document</span>
                </button>
              </div>
            </form>
          ) : (
            /* VIEW: PREVIEW MODE */
            <div className="p-8 sm:p-12 space-y-6 max-w-4xl mx-auto">
              <div className="border-b border-border pb-6">
                <span className="text-xs uppercase tracking-widest text-primary font-semibold">
                  Previewing Live Document
                </span>
                <h1 className="font-serif text-3xl font-light text-charcoal mt-1 mb-2">
                  {formData.title}
                </h1>
                <p className="text-sm text-warm-gray mb-3">{formData.subtitle}</p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-warm-white border border-border text-xs text-charcoal">
                  <Calendar className="size-3 text-primary" />
                  <span>Effective: {formData.lastUpdated}</span>
                </div>
              </div>

              <div className="space-y-6 text-sm text-charcoal leading-relaxed">
                {formData.content.split("\n\n").map((block, i) => {
                  if (block.startsWith("## ")) {
                    return (
                      <h2 key={i} className="font-serif text-xl font-semibold text-primary pt-3 border-b border-border pb-1">
                        {block.replace("## ", "")}
                      </h2>
                    );
                  }
                  if (block.startsWith("- ")) {
                    const items = block.split("\n").filter((l) => l.trim().startsWith("- "));
                    return (
                      <ul key={i} className="list-disc pl-5 space-y-1.5 text-warm-gray">
                        {items.map((item, idx) => (
                          <li
                            key={idx}
                            dangerouslySetInnerHTML={{
                              __html: item.replace(/^- /, "").replace(/\*\*(.*?)\*\*/g, '<strong class="text-charcoal font-semibold">$1</strong>'),
                            }}
                          />
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <p
                      key={i}
                      className="text-warm-gray"
                      dangerouslySetInnerHTML={{
                        __html: block.replace(/\*\*(.*?)\*\*/g, '<strong class="text-charcoal font-semibold">$1</strong>'),
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
