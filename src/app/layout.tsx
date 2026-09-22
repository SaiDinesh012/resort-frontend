import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Vanapriya Resort — Where Wilderness Meets Luxury",
    template: "%s | Vanapriya Resort",
  },
  description:
    "Nestled in the heart of the Western Ghats, Vanapriya Resort offers an unparalleled luxury escape surrounded by pristine forests and breathtaking mountain vistas.",
  keywords: ["luxury resort", "Western Ghats", "Chikmagalur", "forest resort", "nature retreat"],
  authors: [{ name: "Vanapriya Resort" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://vanapriya.com",
    siteName: "Vanapriya Resort",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
