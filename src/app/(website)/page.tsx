"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Waves, Utensils, Wifi, Car, Compass, Leaf, Star, ChevronDown, MapPin, ArrowRight, Check, Plus, Minus,
} from "lucide-react";
import { AvailabilitySearch } from "@/components/website/AvailabilitySearch";
import { RoomCard } from "@/components/website/RoomCard";
import { PackageCard } from "@/components/website/PackageCard";
import { API_BASE_URL } from "@/lib/api";
import type { Room } from "@/types/room";
import type { Package } from "@/types/package";
import type { Review, FAQ, Attraction, MediaItem } from "@/types/media";
import "@/styles/ck-content.css";

const defaultAmenities = [
  { icon: Waves, label: "Infinity Pool", description: "Overlooking the forest canopy" },
  { icon: Utensils, label: "Forest Restaurant", description: "Farm-to-table dining" },
  { icon: Leaf, label: "Ayurvedic Spa", description: "Holistic wellness sanctuary" },
  { icon: Wifi, label: "High-Speed WiFi", description: "Across all resort areas" },
  { icon: Car, label: "Ample Parking", description: "Secure covered parking" },
  { icon: Compass, label: "Guided Activities", description: "Treks, safaris & more" },
];

export default function HomePage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [siteConfig, setSiteConfig] = useState({
    siteName: "",
    tagline: "",
    heroTitle: "",
    heroSubtitle: "",
    heroTextColor: "#ffffff",
    heroImage: "",
    // About Section — all from DB, no static fallbacks
    aboutBadge: "",
    aboutTitle: "",
    aboutBody: "",
    aboutImage: "",
    aboutYearsNumber: "",
    aboutYearsLabel: "",
    aboutLink: "",
    aboutLinkText: "",
  });

  useEffect(() => {
    async function loadLiveData() {
      try {
        const [roomsRes, pkgsRes, revsRes, faqsRes, attsRes, mediaRes, settingsRes] = await Promise.allSettled([
          fetch(`${API_BASE_URL}/rooms?featured=true`),
          fetch(`${API_BASE_URL}/packages?featured=true`),
          fetch(`${API_BASE_URL}/content?type=review`),
          fetch(`${API_BASE_URL}/content?type=faq`),
          fetch(`${API_BASE_URL}/content?type=attraction`),
          fetch(`${API_BASE_URL}/media`),
          fetch(`${API_BASE_URL}/settings?key=site_config`, { cache: 'no-store' }),
        ]);

        if (roomsRes.status === "fulfilled" && roomsRes.value.ok) {
          const data = await roomsRes.value.json();
          if (Array.isArray(data)) setRooms(data);
        }

        if (pkgsRes.status === "fulfilled" && pkgsRes.value.ok) {
          const data = await pkgsRes.value.json();
          if (Array.isArray(data)) setPackages(data);
        }

        if (revsRes.status === "fulfilled" && revsRes.value.ok) {
          const data = await revsRes.value.json();
          if (Array.isArray(data)) setReviews(data);
        }

        if (faqsRes.status === "fulfilled" && faqsRes.value.ok) {
          const data = await faqsRes.value.json();
          if (Array.isArray(data)) setFaqs(data);
        }

        if (attsRes.status === "fulfilled" && attsRes.value.ok) {
          const data = await attsRes.value.json();
          if (Array.isArray(data)) setAttractions(data);
        }

        if (mediaRes.status === "fulfilled" && mediaRes.value.ok) {
          const data = await mediaRes.value.json();
          if (Array.isArray(data)) setMediaItems(data);
        }

        if (settingsRes.status === "fulfilled" && settingsRes.value.ok) {
          const data = await settingsRes.value.json();
          if (data && typeof data === "object") {
            // Directly set everything from DB — no frontend fallbacks
            setSiteConfig({
              siteName: data.siteName ?? "",
              tagline: data.tagline ?? "",
              heroTitle: data.heroTitle ?? "",
              heroSubtitle: data.heroSubtitle ?? "",
              heroTextColor: data.heroTextColor ?? "#ffffff",
              heroImage: data.heroImage ?? "",
              aboutBadge: data.aboutBadge ?? "",
              aboutTitle: data.aboutTitle ?? "",
              aboutBody: data.aboutBody ?? "",
              aboutImage: data.aboutImage ?? "",
              aboutYearsNumber: data.aboutYearsNumber ?? "",
              aboutYearsLabel: data.aboutYearsLabel ?? "",
              aboutLink: data.aboutLink ?? "",
              aboutLinkText: data.aboutLinkText ?? "",
            });
          }
        }
      } catch (err) {
        console.error("Error loading live homepage data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadLiveData();
  }, []);

  const featuredRooms = rooms.slice(0, 3);
  const featuredPackages = packages.slice(0, 3);


  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-charcoal text-white">
        <div className="size-10 border-4 border-white/20 border-t-accent rounded-full animate-spin mb-4" />
        <p className="text-white/60 font-medium text-sm animate-pulse tracking-widest uppercase">Loading Resort Data...</p>
      </div>
    );
  }

  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={siteConfig.heroImage || "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&q=90"}
            alt="Vanapriya Resort background"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/50 via-charcoal/30 to-charcoal/60" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="text-center mb-10">
            <p className="text-accent font-medium text-sm uppercase tracking-[0.2em] mb-4">
                {siteConfig.tagline}
              </p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6 text-balance drop-shadow-md" style={{ color: siteConfig.heroTextColor || "#ffffff" }}>
              {siteConfig.heroTitle}
            </h1>
            <p className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-8 drop-shadow-md" style={{ color: siteConfig.heroTextColor || "#ffffff", opacity: 0.9 }}>
              {siteConfig.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/rooms"
                className="px-8 py-3.5 rounded-md bg-primary hover:bg-primary-dark text-white font-semibold transition-colors"
              >
                Explore Rooms
              </Link>
              <Link
                href="/packages"
                className="px-8 py-3.5 rounded-md bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold backdrop-blur-sm transition-colors"
              >
                View Packages
              </Link>
            </div>
          </div>

          <div className="flex justify-center">
            <AvailabilitySearch variant="hero" />
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 animate-bounce">
          <ChevronDown className="size-6" />
        </div>
      </section>

      {/* ─── ABOUT ─────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            {/* Left: Image */}
            <div className="relative">
              <div className="aspect-[4/5] rounded-lg overflow-hidden">
                <Image
                  src={siteConfig.aboutImage}
                  alt={siteConfig.aboutTitle || "About the Resort"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              {(siteConfig.aboutYearsNumber || siteConfig.aboutYearsLabel) && (
                <div className="absolute -bottom-6 -right-6 bg-surface rounded-lg shadow-panel p-5 border border-border hidden sm:block">
                  <p className="font-serif text-4xl font-bold text-primary">{siteConfig.aboutYearsNumber}</p>
                  <p className="text-sm text-warm-gray font-medium">{siteConfig.aboutYearsLabel}</p>
                </div>
              )}
            </div>

            {/* Right: Content from CKEditor */}
            <div>
              {siteConfig.aboutBadge && (
                <p className="text-accent font-medium text-sm uppercase tracking-[0.15em] mb-3">
                  {siteConfig.aboutBadge}
                </p>
              )}
              {siteConfig.aboutTitle && (
                <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal mb-6 leading-tight">
                  {siteConfig.aboutTitle}
                </h2>
              )}

              {/* CKEditor body rendered exactly as set in admin */}
              {siteConfig.aboutBody ? (
                <div
                  className="ck-content mb-8"
                  dangerouslySetInnerHTML={{ __html: siteConfig.aboutBody }}
                />
              ) : null}

              {siteConfig.aboutLinkText && siteConfig.aboutLink && (
                <Link
                  href={siteConfig.aboutLink}
                  className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all"
                >
                  {siteConfig.aboutLinkText} <ArrowRight className="size-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURED ROOMS ────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
            <div>
              <p className="text-accent font-medium text-sm uppercase tracking-[0.15em] mb-2">
                Accommodations
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal">
                Rooms & Suites
              </h2>
            </div>
            <Link
              href="/rooms"
              className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors border-b border-primary/30 hover:border-primary pb-0.5"
            >
              View All Rooms <ArrowRight className="size-4" />
            </Link>
          </div>
          {featuredRooms.length === 0 ? (
            <div className="bg-background rounded-xl border border-border p-12 text-center text-warm-gray">
              <p className="font-semibold text-charcoal">No rooms currently listed</p>
              <p className="text-xs mt-1">Check back soon or contact reservations for villa availability.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredRooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── AMENITIES ─────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-primary-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-accent font-medium text-sm uppercase tracking-[0.15em] mb-3">
              What We Offer
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-white mb-4">
              Resort Amenities
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">
              Every detail at {siteConfig.siteName} is thoughtfully curated to create an experience that nourishes the body, calms the mind, and elevates the spirit.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {defaultAmenities.map(({ icon: Icon, label, description }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center p-5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
              >
                <div className="size-12 rounded-full bg-accent/20 group-hover:bg-accent/30 flex items-center justify-center mb-4 transition-colors">
                  <Icon className="size-5 text-accent" />
                </div>
                <h3 className="font-sans font-semibold text-white text-sm mb-1">{label}</h3>
                <p className="text-white/50 text-xs">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PACKAGES ──────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
            <div>
              <p className="text-accent font-medium text-sm uppercase tracking-[0.15em] mb-2">
                Curated Experiences
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal">
                Holiday Packages
              </h2>
            </div>
            <Link
              href="/packages"
              className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors border-b border-primary/30 hover:border-primary pb-0.5"
            >
              All Packages <ArrowRight className="size-4" />
            </Link>
          </div>
          {featuredPackages.length === 0 ? (
            <div className="bg-surface rounded-xl border border-border p-12 text-center text-warm-gray">
              <p className="font-semibold text-charcoal">No holiday packages currently listed</p>
              <p className="text-xs mt-1">Our seasonal packages will be announced soon.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPackages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── GALLERY STRIP ─────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-accent font-medium text-sm uppercase tracking-[0.15em] mb-2">Gallery</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal">
              A Visual Journey
            </h2>
          </div>
          {mediaItems.length === 0 ? (
            <div className="text-center py-10 bg-background rounded-lg border border-border p-6 max-w-lg mx-auto">
              <p className="font-serif text-lg font-bold text-charcoal">Resort Visual Gallery</p>
              <p className="text-xs text-warm-gray mt-1 mb-4">Explore high-resolution photographs of our villas and grounds.</p>
              <Link
                href="/gallery"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-colors"
              >
                Browse Gallery <ArrowRight className="size-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {mediaItems.slice(0, 6).map((item, i) => (
                <div key={item.id || i} className="relative rounded-lg overflow-hidden group aspect-square">
                  <Image
                    src={item.url}
                    alt={item.altText || item.title || "Resort photo"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors duration-300" />
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-primary text-primary hover:bg-primary hover:text-white text-sm font-semibold transition-colors"
            >
              View Full Gallery <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── REVIEWS ───────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-accent font-medium text-sm uppercase tracking-[0.15em] mb-2">
              Guest Stories
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal mb-3">
              What Our Guests Say
            </h2>
            <div className="flex items-center justify-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="size-5 fill-accent text-accent" />
                ))}
              </div>
              <span className="text-charcoal font-semibold">4.9</span>
              <span className="text-warm-gray text-sm">
                based on {reviews.length} verified {reviews.length === 1 ? "review" : "reviews"}
              </span>
            </div>
          </div>
          {reviews.length === 0 ? (
            <div className="bg-surface rounded-xl border border-border p-12 text-center text-warm-gray max-w-md mx-auto">
              <p className="font-semibold text-charcoal text-sm">No guest reviews published yet</p>
              <p className="text-xs mt-1">Verified reviews will appear here as guests complete stays.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-surface rounded-lg border border-border p-5 hover:shadow-card-hover transition-shadow"
                >
                  <div className="flex mb-3">
                    {Array.from({ length: review.rating || 5 }).map((_, i) => (
                      <Star key={i} className="size-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="font-sans font-semibold text-charcoal text-sm mb-2">
                    {review.title}
                  </p>
                  <p className="text-sm text-warm-gray leading-relaxed mb-4 line-clamp-4">
                    {review.body}
                  </p>
                  <div className="flex items-center gap-2 pt-3 border-t border-border">
                    {review.customerAvatar ? (
                      <Image
                        src={review.customerAvatar}
                        alt={review.customerName}
                        width={32}
                        height={32}
                        className="rounded-full object-cover size-8"
                      />
                    ) : (
                      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        {review.customerName[0]}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-charcoal">{review.customerName}</p>
                      <p className="text-xs text-warm-gray">
                        {new Date(review.createdAt || Date.now()).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── NEARBY ATTRACTIONS ────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-accent font-medium text-sm uppercase tracking-[0.15em] mb-2">
              Explore Around
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal">
              Nearby Attractions
            </h2>
          </div>
          {attractions.length === 0 ? (
            <div className="bg-background rounded-xl border border-border p-12 text-center text-warm-gray">
              <p className="font-semibold text-charcoal text-sm">No nearby attractions listed yet</p>
              <p className="text-xs mt-1">Sightseeing spots will be displayed here as they are added.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
              {attractions.map((attraction) => (
                <div
                  key={attraction.id}
                  className="bg-background rounded-lg border border-border p-5 hover:border-secondary hover:shadow-card transition-all"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="size-4 text-primary" />
                    <span className="text-xs text-warm-gray">{attraction.distance}</span>
                  </div>
                  <h3 className="font-sans font-semibold text-charcoal text-sm mb-1.5">
                    {attraction.name}
                  </h3>
                  <p className="text-xs text-warm-gray leading-relaxed line-clamp-3">
                    {attraction.description}
                  </p>
                  <p className="text-xs text-primary font-medium mt-3">{attraction.duration}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── FAQ ───────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-accent font-medium text-sm uppercase tracking-[0.15em] mb-2">Support</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal">
              Frequently Asked Questions
            </h2>
          </div>
          {faqs.length === 0 ? (
            <div className="bg-surface rounded-xl border border-border p-12 text-center text-warm-gray">
              <p className="font-semibold text-charcoal text-sm">No FAQs available yet</p>
              <p className="text-xs mt-1">Contact our front desk directly for any questions.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {faqs.map((faq) => (
                <details key={faq.id} className="group bg-surface border border-border rounded-lg">
                  <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none">
                    <span className="font-sans font-medium text-charcoal text-sm">{faq.question}</span>
                    <span className="flex-shrink-0 size-5 rounded-full border border-border flex items-center justify-center group-open:bg-primary group-open:border-primary transition-colors">
                      <Plus className="size-3 text-warm-gray group-open:hidden" />
                      <Minus className="size-3 text-white hidden group-open:block" />
                    </span>
                  </summary>
                  <div className="px-5 pb-4 text-sm text-warm-gray leading-relaxed border-t border-border mt-0 pt-3">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────────────────── */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=85"
            alt="Beautiful resort beach and forest landscape"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-primary-dark/80" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-accent font-medium text-sm uppercase tracking-[0.2em] mb-4">
            Your Perfect Escape Awaits
          </p>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-6">
            Plan Your Perfect Getaway
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-10">
            Whether you seek solitude, adventure, or romance — {siteConfig.siteName} has the perfect retreat waiting for you. Let us curate an experience you will treasure forever.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/booking"
              className="px-8 py-4 rounded-md bg-accent hover:bg-accent-dark text-white font-bold text-base transition-colors"
            >
              Book Your Stay
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 rounded-md bg-white/15 border border-white/30 text-white font-semibold text-base backdrop-blur-sm hover:bg-white/25 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
