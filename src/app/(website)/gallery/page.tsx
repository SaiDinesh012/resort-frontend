"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import type { MediaItem } from "@/types/media";

export default function GalleryPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGallery() {
      try {
        setLoading(true);
        const res = await fetch("/api/media");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setMediaItems(data);
        }
      } catch (err) {
        console.error("Failed to fetch gallery media", err);
      } finally {
        setLoading(false);
      }
    }
    fetchGallery();
  }, []);

  return (
    <div className="bg-background min-h-screen">
      <div className="bg-primary-dark text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Gallery" }]} variant="dark" className="mb-4" />
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-3">Photo Gallery</h1>
          <p className="text-white/70 max-w-xl">Take a visual tour of our resort grounds, villas, and forest vistas.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center items-center py-20 text-warm-gray gap-2 bg-surface rounded-xl border border-border">
            <Loader2 className="size-5 animate-spin text-primary" /> Loading resort gallery...
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mediaItems.map((item) => (
              <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden group border border-border shadow-sm">
                <Image
                  src={item.url}
                  alt={item.altText || item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-charcoal/30 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end text-white text-xs">
                  <p className="font-bold">{item.title}</p>
                  <p className="text-[10px] text-white/80 capitalize">{item.category}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
