import type { Metadata } from "next";
import "@/styles/globals.css";
import { SettingsProvider } from "@/context/SettingsContext";

export const metadata: Metadata = {
  title: {
    default: "Royal Grand IN Resorts | Luxury Resort in Maredumilli, Andhra Pradesh",
    template: "%s | Royal Grand IN Resorts",
  },
  description:
    "Experience unparalleled luxury at Royal Grand IN Resorts, nestled amidst the lush forests and serene landscapes of Maredumilli, Andhra Pradesh. Stay Once, Carry Memories Forever.",
  keywords: ["luxury resort", "Royal Grand IN Resorts", "Maredumilli resort", "Andhra Pradesh resort", "nature retreat", "forest resort booking"],
  authors: [{ name: "Royal Grand IN Resorts" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://royalgrandin.com",
    siteName: "Royal Grand IN Resorts",
    description: "Luxury forest resort in Maredumilli. Stay Once, Carry Memories Forever.",
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
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}
