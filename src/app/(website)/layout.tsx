import { WebsiteHeader } from "@/components/website/WebsiteHeader";
import { WebsiteFooter } from "@/components/website/WebsiteFooter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vanapriya Resort — Where Wilderness Meets Luxury",
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
