import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Maximize, Users, BedDouble, Star, Check, Wifi, ChevronRight, ArrowLeft } from "lucide-react";
import { mockRooms } from "@/data/mock/rooms";
import { mockReviews } from "@/data/mock/content";
import { AvailabilitySearch } from "@/components/website/AvailabilitySearch";
import { RoomCard } from "@/components/website/RoomCard";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { formatCurrency } from "@/lib/utils";
import type { Metadata } from "next";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return mockRooms.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const room = mockRooms.find((r) => r.slug === params.slug);
  return {
    title: room?.name ?? "Room Details",
    description: room?.description,
  };
}

export default function RoomDetailPage({ params }: Props) {
  const room = mockRooms.find((r) => r.slug === params.slug);
  if (!room) notFound();

  const roomReviews = mockReviews.filter((r) => r.roomId === room.id);
  const similarRooms = mockRooms.filter((r) => r.id !== room.id && r.type !== room.type).slice(0, 3);

  return (
    <div className="bg-background">
      {/* Breadcrumb header */}
      <div className="bg-primary-dark pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[{ label: "Rooms", href: "/rooms" }, { label: room.name }]}
            variant="dark"
            className="mb-4"
          />
          <Link href="/rooms" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors">
            <ArrowLeft className="size-4" /> Back to Rooms
          </Link>
        </div>
      </div>

      {/* Image gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-4 gap-3 mb-10">
          {/* Main image */}
          <div className="col-span-4 md:col-span-2 relative aspect-[4/3] rounded-lg overflow-hidden">
            <Image src={room.images[0]} alt={room.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority />
          </div>
          {/* Thumbnails */}
          <div className="hidden md:grid col-span-2 grid-cols-2 gap-3">
            {room.images.slice(1, 5).map((img, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                <Image src={img} alt={`${room.name} view ${i + 2}`} fill className="object-cover" sizes="25vw" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left: details */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-accent font-medium text-sm uppercase tracking-wider mb-1">{room.type}</p>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">{room.name}</h1>
                {room.view && <p className="text-warm-gray mt-1 flex items-center gap-1.5"><Star className="size-4 text-accent" /> {room.view}</p>}
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-charcoal">{formatCurrency(room.basePrice)}</p>
                <p className="text-warm-gray text-sm">per night + taxes</p>
                <div className="flex items-center gap-1 mt-1 justify-end">
                  <Star className="size-4 fill-accent text-accent" />
                  <span className="font-semibold text-charcoal">{room.rating}</span>
                  <span className="text-warm-gray text-sm">({room.reviewCount} reviews)</span>
                </div>
              </div>
            </div>

            {/* Quick meta */}
            <div className="grid grid-cols-3 gap-4 p-5 bg-surface rounded-lg border border-border mb-8">
              <div className="text-center">
                <Maximize className="size-5 text-primary mx-auto mb-1" />
                <p className="text-xs text-warm-gray">Room Size</p>
                <p className="font-semibold text-charcoal text-sm">{room.size} sq ft</p>
              </div>
              <div className="text-center border-x border-border">
                <Users className="size-5 text-primary mx-auto mb-1" />
                <p className="text-xs text-warm-gray">Max Occupancy</p>
                <p className="font-semibold text-charcoal text-sm">{room.maxOccupancy} guests</p>
              </div>
              <div className="text-center">
                <BedDouble className="size-5 text-primary mx-auto mb-1" />
                <p className="text-xs text-warm-gray">Bed Type</p>
                <p className="font-semibold text-charcoal text-sm">{room.beds}</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="font-serif text-xl font-semibold text-charcoal mb-3">About This Room</h2>
              <p className="text-warm-gray leading-relaxed">{room.longDescription}</p>
            </div>

            {/* Amenities */}
            <div className="mb-8">
              <h2 className="font-serif text-xl font-semibold text-charcoal mb-4">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {room.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-2 text-sm text-charcoal">
                    <Check className="size-4 text-success flex-shrink-0" />
                    {a}
                  </div>
                ))}
              </div>
            </div>

            {/* Cancellation */}
            <div className="mb-8 p-5 bg-surface rounded-lg border border-border">
              <h2 className="font-sans font-semibold text-charcoal text-sm mb-2">Cancellation Policy</h2>
              <p className="text-sm text-warm-gray">Free cancellation up to 7 days before check-in. 50% charge within 7 days. No refund within 48 hours of check-in.</p>
            </div>

            {/* Reviews */}
            {roomReviews.length > 0 && (
              <div className="mb-8">
                <h2 className="font-serif text-xl font-semibold text-charcoal mb-4">Guest Reviews</h2>
                <div className="space-y-5">
                  {roomReviews.map((r) => (
                    <div key={r.id} className="p-5 bg-surface rounded-lg border border-border">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                          {r.customerName[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-charcoal text-sm">{r.customerName}</p>
                          <div className="flex">
                            {Array.from({ length: r.rating }).map((_, i) => (
                              <Star key={i} className="size-3.5 fill-accent text-accent" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="font-medium text-charcoal text-sm mb-1">{r.title}</p>
                      <p className="text-sm text-warm-gray">{r.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: booking widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-surface rounded-lg border border-border p-6 shadow-card">
              <p className="font-serif text-2xl font-bold text-charcoal mb-1">
                {formatCurrency(room.basePrice)}
                <span className="text-sm font-sans font-normal text-warm-gray"> / night</span>
              </p>
              <p className="text-xs text-warm-gray mb-5">+ 12–18% taxes</p>
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-warm-gray mb-1">Check-in</label>
                  <input type="date" className="w-full px-3 py-2 rounded-md border border-border text-sm text-charcoal bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-warm-gray mb-1">Check-out</label>
                  <input type="date" className="w-full px-3 py-2 rounded-md border border-border text-sm text-charcoal bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-warm-gray mb-1">Adults</label>
                    <select className="w-full px-3 py-2 rounded-md border border-border text-sm text-charcoal bg-background focus:outline-none">
                      {[1,2,3,4].map(n => <option key={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-warm-gray mb-1">Children</label>
                    <select className="w-full px-3 py-2 rounded-md border border-border text-sm text-charcoal bg-background focus:outline-none">
                      {[0,1,2,3].map(n => <option key={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              {/* Price breakdown */}
              <div className="space-y-2 py-4 border-t border-border mb-4 text-sm">
                <div className="flex justify-between text-warm-gray">
                  <span>{formatCurrency(room.basePrice)} × 3 nights</span>
                  <span>{formatCurrency(room.basePrice * 3)}</span>
                </div>
                <div className="flex justify-between text-warm-gray">
                  <span>Taxes (12%)</span>
                  <span>{formatCurrency(room.basePrice * 3 * 0.12)}</span>
                </div>
                <div className="flex justify-between font-semibold text-charcoal pt-2 border-t border-border">
                  <span>Total</span>
                  <span>{formatCurrency(room.basePrice * 3 * 1.12)}</span>
                </div>
              </div>
              <Link
                href={`/booking?room=${room.slug}`}
                className="block w-full text-center py-3 rounded-md bg-primary hover:bg-primary-dark text-white font-semibold text-sm transition-colors"
              >
                Book This Room
              </Link>
              <p className="text-xs text-warm-gray text-center mt-3">No payment charged yet</p>
            </div>
          </div>
        </div>

        {/* Similar rooms */}
        {similarRooms.length > 0 && (
          <div className="mt-16">
            <h2 className="font-serif text-2xl font-semibold text-charcoal mb-6">Similar Rooms</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarRooms.map((r) => (
                <RoomCard key={r.id} room={r} compact />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
