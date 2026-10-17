"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Plus,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Sparkles,
  Save,
  Loader2,
  ChevronDown,
  ChevronUp,
  Minus,
  Sliders,
  RotateCcw,
} from "lucide-react";
import type { FAQ } from "@/types/media";
import { useSiteSettings } from "@/context/SettingsContext";
import { saveSiteSettings } from "@/lib/api";

const CATEGORIES = [
  "General",
  "Bookings",
  "Dining",
  "Travel",
  "Activities",
  "Policies",
  "Wellness",
];

export default function FAQManagementPage() {
  const { settings, updateSettingsState, refreshSettings } = useSiteSettings();

  // FAQs state
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Section Header Settings State
  const [faqHeading, setFaqHeading] = useState(settings.faqHeading || "Frequently Asked Questions");
  const [faqSubheading, setFaqSubheading] = useState(settings.faqSubheading || "Support");
  const [faqEnabled, setFaqEnabled] = useState(settings.faqEnabled !== false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Edit / Create Modal State
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingFaq, setEditingFaq] = useState<Partial<FAQ>>({
    question: "",
    answer: "",
    category: "General",
    order: 1,
    status: "active",
  });
  const [savingFaq, setSavingFaq] = useState(false);
  const [previewOpenId, setPreviewOpenId] = useState<string | null>(null);

  // Sync settings when loaded
  useEffect(() => {
    if (settings.faqHeading) setFaqHeading(settings.faqHeading);
    if (settings.faqSubheading) setFaqSubheading(settings.faqSubheading);
    if (settings.faqEnabled !== undefined) setFaqEnabled(settings.faqEnabled);
  }, [settings]);

  // Fetch FAQs from API
  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/content?type=faq");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          // Sort by order ascending
          const sorted = [...data].sort((a, b) => (a.order || 0) - (b.order || 0));
          setFaqs(sorted);
        }
      }
    } catch (err) {
      console.error("Failed to load FAQs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  // Save FAQ Section Header Settings
  const handleSaveSectionSettings = async () => {
    try {
      setSavingSettings(true);
      setSettingsSuccess(false);
      await saveSiteSettings({
        faqHeading,
        faqSubheading,
        faqEnabled,
      });
      updateSettingsState({
        faqHeading,
        faqSubheading,
        faqEnabled,
      });
      window.dispatchEvent(new CustomEvent("resort-settings-updated"));
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save section settings:", err);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSavingSettings(false);
    }
  };

  // Open modal for Create
  const handleOpenCreate = () => {
    const nextOrder = faqs.length > 0 ? Math.max(...faqs.map((f) => f.order || 0)) + 1 : 1;
    setEditingFaq({
      question: "",
      answer: "",
      category: "General",
      order: nextOrder,
      status: "active",
    });
    setModalMode("create");
  };

  // Open modal for Edit
  const handleOpenEdit = (faq: FAQ) => {
    setEditingFaq({ ...faq });
    setModalMode("edit");
  };

  // Save FAQ (Create or Update)
  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq.question || !editingFaq.answer) return;

    try {
      setSavingFaq(true);
      if (modalMode === "create") {
        const res = await fetch("/api/content?type=faq", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingFaq),
        });
        if (res.ok) {
          setModalMode(null);
          await fetchFaqs();
          window.dispatchEvent(new CustomEvent("resort-faqs-updated"));
        } else {
          alert("Failed to create FAQ.");
        }
      } else if (modalMode === "edit" && editingFaq.id) {
        const res = await fetch(`/api/content/${editingFaq.id}?type=faq`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingFaq),
        });
        if (res.ok) {
          setModalMode(null);
          await fetchFaqs();
          window.dispatchEvent(new CustomEvent("resort-faqs-updated"));
        } else {
          alert("Failed to update FAQ.");
        }
      }
    } catch (err) {
      console.error("Error saving FAQ:", err);
      alert("Error saving FAQ.");
    } finally {
      setSavingFaq(false);
    }
  };

  // Delete FAQ
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      const res = await fetch(`/api/content/${id}?type=faq`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFaqs((prev) => prev.filter((f) => f.id !== id));
        window.dispatchEvent(new CustomEvent("resort-faqs-updated"));
      } else {
        alert("Failed to delete FAQ.");
      }
    } catch (err) {
      console.error("Failed to delete FAQ:", err);
    }
  };

  // Toggle active / inactive status
  const handleToggleStatus = async (faq: FAQ) => {
    const newStatus = faq.status === "active" ? "inactive" : "active";
    // Optimistic UI
    setFaqs((prev) =>
      prev.map((f) => (f.id === faq.id ? { ...f, status: newStatus } : f))
    );

    try {
      await fetch(`/api/content/${faq.id}?type=faq`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      window.dispatchEvent(new CustomEvent("resort-faqs-updated"));
    } catch (err) {
      console.error("Failed to update status:", err);
      fetchFaqs();
    }
  };

  // Move up or down
  const handleReorder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= faqs.length) return;

    const newFaqs = [...faqs];
    const currentItem = newFaqs[index];
    const targetItem = newFaqs[targetIndex];

    const tempOrder = currentItem.order || index + 1;
    currentItem.order = targetItem.order || targetIndex + 1;
    targetItem.order = tempOrder;

    newFaqs[index] = targetItem;
    newFaqs[targetIndex] = currentItem;

    setFaqs(newFaqs);

    try {
      await Promise.all([
        fetch(`/api/content/${currentItem.id}?type=faq`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: currentItem.order }),
        }),
        fetch(`/api/content/${targetItem.id}?type=faq`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: targetItem.order }),
        }),
      ]);
      window.dispatchEvent(new CustomEvent("resort-faqs-updated"));
    } catch (err) {
      console.error("Failed to reorder:", err);
      fetchFaqs();
    }
  };

  // Filtered FAQs
  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || faq.category === selectedCategory;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && faq.status !== "inactive") ||
      (statusFilter === "inactive" && faq.status === "inactive");
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const activeCount = faqs.filter((f) => f.status !== "inactive").length;
  const categoriesPresent = Array.from(new Set(faqs.map((f) => f.category || "General")));

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-bold text-charcoal">FAQ Management</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary">
              {faqs.length} Questions
            </span>
          </div>
          <p className="text-xs text-warm-gray mt-1">
            Easily adjust frequently asked questions, display order, categories, and section titles shown on the website.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/content"
            className="px-3.5 py-2 text-xs font-semibold rounded-md border border-border text-charcoal hover:bg-surface transition-colors"
          >
            All Content
          </Link>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-white text-xs font-semibold hover:bg-primary-dark cursor-pointer transition-colors shadow-sm"
          >
            <Plus className="size-4" /> Add New FAQ
          </button>
        </div>
      </div>

      {/* SECTION HEADER CONFIGURATOR CARD */}
      <div className="bg-surface rounded-xl border border-border p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="size-4 text-accent" />
            <h2 className="font-serif font-bold text-charcoal text-sm">
              Website Section Appearance
            </h2>
          </div>
          <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
            <span className="text-warm-gray font-medium">Show Section on Website:</span>
            <input
              type="checkbox"
              checked={faqEnabled}
              onChange={(e) => setFaqEnabled(e.target.checked)}
              className="accent-primary size-4 rounded"
            />
            <span className={faqEnabled ? "text-emerald-600 font-semibold" : "text-warm-gray"}>
              {faqEnabled ? "Enabled" : "Disabled"}
            </span>
          </label>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-warm-gray font-semibold mb-1">
              Section Label (Subheading)
            </label>
            <input
              type="text"
              value={faqSubheading}
              onChange={(e) => setFaqSubheading(e.target.value)}
              placeholder="e.g. Support, FAQ, Guest Help"
              className="w-full px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary bg-background"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-warm-gray font-semibold mb-1">
              Main Section Heading
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={faqHeading}
                onChange={(e) => setFaqHeading(e.target.value)}
                placeholder="e.g. Frequently Asked Questions"
                className="flex-1 px-3 py-2 rounded border border-border text-charcoal focus:outline-none focus:border-primary bg-background"
              />
              <button
                type="button"
                onClick={handleSaveSectionSettings}
                disabled={savingSettings}
                className="px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors shadow-xs"
              >
                {savingSettings ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : settingsSuccess ? (
                  <Check className="size-3.5" />
                ) : (
                  <Save className="size-3.5" />
                )}
                {settingsSuccess ? "Saved!" : "Save Section"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-surface rounded-xl border border-border p-4 shadow-card flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions or answers..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded border border-border bg-background focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded border border-border bg-background text-charcoal focus:outline-none"
          >
            <option value="All">All Categories ({faqs.length})</option>
            {categoriesPresent.map((c) => (
              <option key={c} value={c}>
                {c} ({faqs.filter((f) => f.category === c).length})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded border border-border bg-background text-charcoal focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only ({activeCount})</option>
            <option value="inactive">Hidden Only ({faqs.length - activeCount})</option>
          </select>

          {(searchQuery || selectedCategory !== "All" || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setStatusFilter("all");
              }}
              className="p-2 text-warm-gray hover:text-charcoal cursor-pointer"
              title="Reset Filters"
            >
              <RotateCcw className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* FAQ ITEMS LIST */}
      {loading ? (
        <div className="flex justify-center items-center py-20 text-warm-gray gap-2 bg-surface rounded-xl border border-border">
          <Loader2 className="size-5 animate-spin text-primary" /> Loading FAQs...
        </div>
      ) : filteredFaqs.length === 0 ? (
        <div className="p-12 text-center text-warm-gray bg-surface rounded-xl border border-border">
          <HelpCircle className="size-8 mx-auto mb-2 text-accent opacity-50" />
          <p className="font-semibold text-charcoal text-sm mb-1">No FAQs Found</p>
          <p className="text-xs">
            {searchQuery
              ? "No questions matched your search query."
              : "Get started by clicking 'Add New FAQ' above."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => {
            const isPreviewOpen = previewOpenId === faq.id;
            const isActive = faq.status !== "inactive";

            return (
              <div
                key={faq.id}
                className={`bg-surface rounded-xl border transition-all shadow-card ${
                  isActive ? "border-border" : "border-border/60 opacity-70 bg-background/50"
                }`}
              >
                {/* Header row */}
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Reorder Buttons */}
                    <div className="flex flex-col items-center gap-0.5 text-warm-gray pt-0.5 flex-shrink-0">
                      <button
                        onClick={() => handleReorder(index, "up")}
                        disabled={index === 0}
                        className="p-1 rounded hover:bg-background disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                        title="Move Up"
                      >
                        <ArrowUp className="size-3" />
                      </button>
                      <span className="text-[10px] font-mono font-bold text-muted-sage">
                        #{faq.order || index + 1}
                      </span>
                      <button
                        onClick={() => handleReorder(index, "down")}
                        disabled={index === faqs.length - 1}
                        className="p-1 rounded hover:bg-background disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                        title="Move Down"
                      >
                        <ArrowDown className="size-3" />
                      </button>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-charcoal text-sm leading-snug">
                          {faq.question}
                        </span>
                        {faq.category && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-accent/15 text-accent-dark uppercase tracking-wider">
                            {faq.category}
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                            isActive
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                              : "bg-gray-100 text-gray-500 border border-gray-200"
                          }`}
                        >
                          {isActive ? <Eye className="size-2.5" /> : <EyeOff className="size-2.5" />}
                          {isActive ? "Active" : "Hidden"}
                        </span>
                      </div>

                      {/* Snippet / expanded answer */}
                      <p className={`text-xs text-warm-gray leading-relaxed ${isPreviewOpen ? "" : "line-clamp-2"}`}>
                        {faq.answer}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 self-end md:self-center flex-shrink-0">
                    <button
                      onClick={() => setPreviewOpenId(isPreviewOpen ? null : faq.id)}
                      className="px-2.5 py-1.5 rounded border border-border text-xs text-warm-gray hover:text-charcoal hover:bg-background cursor-pointer flex items-center gap-1"
                      title="Toggle full answer"
                    >
                      {isPreviewOpen ? (
                        <>
                          <ChevronUp className="size-3.5" /> Collapse
                        </>
                      ) : (
                        <>
                          <ChevronDown className="size-3.5" /> Preview
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleToggleStatus(faq)}
                      className={`p-1.5 rounded border text-xs cursor-pointer transition-colors ${
                        isActive
                          ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          : "border-gray-300 text-gray-600 hover:bg-gray-100"
                      }`}
                      title={isActive ? "Hide on website" : "Show on website"}
                    >
                      {isActive ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                    </button>

                    <button
                      onClick={() => handleOpenEdit(faq)}
                      className="p-1.5 rounded border border-border text-primary hover:bg-primary/5 cursor-pointer"
                      title="Edit FAQ"
                    >
                      <Edit2 className="size-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(faq.id)}
                      className="p-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                      title="Delete FAQ"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded preview accordion matching website style */}
                {isPreviewOpen && (
                  <div className="px-5 pb-5 pt-2 border-t border-border bg-ivory/50 rounded-b-xl space-y-2">
                    <div className="text-[11px] font-semibold text-accent uppercase tracking-wider">
                      Website Accordion Preview
                    </div>
                    <div className="bg-surface border border-border rounded-lg p-4 shadow-xs">
                      <div className="flex items-center justify-between text-sm font-medium text-charcoal mb-2">
                        <span>{faq.question}</span>
                        <span className="size-6 rounded-full border border-border flex items-center justify-center bg-primary text-white">
                          <Minus className="size-3" />
                        </span>
                      </div>
                      <p className="text-xs text-warm-gray leading-relaxed pt-2 border-t border-border">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl border border-border shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="font-serif text-lg font-bold text-charcoal flex items-center gap-2">
                <HelpCircle className="size-4 text-accent" />
                {modalMode === "create" ? "Add New FAQ" : "Edit FAQ"}
              </h2>
              <button
                onClick={() => setModalMode(null)}
                className="text-warm-gray hover:text-charcoal cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-charcoal mb-1">
                  Question *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. What is the check-in and check-out time?"
                  value={editingFaq.question || ""}
                  onChange={(e) =>
                    setEditingFaq({ ...editingFaq, question: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded bg-background focus:outline-none focus:border-primary text-charcoal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">
                    Category
                  </label>
                  <select
                    value={editingFaq.category || "General"}
                    onChange={(e) =>
                      setEditingFaq({ ...editingFaq, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded bg-background focus:outline-none text-charcoal"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-charcoal mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingFaq.order || 1}
                    onChange={(e) =>
                      setEditingFaq({ ...editingFaq, order: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border rounded bg-background focus:outline-none text-charcoal"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">
                  Status
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={editingFaq.status !== "inactive"}
                      onChange={() =>
                        setEditingFaq({ ...editingFaq, status: "active" })
                      }
                      className="accent-primary"
                    />
                    <span>Active (Visible on website)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={editingFaq.status === "inactive"}
                      onChange={() =>
                        setEditingFaq({ ...editingFaq, status: "inactive" })
                      }
                      className="accent-primary"
                    />
                    <span>Inactive (Hidden)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">
                  Answer *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Provide clear, concise details for guests..."
                  value={editingFaq.answer || ""}
                  onChange={(e) =>
                    setEditingFaq({ ...editingFaq, answer: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded bg-background focus:outline-none focus:border-primary text-charcoal leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-3.5 py-1.5 border rounded cursor-pointer hover:bg-background"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingFaq}
                  className="px-4 py-1.5 bg-primary text-white font-semibold rounded cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5 hover:bg-primary-dark shadow-sm"
                >
                  {savingFaq ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Check className="size-3.5" />
                  )}
                  {modalMode === "create" ? "Add FAQ" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
