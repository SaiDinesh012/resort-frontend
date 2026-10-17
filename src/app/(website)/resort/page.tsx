"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { SITE_NAME } from "@/lib/constants";
import { mockExperiences } from "@/data/mock/content";
import type { Experience } from "@/types/media";
import {
  Sparkles,
  Clock,
  Compass,
  ArrowRight,
  Loader2,
  Calendar,
  Check,
  Tag,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const CATEGORIES = [
  { label: "All Experiences", value: "all" },
  { label: "Wellness & Spa", value: "wellness" },
  { label: "Forest Dining", value: "dining" },
  { label: "Adventures & Treks", value: "adventure" },
  { label: "Nature & Night Skies", value: "nature" },
  { label: "Culture & Plantations", value: "cultural" },
];

export default function ResortExperiencesPage() {
  const [experiences, setExperiences] = useState<Experience[]>(mockExperiences);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    async function fetchExperiences() {
      try {
        setLoading(true);
        const res = await fetch("/api/content?type=experience");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setExperiences(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch experiences", err);
      } finally {
        setLoading(false);
      }
    }
    fetchExperiences();
  }, []);

  const filtered = experiences.filter((exp) => {
    if (selectedCategory === "all") return true;
    return exp.category === selectedCategory;
  });

  const getCategoryCount = (val: string) => {
    if (val === "all") return experiences.length;
    return experiences.filter((e) => e.category === val).length;
  };

  return (
    <div className="bg-background min-h-screen">
      {/* ══════════════════════════════════════════════════════
          PAGE HEADER — Deep Forest Green with Antique Gold Accent
      ══════════════════════════════════════════════════════ */}
      <div className="bg-primary-dark text-white pt-28 pb-16 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[{ label: "Resort Experiences" }]}
            variant="dark"
            className="mb-4"
          />
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15">
            <Sparkles className="size-3 text-accent" />
            <span className="font-sans text-xs tracking-wider uppercase text-white/90">
              Curated Nature Escapes • Maredumilli
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-light text-white mb-3">
            Experiences & Resort Life
          </h1>
          <div className="w-12 h-px bg-accent mb-4" />
          <p className="font-sans text-white/75 max-w-2xl text-sm sm:text-base leading-relaxed">
            Immerse yourself in authentic wilderness rituals, holistic wellness, and unforgettable
            gatherings designed to reconnect you with the pristine beauty of Maredumilli.
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          CATEGORY FILTER STRIP
      ══════════════════════════════════════════════════════ */}
      <div className="bg-surface border-b border-border sticky top-16 lg:top-20 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 min-w-max">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.value;
              const count = getCategoryCount(cat.value);
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-sm text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    active
                      ? "bg-primary text-white shadow-xs"
                      : "bg-background text-warm-gray hover:text-charcoal hover:bg-warm-white border border-border"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      active ? "bg-white/20 text-white" : "bg-charcoal/10 text-warm-gray"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          DYNAMIC EXPERIENCES LIST — Editorial alternating layout
      ══════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-24 text-warm-gray gap-3 bg-surface rounded-sm border border-border">
            <Loader2 className="size-6 animate-spin text-primary" />
            <span className="font-sans text-sm">Loading curated experiences...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-surface rounded-sm border border-border p-16 text-center shadow-xs">
            <Compass className="size-10 text-muted-sage mx-auto mb-4" />
            <h3 className="font-serif text-2xl font-light text-charcoal mb-2">
              No experiences in this category
            </h3>
            <p className="font-sans text-warm-gray text-sm mb-6">
              Please choose another category or reset your filter.
            </p>
            <button
              onClick={() => setSelectedCategory("all")}
              className="px-6 py-2.5 bg-primary text-white rounded-sm text-xs font-semibold tracking-wide hover:bg-primary-dark transition-colors cursor-pointer"
            >
              View All Experiences
            </button>
          </div>
        ) : (
          <div className="space-y-20">
            {filtered.map((item, idx) => {
              const isEven = idx % 2 === 1;
              return (
                <article
                  key={item.id || item.title}
                  className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-surface p-6 sm:p-8 rounded-sm border border-border shadow-xs hover:border-accent/40 transition-all group"
                >
                  {/* Image container */}
                  <div
                    className={`lg:col-span-6 relative aspect-[16/10] sm:aspect-[4/3] rounded-sm overflow-hidden border border-border/80 ${
                      isEven ? "lg:order-2" : "lg:order-1"
                    }`}
                  >
                    <Image
                      src={item.image || "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80"}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-primary-dark/10 group-hover:bg-primary-dark/0 transition-colors" />

                    {/* Category pill badge */}
                    {item.category && (
                      <span className="absolute top-4 left-4 px-3 py-1 rounded-sm bg-primary-dark/85 backdrop-blur-sm text-accent text-[11px] font-semibold uppercase tracking-wider">
                        {item.category}
                      </span>
                    )}

                    {/* Duration badge */}
                    {item.duration && (
                      <div className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-black/70 backdrop-blur-sm text-white text-xs font-medium">
                        <Clock className="size-3 text-accent" />
                        <span>{item.duration}</span>
                      </div>
                    )}
                  </div>

                  {/* Content details */}
                  <div className={`lg:col-span-6 ${isEven ? "lg:order-1" : "lg:order-2"}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-6 h-px bg-accent" />
                      <span className="font-sans text-xs uppercase tracking-widest text-muted-sage font-semibold">
                        Exclusive Experience
                      </span>
                    </div>

                    <h2 className="font-serif text-2xl sm:text-4xl font-light text-charcoal mb-4 group-hover:text-primary transition-colors">
                      {item.title}
                    </h2>

                    <p className="font-sans text-warm-gray text-sm sm:text-base leading-relaxed mb-6">
                      {item.description}
                    </p>

                    {/* Metadata strip */}
                    <div className="flex flex-wrap items-center gap-6 py-4 border-y border-border mb-8 text-xs text-charcoal">
                      {item.duration && (
                        <div className="flex items-center gap-2">
                          <Clock className="size-4 text-primary" />
                          <span>Duration: <strong>{item.duration}</strong></span>
                        </div>
                      )}
                      {item.price ? (
                        <div className="flex items-center gap-2">
                          <Tag className="size-4 text-primary" />
                          <span>From: <strong>{formatCurrency(item.price)}</strong> / guest</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Sparkles className="size-4 text-accent" />
                          <span><strong>Complimentary with stay</strong></span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-4">
                      <Link
                        href={`/booking?type=experience&title=${encodeURIComponent(item.title)}`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-dark text-white rounded-sm font-sans font-semibold text-xs uppercase tracking-wider transition-all shadow-xs hover:shadow"
                      >
                        <span>Reserve Experience</span>
                        <ArrowRight className="size-3.5" />
                      </Link>

                      <Link
                        href={`/contact?subject=${encodeURIComponent("Experience Inquiry: " + item.title)}&experience=${encodeURIComponent(item.title)}`}
                        className="inline-flex items-center gap-1.5 px-5 py-3 rounded-sm border border-border text-charcoal hover:bg-warm-white font-sans text-xs font-semibold tracking-wider transition-colors"
                      >
                        <span>Inquire with Concierge</span>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          FOOTER CTA BANNER
      ══════════════════════════════════════════════════════ */}
      <section className="bg-primary text-white py-16 border-t border-primary-dark">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-sans text-accent text-xs uppercase tracking-[0.2em] mb-3">
            Bespoke Itineraries
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-light mb-4 text-white">
            Looking for a Tailored Forest Expedition?
          </h2>
          <p className="font-sans text-white/75 text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
            Our guest concierge can curate personalized waterfall excursions, private tribal dining under
            the stars, and romantic setups tailored to your schedule.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="px-7 py-3 rounded-sm bg-accent hover:bg-accent-dark text-white font-sans text-xs font-semibold uppercase tracking-wider transition-all"
            >
              Contact Guest Concierge
            </Link>
            <Link
              href="/packages"
              className="px-7 py-3 rounded-sm bg-white/10 hover:bg-white/20 border border-white/20 text-white font-sans text-xs font-semibold uppercase tracking-wider transition-all"
            >
              View Holiday Packages
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
