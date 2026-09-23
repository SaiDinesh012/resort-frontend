"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Clock, Users, Star, Check } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { Package } from "@/types/package";

interface PackageCardProps {
  pkg: Package;
  className?: string;
}

export function PackageCard({ pkg, className }: PackageCardProps) {
  const searchParams = useSearchParams();
  const queryString = searchParams ? searchParams.toString() : "";
  const bookingUrl = `/booking?package=${pkg.id}${queryString ? '&' + queryString : ''}`;

  return (
    <article
      className={cn(
        "group bg-surface rounded-lg overflow-hidden border border-border hover:border-secondary transition-all duration-300 hover:shadow-card-hover flex flex-col",
        className
      )}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[16/10]">
        <Image
          src={pkg.images[0]}
          alt={pkg.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Duration badge */}
        <div className="absolute top-3 left-3">
          <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-charcoal/70 text-white backdrop-blur-sm">
            <Clock className="size-3" />
            {pkg.durationNights}N / {pkg.durationDays}D
          </span>
        </div>
        {pkg.featured && (
          <div className="absolute top-3 right-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent text-white">
              Popular
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <Star className="size-3.5 fill-accent text-accent" />
          <span className="text-sm font-medium text-charcoal">{pkg.rating}</span>
          <span className="text-xs text-warm-gray">({pkg.reviewCount} reviews)</span>
        </div>

        {/* Title */}
        <h3 className="font-serif text-xl font-semibold text-charcoal mb-1 group-hover:text-primary transition-colors">
          {pkg.name}
        </h3>
        <p className="text-sm text-accent font-medium mb-3">{pkg.tagline}</p>

        <p className="text-sm text-warm-gray leading-relaxed mb-4 line-clamp-2 flex-1">
          {pkg.description}
        </p>

        {/* Highlights */}
        <ul className="space-y-1.5 mb-5">
          {pkg.whatsIncluded.slice(0, 3).map((item) => (
            <li key={item} className="flex items-start gap-2 text-xs text-warm-gray">
              <Check className="size-3.5 text-success flex-shrink-0 mt-0.5" />
              {item}
            </li>
          ))}
        </ul>

        {/* Price + meta */}
        <div className="flex items-end justify-between mb-4 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-warm-gray mb-0.5">Starting from</p>
            <p className="text-2xl font-bold text-charcoal font-sans">
              {formatCurrency(pkg.price)}
            </p>
            <p className="text-xs text-warm-gray">
              per {pkg.priceType === "per_couple" ? "couple" : pkg.priceType === "per_person" ? "person" : "group"} · {pkg.meals.label}
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-warm-gray">
            <Users className="size-3.5" />
            Max {pkg.maxGuests} guests
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <Link
            href={`/packages/${pkg.slug}`}
            className="flex-1 text-center py-2.5 rounded-md border border-primary text-primary text-sm font-medium hover:bg-primary hover:text-white transition-colors"
          >
            View Package
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
