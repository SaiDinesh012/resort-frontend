import Link from "next/link";
import Image from "next/image";
import { Users, Maximize, Star, Wifi, Waves } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { Room } from "@/types/room";

interface RoomCardProps {
  room: Room;
  className?: string;
  compact?: boolean;
}

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="size-3.5" />,
  "Private Pool": <Waves className="size-3.5" />,
  "Private Plunge Pool": <Waves className="size-3.5" />,
};

export function RoomCard({ room, className, compact = false }: RoomCardProps) {
  const fallbackImage = "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80";
  return (
    <article
      className={cn(
        "group bg-surface rounded-2xl overflow-hidden border border-border luxury-card",
        className
      )}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <Image
          src={room.images?.[0] || fallbackImage}
          alt={`${room.name} — Royalgrandin Resort`}
          fill
          className="object-cover group-hover:scale-[1.045] transition-transform duration-700 ease-out"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/80 via-transparent to-black/20 opacity-40 group-hover:opacity-65 transition-opacity duration-500 pointer-events-none" />

        {/* Availability chip */}
        <div className="absolute top-3 left-3">
          <span
            className={cn(
              "text-[10px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full backdrop-blur-md border border-white/20",
              room.status === "available"
                ? "bg-emerald-600/90 text-white"
                : "bg-charcoal/80 text-white"
            )}
          >
            {room.status === "available" ? "Available" : room.status.charAt(0).toUpperCase() + room.status.slice(1)}
          </span>
        </div>
        {/* Price overlay */}
        <div className="absolute bottom-0 right-0 bg-gradient-to-tl from-primary-dark/90 via-primary-dark/60 to-transparent px-5 pt-8 pb-3.5 text-right">
          <p className="text-white/80 text-[10px] tracking-wider uppercase font-semibold">From</p>
          <p className="text-white text-xl font-bold leading-none font-serif mt-0.5">
            {formatCurrency(room.basePrice)}
          </p>
          <p className="text-white/70 text-[10px] mt-0.5">per night</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Rating + type */}
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] font-semibold text-accent-dark uppercase tracking-widest">
            {room.type}
          </span>
          <div className="flex items-center gap-1">
            <Star className="size-3.5 fill-accent text-accent" />
            <span className="text-xs font-semibold text-charcoal">{room.rating}</span>
            <span className="text-[11px] text-warm-gray">({room.reviewCount})</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-serif text-2xl font-light text-charcoal mb-2 group-hover:text-primary transition-colors leading-tight">
          {room.name}
        </h3>

        {/* Hairline gold rule that expands on hover */}
        <div className="hairline-gold mb-3.5" />

        {!compact && (
          <p className="text-xs text-warm-gray leading-relaxed mb-4 line-clamp-2">
            {room.description}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-warm-gray mb-4 pb-3 border-b border-border/70">
          <span className="flex items-center gap-1.5">
            <Users className="size-3.5 text-accent" />
            Up to {room.maxOccupancy} guests
          </span>
          <span className="flex items-center gap-1.5">
            <Maximize className="size-3.5 text-accent" />
            {room.size} sq ft
          </span>
        </div>

        {/* Amenity chips */}
        {!compact && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {room.amenities.slice(0, 4).map((a) => (
              <span
                key={a}
                className="flex items-center gap-1 text-[11px] px-2.5 py-1 bg-background rounded-full text-warm-gray border border-border"
              >
                {amenityIcons[a] ?? null}
                {a}
              </span>
            ))}
            {room.amenities.length > 4 && (
              <span className="text-[11px] px-2.5 py-1 bg-background rounded-full text-warm-gray border border-border">
                +{room.amenities.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2.5">
          <Link
            href={`/rooms/${room.slug}`}
            className="flex-1 text-center py-2.5 rounded-full border border-primary/30 text-primary hover:border-primary font-sans text-xs font-semibold uppercase tracking-wider hover:bg-primary/5 transition-all duration-300"
          >
            Explore
          </Link>
          <Link
            href={`/booking?room=${room.slug}`}
            className="flex-1 text-center py-2.5 rounded-full bg-primary hover:bg-primary-dark text-white font-sans text-xs font-semibold uppercase tracking-wider shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Reserve
          </Link>
        </div>
      </div>
    </article>
  );
}
