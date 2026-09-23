"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Upload, Search, Grid, List, Trash2, Loader2, X, Check, Cloud, FileImage } from "lucide-react";
import { Modal } from "@/components/shared/Modal";
import type { MediaItem } from "@/types/media";

export default function MediaLibraryPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newMediaData, setNewMediaData] = useState({
    title: "",
    altText: "",
    url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80",
    category: "resort" as MediaItem["category"],
    fileName: "resort-photo.jpg",
  });

  const categories = ["all", "resort", "rooms", "packages", "activities", "blog", "seo"];

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/media");
      const data = await res.json();
      if (Array.isArray(data)) {
        setItems(data);
      }
    } catch (err) {
      console.error("Failed to load media items", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      if (!newMediaData.title) {
        setNewMediaData((prev) => ({
          ...prev,
          title: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
          fileName: file.name,
        }));
      }
    }
  };

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);

      let payload: any = {
        title: newMediaData.title,
        altText: newMediaData.altText,
        category: newMediaData.category,
        fileName: newMediaData.fileName,
      };

      if (previewUrl && selectedFile) {
        payload.fileData = previewUrl; // base64 string for direct Cloudinary upload
      } else {
        payload.url = newMediaData.url; // Remote URL upload to Cloudinary
      }

      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to upload asset");
      }

      setIsAddModalOpen(false);
      setSelectedFile(null);
      setPreviewUrl("");
      setNewMediaData({
        title: "",
        altText: "",
        url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80",
        category: "resort",
        fileName: "resort-photo.jpg",
      });
      fetchMedia();
    } catch (err: any) {
      alert(`Error uploading asset: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    if (!confirm("Are you sure you want to delete this media item?")) return;
    try {
      await fetch(`/api/media/${id}`, { method: "DELETE" });
      setSelectedMedia(null);
      fetchMedia();
    } catch (err) {
      console.error("Failed to delete media item", err);
    }
  };

  const filtered = items.filter((m) => {
    const matchesCat = selectedCategory === "all" || m.category === selectedCategory;
    const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) || (m.fileName || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal flex items-center gap-2">
            Media Library
            <span className="inline-flex items-center gap-1 text-[11px] font-sans font-medium px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
              <Cloud className="size-3" /> Cloudinary Enabled (dewdakkvj)
            </span>
          </h1>
          <p className="text-xs text-warm-gray mt-1">
            Upload images directly to Cloudinary CDN & store metadata live in MongoDB
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-colors shadow-xs cursor-pointer"
        >
          <Upload className="size-3.5" /> Upload File to Cloudinary
        </button>
      </div>

      {/* Upload Zone Button */}
      <div
        onClick={() => {
          setIsAddModalOpen(true);
          setTimeout(() => fileInputRef.current?.click(), 100);
        }}
        className="border-2 border-dashed border-border hover:border-primary rounded-xl p-6 bg-surface text-center transition-colors cursor-pointer group"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Upload className="size-8 text-primary group-hover:scale-110 transition-transform" />
          <Cloud className="size-6 text-blue-500" />
        </div>
        <p className="font-serif font-semibold text-charcoal text-sm">Click to Select Local Image File or Paste URL</p>
        <p className="text-xs text-warm-gray mt-1">Automatic Upload & Optimization via Cloudinary Account (dewdakkvj)</p>
      </div>

      {/* Controls Bar */}
      <div className="bg-surface rounded-xl border border-border p-4 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-warm-gray" />
          <input
            type="text"
            placeholder="Search media files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-md border border-border text-xs text-charcoal focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto overflow-x-auto">
          {/* Category Filter */}
          <div className="flex rounded-md border border-border overflow-hidden">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors cursor-pointer ${
                  selectedCategory === cat ? "bg-primary text-white" : "bg-background text-warm-gray hover:text-charcoal"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex rounded-md border border-border overflow-hidden flex-shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 transition-colors cursor-pointer ${viewMode === "grid" ? "bg-primary text-white" : "text-warm-gray"}`}
            >
              <Grid className="size-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 transition-colors cursor-pointer ${viewMode === "list" ? "bg-primary text-white" : "text-warm-gray"}`}
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading or Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20 text-warm-gray gap-2 bg-surface rounded-xl border border-border">
          <Loader2 className="size-5 animate-spin text-primary" /> Loading media library...
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filtered.map((item) => {
            const isCloudinary = item.url.includes("cloudinary.com");
            return (
              <div
                key={item.id}
                onClick={() => setSelectedMedia(item)}
                className="group relative bg-surface rounded-lg border border-border overflow-hidden shadow-xs cursor-pointer hover:border-primary transition-all aspect-square"
              >
                <Image src={item.url} alt={item.altText || item.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                {isCloudinary && (
                  <span className="absolute top-1.5 right-1.5 bg-blue-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-sm">
                    <Cloud className="size-2.5" /> CDN
                  </span>
                )}
                <div className="absolute inset-0 bg-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between text-white">
                  <span className="text-[10px] font-semibold uppercase bg-accent/80 px-1.5 py-0.5 rounded self-start">{item.category}</span>
                  <p className="text-xs font-medium truncate">{item.title}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-background border-b border-border text-warm-gray font-semibold uppercase">
                <th className="p-3.5">Preview</th>
                <th className="p-3.5">Title / File</th>
                <th className="p-3.5">Storage CDN</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Dimensions</th>
                <th className="p-3.5">Size</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-charcoal font-medium">
              {filtered.map((item) => {
                const isCloudinary = item.url.includes("cloudinary.com");
                return (
                  <tr key={item.id} className="hover:bg-background/50">
                    <td className="p-3.5">
                      <div className="relative size-10 rounded overflow-hidden">
                        <Image src={item.url} alt={item.altText || item.title} fill className="object-cover" />
                      </div>
                    </td>
                    <td className="p-3.5">
                      <p className="font-bold">{item.title}</p>
                      <p className="text-[11px] text-warm-gray">{item.fileName}</p>
                    </td>
                    <td className="p-3.5">
                      {isCloudinary ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                          <Cloud className="size-3" /> Cloudinary (dewdakkvj)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          External URL
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 capitalize">{item.category}</td>
                    <td className="p-3.5">{item.width || 1920} x {item.height || 1080}</td>
                    <td className="p-3.5">{item.fileSizeKb || 350} KB</td>
                    <td className="p-3.5 text-right">
                      <button onClick={() => setSelectedMedia(item)} className="px-2.5 py-1 rounded border border-border text-xs cursor-pointer">
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Media Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl border border-border shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="font-serif text-lg font-bold text-charcoal flex items-center gap-2">
                Upload Media to Cloudinary
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-warm-gray hover:text-charcoal cursor-pointer">
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={handleAddMedia} className="space-y-3 text-xs">
              {/* File Upload Selector */}
              <div>
                <label className="block font-semibold text-charcoal mb-1">Choose Local Image File *</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer"
                />
              </div>

              {previewUrl ? (
                <div className="relative aspect-video rounded-lg overflow-hidden border border-border">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                    <FileImage className="size-3" /> Selected File Preview
                  </span>
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-charcoal mb-1">...or Remote Image URL</label>
                  <input
                    type="text"
                    value={newMediaData.url}
                    onChange={(e) => setNewMediaData({ ...newMediaData, url: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-charcoal mb-1">Image Title *</label>
                <input
                  type="text"
                  required
                  value={newMediaData.title}
                  onChange={(e) => setNewMediaData({ ...newMediaData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none"
                  placeholder="e.g. Sunset Luxury Suite"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Alt Text (SEO)</label>
                <input
                  type="text"
                  value={newMediaData.altText}
                  onChange={(e) => setNewMediaData({ ...newMediaData, altText: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none"
                  placeholder="Descriptive alt text"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal mb-1">Category</label>
                <select
                  value={newMediaData.category}
                  onChange={(e) => setNewMediaData({ ...newMediaData, category: e.target.value as MediaItem["category"] })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none capitalize"
                >
                  <option value="resort">Resort</option>
                  <option value="rooms">Rooms</option>
                  <option value="packages">Packages</option>
                  <option value="activities">Activities</option>
                  <option value="blog">Blog</option>
                  <option value="seo">SEO</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-border text-warm-gray hover:text-charcoal cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded bg-primary text-white font-semibold hover:bg-primary-dark cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                >
                  {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                  {saving ? "Uploading to Cloudinary..." : "Upload to Cloudinary"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect / Delete Modal */}
      {selectedMedia && (
        <Modal isOpen={Boolean(selectedMedia)} onClose={() => setSelectedMedia(null)} title="Media Asset Details" size="lg">
          <div className="grid sm:grid-cols-2 gap-6 text-xs">
            <div className="relative aspect-square rounded-lg overflow-hidden border border-border">
              <Image src={selectedMedia.url} alt={selectedMedia.altText || selectedMedia.title} fill className="object-cover" />
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-warm-gray font-semibold block mb-1">Title</label>
                <p className="font-bold text-charcoal text-sm">{selectedMedia.title}</p>
              </div>
              <div>
                <label className="text-warm-gray font-semibold block mb-1">Cloudinary CDN URL</label>
                <a
                  href={selectedMedia.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline font-mono text-[11px] break-all block"
                >
                  {selectedMedia.url}
                </a>
              </div>
              <div>
                <label className="text-warm-gray font-semibold block mb-1">Alt Text (SEO)</label>
                <p className="text-charcoal">{selectedMedia.altText || "N/A"}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-warm-gray pt-2 border-t border-border">
                <div><span className="font-semibold text-charcoal">Category:</span> {selectedMedia.category}</div>
                <div><span className="font-semibold text-charcoal">Format:</span> {selectedMedia.format || "jpg"}</div>
                <div><span className="font-semibold text-charcoal">Width x Height:</span> {selectedMedia.width || 1200}x{selectedMedia.height || 800}</div>
                <div><span className="font-semibold text-charcoal">Size:</span> {selectedMedia.fileSizeKb || 250} KB</div>
              </div>
              <div className="pt-4 flex gap-2">
                <button onClick={() => setSelectedMedia(null)} className="flex-1 py-2 rounded bg-primary text-white font-semibold cursor-pointer">Close</button>
                <button onClick={() => handleDeleteMedia(selectedMedia.id)} className="px-3 py-2 rounded border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
