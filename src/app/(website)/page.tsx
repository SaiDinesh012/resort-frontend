"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Waves, Utensils, Wifi, Car, Compass, Leaf, Flame,
  Star, ChevronDown, MapPin, ArrowRight, Check, Plus,
  Minus, Phone, TreePine, Mountain, Wind,
} from "lucide-react";
import { AvailabilitySearch } from "@/components/website/AvailabilitySearch";
import { RoomCard } from "@/components/website/RoomCard";
import { PackageCard } from "@/components/website/PackageCard";
import { mockRooms } from "@/data/mock/rooms";
import { mockPackages } from "@/data/mock/packages";
import { mockReviews, mockFAQs, mockAttractions } from "@/data/mock/content";
import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION } from "@/lib/constants";
import { useSiteSettings } from "@/context/SettingsContext";
import { API_BASE_URL } from "@/lib/api";
import type { Room } from "@/types/room";
import type { Package } from "@/types/package";
import type { Review, FAQ, Attraction } from "@/types/media";

// Default amenity icons — admin can toggle which amenities show from backend
const defaultAmenities = [
  { icon: Waves, label: "Infinity Pool", description: "Overlooking the forest canopy" },
  { icon: Utensils, label: "Multi-Cuisine Dining", description: "Authentic flavours, farm-fresh" },
  { icon: Leaf, label: "Nature Spa", description: "Holistic wellness sanctuary" },
  { icon: Wifi, label: "High-Speed Wi-Fi", description: "Across all resort areas" },
  { icon: Flame, label: "Campfire Evenings", description: "Under the open forest sky" },
  { icon: Compass, label: "Nature Activities", description: "Treks, birds & safaris" },
  { icon: TreePine, label: "Nature Walks", description: "Guided forest exploration" },
  { icon: Mountain, label: "Scenic Viewpoints", description: "Mist-covered hill vistas" },
];

// Small reusable section label
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-sans font-medium text-xs uppercase tracking-[0.22em] text-accent mb-3 flex items-center gap-2">
      <span className="inline-block w-6 h-px bg-accent" />
      {children}
    </p>
  );
}

