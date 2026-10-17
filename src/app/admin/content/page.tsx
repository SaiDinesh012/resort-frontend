"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Loader2, X, Check, Trash2, Mail, Phone, Calendar, MessageSquare, Edit3 } from "lucide-react";
import type { BlogPost, FAQ, Attraction, Experience } from "@/types/media";
import { formatCurrency } from "@/lib/utils";

interface InquiryItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState<"experiences" | "inquiries" | "blog" | "faqs" | "attractions">("experiences");
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states for creating new content
  const [newExperience, setNewExperience] = useState({
    title: "",
    description: "",
    category: "wellness" as Experience["category"],
    duration: "2 hours",
    price: 1500,
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
  });

  const [newBlog, setNewBlog] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "Travel Guide",
    author: "Resort Editorial",
    featuredImage: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80",
  });

  const [newFAQ, setNewFAQ] = useState({
    question: "",
    answer: "",
    category: "General",
  });

  const [newAttraction, setNewAttraction] = useState({
    name: "",
    description: "",
    distance: "15 km",
    duration: "30 minutes drive",
    type: "nature" as Attraction["type"],
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
  });

  const fetchContent = async () => {
    try {
      setLoading(true);
      if (activeTab === "experiences") {
        const res = await fetch("/api/content?type=experience");
        const data = await res.json();
        if (Array.isArray(data)) setExperiences(data);
      } else if (activeTab === "inquiries") {
        const res = await fetch("/api/contact");
        const data = await res.json();
        if (Array.isArray(data)) setInquiries(data);
      } else if (activeTab === "blog") {
        const res = await fetch("/api/content?type=blog");
        const data = await res.json();
        if (Array.isArray(data)) setBlogPosts(data);
      } else if (activeTab === "faqs") {
        const res = await fetch("/api/content?type=faq");
        const data = await res.json();
        if (Array.isArray(data)) setFaqs(data);
      } else if (activeTab === "attractions") {
        const res = await fetch("/api/content?type=attraction");
        const data = await res.json();
        if (Array.isArray(data)) setAttractions(data);
      }
    } catch (err) {
      console.error("Failed to fetch content", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") as any;
      if (tabParam && ["experiences", "inquiries", "blog", "faqs", "attractions"].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [activeTab]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      if (activeTab === "inquiries") {
        const res = await fetch(`/api/contact?id=${id}`, { method: "DELETE" });
        if (res.ok) fetchContent();
        return;
      }

      let endpointType = "experience";
      if (activeTab === "blog") endpointType = "blog";
      else if (activeTab === "faqs") endpointType = "faq";
      else if (activeTab === "attractions") endpointType = "attraction";

      const res = await fetch(`/api/content/${id}?type=${endpointType}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchContent();
      }
    } catch (err) {
      console.error("Failed to delete content", err);
    }
  };

  const handleStartEditExperience = (exp: Experience) => {
    setEditingId(exp.id);
    setNewExperience({
      title: exp.title,
      description: exp.description,
      category: exp.category || "wellness",
      duration: exp.duration || "2 hours",
      price: exp.price || 1500,
      image: exp.image || "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      let endpointType = "experience";
      let payload: any = newExperience;

      if (activeTab === "blog") {
        endpointType = "blog";
        payload = newBlog;
      } else if (activeTab === "faqs") {
        endpointType = "faq";
        payload = newFAQ;
      } else if (activeTab === "attractions") {
        endpointType = "attraction";
        payload = newAttraction;
      }

      const url = editingId
        ? `/api/content/${editingId}?type=${endpointType}`
        : `/api/content?type=${endpointType}`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingId(null);
        fetchContent();
      }
    } catch (err) {
      console.error("Failed to save content", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Content & Guest Engagement</h1>
          <p className="text-xs text-warm-gray">Manage experiences, guest inquiries, blogs, FAQs and attractions.</p>
        </div>
        {activeTab !== "inquiries" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-white text-xs font-semibold hover:bg-primary-dark cursor-pointer transition-colors"
          >
            <Plus className="size-3.5" /> Add New Entry
          </button>
        )}
      </div>

      <div className="flex border-b border-border overflow-x-auto scrollbar-none">
        {[
          { id: "experiences", label: `Experiences (${experiences.length})` },
          { id: "inquiries", label: `Guest Inquiries (${inquiries.length})` },
          { id: "blog", label: `Blog Articles (${blogPosts.length})` },
          { id: "faqs", label: `FAQs (${faqs.length})` },
          { id: "attractions", label: `Attractions (${attractions.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-5 py-2.5 font-medium text-xs border-b-2 transition-colors cursor-pointer min-w-max ${
              activeTab === t.id ? "border-primary text-primary font-bold" : "border-transparent text-warm-gray hover:text-charcoal"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-warm-gray gap-2 bg-surface rounded-xl border border-border">
          <Loader2 className="size-5 animate-spin text-primary" /> Loading items...
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden">
          {/* EXPERIENCES */}
          {activeTab === "experiences" && (
            <div className="divide-y divide-border">
              {experiences.map((exp) => (
                <div key={exp.id} className="p-4 hover:bg-background/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="relative size-14 rounded-md overflow-hidden flex-shrink-0 border border-border">
                      <Image src={exp.image} alt={exp.title} fill className="object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-charcoal text-sm">{exp.title}</span>
                        {exp.category && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary font-semibold uppercase">
                            {exp.category}
                          </span>
                        )}
                      </div>
                      <p className="text-warm-gray line-clamp-1 max-w-xl">{exp.description}</p>
                      <div className="flex items-center gap-4 mt-1 text-[11px] text-warm-gray">
                        {exp.duration && <span>Duration: <strong>{exp.duration}</strong></span>}
                        {exp.price ? <span>Price: <strong>{formatCurrency(exp.price)}</strong></span> : <span>Complimentary</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleStartEditExperience(exp)}
                      className="p-1.5 rounded border border-border text-charcoal hover:bg-background cursor-pointer transition-colors"
                      title="Edit Experience"
                    >
                      <Edit3 className="size-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="p-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                      title="Delete Experience"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* GUEST INQUIRIES */}
          {activeTab === "inquiries" && (
            inquiries.length === 0 ? (
              <div className="p-12 text-center text-warm-gray text-xs">
                <MessageSquare className="size-8 mx-auto mb-2 text-muted-sage opacity-50" />
                <p className="font-semibold text-charcoal text-sm mb-1">No Inquiries Yet</p>
                <p>When guests submit the contact form on the website, messages will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {inquiries.map((inq) => (
                  <div key={inq.id} className="p-5 hover:bg-background/50 text-xs space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-charcoal text-sm">{inq.name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-accent/15 text-accent-dark font-semibold uppercase">
                            {inq.subject}
                          </span>
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                            {inq.status || "new"}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-warm-gray text-[11px]">
                          <span className="flex items-center gap-1">
                            <Mail className="size-3 text-primary" /> {inq.email}
                          </span>
                          {inq.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="size-3 text-primary" /> {inq.phone}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-muted-sage">
                            <Calendar className="size-3" /> {new Date(inq.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(inq.id)}
                        className="p-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer flex-shrink-0"
                        title="Delete inquiry"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                    <div className="bg-background/70 p-3 rounded border border-border text-charcoal leading-relaxed">
                      {inq.message}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* BLOG */}
          {activeTab === "blog" && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-background border-b border-border text-warm-gray font-semibold uppercase">
                  <th className="p-3.5">Title</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Author</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {blogPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-background/50">
                    <td className="p-3.5 font-bold text-charcoal">{post.title}</td>
                    <td className="p-3.5">{post.category}</td>
                    <td className="p-3.5">{post.author}</td>
                    <td className="p-3.5 capitalize text-emerald-600 font-semibold">{post.status}</td>
                    <td className="p-3.5 text-right">
                      <button onClick={() => handleDelete(post.id)} className="p-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer">
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* FAQS */}
          {activeTab === "faqs" && (
            <div>
              <div className="p-3 bg-accent/10 border-b border-border flex items-center justify-between text-xs">
                <span className="text-charcoal font-medium">
                  Need to reorder questions, toggle visibility, or customize section titles?
                </span>
                <a
                  href="/admin/content/faqs"
                  className="px-3 py-1 bg-primary text-white font-semibold rounded hover:bg-primary-dark transition-colors inline-flex items-center gap-1"
                >
                  Open Dedicated FAQ Studio &rarr;
                </a>
              </div>
              <div className="divide-y divide-border">
                {faqs.map((faq) => (
                  <div key={faq.id} className="p-4 hover:bg-background/50 flex justify-between items-center text-xs">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-charcoal">{faq.question}</p>
                        {faq.category && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-accent/15 text-accent-dark font-semibold">
                            {faq.category}
                          </span>
                        )}
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded ${
                            faq.status !== "inactive"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {faq.status !== "inactive" ? "Active" : "Hidden"}
                        </span>
                      </div>
                      <p className="text-warm-gray">{faq.answer}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <a
                        href="/admin/content/faqs"
                        className="p-1.5 rounded border border-border text-primary hover:bg-primary/5 cursor-pointer"
                        title="Edit in FAQ Studio"
                      >
                        Adjust
                      </a>
                      <button onClick={() => handleDelete(faq.id)} className="p-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ATTRACTIONS */}
          {activeTab === "attractions" && (
            <div className="divide-y divide-border">
              {attractions.map((att) => (
                <div key={att.id} className="p-4 hover:bg-background/50 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-charcoal mb-1">{att.name} ({att.distance})</p>
                    <p className="text-warm-gray">{att.description}</p>
                  </div>
                  <button onClick={() => handleDelete(att.id)} className="p-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer ml-4">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Content Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl border border-border shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="font-serif text-lg font-bold text-charcoal capitalize">
                {editingId ? "Edit" : "Add New"} {activeTab === "experiences" ? "Experience" : activeTab === "blog" ? "Blog Article" : activeTab === "faqs" ? "FAQ" : "Attraction"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingId(null);
                }}
                className="text-warm-gray hover:text-charcoal cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              {activeTab === "experiences" && (
                <>
                  <div>
                    <label className="block font-semibold mb-1">Experience Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Holistic Ayurvedic Spa & Forest Wellness"
                      value={newExperience.title}
                      onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
                      className="w-full px-3 py-2 border rounded bg-background"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Category</label>
                      <select
                        value={newExperience.category}
                        onChange={(e) => setNewExperience({ ...newExperience, category: e.target.value as any })}
                        className="w-full px-3 py-2 border rounded bg-background"
                      >
                        <option value="wellness">Wellness</option>
                        <option value="dining">Dining</option>
                        <option value="adventure">Adventure</option>
                        <option value="nature">Nature</option>
                        <option value="cultural">Cultural</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Duration</label>
                      <input
                        type="text"
                        placeholder="e.g. 90 mins"
                        value={newExperience.duration}
                        onChange={(e) => setNewExperience({ ...newExperience, duration: e.target.value })}
                        className="w-full px-3 py-2 border rounded bg-background"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Price per Guest (INR, 0 for Free)</label>
                    <input
                      type="number"
                      value={newExperience.price}
                      onChange={(e) => setNewExperience({ ...newExperience, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded bg-background"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Image URL (Cloudinary or Unsplash) *</label>
                    <input
                      type="url"
                      required
                      value={newExperience.image}
                      onChange={(e) => setNewExperience({ ...newExperience, image: e.target.value })}
                      className="w-full px-3 py-2 border rounded bg-background"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Description *</label>
                    <textarea
                      required
                      rows={3}
                      value={newExperience.description}
                      onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded bg-background"
                    />
                  </div>
                </>
              )}

              {activeTab === "blog" && (
                <>
                  <div>
                    <label className="block font-semibold mb-1">Article Title *</label>
                    <input type="text" required value={newBlog.title} onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })} className="w-full px-3 py-2 border rounded bg-background" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Excerpt *</label>
                    <textarea required rows={2} value={newBlog.excerpt} onChange={(e) => setNewBlog({ ...newBlog, excerpt: e.target.value })} className="w-full px-3 py-2 border rounded bg-background" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Full Content *</label>
                    <textarea required rows={4} value={newBlog.content} onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })} className="w-full px-3 py-2 border rounded bg-background" />
                  </div>
                </>
              )}

              {activeTab === "faqs" && (
                <>
                  <div>
                    <label className="block font-semibold mb-1">Question *</label>
                    <input type="text" required value={newFAQ.question} onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })} className="w-full px-3 py-2 border rounded bg-background" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Answer *</label>
                    <textarea required rows={3} value={newFAQ.answer} onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })} className="w-full px-3 py-2 border rounded bg-background" />
                  </div>
                </>
              )}

              {activeTab === "attractions" && (
                <>
                  <div>
                    <label className="block font-semibold mb-1">Attraction Name *</label>
                    <input type="text" required value={newAttraction.name} onChange={(e) => setNewAttraction({ ...newAttraction, name: e.target.value })} className="w-full px-3 py-2 border rounded bg-background" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Distance / Duration *</label>
                    <input type="text" required value={newAttraction.distance} onChange={(e) => setNewAttraction({ ...newAttraction, distance: e.target.value })} className="w-full px-3 py-2 border rounded bg-background" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Description *</label>
                    <textarea required rows={3} value={newAttraction.description} onChange={(e) => setNewAttraction({ ...newAttraction, description: e.target.value })} className="w-full px-3 py-2 border rounded bg-background" />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingId(null);
                  }}
                  className="px-3 py-1.5 border rounded cursor-pointer hover:bg-background"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-primary text-white font-semibold rounded cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                >
                  {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                  {editingId ? "Update Entry" : "Save Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
