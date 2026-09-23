"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const session = localStorage.getItem("resortUserSession") || sessionStorage.getItem("resortUserSession");
      if (!session) {
        setIsAuthenticated(false);
        window.location.replace("/login");
        return;
      }
      setIsAuthenticated(true);
    }
  }, []);

  if (isAuthenticated === false || isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-surface rounded-xl border border-border p-12 text-center text-warm-gray flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="font-semibold text-charcoal">Checking admin authorization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-charcoal font-sans flex">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <AdminHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
