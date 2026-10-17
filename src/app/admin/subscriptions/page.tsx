"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  Users,
  Download,
  Plus,
  Trash2,
  Check,
  X,
  Search,
  Sliders,
  Save,
  Loader2,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  Sparkles,
  Calendar,
  RotateCcw,
} from "lucide-react";
import { useSiteSettings } from "@/context/SettingsContext";
import { saveSiteSettings } from "@/lib/api";

interface Subscriber {
  _id: string;
  email: string;
  status: "active" | "unsubscribed";
  source?: string;
  subscribedAt: string;
  createdAt: string;
}

export default function SubscriptionsManagementPage() {
  const { settings, updateSettingsState } = useSiteSettings();

  const [activeTab, setActiveTab] = useState<"subscribers" | "banner">("subscribers");
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "unsubscribed">("all");

  // Add Subscriber Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);

  // Banner Settings State
  const [newsletterEnabled, setNewsletterEnabled] = useState(
    settings.newsletterEnabled !== false
  );
  const [newsletterHeading, setNewsletterHeading] = useState(
    settings.newsletterHeading || "Subscribe to our Newsletter"
  );
  const [newsletterSubheading, setNewsletterSubheading] = useState(
    settings.newsletterSubheading ||
      "Seasonal offers, curated packages and resort stories — in your inbox."
  );
  const [newsletterButtonText, setNewsletterButtonText] = useState(
    settings.newsletterButtonText || "Subscribe"
  );
  const [newsletterPlaceholder, setNewsletterPlaceholder] = useState(
    settings.newsletterPlaceholder || "Enter your email address"
  );
  const [newsletterBadge, setNewsletterBadge] = useState(
    settings.newsletterBadge || ""
  );
  const [newsletterSuccessMessage, setNewsletterSuccessMessage] = useState(
    settings.newsletterSuccessMessage ||
      "Thank you for subscribing! Seasonal offers and resort stories will arrive in your inbox."
  );
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Sync settings when loaded
  useEffect(() => {
    if (settings.newsletterEnabled !== undefined) setNewsletterEnabled(settings.newsletterEnabled);
    if (settings.newsletterHeading) setNewsletterHeading(settings.newsletterHeading);
    if (settings.newsletterSubheading) setNewsletterSubheading(settings.newsletterSubheading);
    if (settings.newsletterButtonText) setNewsletterButtonText(settings.newsletterButtonText);
    if (settings.newsletterPlaceholder) setNewsletterPlaceholder(settings.newsletterPlaceholder);
    if (settings.newsletterBadge !== undefined) setNewsletterBadge(settings.newsletterBadge);
    if (settings.newsletterSuccessMessage)
      setNewsletterSuccessMessage(settings.newsletterSuccessMessage);
  }, [settings]);

  // Fetch Subscribers
  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/newsletter");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.subscribers)) {
          setSubscribers(data.subscribers);
        }
      }
    } catch (err) {
      console.error("Failed to load subscribers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  // Save Banner Customization Settings
  const handleSaveBannerSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSavingSettings(true);
      setSettingsSaved(false);

      const payload = {
        newsletterEnabled,
        newsletterHeading,
        newsletterSubheading,
        newsletterButtonText,
        newsletterPlaceholder,
        newsletterBadge,
        newsletterSuccessMessage,
      };

      await saveSiteSettings(payload);
      updateSettingsState(payload);

      // Notify other open components on website
      window.dispatchEvent(new CustomEvent("resort-settings-updated"));
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save banner settings:", err);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSavingSettings(false);
    }
  };

  // Add Subscriber Manually
  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes("@")) return;

    try {
      setAdding(true);
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail.trim(),
          source: "admin_manual",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setNewEmail("");
        setIsAddModalOpen(false);
        fetchSubscribers();
      } else {
        alert(data.error || "Failed to add subscriber.");
      }
    } catch (err) {
      console.error("Error adding subscriber:", err);
      alert("Error adding subscriber.");
    } finally {
      setAdding(false);
    }
  };

  // Toggle Subscriber Status
  const handleToggleStatus = async (sub: Subscriber) => {
    const newStatus = sub.status === "active" ? "unsubscribed" : "active";
    setSubscribers((prev) =>
      prev.map((s) => (s._id === sub._id ? { ...s, status: newStatus } : s))
    );

    try {
      await fetch("/api/newsletter", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sub._id, status: newStatus }),
      });
    } catch (err) {
      console.error("Failed to toggle status:", err);
      fetchSubscribers();
    }
  };

  // Delete Subscriber
  const handleDeleteSubscriber = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from the subscriber list?`)) return;

    try {
      const res = await fetch(`/api/newsletter?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSubscribers((prev) => prev.filter((s) => s._id !== id));
      } else {
        alert("Failed to delete subscriber.");
      }
    } catch (err) {
      console.error("Error deleting subscriber:", err);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      alert("No subscribers to export.");
      return;
    }

    const headers = ["Email", "Status", "Source", "Subscribed Date"];
    const rows = subscribers.map((s) => [
      s.email,
      s.status,
      s.source || "website_footer",
      new Date(s.subscribedAt || s.createdAt).toISOString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `resort-subscribers-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered subscribers
  const filteredSubscribers = subscribers.filter((s) => {
    const matchesSearch = s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = subscribers.filter((s) => s.status === "active").length;
  const unsubscribedCount = subscribers.filter((s) => s.status === "unsubscribed").length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-bold text-charcoal">
              Newsletter & Subscriptions
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary">
              {subscribers.length} Subscribers
            </span>
          </div>
          <p className="text-xs text-warm-gray mt-1">
            Easily adjust the website newsletter subscription banner and manage guest mailing list subscribers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md border border-border text-charcoal hover:bg-surface transition-colors cursor-pointer"
          >
            <Download className="size-3.5 text-accent" /> Export CSV
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-white text-xs font-semibold hover:bg-primary-dark cursor-pointer transition-colors shadow-sm"
          >
            <Plus className="size-4" /> Add Subscriber
          </button>
        </div>
      </div>

      {/* KPI STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface rounded-xl border border-border p-5 shadow-card flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-warm-gray font-semibold">
              Total Subscribers
            </p>
            <p className="text-2xl font-serif font-bold text-charcoal mt-1">
              {subscribers.length}
            </p>
          </div>
          <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Users className="size-5" />
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-5 shadow-card flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-warm-gray font-semibold">
              Active Subscribers
            </p>
            <p className="text-2xl font-serif font-bold text-emerald-600 mt-1">
              {activeCount}
            </p>
          </div>
          <div className="size-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="size-5" />
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-5 shadow-card flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-warm-gray font-semibold">
              Unsubscribed
            </p>
            <p className="text-2xl font-serif font-bold text-warm-gray mt-1">
              {unsubscribedCount}
            </p>
          </div>
          <div className="size-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center">
            <UserX className="size-5" />
          </div>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("subscribers")}
          className={`px-5 py-3 text-xs font-semibold border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
            activeTab === "subscribers"
              ? "border-primary text-primary"
              : "border-transparent text-warm-gray hover:text-charcoal"
          }`}
        >
          <Mail className="size-4" /> Guest Subscriber Roster ({subscribers.length})
        </button>
        <button
          onClick={() => setActiveTab("banner")}
          className={`px-5 py-3 text-xs font-semibold border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
            activeTab === "banner"
              ? "border-primary text-primary"
              : "border-transparent text-warm-gray hover:text-charcoal"
          }`}
        >
          <Sliders className="size-4" /> Website Subscription Banner Adjuster
        </button>
      </div>

      {/* TAB 1: SUBSCRIBERS LIST */}
      {activeTab === "subscribers" && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="bg-surface rounded-xl border border-border p-4 shadow-card flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by guest email address..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded border border-border bg-background focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 rounded border border-border bg-background text-charcoal focus:outline-none"
              >
                <option value="all">All Statuses ({subscribers.length})</option>
                <option value="active">Active Only ({activeCount})</option>
                <option value="unsubscribed">Unsubscribed ({unsubscribedCount})</option>
              </select>

              {(searchQuery || statusFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                  className="p-2 text-warm-gray hover:text-charcoal cursor-pointer"
                  title="Reset Filter"
                >
                  <RotateCcw className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center items-center py-20 text-warm-gray gap-2 bg-surface rounded-xl border border-border">
              <Loader2 className="size-5 animate-spin text-primary" /> Loading subscribers...
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="p-12 text-center text-warm-gray bg-surface rounded-xl border border-border">
              <Mail className="size-8 mx-auto mb-2 text-accent opacity-50" />
              <p className="font-semibold text-charcoal text-sm mb-1">No Subscribers Found</p>
              <p className="text-xs">
                {searchQuery
                  ? "No subscriber matched your search."
                  : "When guests subscribe on the website, they will appear here."}
              </p>
            </div>
          ) : (
            <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-background border-b border-border text-warm-gray font-semibold uppercase">
                    <th className="p-3.5">Email Address</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Signup Source</th>
                    <th className="p-3.5">Date Subscribed</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium">
                  {filteredSubscribers.map((sub) => {
                    const isActive = sub.status === "active";
                    return (
                      <tr key={sub._id} className="hover:bg-background/50">
                        <td className="p-3.5 font-bold text-charcoal flex items-center gap-2">
                          <Mail className="size-3.5 text-muted-sage" />
                          <span>{sub.email}</span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold inline-flex items-center gap-1 ${
                              isActive
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                : "bg-gray-100 text-gray-500 border border-gray-200"
                            }`}
                          >
                            {isActive ? <UserCheck className="size-2.5" /> : <UserX className="size-2.5" />}
                            {isActive ? "Active" : "Unsubscribed"}
                          </span>
                        </td>
                        <td className="p-3.5 text-warm-gray">
                          <span className="capitalize px-2 py-0.5 rounded bg-background border border-border text-[11px]">
                            {sub.source ? sub.source.replace("_", " ") : "Website Footer"}
                          </span>
                        </td>
                        <td className="p-3.5 text-warm-gray flex items-center gap-1">
                          <Calendar className="size-3 text-muted-sage" />
                          {new Date(sub.subscribedAt || sub.createdAt).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleToggleStatus(sub)}
                              className={`p-1.5 rounded border text-xs cursor-pointer transition-colors ${
                                isActive
                                  ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                                  : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                              }`}
                              title={isActive ? "Mark as unsubscribed" : "Reactivate subscription"}
                            >
                              {isActive ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                            </button>
                            <button
                              onClick={() => handleDeleteSubscriber(sub._id, sub.email)}
                              className="p-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                              title="Delete subscriber"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: WEBSITE SUBSCRIPTION BANNER ADJUSTER */}
      {activeTab === "banner" && (
        <div className="space-y-6">
          {/* LIVE PREVIEW CONTAINER */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-warm-gray uppercase tracking-wider">
              <span>Live Website Strip Preview</span>
              <span className={newsletterEnabled ? "text-emerald-600" : "text-amber-600"}>
                {newsletterEnabled ? "● Visible on Website" : "○ Currently Hidden"}
              </span>
            </div>

            {newsletterEnabled ? (
              <div className="bg-[#11241d] rounded-xl border border-white/10 p-8 text-white shadow-xl">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    {newsletterBadge && (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#c5a059]/20 text-[#c5a059] uppercase tracking-wider mb-2">
                        {newsletterBadge}
                      </span>
                    )}
                    <h3 className="font-serif text-2xl font-light text-white mb-1.5 tracking-wide">
                      {newsletterHeading}
                    </h3>
                    <p className="font-sans text-white/60 text-xs sm:text-sm max-w-md">
                      {newsletterSubheading}
                    </p>
                  </div>

                  <div className="w-full md:w-auto">
                    <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
                      <input
                        type="text"
                        disabled
                        placeholder={newsletterPlaceholder}
                        className="px-4 py-2.5 rounded-sm bg-white/[0.08] border border-white/20 text-white placeholder:text-white/40 text-xs md:w-64"
                      />
                      <button
                        type="button"
                        disabled
                        className="px-6 py-2.5 rounded-sm bg-[#c5a059] text-white text-xs font-semibold tracking-wider uppercase flex-shrink-0 cursor-default"
                      >
                        {newsletterButtonText}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-background rounded-xl border border-dashed border-border p-8 text-center text-warm-gray text-xs">
                The newsletter subscription section is currently disabled. Toggle &quot;Enable Subscription Section&quot; below to display it on the website.
              </div>
            )}
          </div>

          {/* EDIT FORM */}
          <form
            onSubmit={handleSaveBannerSettings}
            className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-5 text-xs"
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-serif text-base font-bold text-charcoal">
                  Subscription Banner Configuration
                </h3>
                <p className="text-warm-gray text-xs">
                  Changes saved here immediately update the website footer banner without server restarts.
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <span className="font-semibold text-charcoal">Enable Subscription Strip:</span>
                <input
                  type="checkbox"
                  checked={newsletterEnabled}
                  onChange={(e) => setNewsletterEnabled(e.target.checked)}
                  className="accent-primary size-4.5 rounded"
                />
                <span className={newsletterEnabled ? "text-emerald-600 font-bold" : "text-warm-gray"}>
                  {newsletterEnabled ? "Active" : "Disabled"}
                </span>
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-charcoal mb-1">
                  Main Headline *
                </label>
                <input
                  type="text"
                  required
                  value={newsletterHeading}
                  onChange={(e) => setNewsletterHeading(e.target.value)}
                  placeholder="e.g. Subscribe to our Newsletter"
                  className="w-full px-3 py-2 rounded border border-border bg-background focus:outline-none focus:border-primary text-charcoal"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">
                  Optional Promotional Badge / Chip
                </label>
                <input
                  type="text"
                  value={newsletterBadge}
                  onChange={(e) => setNewsletterBadge(e.target.value)}
                  placeholder="e.g. EXCLUSIVE OFFERS or 10% OFF FIRST STAY"
                  className="w-full px-3 py-2 rounded border border-border bg-background focus:outline-none focus:border-primary text-charcoal"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-charcoal mb-1">
                  Subheading / Teaser Description *
                </label>
                <input
                  type="text"
                  required
                  value={newsletterSubheading}
                  onChange={(e) => setNewsletterSubheading(e.target.value)}
                  placeholder="e.g. Seasonal offers, curated packages and resort stories — in your inbox."
                  className="w-full px-3 py-2 rounded border border-border bg-background focus:outline-none focus:border-primary text-charcoal"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">
                  Email Input Placeholder *
                </label>
                <input
                  type="text"
                  required
                  value={newsletterPlaceholder}
                  onChange={(e) => setNewsletterPlaceholder(e.target.value)}
                  placeholder="e.g. Enter your email address"
                  className="w-full px-3 py-2 rounded border border-border bg-background focus:outline-none focus:border-primary text-charcoal"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">
                  Button Text *
                </label>
                <input
                  type="text"
                  required
                  value={newsletterButtonText}
                  onChange={(e) => setNewsletterButtonText(e.target.value)}
                  placeholder="e.g. Subscribe or Join"
                  className="w-full px-3 py-2 rounded border border-border bg-background focus:outline-none focus:border-primary text-charcoal"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-charcoal mb-1">
                  Success Confirmation Message *
                </label>
                <input
                  type="text"
                  required
                  value={newsletterSuccessMessage}
                  onChange={(e) => setNewsletterSuccessMessage(e.target.value)}
                  placeholder="e.g. Thank you for subscribing! Seasonal offers and resort stories will arrive in your inbox."
                  className="w-full px-3 py-2 rounded border border-border bg-background focus:outline-none focus:border-primary text-charcoal"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded cursor-pointer disabled:opacity-50 inline-flex items-center gap-2 shadow-sm transition-colors"
              >
                {savingSettings ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : settingsSaved ? (
                  <Check className="size-4" />
                ) : (
                  <Save className="size-4" />
                )}
                {settingsSaved ? "Changes Saved!" : "Save Banner Adjustments"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD SUBSCRIBER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl border border-border shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="font-serif text-base font-bold text-charcoal flex items-center gap-2">
                <Mail className="size-4 text-accent" /> Add Guest Subscriber
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-warm-gray hover:text-charcoal cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubscriber} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-charcoal mb-1">
                  Guest Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. guest@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded bg-background focus:outline-none focus:border-primary text-charcoal"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 border rounded cursor-pointer hover:bg-background"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="px-4 py-1.5 bg-primary text-white font-semibold rounded cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5 hover:bg-primary-dark"
                >
                  {adding ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Check className="size-3.5" />
                  )}
                  Save Subscriber
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
