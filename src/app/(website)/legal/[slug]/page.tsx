import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { SITE_NAME, SITE_EMAIL, SITE_PHONE } from "@/lib/constants";
import connectDB from "@/lib/mongodb";
import LegalPage from "@/lib/models/LegalPage";
import { initialLegalPolicies } from "@/data/mock/legal";
import { ShieldCheck, FileText, ArrowLeft, Mail, Phone, Calendar, CheckCircle } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return [
    { slug: "privacy-policy" },
    { slug: "terms-and-conditions" },
    { slug: "cancellation-policy" },
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const policy = initialLegalPolicies.find((p) => p.slug === slug);
  const title = policy?.title || "Legal Policy";
  return {
    title: `${title} | ${SITE_NAME}`,
    description: policy?.subtitle || `Official policy guidelines for ${SITE_NAME}`,
  };
}

async function getLegalDoc(slug: string) {
  try {
    await connectDB();
    let doc = await LegalPage.findOne({ slug });
    if (!doc) {
      const fallback = initialLegalPolicies.find((p) => p.slug === slug);
      if (fallback) {
        doc = await LegalPage.create(fallback);
      }
    }
    return doc ? JSON.parse(JSON.stringify(doc)) : null;
  } catch (err) {
    console.error("Error retrieving legal policy doc:", err);
    return initialLegalPolicies.find((p) => p.slug === slug) || null;
  }
}

export default async function LegalPolicyPage({ params }: Props) {
  const { slug } = await params;
  const page = await getLegalDoc(slug);

  if (!page) {
    notFound();
  }

  const navLinks = [
    { slug: "privacy-policy", label: "Privacy Policy" },
    { slug: "terms-and-conditions", label: "Terms & Conditions" },
    { slug: "cancellation-policy", label: "Cancellation Policy" },
  ];

  return (
    <div className="bg-background min-h-screen">
      {/* ══════════════════════════════════════════════════════
          HERO HEADER — Deep Forest Green
      ══════════════════════════════════════════════════════ */}
      <div className="bg-primary-dark text-white pt-28 pb-14 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[{ label: "Legal & Policies", href: "/legal/privacy-policy" }, { label: page.title }]}
            variant="dark"
            className="mb-4"
          />
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15">
            <ShieldCheck className="size-3 text-accent" />
            <span className="font-sans text-xs tracking-wider uppercase text-white/90">
              Official Resort Guidelines
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-light text-white mb-3">
            {page.title}
          </h1>
          <div className="w-12 h-px bg-accent mb-4" />
          <div className="flex flex-wrap items-center gap-4 text-xs font-sans text-white/70">
            {page.subtitle && <span>{page.subtitle}</span>}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-white/10 text-white/90">
              <Calendar className="size-3 text-accent" />
              Effective: {page.lastUpdated || "October 2026"}
            </span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          CONTENT GRID
      ══════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* SIDEBAR NAVIGATION */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-surface rounded-sm border border-border p-5 shadow-2xs sticky top-28">
              <h2 className="font-sans font-semibold text-charcoal text-xs uppercase tracking-wider mb-4 pb-3 border-b border-border">
                Legal Documents
              </h2>
              <nav className="space-y-1.5" aria-label="Legal policy pages">
                {navLinks.map((item) => {
                  const isActive = item.slug === slug;
                  return (
                    <Link
                      key={item.slug}
                      href={`/legal/${item.slug}`}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-sm text-xs font-semibold tracking-wide transition-colors ${
                        isActive
                          ? "bg-primary text-white"
                          : "text-warm-gray hover:text-charcoal hover:bg-warm-white"
                      }`}
                    >
                      <span>{item.label}</span>
                      {isActive && <CheckCircle className="size-3.5 text-accent" />}
                    </Link>
                  );
                })}
              </nav>

              {/* Concierge box */}
              <div className="mt-8 pt-6 border-t border-border">
                <h3 className="font-sans font-semibold text-charcoal text-xs uppercase tracking-wider mb-2">
                  Need Clarification?
                </h3>
                <p className="font-sans text-xs text-warm-gray leading-relaxed mb-4">
                  For reservation questions or specific policy exceptions, our guest relations desk is at your service.
                </p>
                <div className="space-y-2 text-xs">
                  <a
                    href={`mailto:${SITE_EMAIL}`}
                    className="flex items-center gap-2 text-primary font-medium hover:underline"
                  >
                    <Mail className="size-3.5 text-accent" />
                    <span>{SITE_EMAIL}</span>
                  </a>
                  <a
                    href={`tel:${SITE_PHONE}`}
                    className="flex items-center gap-2 text-primary font-medium hover:underline"
                  >
                    <Phone className="size-3.5 text-accent" />
                    <span>{SITE_PHONE}</span>
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN DOCUMENT ARTICLE */}
          <article className="lg:col-span-8 bg-surface rounded-sm border border-border p-8 sm:p-12 shadow-xs">
            <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-charcoal space-y-6">
              {page.content.split("\n\n").map((block: string, i: number) => {
                if (block.startsWith("## ")) {
                  return (
                    <h2
                      key={i}
                      className="font-serif text-2xl font-light text-charcoal pt-4 pb-2 border-b border-border/80 text-primary-dark"
                    >
                      {block.replace("## ", "")}
                    </h2>
                  );
                }
                if (block.startsWith("- ")) {
                  const items = block.split("\n").filter((l) => l.trim().startsWith("- "));
                  return (
                    <ul key={i} className="space-y-2 my-3 pl-4 list-disc text-warm-gray">
                      {items.map((item, idx) => (
                        <li key={idx} className="leading-relaxed">
                          <span
                            dangerouslySetInnerHTML={{
                              __html: item
                                .replace(/^- /, "")
                                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-charcoal font-semibold">$1</strong>'),
                            }}
                          />
                        </li>
                      ))}
                    </ul>
                  );
                }
                return (
                  <p
                    key={i}
                    className="text-warm-gray leading-relaxed font-sans"
                    dangerouslySetInnerHTML={{
                      __html: block.replace(
                        /\*\*(.*?)\*\*/g,
                        '<strong class="text-charcoal font-semibold">$1</strong>'
                      ),
                    }}
                  />
                );
              })}
            </div>

            <div className="mt-12 pt-6 border-t border-border flex items-center justify-between text-xs text-warm-gray">
              <span>Published by Royal Grand IN Resorts Legal & Concierge</span>
              <Link href="/" className="inline-flex items-center gap-1 text-primary hover:text-accent font-semibold">
                <ArrowLeft className="size-3" />
                <span>Return to Homepage</span>
              </Link>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
