import Link from "next/link";
import Image from "next/image";
import { Clock, Users, Star, Check } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { Package } from "@/types/package";

interface PackageCardProps {
  pkg: Package;
  className?: string;
}

export function PackageCard({ pkg, className }: PackageCardProps) {
  return (
    <article
      className={cn(
        "group bg-surface rounded-2xl overflow-hidden border border-border luxury-card flex flex-col",
        className
      )}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[16/10]">
        <Image
          src={pkg.images[0]}
          alt={pkg.name}
          fill
          className="object-cover group-hover:scale-[1.045] transition-transform duration-700 ease-out"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/70 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none" />

        {/* Duration badge */}
        <div className="absolute top-3 left-3">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-primary-dark/85 text-white backdrop-blur-md border border-white/20">
            <Clock className="size-3 text-accent" />
            {pkg.durationNights}N / {pkg.durationDays}D
          </span>
        </div>
        {pkg.featured && (
          <div className="absolute top-3 right-3">
            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-accent text-primary-dark shadow-sm">
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          <Star className="size-3.5 fill-accent text-accent" />
          <span className="text-xs font-semibold text-charcoal">{pkg.rating}</span>
          <span className="text-[11px] text-warm-gray">({pkg.reviewCount} reviews)</span>
        </div>

        {/* Title */}
        <h3 className="font-serif text-2xl font-light text-charcoal mb-1 group-hover:text-primary transition-colors leading-tight">
          {pkg.name}
        </h3>
        <p className="text-xs text-accent-dark font-medium mb-3">{pkg.tagline}</p>

        {/* Hairline gold line */}
        <div className="hairline-gold mb-3.5" />

        <p className="text-xs text-warm-gray leading-relaxed mb-4 line-clamp-2 flex-1">
          {pkg.description}
        </p>

        {/* Highlights */}
        <ul className="space-y-1.5 mb-5">
          {pkg.whatsIncluded.slice(0, 3).map((item) => (
            <li key={item} className="flex items-start gap-2 text-xs text-warm-gray">
              <Check className="size-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {/* Price + meta */}
        <div className="flex items-end justify-between mb-5 pt-4 border-t border-border/70">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-warm-gray font-semibold mb-0.5">Starting from</p>
            <p className="text-2xl font-bold text-charcoal font-serif leading-none">
              {formatCurrency(pkg.price)}
            </p>
            <p className="text-[11px] text-warm-gray mt-1">
              per {pkg.priceType === "per_couple" ? "couple" : pkg.priceType === "per_person" ? "person" : "group"} · {pkg.meals.label}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-warm-gray">
            <Users className="size-3.5 text-accent" />
            Max {pkg.maxGuests} guests
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2.5 mt-auto">
          <Link
            href={`/packages/${pkg.slug}`}
            className="flex-1 text-center py-2.5 rounded-full border border-primary/30 text-primary hover:border-primary text-xs font-semibold uppercase tracking-wider hover:bg-primary/5 transition-all duration-300"
          >
            Details
          </Link>
          <Link
            href={`/booking?package=${pkg.slug}`}
            className="flex-1 text-center py-2.5 rounded-full bg-primary hover:bg-primary-dark text-white text-xs font-semibold uppercase tracking-wider shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Book Retreat
          </Link>
        </div>
      </div>
    </article>
  );
}
