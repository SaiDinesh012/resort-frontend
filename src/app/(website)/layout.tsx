import { WebsiteHeader } from "@/components/website/WebsiteHeader";
import { WebsiteFooter } from "@/components/website/WebsiteFooter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Royal Grand IN Resorts | Maredumilli, Andhra Pradesh",
  description: "Luxury forest resort in Maredumilli, Andhra Pradesh. Stay Once, Carry Memories Forever. Book rooms, packages and experiences at Royal Grand IN Resorts.",
};

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <WebsiteHeader />
      <main className="flex-1">{children}</main>
      <WebsiteFooter />
    </div>
  );
}
