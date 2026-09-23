import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Clock, Users, Check, X as XIcon, Star, Calendar } from "lucide-react";
import connectDB from "@/lib/mongodb";
import Package from "@/lib/models/Package";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { formatCurrency } from "@/lib/utils";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const pkg = await Package.findOne({ $or: [{ slug }, { id: slug }] });
  return { title: pkg?.name ?? "Package Details", description: pkg?.description };
}

export default async function PackageDetailPage({ params }: Props) {
  const { slug } = await params;
  await connectDB();
  const pkgDoc = await Package.findOne({ $or: [{ slug }, { id: slug }] });
  if (!pkgDoc) notFound();

  const pkg = JSON.parse(JSON.stringify(pkgDoc));

  return (
    <div className="bg-background">
      {/* Hero */}
      <div className="relative h-72 sm:h-96 lg:h-[480px]">
        <Image
          src={pkg.images?.[0] || "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80"}
          alt={pkg.name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/40 to-charcoal/70" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-10">
            <Breadcrumbs
              items={[{ label: "Packages", href: "/packages" }, { label: pkg.name }]}
              variant="dark"
              className="mb-3"
            />
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm mb-3">
              <Clock className="size-3" /> {pkg.durationNights}N / {pkg.durationDays}D
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white mb-2">{pkg.name}</h1>
            <p className="text-white/80 text-lg">{pkg.tagline}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left: content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Overview */}
            <div>
              <h2 className="font-serif text-2xl font-semibold text-charcoal mb-4">Package Overview</h2>
              <p className="text-warm-gray leading-relaxed">{pkg.longDescription}</p>
              <div className="grid grid-cols-3 gap-4 mt-6 p-5 bg-surface rounded-lg border border-border">
                <div className="text-center">
                  <Clock className="size-5 text-primary mx-auto mb-1" />
                  <p className="text-xs text-warm-gray">Duration</p>
                  <p className="font-semibold text-charcoal text-sm">{pkg.durationNights}N/{pkg.durationDays}D</p>
                </div>
                <div className="text-center border-x border-border">
                  <Users className="size-5 text-primary mx-auto mb-1" />
                  <p className="text-xs text-warm-gray">Max Guests</p>
                  <p className="font-semibold text-charcoal text-sm">{pkg.maxGuests} people</p>
                </div>
                <div className="text-center">
                  <Calendar className="size-5 text-primary mx-auto mb-1" />
                  <p className="text-xs text-warm-gray">Meal Plan</p>
                  <p className="font-semibold text-charcoal text-sm">{pkg.meals?.type || "Full Board"}</p>
                </div>
              </div>
            </div>

            {/* Itinerary */}
            {pkg.itinerary?.length > 0 && (
              <div>
                <h2 className="font-serif text-2xl font-semibold text-charcoal mb-5">Day-by-Day Itinerary</h2>
                <div className="space-y-4">
                  {pkg.itinerary.map((day: any) => (
                    <div key={day.day} className="bg-surface rounded-lg border border-border p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="size-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                          {day.day}
                        </span>
                        <h3 className="font-sans font-semibold text-charcoal">{day.title}</h3>
                      </div>
                      <ul className="space-y-1.5 ml-11">
                        {day.activities?.map((a: string) => (
                          <li key={a} className="flex items-start gap-2 text-sm text-warm-gray">
                            <Check className="size-3.5 text-success flex-shrink-0 mt-0.5" /> {a}
                          </li>
                        ))}
                        {day.meals?.map((m: string) => (
                          <li key={m} className="flex items-start gap-2 text-xs text-accent font-medium">
                            🍽 {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Included / Excluded */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h2 className="font-serif text-xl font-semibold text-charcoal mb-4">What's Included</h2>
                <ul className="space-y-2">
                  {pkg.whatsIncluded?.map((item: string) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-charcoal">
                      <Check className="size-4 text-success flex-shrink-0 mt-0.5" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="font-serif text-xl font-semibold text-charcoal mb-4">What's Excluded</h2>
                <ul className="space-y-2">
                  {pkg.whatsExcluded?.map((item: string) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-warm-gray">
                      <XIcon className="size-4 text-error flex-shrink-0 mt-0.5" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Terms */}
            <div className="bg-surface rounded-lg border border-border p-5">
              <h2 className="font-sans font-semibold text-charcoal mb-3">Terms & Cancellation</h2>
              <p className="text-sm text-warm-gray mb-3">{pkg.cancellationPolicy}</p>
              <ul className="space-y-1.5">
                {pkg.terms?.map((t: string) => (
                  <li key={t} className="text-xs text-warm-gray flex items-start gap-2">
                    <span className="text-accent">•</span> {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: booking widget */}
          <div>
            <div className="sticky top-24 bg-surface rounded-lg border border-border p-6 shadow-card">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-warm-gray uppercase tracking-wider">Price</p>
                <div className="flex items-center gap-1">
                  <Star className="size-4 fill-accent text-accent" />
                  <span className="text-sm font-medium text-charcoal">{pkg.rating || 4.9}</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-charcoal mb-1">{formatCurrency(pkg.price)}</p>
              <p className="text-sm text-warm-gray mb-5">
                per {pkg.priceType === "per_couple" ? "couple" : pkg.priceType === "per_person" ? "person" : "group"} · includes {pkg.meals?.label || "Meals"}
              </p>

              {/* Thumbnail gallery */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {pkg.images?.slice(0, 3).map((img: string, i: number) => (
                  <div key={i} className="aspect-square rounded-md overflow-hidden relative">
                    <Image src={img} alt={`${pkg.name} ${i + 1}`} fill className="object-cover" sizes="100px" />
                  </div>
                ))}
              </div>

              <Link
                href={`/booking?package=${pkg.slug}`}
                className="block w-full text-center py-3 rounded-md bg-primary hover:bg-primary-dark text-white font-semibold text-sm transition-colors mb-3"
              >
                Book This Package
              </Link>
              <Link href="/contact" className="block w-full text-center py-2.5 rounded-md border border-border text-charcoal text-sm font-medium hover:bg-border/30 transition-colors">
                Enquire Now
              </Link>

              {/* Inclusions summary */}
              <div className="mt-5 pt-5 border-t border-border space-y-2">
                {[
                  `${pkg.durationNights} nights in ${pkg.includedRoom}`,
                  pkg.meals?.label,
                  pkg.transport ? "Transfers included" : "Transfers not included",
                ].filter(Boolean).map((item) => (
                  <div key={item} className="flex items-start gap-2 text-xs text-warm-gray">
                    <Check className="size-3.5 text-success flex-shrink-0 mt-0.5" /> {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
