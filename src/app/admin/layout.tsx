"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setIsAuthenticated(true);
      return;
    }

    let isMounted = true;
    async function verifyAuth() {
      try {
        const res = await fetch("/api/auth");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && isMounted) {
            setIsAuthenticated(true);
            return;
          }
        }
        if (isMounted) {
          setIsAuthenticated(false);
          router.replace("/admin/login");
        }
      } catch (err) {
        if (isMounted) {
          setIsAuthenticated(false);
          router.replace("/admin/login");
        }
      }
    }

    verifyAuth();
    return () => {
      isMounted = false;
    };
  }, [pathname, isLoginPage, router]);

  // If on login page, render clean full-screen login layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Show authenticating state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-primary-dark flex flex-col items-center justify-center p-4">
        <Loader2 className="size-8 text-accent animate-spin mb-3" />
        <p className="font-serif text-white/90 text-sm tracking-wide">
          Verifying Royalgrandin Admin Access...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
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
