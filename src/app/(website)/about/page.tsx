"use client";

import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { useSiteSettings } from "@/context/SettingsContext";
import { SITE_NAME, SITE_ADDRESS, SITE_PHONE, SITE_EMAIL } from "@/lib/constants";
import {
  Sparkles,
  Compass,
  Heart,
  ShieldCheck,
  TreePine,
  Coffee,
  Award,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

export default function AboutPage() {
  const { settings } = useSiteSettings();
  const siteName = settings.siteName || SITE_NAME;
  const address = settings.address || SITE_ADDRESS;
  const phone = settings.phone || SITE_PHONE;
  const email = settings.email || SITE_EMAIL;

  const pillars = [
    {
      icon: TreePine,
      title: "Untouched Forest Canopy",
      desc: "Perched high in the Eastern Ghats, our 15-acre sanctuary harmoniously preserves ancient deciduous and bamboo forests, allowing wildlife and serene forest streams to flourish uninterrupted.",
    },
    {
      icon: Coffee,
      title: "Tribal & Forest Gastronomy",
      desc: "Our farm-to-table culinary philosophy celebrates indigenous Maredumilli traditions — from authentic slow-cooked Bamboo Chicken and fragrant herbal rices to organic forest honey and wild spices.",
    },
    {
      icon: Heart,
      title: "Holistic Forest Wellness",
      desc: "Rejuvenate mind and spirit at our Ayurvedic forest sanctuary. Expert therapists curate herbal oil rituals, steam baths, and meditative sound baths amidst nature's morning mist.",
    },
    {
      icon: ShieldCheck,
      title: "Sustainable Stewardship",
      desc: "Committed to 100% eco-conscious hospitality, we operate with zero single-use plastics, solar energy integration, and active employment and cultural empowerment of local tribal communities.",
    },
  ];

  const milestones = [
    { number: "15+", label: "Acres of Protected Forest" },
    { number: "12", label: "Luxury Suites & Private Villas" },
    { number: "100%", label: "Eco-Conscious Architecture" },
    { number: "4.9★", label: "Guest Satisfaction Rating" },
  ];

  return (
    <div className="bg-background min-h-screen">
      {/* ══════════════════════════════════════════════════════
          HERO BANNER
      ══════════════════════════════════════════════════════ */}
      <section className="bg-primary-dark text-white pt-28 pb-20 border-b border-white/[0.08] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Breadcrumbs
            items={[{ label: "About Us" }]}
            variant="dark"
            className="mb-4"
          />
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15">
            <Sparkles className="size-3 text-accent" />
            <span className="font-sans text-xs tracking-wider uppercase text-white/90">
              The Heritage of Maredumilli
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light text-white mb-5 max-w-3xl leading-tight">
            Where Regal Hospitality Meets Untamed Wilderness
          </h1>
          <div className="w-16 h-0.5 bg-accent mb-6" />
          <p className="font-sans text-white/80 max-w-2xl text-sm sm:text-base leading-relaxed">
            Nestled in the mist-laden hills of the Eastern Ghats, {siteName} was conceived as a sanctuary
            of timeless serenity, celebrating the breathtaking natural heritage and indigenous culture of Maredumilli.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          THE STORY & VISION
      ══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center gap-2">
                <span className="w-8 h-px bg-accent" />
                <span className="font-sans text-xs uppercase tracking-widest text-accent font-semibold">
                  Our Origins & Vision
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-4xl text-charcoal font-normal leading-snug">
                Born from a Reverence for Nature and Tribal Culture
              </h2>
              <p className="text-warm-gray text-sm sm:text-base leading-relaxed">
                Maredumilli is renowned for its cascading streams like Jalatarangini and Amruthadhara, dense semi-evergreen
                forests, and vibrant tribal communities. {siteName} was envisioned not merely as a hotel, but as a living
                extension of this pristine ecosystem.
              </p>
              <p className="text-warm-gray text-sm sm:text-base leading-relaxed">
                Every villa and suite is thoughtfully placed to honor the natural contours of the land. We employ local craftsmen,
                sustain organic spice gardens on property, and offer guests rare access to secret waterfall trails led by expert
                tribal naturalists.
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  href="/rooms"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
                >
                  <span>Explore Accommodations</span>
                  <ArrowRight className="size-3.5" />
                </Link>
                <Link
                  href="/resort"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-border text-charcoal hover:bg-background rounded text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  <span>Discover Experiences</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 relative">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border shadow-card">
                <Image
                  src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1000&q=80"
                  alt={`${siteName} Sanctuary`}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-primary text-white p-6 rounded-lg shadow-xl hidden sm:block max-w-xs border border-primary-light/20">
                <Award className="size-6 text-accent mb-2" />
                <p className="font-serif text-lg font-bold">Award-Winning Forest Escape</p>
                <p className="text-white/80 text-xs mt-1">Recognized for authentic tribal ecotourism and sustainable hospitality in Andhra Pradesh.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FOUR PILLARS
      ══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="font-sans text-xs uppercase tracking-widest text-accent font-semibold">
              The Royal Standard
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-normal">
              Four Pillars of Our Forest Experience
            </h2>
            <div className="w-12 h-px bg-accent mx-auto" />
            <p className="text-warm-gray text-sm sm:text-base leading-relaxed">
              Every moment of your stay is curated around authenticity, luxury, sustainability, and harmony with nature.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((p, idx) => (
              <div
                key={idx}
                className="bg-surface rounded-xl border border-border p-6 shadow-xs hover:border-accent/40 hover:shadow-card transition-all group"
              >
                <div className="size-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-colors">
                  <p.icon className="size-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-charcoal mb-2.5">
                  {p.title}
                </h3>
                <p className="text-warm-gray text-xs sm:text-sm leading-relaxed">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          MILESTONES & NUMBERS
      ══════════════════════════════════════════════════════ */}
      <section className="py-16 bg-primary-dark text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {milestones.map((m, idx) => (
              <div key={idx} className="space-y-1">
                <p className="font-serif text-3xl sm:text-5xl font-light text-accent">
                  {m.number}
                </p>
                <p className="font-sans text-xs sm:text-sm text-white/80 font-medium tracking-wide">
                  {m.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          LOCATION & GUEST CONCIERGE CTA
      ══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-background rounded-2xl border border-border p-8 sm:p-12 shadow-card grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="font-sans text-xs uppercase tracking-widest text-accent font-semibold">
                Guest Experience Concierge
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-charcoal font-normal">
                Ready to Experience Maredumilli in Unrivalled Luxury?
              </h2>
              <p className="text-warm-gray text-sm leading-relaxed max-w-2xl">
                Our front desk and travel naturalists are available 24/7 to assist with room selections,
                bespoke dining requests, airport transfers from Rajahmundry, and private waterfall expeditions.
              </p>
              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-charcoal">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <MapPin className="size-4 text-accent" /> {address}
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Phone className="size-4 text-accent" /> {phone}
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Mail className="size-4 text-accent" /> {email}
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
              <Link
                href="/booking"
                className="px-6 py-3.5 bg-primary hover:bg-primary-dark text-white text-center rounded font-semibold text-xs uppercase tracking-wider transition-colors shadow-xs"
              >
                Book Your Stay Now
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3.5 border border-border hover:bg-surface text-charcoal text-center rounded font-semibold text-xs uppercase tracking-wider transition-colors"
              >
                Contact Concierge Desk
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
