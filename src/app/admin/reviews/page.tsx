"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Star,
  Plus,
  Loader2,
  CheckCircle,
  XCircle,
  Trash2,
  MessageSquare,
  Search,
  Filter,
  Check,
  X,
  Sparkles,
  User,
} from "lucide-react";
import type { Review } from "@/types/media";

export default function ReviewsManagementPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "pending" | "rejected">("all");
  const [filterRating, setFilterRating] = useState<number | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [replyingReview, setReplyingReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");

  // New Review Form
  const [newReview, setNewReview] = useState({
    customerName: "",
    rating: 5,
    title: "",
    body: "",
    status: "published" as "published" | "pending" | "rejected",
    roomId: "",
    packageId: "",
  });

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/content?type=review");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setReviews(data);
        }
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleStatusChange = async (id: string, newStatus: "published" | "pending" | "rejected") => {
    try {
      const res = await fetch(`/api/content/${id}?type=review`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchReviews();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this guest review?")) return;
    try {
      const res = await fetch(`/api/content/${id}?type=review`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchReviews();
      }
    } catch (err) {
      console.error("Failed to delete review:", err);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingReview) return;
    try {
      const res = await fetch(`/api/content/${replyingReview.id}?type=review`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reply: replyText,
          repliedAt: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setReplyingReview(null);
        setReplyText("");
        fetchReviews();
      }
    } catch (err) {
      console.error("Failed to save reply:", err);
    }
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...newReview,
        customerId: `cust-${Date.now()}`,
      };
      const res = await fetch("/api/content?type=review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setNewReview({
          customerName: "",
          rating: 5,
          title: "",
          body: "",
          status: "published",
          roomId: "",
          packageId: "",
        });
        fetchReviews();
      }
    } catch (err) {
      console.error("Failed to add review:", err);
    } finally {
      setSaving(false);
    }
  };

  // Metrics
  const totalCount = reviews.length;
  const publishedCount = reviews.filter((r) => r.status === "published").length;
  const pendingCount = reviews.filter((r) => r.status === "pending").length;
  const averageRating =
    totalCount > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / totalCount).toFixed(1)
      : "5.0";

  // Filtered reviews
  const filtered = reviews.filter((r) => {
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    if (filterRating !== "all" && r.rating !== filterRating) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = r.customerName?.toLowerCase().includes(q);
      const matchTitle = r.title?.toLowerCase().includes(q);
      const matchBody = r.body?.toLowerCase().includes(q);
      if (!matchName && !matchTitle && !matchBody) return false;
    }
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal flex items-center gap-2">
            <Star className="size-6 text-accent fill-accent" /> Guest Reviews & Testimonials
          </h1>
          <p className="text-xs text-warm-gray mt-1">
            Moderate, approve, and curate authentic guest stories showcased on your public homepage.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="size-4" /> Add Guest Review
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-surface border border-border shadow-xs">
          <span className="text-[11px] font-bold text-warm-gray uppercase tracking-wider block">Average Rating</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold font-serif text-charcoal">{averageRating}</span>
            <div className="flex text-accent">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="size-3.5 fill-accent" />
              ))}
            </div>
          </div>
          <span className="text-[10px] text-warm-gray/70 mt-1 block">From verified guest stays</span>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border shadow-xs">
          <span className="text-[11px] font-bold text-warm-gray uppercase tracking-wider block">Total Testimonials</span>
          <span className="text-2xl font-bold font-serif text-charcoal mt-1 block">{totalCount}</span>
          <span className="text-[10px] text-warm-gray/70 mt-1 block">In resort database</span>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Published Live</span>
          <span className="text-2xl font-bold font-serif text-emerald-600 mt-1 block">{publishedCount}</span>
          <span className="text-[10px] text-warm-gray/70 mt-1 block">Visible on website homepage</span>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border shadow-xs">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Pending Approval</span>
          <span className="text-2xl font-bold font-serif text-amber-600 mt-1 block">{pendingCount}</span>
          <span className="text-[10px] text-warm-gray/70 mt-1 block">Awaiting manager review</span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="p-4 rounded-xl bg-surface border border-border flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-warm-gray" />
            <input
              type="text"
              placeholder="Search by guest, title, keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded border border-border text-xs text-charcoal bg-white focus:outline-none focus:border-primary"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex rounded border border-border overflow-hidden bg-background p-0.5 text-xs font-semibold">
            {(["all", "published", "pending", "rejected"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-sm capitalize transition-colors cursor-pointer ${
                  filterStatus === st ? "bg-primary text-white shadow-xs" : "text-charcoal hover:bg-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Rating Filter */}
        <div className="flex items-center gap-2 self-start md:self-auto text-xs text-warm-gray font-semibold">
          <Filter className="size-3.5" />
          <span>Rating:</span>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value === "all" ? "all" : parseInt(e.target.value, 10))}
            className="px-2.5 py-1 rounded border border-border bg-white text-charcoal text-xs font-semibold focus:outline-none focus:border-primary"
          >
            <option value="all">All Stars</option>
            <option value="5">5 Stars only</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="py-20 flex justify-center items-center gap-2 text-warm-gray text-xs bg-surface rounded-xl border border-border">
          <Loader2 className="size-5 animate-spin text-primary" /> Loading guest reviews...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-surface rounded-xl border border-border p-6 space-y-3">
          <Star className="size-8 text-warm-gray/40 mx-auto" />
          <h3 className="font-serif font-bold text-charcoal text-base">No reviews match your filters</h3>
          <p className="text-xs text-warm-gray max-w-sm mx-auto">
            Try resetting your search query or status filter to see all testimonials.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-xl bg-surface border border-border shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/40 transition-colors"
            >
              <div>
                {/* Header: Customer and Stars */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm overflow-hidden flex-shrink-0">
                      {rev.customerAvatar ? (
                        <img src={rev.customerAvatar} alt={rev.customerName} className="size-full object-cover" />
                      ) : (
                        rev.customerName?.charAt(0) || <User className="size-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-charcoal text-sm leading-tight">{rev.customerName}</h4>
                      <div className="flex items-center gap-1 mt-1 text-accent">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`size-3.5 ${
                              i < rev.rating ? "fill-accent text-accent" : "text-border fill-border"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      rev.status === "published"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : rev.status === "pending"
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : "bg-rose-100 text-rose-800 border border-rose-300"
                    }`}
                  >
                    {rev.status || "published"}
                  </span>
                </div>

                {/* Body Text */}
                <h5 className="font-serif font-bold text-charcoal text-sm mt-3 leading-snug">&ldquo;{rev.title}&rdquo;</h5>
                <p className="text-xs text-warm-gray leading-relaxed mt-1.5">{rev.body}</p>

                {/* Official Resort Reply if any */}
                {rev.reply && (
                  <div className="mt-3 p-3 rounded-lg bg-background border border-border/80 text-[11px] space-y-1">
                    <div className="flex items-center gap-1 font-bold text-primary">
                      <Sparkles className="size-3" /> Resort Management Reply:
                    </div>
                    <p className="text-charcoal/80 italic">{rev.reply}</p>
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  {rev.status !== "published" && (
                    <button
                      onClick={() => handleStatusChange(rev.id, "published")}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                      title="Publish to Homepage"
                    >
                      <Check className="size-3" /> Approve Live
                    </button>
                  )}
                  {rev.status !== "rejected" && (
                    <button
                      onClick={() => handleStatusChange(rev.id, "rejected")}
                      className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-medium text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                      title="Hide review"
                    >
                      <X className="size-3" /> Reject
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setReplyingReview(rev);
                      setReplyText(rev.reply || "");
                    }}
                    className="px-2.5 py-1 rounded border border-border text-charcoal hover:bg-background font-medium text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <MessageSquare className="size-3" /> Reply
                  </button>
                </div>

                <button
                  onClick={() => handleDelete(rev.id)}
                  className="p-1.5 text-warm-gray hover:text-red-600 rounded hover:bg-red-50 transition-colors cursor-pointer"
                  title="Delete review permanently"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-surface rounded-2xl border border-border shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-serif font-bold text-charcoal text-lg">Add Guest Testimonial</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-warm-gray hover:text-charcoal cursor-pointer">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-warm-gray font-semibold mb-1">Guest Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sravan Varma"
                  value={newReview.customerName}
                  onChange={(e) => setNewReview({ ...newReview, customerName: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-border text-charcoal bg-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-warm-gray font-semibold mb-1">Star Rating</label>
                  <select
                    value={newReview.rating}
                    onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 rounded border border-border text-charcoal bg-white focus:outline-none focus:border-primary font-bold"
                  >
                    <option value="5">★★★★★ 5 Stars (Excellent)</option>
                    <option value="4">★★★★☆ 4 Stars (Very Good)</option>
                    <option value="3">★★★☆☆ 3 Stars (Average)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-warm-gray font-semibold mb-1">Initial Status</label>
                  <select
                    value={newReview.status}
                    onChange={(e) => setNewReview({ ...newReview, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded border border-border text-charcoal bg-white focus:outline-none focus:border-primary font-bold"
                  >
                    <option value="published">Published (Live on Website)</option>
                    <option value="pending">Pending Review</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-warm-gray font-semibold mb-1">Review Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. An unforgettable sanctuary amidst misty canopy!"
                  value={newReview.title}
                  onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-border text-charcoal bg-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-warm-gray font-semibold mb-1">Review Testimonial Text *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe the guest's stay, feedback on private pool villa, bamboo dining, or waterfall safari..."
                  value={newReview.body}
                  onChange={(e) => setNewReview({ ...newReview, body: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-border text-charcoal bg-white focus:outline-none focus:border-primary leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border rounded text-warm-gray hover:bg-background font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {saving && <Loader2 className="size-3.5 animate-spin" />} Save Testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {replyingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-surface rounded-2xl border border-border shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-serif font-bold text-charcoal text-base">Reply to {replyingReview.customerName}</h3>
              <button onClick={() => setReplyingReview(null)} className="text-warm-gray hover:text-charcoal cursor-pointer">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleReplySubmit} className="space-y-3 text-xs">
              <p className="text-warm-gray italic line-clamp-2">&ldquo;{replyingReview.body}&rdquo;</p>
              <div>
                <label className="block text-warm-gray font-semibold mb-1">Official Resort Response</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Thank you for staying with us! We are thrilled you enjoyed the forest sanctuary..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-border text-charcoal bg-white focus:outline-none focus:border-primary leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setReplyingReview(null)}
                  className="px-4 py-2 border border-border rounded text-warm-gray hover:bg-background font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded font-semibold cursor-pointer shadow-sm"
                >
                  Save Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
