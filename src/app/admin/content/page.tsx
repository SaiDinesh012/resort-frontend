"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, X, Check, Trash2 } from "lucide-react";
import type { BlogPost, FAQ, Attraction } from "@/types/media";

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState<"blog" | "faqs" | "attractions">("blog");
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states for creating new content
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
      if (activeTab === "blog") {
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
    fetchContent();
  }, [activeTab]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (activeTab === "blog") {
        await fetch("/api/content?type=blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...newBlog, status: "published", readTime: 5 }),
        });
      } else if (activeTab === "faqs") {
        await fetch("/api/content?type=faq", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...newFAQ, status: "active", order: faqs.length + 1 }),
        });
      } else if (activeTab === "attractions") {
        await fetch("/api/content?type=attraction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newAttraction),
        });
      }

      setIsModalOpen(false);
      fetchContent();
    } catch (err) {
      console.error("Failed to create content", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    try {
      await fetch(`/api/content/${id}?type=${activeTab === "blog" ? "blog" : activeTab === "faqs" ? "faq" : "attraction"}`, {
        method: "DELETE",
      });
      fetchContent();
    } catch (err) {
      console.error("Failed to delete content", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Content Management</h1>
          <p className="text-xs text-warm-gray mt-1">Manage website copy, blog posts, FAQs, and nearby sightseeing listings live in MongoDB</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-white text-xs font-semibold hover:bg-primary-dark cursor-pointer"
        >
          <Plus className="size-3.5" /> Add New Entry
        </button>
      </div>

      <div className="flex border-b border-border">
        {[
          { id: "blog", label: `Blog Articles (${blogPosts.length})` },
          { id: "faqs", label: `FAQs (${faqs.length})` },
          { id: "attractions", label: `Attractions (${attractions.length})` },
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

      {loading ? (
        <div className="flex justify-center items-center py-20 text-warm-gray gap-2 bg-surface rounded-xl border border-border">
          <Loader2 className="size-5 animate-spin text-primary" /> Loading content items...
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden">
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

          {activeTab === "faqs" && (
            <div className="divide-y divide-border">
              {faqs.map((faq) => (
                <div key={faq.id} className="p-4 hover:bg-background/50 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-charcoal mb-1">{faq.question}</p>
                    <p className="text-warm-gray">{faq.answer}</p>
                  </div>
                  <button onClick={() => handleDelete(faq.id)} className="p-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer ml-4">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

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
          <div className="bg-surface rounded-xl border border-border shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="font-serif text-lg font-bold text-charcoal capitalize">Add New {activeTab === "blog" ? "Blog Article" : activeTab === "faqs" ? "FAQ" : "Attraction"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-warm-gray hover:text-charcoal cursor-pointer">
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
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
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 border rounded cursor-pointer">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-1.5 bg-primary text-white font-semibold rounded cursor-pointer disabled:opacity-50 inline-flex items-center gap-1">
                  {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />} Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
