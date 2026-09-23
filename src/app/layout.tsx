import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import "@/styles/globals.css";
import connectDB from "@/lib/mongodb";
import Setting from "@/lib/models/Setting";
import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION } from "@/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  let siteName = SITE_NAME;
  let tagline = SITE_TAGLINE;
  let description = SITE_DESCRIPTION;

  try {
    await connectDB();
    const config = await Setting.findOne({ key: "site_config" });
    if (config && config.value) {
      const val = config.value as any;
      siteName = val.siteName || siteName;
      tagline = val.tagline || val.heroSubtitle || tagline;
      description = val.description || description;
    }
  } catch (error) {
    console.warn("Failed to fetch dynamic metadata:", error);
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
