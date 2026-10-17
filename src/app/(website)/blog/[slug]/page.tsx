import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { mockBlogPosts } from "@/data/mock/content";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import type { Metadata } from "next";

import connectDB from "@/lib/mongodb";
import { BlogPost } from "@/lib/models/Content";

interface Props {
  params: Promise<{ slug: string }> | { slug: string };
}

async function getBlogPostBySlug(slug: string) {
  try {
    await connectDB();
    const post = await BlogPost.findOne({ slug }).lean();
    if (post) {
      return JSON.parse(JSON.stringify(post));
    }
  } catch (err) {
    console.error("Error querying blog post by slug:", err);
  }
  return mockBlogPosts.find((b) => b.slug === slug) || null;
}

export async function generateStaticParams() {
  try {
    await connectDB();
    const posts = await BlogPost.find({}, "slug").lean();
    if (posts && posts.length > 0) {
      return posts.map((b: any) => ({ slug: b.slug }));
    }
  } catch (e) {
    // fallback
  }
  return mockBlogPosts.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await Promise.resolve(params);
  const post = await getBlogPostBySlug(slug);
  return {
    title: post?.title ? `${post.title} | Royal Grand IN Resorts` : "Blog Article",
    description: post?.excerpt || "Travel insights and forest stories from Maredumilli.",
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await Promise.resolve(params);
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="bg-background min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Blog", href: "/blog" }, { label: post.title }]} className="mb-6" />
        <span className="text-xs font-semibold text-accent uppercase tracking-wider">{post.category}</span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-charcoal my-4">{post.title}</h1>
        <div className="flex items-center gap-4 text-sm text-warm-gray mb-8">
          <span>By {post.author || "Royal Grand Editorial"}</span>
          <span>•</span>
          <span>{post.readTime || 6} min read</span>
        </div>

        <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-8 border border-border shadow-card">
          <Image src={post.featuredImage} alt={post.title} fill className="object-cover" priority />
        </div>

        <div className="prose prose-lg text-warm-gray leading-relaxed space-y-4">
          <p className="text-lg font-medium text-charcoal">{post.excerpt}</p>
          <div className="whitespace-pre-line text-sm sm:text-base leading-relaxed text-charcoal/80 space-y-4">
            {post.content}
          </div>
          <div className="p-6 rounded-xl bg-surface border border-border mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-bold text-charcoal text-base">Plan Your Escape to Maredumilli</h3>
              <p className="text-xs text-warm-gray mt-1">Experience luxury villas, waterfall treks, and authentic tribal culinary craft.</p>
            </div>
            <Link href="/booking" className="px-5 py-2.5 rounded bg-primary hover:bg-primary-dark text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm whitespace-nowrap">
              Book Your Stay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
