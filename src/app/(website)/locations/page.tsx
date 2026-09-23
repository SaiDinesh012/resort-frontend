import Image from "next/image";
import { MapPin, Clock } from "lucide-react";
import connectDB from "@/lib/mongodb";
import { Attraction } from "@/lib/models/Content";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nearby Attractions & Locations",
  description: "Explore famous peaks, waterfalls, and wildlife sanctuaries near Vanapriya Resort.",
};

export default async function LocationsPage() {
  await connectDB();
  const attractionsDoc = await Attraction.find({}).sort({ createdAt: -1 });
  const attractions = JSON.parse(JSON.stringify(attractionsDoc));
  return (
    <div className="bg-background min-h-screen">
      <div className="bg-primary-dark text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Locations & Sightseeing" }]} variant="dark" className="mb-4" />
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-3">Nearby Attractions</h1>
          <p className="text-white/70 max-w-xl">Discover the wonders of Chikmagalur and the Western Ghats within short driving distances.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attractions.map((att: any) => (
            <div key={att.id} className="bg-surface rounded-xl border border-border overflow-hidden shadow-card">
              <div className="relative aspect-[16/10]">
                <Image src={att.image || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80"} alt={att.name} fill className="object-cover" />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between text-xs text-warm-gray mb-2">
                  <span className="flex items-center gap-1"><MapPin className="size-3.5 text-primary" /> {att.distance}</span>
                  <span className="flex items-center gap-1"><Clock className="size-3.5 text-accent" /> {att.duration}</span>
                </div>
                <h2 className="font-serif text-xl font-bold text-charcoal mb-2">{att.name}</h2>
                <p className="text-sm text-warm-gray leading-relaxed">{att.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
