import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Maximize, Users, BedDouble, Star, Check, ArrowLeft } from "lucide-react";
import connectDB from "@/lib/mongodb";
import Room from "@/lib/models/Room";
import { Review } from "@/lib/models/Content";
import { AvailabilitySearch } from "@/components/website/AvailabilitySearch";
import { RoomBookingWidget } from "@/components/website/RoomBookingWidget";
import { RoomCard } from "@/components/website/RoomCard";
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
  const room = await Room.findOne({ $or: [{ slug }, { id: slug }] });
  return {
    title: room?.name ?? "Room Details",
    description: room?.description,
  };
}

export default async function RoomDetailPage({ params }: Props) {
  const { slug } = await params;
  await connectDB();

  const roomDoc = await Room.findOne({ $or: [{ slug }, { id: slug }] });
  if (!roomDoc) notFound();

  const room = JSON.parse(JSON.stringify(roomDoc));
  const roomReviews = JSON.parse(JSON.stringify(await Review.find({ roomId: room.id })));
  const similarRooms = JSON.parse(
    JSON.stringify(await Room.find({ id: { $ne: room.id } }).limit(3))
  );

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
            <Image src={room.images?.[0] || "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80"} alt={room.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority />
          </div>
          {/* Thumbnails */}
          <div className="hidden md:grid col-span-2 grid-cols-2 gap-3">
            {room.images?.slice(1, 5).map((img: string, i: number) => (
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
                  <span className="font-semibold text-charcoal">{room.rating || 4.8}</span>
                  <span className="text-warm-gray text-sm">({room.reviewCount || 0} reviews)</span>
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
              <p className="text-warm-gray leading-relaxed">{room.longDescription || room.description}</p>
            </div>

            {/* Amenities */}
            <div className="mb-8">
              <h2 className="font-serif text-xl font-semibold text-charcoal mb-4">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {room.amenities?.map((a: string) => (
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
                  {roomReviews.map((r: any) => (
                    <div key={r.id} className="p-5 bg-surface rounded-lg border border-border">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                          {r.customerName?.[0] || "G"}
                        </div>
                        <div>
                          <p className="font-semibold text-charcoal text-sm">{r.customerName}</p>
                          <div className="flex">
                            {Array.from({ length: r.rating || 5 }).map((_, i) => (
                              <Star key={i} className="size-3.5 fill-accent text-accent" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="font-serif font-semibold text-charcoal text-sm mb-1">{r.title}</p>
                      <p className="text-warm-gray text-xs leading-relaxed">{r.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Booking widget */}
          <div>
            <RoomBookingWidget itemId={room.id} basePrice={room.basePrice} type="room" />
          </div>
        </div>

        {/* Similar rooms */}
        {similarRooms.length > 0 && (
          <div className="mt-16">
            <h2 className="font-serif text-2xl font-semibold text-charcoal mb-6">Similar Rooms</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarRooms.map((r: any) => (
                <RoomCard key={r.id} room={r} compact />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