// FAQ accordion item
function FAQItem({ faq, index }: { faq: FAQ; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border border-border rounded-lg overflow-hidden transition-shadow ${open ? "shadow-card" : ""}`}>
      <button
        className="flex items-center justify-between gap-4 w-full px-6 py-5 text-left bg-surface hover:bg-ivory transition-colors"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="font-sans font-medium text-charcoal text-sm leading-relaxed pr-4">{faq.question}</span>
        <span className={`flex-shrink-0 size-6 rounded-full border border-border flex items-center justify-center transition-all ${open ? "bg-primary border-primary rotate-0" : "rotate-0"}`}>
          {open ? <Minus className="size-3 text-white" /> : <Plus className="size-3 text-warm-gray" />}
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5 pt-1 text-sm text-warm-gray leading-relaxed border-t border-border bg-warm-white">
          {faq.answer}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const { settings: globalSettings } = useSiteSettings();
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [packages, setPackages] = useState<Package[]>(mockPackages);
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [faqs, setFaqs] = useState<FAQ[]>(mockFAQs);
  const [attractions, setAttractions] = useState<Attraction[]>(mockAttractions);
  const [galleryImages, setGalleryImages] = useState<Array<{ url: string; alt: string }>>([]);
  const [loading, setLoading] = useState(true);

  const heroTitle = globalSettings.heroTitle || "Where Royalty Meets the Wild";
  const heroSubtitle = globalSettings.heroSubtitle || "A luxurious retreat surrounded by lush forests, misty hills and the untouched beauty of Maredumilli.";
  const heroImage = globalSettings.heroImage || "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=90";
  const siteName = globalSettings.siteName || SITE_NAME;

  // FAQ section settings
  const faqHeading = globalSettings.faqHeading || "Frequently Asked Questions";
  const faqSubheading = globalSettings.faqSubheading || "Support";
  const faqEnabled = globalSettings.faqEnabled !== false;

  // About section from settings
  const aboutTitle = (globalSettings as any).aboutTitle || "A Forest Retreat Like No Other";
  const aboutBody = (globalSettings as any).aboutBody || SITE_DESCRIPTION;
  const aboutImage = (globalSettings as any).aboutImage || "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=85";
  const aboutBadge = (globalSettings as any).aboutBadge || "ABOUT ROYAL GRAND IN";

  const fetchFaqs = async () => {
    try {
      // First try local Next.js API for instant fresh DB data
      let res = await fetch("/api/content?type=faq");
      if (!res.ok) {
        res = await fetch(`${API_BASE_URL}/content?type=faq`);
      }
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const active = data
            .filter((f: any) => f.status !== "inactive")
            .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
          setFaqs(active.length > 0 ? active : data);
        }
      }
    } catch (e) {
      console.warn("Could not fetch FAQs dynamically, keeping defaults", e);
    }
  };

  useEffect(() => {
    async function loadLiveData() {
      try {
        const [roomsRes, pkgsRes, revsRes, attsRes, mediaRes] = await Promise.allSettled([
          fetch("/api/rooms?featured=true").then(async (r) => r.ok ? r : fetch(`${API_BASE_URL}/rooms?featured=true`)),
          fetch("/api/packages?featured=true").then(async (r) => r.ok ? r : fetch(`${API_BASE_URL}/packages?featured=true`)),
          fetch("/api/content?type=review&status=published").then(async (r) => r.ok ? r : fetch(`${API_BASE_URL}/content?type=review`)),
          fetch("/api/content?type=attraction").then(async (r) => r.ok ? r : fetch(`${API_BASE_URL}/content?type=attraction`)),
          fetch("/api/media?category=gallery&limit=8").then(async (r) => r.ok ? r : fetch(`${API_BASE_URL}/media?category=gallery&limit=8`)),
        ]);

        if (roomsRes.status === "fulfilled" && roomsRes.value.ok) {
          const data = await roomsRes.value.json();
          if (Array.isArray(data) && data.length > 0) setRooms(data);
        }
        if (pkgsRes.status === "fulfilled" && pkgsRes.value.ok) {
          const data = await pkgsRes.value.json();
          if (Array.isArray(data) && data.length > 0) setPackages(data);
        }
        if (revsRes.status === "fulfilled" && revsRes.value.ok) {
          const data = await revsRes.value.json();
          if (Array.isArray(data) && data.length > 0) setReviews(data);
        }
        if (attsRes.status === "fulfilled" && attsRes.value.ok) {
          const data = await attsRes.value.json();
          if (Array.isArray(data) && data.length > 0) setAttractions(data);
        }
        if (mediaRes.status === "fulfilled" && mediaRes.value.ok) {
          const data = await mediaRes.value.json();
          if (Array.isArray(data) && data.length > 0) {
            setGalleryImages(data.map((m: any) => ({
              url: m.url || m.secureUrl || m.cloudinaryUrl,
              alt: m.title || m.alt || "Resort gallery",
            })));
          }
        }
      } catch (err) {
        console.error("Error loading homepage data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadLiveData();
    fetchFaqs();

    const handleFaqsUpdated = () => {
      fetchFaqs();
    };
    window.addEventListener("resort-faqs-updated", handleFaqsUpdated);
    return () => {
      window.removeEventListener("resort-faqs-updated", handleFaqsUpdated);
    };
  }, []);


  // Gallery fallback images (if no media library images yet)
  const displayGallery = galleryImages.length > 0 ? galleryImages : [
    { url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80", alt: "Forest valley Maredumilli" },
    { url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&q=80", alt: "Resort infinity pool" },
    { url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80", alt: "Luxury room interior" },
    { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80", alt: "Dining experience" },
    { url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80", alt: "Misty mountain vista" },
    { url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80", alt: "Spa wellness" },
  ];

  const featuredRooms = rooms.slice(0, 3);
  const featuredPackages = packages.slice(0, 3);
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : "4.9";

  return (
    <>
      {/* ══════════════════════════════════════════════════════
          HERO — Cinematic forest backdrop, editorial feel
      ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden" aria-label="Hero section">
        {/* Hero background image — slow Ken Burns zoom */}
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt="Royal Grand IN Resorts — Maredumilli Forest"
            fill
            className="object-cover animate-slow-zoom"
            priority
            sizes="100vw"
          />
          {/* Deep atmospheric gradient overlay — top dark, centre clear, bottom dark */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary-dark/70 via-primary-dark/20 to-primary-dark/75" />
          {/* Subtle vignette */}
          <div className="absolute inset-0 bg-radial-[at_50%_60%] from-transparent via-transparent to-primary-dark/40" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 flex flex-col items-center text-center">
          {/* Location badge */}
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
            <MapPin className="size-3.5 text-accent" aria-hidden="true" />
            <span className="font-sans text-white/90 text-xs font-medium tracking-[0.15em] uppercase">
              Maredumilli • Andhra Pradesh
            </span>
          </div>

          {/* Main headline */}
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-8xl font-light text-white leading-[1.05] mb-6 tracking-tight text-balance">
            {heroTitle}
          </h1>

          {/* Antique gold rule */}
          <div className="w-12 h-px bg-accent mb-6" aria-hidden="true" />

          {/* Sub headline */}
          <p className="font-sans text-white/75 text-base sm:text-lg max-w-2xl leading-relaxed mb-10">
            {heroSubtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <Link
              href="/resort"
              className="px-8 py-3.5 rounded-sm bg-accent hover:bg-accent-dark text-white font-sans font-semibold text-sm tracking-wide transition-all hover:shadow-lg"
            >
              Explore the Resort
            </Link>
            <Link
              href="/rooms"
              className="px-8 py-3.5 rounded-sm bg-white/10 hover:bg-white/20 border border-white/30 text-white font-sans font-semibold text-sm tracking-wide backdrop-blur-sm transition-all"
            >
              View Rooms
            </Link>
          </div>

          {/* Availability search bar */}
          <div className="w-full flex justify-center">
            <AvailabilitySearch variant="hero" />
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40 animate-bounce" aria-hidden="true">
          <ChevronDown className="size-5" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          ABOUT — Editorial two-column with dynamic content
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-warm-white" aria-labelledby="about-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Image with decorative offset border */}
            <div className="relative order-2 lg:order-1">
              <div className="relative aspect-[4/5] rounded-sm overflow-hidden">
                <Image
                  src={aboutImage}
                  alt="Royal Grand IN Resorts natural forest setting"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              {/* Decorative border offset */}
              <div className="absolute -bottom-4 -left-4 w-full h-full border border-accent/30 rounded-sm -z-10" aria-hidden="true" />
              {/* Stat card */}
              <div className="absolute -bottom-6 -right-4 sm:-right-8 bg-primary text-white rounded-sm shadow-panel p-5 hidden sm:block">
                <p className="font-serif text-4xl font-light text-accent leading-none">100%</p>
                <p className="font-sans text-xs text-white/70 mt-1 font-medium">Pure Nature Experience</p>
              </div>
            </div>

            {/* Content */}
            <div className="order-1 lg:order-2">
              <SectionLabel>{aboutBadge}</SectionLabel>
              <h2 id="about-heading" className="font-serif text-4xl sm:text-5xl font-light text-charcoal mb-6 leading-tight">
                {aboutTitle}
              </h2>
              <div className="w-8 h-px bg-accent mb-8" aria-hidden="true" />
              <div
                className="font-sans text-warm-gray leading-relaxed space-y-4 mb-8 text-sm sm:text-base prose-p:text-warm-gray"
                dangerouslySetInnerHTML={{ __html: typeof aboutBody === "string" && aboutBody.includes("<") ? aboutBody : `<p>${aboutBody}</p>` }}
              />
              <ul className="space-y-3 mb-10" aria-label="Resort highlights">
                {[
                  "Luxury accommodations in the heart of nature",
                  "Multi-cuisine dining with local Andhra flavours",
                  "Guided nature walks to Maredumilli waterfalls",
                  "Campfire evenings under the open forest sky",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 font-sans text-charcoal text-sm">
                    <span className="size-5 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5" aria-hidden="true">
                      <Check className="size-2.5 text-accent" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/resort"
                className="inline-flex items-center gap-2 font-sans font-semibold text-sm text-primary hover:text-accent transition-colors group"
                aria-label="Discover more about Royal Grand IN Resorts"
              >
                Discover More
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          ROOMS & SUITES — Dynamic from backend
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-ivory" aria-labelledby="rooms-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-14">
            <div>
              <SectionLabel>Accommodations</SectionLabel>
              <h2 id="rooms-heading" className="font-serif text-4xl sm:text-5xl font-light text-charcoal leading-tight">
                Rooms & Suites
              </h2>
            </div>
            <Link
              href="/rooms"
              className="flex items-center gap-2 font-sans text-sm font-medium text-primary hover:text-accent transition-colors group"
              aria-label="View all rooms and suites"
            >
              View All Rooms
              <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton rounded-lg h-80" aria-hidden="true" />
              ))}
            </div>
          ) : featuredRooms.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredRooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-warm-gray font-sans text-sm">
              Room information coming soon.
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          AMENITIES — Calm, muted dark forest section
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-primary-dark text-white" aria-labelledby="amenities-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <SectionLabel>
              <span className="text-accent/80">What We Offer</span>
            </SectionLabel>
            <h2 id="amenities-heading" className="font-serif text-4xl sm:text-5xl font-light text-white mb-5">
              Resort Amenities
            </h2>
            <div className="section-divider mb-6" aria-hidden="true" />
            <p className="font-sans text-white/55 max-w-lg mx-auto text-sm leading-relaxed">
              Every detail at {siteName} is thoughtfully curated to nourish the body, calm the mind, and elevate the spirit.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {defaultAmenities.map(({ icon: Icon, label, description }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center p-5 rounded-sm bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors group cursor-default"
              >
                <div className="size-10 rounded-full bg-accent/15 group-hover:bg-accent/25 flex items-center justify-center mb-3 transition-colors" aria-hidden="true">
                  <Icon className="size-4 text-accent" />
                </div>
                <h3 className="font-sans font-medium text-white text-xs leading-tight mb-1">{label}</h3>
                <p className="font-sans text-white/40 text-[10px] leading-snug hidden sm:block">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          HOLIDAY PACKAGES — Dynamic from backend
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-warm-white" aria-labelledby="packages-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-14">
            <div>
              <SectionLabel>Curated Experiences</SectionLabel>
              <h2 id="packages-heading" className="font-serif text-4xl sm:text-5xl font-light text-charcoal leading-tight">
                Holiday Packages
              </h2>
            </div>
            <Link
              href="/packages"
              className="flex items-center gap-2 font-sans text-sm font-medium text-primary hover:text-accent transition-colors group"
              aria-label="View all holiday packages"
            >
              All Packages
              <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton rounded-lg h-72" aria-hidden="true" />
              ))}
            </div>
          ) : featuredPackages.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPackages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-warm-gray font-sans text-sm">
              Package information coming soon.
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          VISUAL JOURNEY — Editorial gallery grid
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-ivory" aria-labelledby="gallery-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <SectionLabel>A Visual Journey</SectionLabel>
            <h2 id="gallery-heading" className="font-serif text-4xl sm:text-5xl font-light text-charcoal">
              Through Our Lens
            </h2>
          </div>

          {/* Editorial asymmetric gallery grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 lg:gap-4 auto-rows-[200px] md:auto-rows-[180px]">
            {displayGallery.slice(0, 6).map(({ url, alt }, i) => (
              <div
                key={i}
                className={`relative rounded-sm overflow-hidden group cursor-pointer ${
                  i === 0 ? "col-span-2 row-span-2 md:col-span-1 md:row-span-2" :
                  i === 3 ? "col-span-2 md:col-span-1" : ""
                }`}
              >
                <Image
                  src={url}
                  alt={alt}
                  fill
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
                  sizes="(max-width: 768px) 50vw, 33vw"
                  loading={i === 0 ? "eager" : "lazy"}
                />
                {/* Subtle hover overlay */}
                <div className="absolute inset-0 bg-primary-dark/0 group-hover:bg-primary-dark/15 transition-colors duration-500" aria-hidden="true" />
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-sm border border-primary text-primary hover:bg-primary hover:text-white font-sans text-sm font-semibold transition-all"
              aria-label="View full photo gallery"
            >
              View Full Gallery
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          TESTIMONIALS — Dynamic guest reviews
      ══════════════════════════════════════════════════════ */}
      {reviews.length > 0 && (
        <section className="py-24 lg:py-32 bg-warm-white" aria-labelledby="reviews-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <SectionLabel>Guest Testimonials</SectionLabel>
              <h2 id="reviews-heading" className="font-serif text-4xl sm:text-5xl font-light text-charcoal mb-4">
                What Our Guests Say
              </h2>
              {/* Average rating */}
              <div className="flex items-center justify-center gap-2" aria-label={`Average rating ${avgRating} out of 5`}>
                <div className="flex" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="size-4 fill-accent text-accent" />
                  ))}
                </div>
                <span className="font-sans font-semibold text-charcoal text-sm">{avgRating}</span>
                <span className="font-sans text-warm-gray text-sm">· {reviews.length} reviews</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {reviews.slice(0, 4).map((review) => (
                <article
                  key={review.id}
                  className="bg-surface border border-border rounded-sm p-6 hover:shadow-card-hover transition-shadow"
                >
                  {/* Stars */}
                  <div className="flex mb-4" aria-label={`${review.rating || 5} out of 5 stars`}>
                    {Array.from({ length: review.rating || 5 }).map((_, i) => (
                      <Star key={i} className="size-3.5 fill-accent text-accent" aria-hidden="true" />
                    ))}
                  </div>
                  {review.title && (
                    <h3 className="font-sans font-semibold text-charcoal text-sm mb-2">{review.title}</h3>
                  )}
                  <p className="font-sans text-sm text-warm-gray leading-relaxed mb-5 line-clamp-4">
                    {review.body}
                  </p>
                  {/* Guest info */}
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    {review.customerAvatar ? (
                      <Image
                        src={review.customerAvatar}
                        alt={`${review.customerName} profile photo`}
                        width={32}
                        height={32}
                        className="rounded-full object-cover size-8"
                      />
                    ) : (
                      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold font-sans" aria-hidden="true">
                        {review.customerName?.[0] || "G"}
                      </div>
                    )}
                    <div>
                      <p className="font-sans text-xs font-semibold text-charcoal">{review.customerName}</p>
                      <p className="font-sans text-xs text-warm-gray">
                        {new Date(review.createdAt || Date.now()).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════
          EXPLORE MAREDUMILLI — Nearby attractions from DB
      ══════════════════════════════════════════════════════ */}
      {attractions.length > 0 && (
        <section className="py-24 lg:py-32 bg-primary-dark text-white" aria-labelledby="attractions-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <SectionLabel>
                <span className="text-accent/80">Around the Resort</span>
              </SectionLabel>
              <h2 id="attractions-heading" className="font-serif text-4xl sm:text-5xl font-light text-white mb-4">
                Explore Maredumilli
              </h2>
              <div className="section-divider mb-5" aria-hidden="true" />
              <p className="font-sans text-white/50 max-w-md mx-auto text-sm">
                Step beyond our gates into the pristine forests and waterfalls of Maredumilli.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {attractions.slice(0, 5).map((attraction) => (
                <article
                  key={attraction.id}
                  className="bg-white/[0.05] border border-white/[0.08] rounded-sm p-5 hover:bg-white/[0.09] transition-colors"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="size-3.5 text-accent flex-shrink-0" aria-hidden="true" />
                    <span className="font-sans text-xs text-white/50">{attraction.distance}</span>
                  </div>
                  <h3 className="font-sans font-semibold text-white text-sm mb-2 leading-snug">{attraction.name}</h3>
                  <p className="font-sans text-xs text-white/45 leading-relaxed line-clamp-3">{attraction.description}</p>
                  {attraction.duration && (
                    <p className="font-sans text-xs text-accent/70 font-medium mt-3">{attraction.duration}</p>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════
          FAQ — Smooth accordion from backend
      ══════════════════════════════════════════════════════ */}
      {faqEnabled && faqs.length > 0 && (
        <section className="py-24 lg:py-32 bg-ivory" aria-labelledby="faq-heading">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <SectionLabel>{faqSubheading}</SectionLabel>
              <h2 id="faq-heading" className="font-serif text-4xl sm:text-5xl font-light text-charcoal">
                {faqHeading}
              </h2>
            </div>
            <div className="space-y-3" role="list">
              {faqs.map((faq, index) => (
                <FAQItem key={faq.id} faq={faq} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════
          FINAL CTA — Cinematic escape invitation
      ══════════════════════════════════════════════════════ */}
      <section className="relative py-32 lg:py-44 overflow-hidden" aria-labelledby="cta-heading">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=85"
            alt="Maredumilli forest landscape — your escape awaits"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-primary-dark/82" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionLabel>
            <span className="text-accent/70">Your Perfect Escape Awaits</span>
          </SectionLabel>
          <h2 id="cta-heading" className="font-serif text-4xl sm:text-6xl font-light text-white mb-5 leading-tight">
            Escape to Tranquility
          </h2>
          <div className="section-divider mb-7" aria-hidden="true" />
          <p className="font-sans text-white/60 text-sm sm:text-base max-w-xl mx-auto mb-10 leading-relaxed">
            Create unforgettable memories surrounded by the pristine forests of Maredumilli.
            <em className="text-white/45 not-italic block mt-2 text-sm">{SITE_TAGLINE}</em>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/booking"
              className="px-9 py-4 rounded-sm bg-accent hover:bg-accent-dark text-white font-sans font-semibold text-sm tracking-wide transition-all hover:shadow-lg"
            >
              Book Your Stay
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-9 py-4 rounded-sm bg-white/10 border border-white/25 text-white font-sans font-semibold text-sm tracking-wide hover:bg-white/18 transition-all"
            >
              <Phone className="size-4" aria-hidden="true" />
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
