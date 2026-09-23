import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import connectDB from "@/lib/mongodb";
import { BlogPost } from "@/lib/models/Content";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const post = await BlogPost.findOne({ $or: [{ slug }, { id: slug }] });
  return { title: post?.title ?? "Blog Article" };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  await connectDB();
  const postDoc = await BlogPost.findOne({ $or: [{ slug }, { id: slug }] });
  if (!postDoc) notFound();

  const post = JSON.parse(JSON.stringify(postDoc));

  return (
    <div className="bg-background min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Blog", href: "/blog" }, { label: post.title }]} className="mb-6" />
        <span className="text-xs font-semibold text-accent uppercase tracking-wider">{post.category}</span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-charcoal my-4">{post.title}</h1>
        <div className="flex items-center gap-4 text-sm text-warm-gray mb-8">
          <span>By {post.author}</span>
          <span>•</span>
          <span>{post.readTime} min read</span>
        </div>

        <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-8 border border-border shadow-card">
          <Image src={post.featuredImage} alt={post.title} fill className="object-cover" priority />
        </div>

        <div className="prose prose-lg text-warm-gray leading-relaxed space-y-4">
          <p className="text-lg font-medium text-charcoal">{post.excerpt}</p>
          <p>{post.content}</p>
          <p>
            Visiting Chikmagalur offers an extraordinary escape into nature. Whether you are trekking up Mullayanagiri Peak or sitting back on your balcony enjoying freshly brewed Arabica coffee, every moment spent here restores your connection with nature.
          </p>
        </div>
      </div>
    </div>
  );
}
