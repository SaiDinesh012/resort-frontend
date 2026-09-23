"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  BedDouble,
  Package as PackageIcon,
  Users,
  CreditCard,
  Image as ImageIcon,
  Star,
  FileText,
  Search,
  Megaphone,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  X,
  LogOut,
} from "lucide-react";
import { cn, clearLocalUserData } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";
import { useEffect } from "react";
import { SITE_NAME } from "@/lib/constants";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const iconMap: Record<string, any> = {
  LayoutDashboard,
  CalendarCheck,
  BedDouble,
  Package: PackageIcon,
  Users,
  CreditCard,
  Image: ImageIcon,
  Star,
  FileText,
  Search,
  Megaphone,
  BarChart3,
  Settings,
};

const navItems = [
  { label: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
  {
    label: "Bookings",
    icon: "CalendarCheck",
    children: [
      { label: "All Bookings", href: "/admin/bookings" },
      { label: "Upcoming", href: "/admin/bookings?status=confirmed" },
      { label: "Completed", href: "/admin/bookings?status=completed" },
      { label: "Cancelled", href: "/admin/bookings?status=cancelled" },
      { label: "Refunds", href: "/admin/refunds" },
    ],
  },
  {
    label: "Rooms",
    icon: "BedDouble",
    children: [
      { label: "Room Types", href: "/admin/rooms" },
      { label: "Inventory", href: "/admin/rooms/inventory" },
      { label: "Rates", href: "/admin/rooms/rates" },
      { label: "Amenities", href: "/admin/rooms/amenities" },
    ],
  },
  {
    label: "Packages",
    icon: "Package",
    children: [
      { label: "Packages", href: "/admin/packages" },
      { label: "Activities", href: "/admin/packages#activities" },
      { label: "Meals", href: "/admin/packages#meals" },
    ],
  },
  { label: "Customers", href: "/admin/customers", icon: "Users" },
  { label: "Payments", href: "/admin/payments", icon: "CreditCard" },
  { label: "Media Library", href: "/admin/media", icon: "Image" },
  { label: "Reviews", href: "/admin/reviews", icon: "Star" },
  {
    label: "Content",
    icon: "FileText",
    children: [
      { label: "Pages", href: "/admin/content" },
      { label: "Blog", href: "/admin/content/blog" },
      { label: "FAQs", href: "/admin/content/faqs" },
      { label: "Attractions", href: "/admin/content/attractions" },
    ],
  },
  {
    label: "SEO",
    icon: "Search",
    children: [
      { label: "SEO Pages", href: "/admin/seo" },
      { label: "Slugs", href: "/admin/seo/slugs" },
      { label: "Redirects", href: "/admin/seo/redirects" },
      { label: "Schema", href: "/admin/seo/schema" },
      { label: "Sitemap", href: "/admin/seo/sitemap" },
    ],
  },
  {
    label: "Marketing",
    icon: "Megaphone",
    children: [
      { label: "Campaigns", href: "/admin/marketing" },
      { label: "Promotions", href: "/admin/marketing?tab=promotions" },
      { label: "Coupons", href: "/admin/marketing?tab=coupons" },
      { label: "UTM", href: "/admin/marketing?tab=utm" },
    ],
  },
  {
    label: "Analytics",
    icon: "BarChart3",
    children: [
      { label: "Overview", href: "/admin/analytics" },
      { label: "Funnel", href: "/admin/analytics?tab=funnel" },
      { label: "Revenue", href: "/admin/analytics?tab=revenue" },
    ],
  },
  {
    label: "Settings",
    icon: "Settings",
    children: [
      { label: "Resort Details", href: "/admin/settings" },
      { label: "Email", href: "/admin/settings?tab=email" },
      { label: "Razorpay", href: "/admin/settings?tab=razorpay" },
      { label: "Google Analytics", href: "/admin/settings?tab=ga" },
      { label: "Feature Flags", href: "/admin/settings?tab=features" },
    ],
  },
];

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const [siteConfig, setSiteConfig] = useState({
    siteName: SITE_NAME,
    logoUrl: "",
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/settings?key=site_config`)
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === "object") {
          setSiteConfig({
            siteName: data.siteName || SITE_NAME,
            logoUrl: data.logoUrl || "",
          });
        }
      })
      .catch(console.error);
  }, []);
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Bookings: true,
    Rooms: true,
  });

  const toggleGroup = (groupLabel: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupLabel]: !prev[groupLabel] }));
  };

  const handleLogout = () => {
    clearLocalUserData();
    window.location.replace("/login");
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-charcoal/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 bottom-0 z-50 w-64 bg-primary-dark text-white flex flex-col transition-transform duration-300 lg:translate-x-0 border-r border-white/10 shadow-panel",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-white/10 flex-shrink-0">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="size-8 rounded bg-accent flex items-center justify-center font-serif font-bold text-white text-sm">
              V
            </div>
            <div>
              <span className="font-serif font-bold text-base tracking-wide text-white block leading-none">
                {siteConfig.siteName}
              </span>
              <span className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">
                Admin Console
              </span>
            </div>
          </Link>
          <button onClick={onClose} className="p-1 rounded text-white/60 hover:text-white lg:hidden cursor-pointer">
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 admin-scrollbar">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon];
            const hasChildren = Boolean(item.children && item.children.length > 0);
            const isGroupOpen = openGroups[item.label];

            if (!hasChildren && item.href) {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-white font-semibold"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className={cn("size-4", isActive ? "text-accent" : "text-white/60")} />
                  <span>{item.label}</span>
                </Link>
              );
            }

            return (
              <div key={item.label} className="space-y-1">
                <button
                  onClick={() => toggleGroup(item.label)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="size-4 text-white/60" />
                    <span>{item.label}</span>
                  </div>
                  {isGroupOpen ? (
                    <ChevronDown className="size-4 text-white/40" />
                  ) : (
                    <ChevronRight className="size-4 text-white/40" />
                  )}
                </button>

                {isGroupOpen && item.children && (
                  <div className="pl-9 space-y-1 border-l border-white/10 ml-5">
                    {item.children.map((child) => {
                      const isActive = pathname === child.href;
                      return (
                        <Link
                          key={child.label}
                          href={child.href}
                          className={cn(
                            "block px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                            isActive
                              ? "text-accent font-semibold bg-white/10"
                              : "text-white/60 hover:text-white hover:bg-white/5"
                          )}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* User profile footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between flex-shrink-0 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8 rounded-full bg-accent/20 border border-accent/40 text-accent font-bold text-xs flex items-center justify-center flex-shrink-0">
              AD
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">Admin User</p>
              <p className="text-[10px] text-white/50 truncate">manager@vanapriya.com</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href="/" className="text-xs text-accent hover:underline font-medium">
              Site ↗
            </Link>
            <span className="text-white/20">·</span>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-medium cursor-pointer"
              title="Logout and clear local saved data"
            >
              <LogOut className="size-3" /> Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
