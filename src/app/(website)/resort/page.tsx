import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { SITE_NAME } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Experiences & Activities",
  description: "Discover curated forest activities, wellness rituals, and dining experiences at Vanapriya.",
};

export default function ResortPage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="bg-primary-dark text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Resort Experiences" }]} variant="dark" className="mb-4" />
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-3">Experiences & Resort Life</h1>
          <p className="text-white/70 max-w-xl">
            Immerse yourself in authentic wilderness experiences, holistic wellness, and unforgettable dining.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {[
          {
            title: "Holistic Ayurvedic Spa",
            desc: "Our sanctuary of healing combines ancient Ayurvedic traditions with modern comfort. Certified therapists guide your wellness journey with customized oil massages, herbal steams, and meditative sound baths.",
            image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
          },
          {
            title: "Farm-to-Table Forest Dining",
            desc: "Savour local Malnad cuisine alongside international favorites. Ingredients are harvested daily from our organic kitchen gardens and local high-altitude farms.",
            image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
          },
          {
            title: "Guided Nature & Birding Walks",
            desc: "Wander through pristine shola forests with our resident naturalists. Discover rare orchids, hornbills, flying squirrels, and endemic bird species.",
            image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
          },
        ].map((item, idx) => (
          <div key={item.title} className={`grid md:grid-cols-2 gap-10 items-center ${idx % 2 === 1 ? "md:flex-row-reverse" : ""}`}>
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-border shadow-card">
              <Image src={item.image} alt={item.title} fill className="object-cover" />
            </div>
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal mb-4">{item.title}</h2>
              <p className="text-warm-gray leading-relaxed mb-6">{item.desc}</p>
              <Link href="/booking" className="px-6 py-2.5 bg-primary text-white rounded-md font-semibold text-sm hover:bg-primary-dark transition-colors inline-block">
                Book Experience
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
