import Link from "next/link";
import Image from "next/image";
import connectDB from "@/lib/mongodb";
import { BlogPost } from "@/lib/models/Content";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Resort Blog & Travel Guides",
  description: "Read travel tips, nature stories, and guidebooks for your Western Ghats adventure.",
};

export default async function BlogPage() {
  await connectDB();
  const postsDoc = await BlogPost.find({ status: "published" }).sort({ createdAt: -1 });
  const posts = JSON.parse(JSON.stringify(postsDoc));

  return (
    <div className="bg-background min-h-screen">
      <div className="bg-primary-dark text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Blog" }]} variant="dark" className="mb-4" />
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-3">Resort Blog & Stories</h1>
          <p className="text-white/70 max-w-xl">Insights, travel guides, and stories from the forest canopy.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {posts.length === 0 ? (
          <div className="bg-surface rounded-xl border border-border p-12 text-center text-warm-gray">
            <p className="font-semibold text-charcoal">No blog articles published yet</p>
            <p className="text-xs mt-1">Check back soon for new travel stories and guides.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post: any) => (
              <article key={post.id} className="bg-surface rounded-xl border border-border overflow-hidden shadow-card flex flex-col">
                <div className="relative aspect-[16/10]">
                  <Image src={post.featuredImage || "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80"} alt={post.title} fill className="object-cover" />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <span className="text-xs font-semibold text-accent uppercase tracking-wider mb-2">{post.category}</span>
                  <h2 className="font-serif text-xl font-bold text-charcoal mb-2 hover:text-primary transition-colors">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                  <p className="text-sm text-warm-gray line-clamp-3 mb-4 flex-1">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-warm-gray pt-4 border-t border-border">
                    <span>{post.author}</span>
                    <span>{post.readTime} min read</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
