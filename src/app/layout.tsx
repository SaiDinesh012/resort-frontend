import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import "@/styles/globals.css";
import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION } from "@/lib/constants";
import { API_BASE_URL } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  let siteName = SITE_NAME;
  let tagline = SITE_TAGLINE;
  let description = SITE_DESCRIPTION;

  try {
    if (API_BASE_URL && API_BASE_URL.startsWith("http")) {
      const res = await fetch(`${API_BASE_URL}/settings?key=site_config`, {
        next: { revalidate: 60 },
      });
      if (res.ok) {
        const val = await res.json();
        if (val) {
          siteName = val.siteName || siteName;
          tagline = val.tagline || val.heroSubtitle || tagline;
          description = val.description || description;
        }
      }
    }
  } catch (error) {
    // Fallback to default constants
  }

  return {
    title: {
      default: `${siteName} — ${tagline}`,
      template: `%s | ${siteName}`,
    },
    description: description,
    keywords: ["luxury resort", "vacation", "nature retreat"],
    authors: [{ name: siteName }],
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: siteName,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
