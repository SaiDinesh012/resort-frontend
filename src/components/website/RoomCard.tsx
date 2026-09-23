"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const queryString = searchParams ? searchParams.toString() : "";
  const bookingUrl = `/booking?room=${room.id}${queryString ? '&' + queryString : ''}`;

  return (
    <article
      className={cn(
        "group bg-surface rounded-lg overflow-hidden border border-border hover:border-secondary transition-all duration-300 hover:shadow-card-hover",
        className
      )}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <Image
          src={room.images[0]}
          alt={room.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Availability chip */}
        <div className="absolute top-3 left-3">
          <span
            className={cn(
              "text-xs font-medium px-2.5 py-1 rounded-full",
              room.status === "available"
                ? "bg-success/90 text-white"
                : "bg-charcoal/70 text-white"
            )}
          >
            {room.status === "available" ? "Available" : room.status.charAt(0).toUpperCase() + room.status.slice(1)}
          </span>
        </div>
        {/* Price overlay */}
        <div className="absolute bottom-0 right-0 bg-gradient-to-tl from-charcoal/70 to-transparent px-4 pt-8 pb-3">
          <p className="text-white text-xs font-medium">From</p>
          <p className="text-white text-lg font-bold leading-none">
            {formatCurrency(room.basePrice)}
          </p>
          <p className="text-white/70 text-xs">per night</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Rating + type */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-warm-gray uppercase tracking-wider">
            {room.type}
          </span>
          <div className="flex items-center gap-1">
            <Star className="size-3.5 fill-accent text-accent" />
            <span className="text-sm font-medium text-charcoal">{room.rating}</span>
            <span className="text-xs text-warm-gray">({room.reviewCount})</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-serif text-lg font-semibold text-charcoal mb-2 group-hover:text-primary transition-colors">
          {room.name}
        </h3>

        {!compact && (
          <p className="text-sm text-warm-gray leading-relaxed mb-4 line-clamp-2">
            {room.description}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-warm-gray mb-4">
          <span className="flex items-center gap-1">
            <Users className="size-3.5" />
            Up to {room.maxOccupancy} guests
          </span>
          <span className="flex items-center gap-1">
            <Maximize className="size-3.5" />
            {room.size} sq ft
          </span>
        </div>

        {/* Amenity chips */}
        {!compact && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {room.amenities.slice(0, 4).map((a) => (
              <span
                key={a}
                className="flex items-center gap-1 text-xs px-2 py-0.5 bg-background rounded text-warm-gray border border-border"
              >
                {amenityIcons[a] ?? null}
                {a}
              </span>
            ))}
            {room.amenities.length > 4 && (
              <span className="text-xs px-2 py-0.5 bg-background rounded text-warm-gray border border-border">
                +{room.amenities.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/rooms/${room.slug}`}
            className="flex-1 text-center py-2.5 rounded-md border border-primary text-primary text-sm font-medium hover:bg-primary hover:text-white transition-colors"
          >
            View Details
          </Link>
          <Link
            href={bookingUrl}
            className="flex-1 text-center py-2.5 rounded-md bg-primary hover:bg-primary-dark text-white text-sm font-medium transition-colors"
          >
            Book Now
          </Link>
        </div>
      </div>
    </article>
  );
}
