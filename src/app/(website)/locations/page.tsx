import Image from "next/image";
import { MapPin, Clock } from "lucide-react";
import { mockAttractions } from "@/data/mock/content";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import type { Metadata } from "next";

import connectDB from "@/lib/mongodb";
import { Attraction } from "@/lib/models/Content";

export const metadata: Metadata = {
  title: "Nearby Attractions & Sightseeing | Royal Grand IN Resorts Maredumilli",
  description: "Explore famous waterfalls, river gorges, and tribal sanctuaries near Royal Grand IN Resorts in Maredumilli.",
};

async function getAttractions() {
  try {
    await connectDB();
    const items = await Attraction.find({}).sort({ createdAt: -1 }).lean();
    if (items && items.length > 0) {
      return JSON.parse(JSON.stringify(items));
    }
  } catch (err) {
    console.error("Error fetching attractions from DB:", err);
  }
  return mockAttractions;
}

export default async function LocationsPage() {
  const attractions = await getAttractions();

  return (
    <div className="bg-background min-h-screen">
      <div className="bg-primary-dark text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Locations & Sightseeing" }]} variant="dark" className="mb-4" />
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-3">Nearby Attractions & Sightseeing</h1>
          <p className="text-white/70 max-w-xl">Discover the pristine waterfalls, jungle river gorges, and tribal sanctuaries of Maredumilli.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attractions.map((att: any) => (
            <div key={att.id || att.name} className="bg-surface rounded-xl border border-border overflow-hidden shadow-card hover:shadow-lg transition-shadow flex flex-col">
              <div className="relative aspect-[16/10]">
                <Image src={att.image || "https://images.unsplash.com/photo-1546587348-d12660c30c50?w=600&q=80"} alt={att.name} fill className="object-cover" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between text-xs text-warm-gray mb-2">
                  <span className="flex items-center gap-1 font-semibold text-primary"><MapPin className="size-3.5 text-primary" /> {att.distance}</span>
                  <span className="flex items-center gap-1 text-accent font-medium"><Clock className="size-3.5 text-accent" /> {att.duration}</span>
                </div>
                <h2 className="font-serif text-xl font-bold text-charcoal mb-2">{att.name}</h2>
                <p className="text-sm text-warm-gray leading-relaxed flex-1">{att.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
