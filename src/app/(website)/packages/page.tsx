"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { PackageCard } from "@/components/website/PackageCard";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import type { Package } from "@/types/package";

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPackages() {
      try {
        setLoading(true);
        const res = await fetch("/api/packages");
        const data = await res.json();
        if (Array.isArray(data)) {
          setPackages(data);
        }
      } catch (err) {
        console.error("Failed to fetch packages", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPackages();
  }, []);

  return (
    <div className="bg-background min-h-screen">
      <div className="bg-primary-dark text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Packages" }]} variant="dark" className="mb-4" />
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-3">Holiday Packages</h1>
          <p className="text-white/70 max-w-xl">
            Thoughtfully curated packages that bring together accommodation, activities, and experiences into one seamless escape.
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center items-center py-20 text-warm-gray gap-2 bg-surface rounded-xl border border-border">
            <Loader2 className="size-5 animate-spin text-primary" /> Loading holiday packages...
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
