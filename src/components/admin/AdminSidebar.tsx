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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE_NAME, SITE_EMAIL } from "@/lib/constants";
import { useSiteSettings } from "@/context/SettingsContext";

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
      { label: "Refunds & Cancellations", href: "/admin/bookings?status=cancelled" },
    ],
  },
  {
    label: "Rooms",
    icon: "BedDouble",
    children: [
      { label: "Room Types", href: "/admin/rooms" },
      { label: "Inventory", href: "/admin/rooms/inventory" },
    ],
  },
  {
    label: "Packages",
    icon: "Package",
    children: [
      { label: "Packages", href: "/admin/packages" },
      { label: "Experiences", href: "/admin/content?tab=experiences" },
    ],
  },
  { label: "Customers", href: "/admin/customers", icon: "Users" },
  { label: "Payments", href: "/admin/payments", icon: "CreditCard" },
  { label: "Media Library", href: "/admin/media", icon: "Image" },
  { label: "Reviews & Testimonials", href: "/admin/reviews", icon: "Star" },
  {
    label: "Content",
    icon: "FileText",
    children: [
      { label: "Experiences", href: "/admin/content?tab=experiences" },
      { label: "Guest Inquiries", href: "/admin/content?tab=inquiries" },
      { label: "Blog & Stories", href: "/admin/content?tab=blog" },
      { label: "FAQs Studio", href: "/admin/content/faqs" },
      { label: "Nearby Attractions", href: "/admin/content?tab=attractions" },
      { label: "Legal Policies", href: "/admin/legal" },
    ],
  },
  {
    label: "SEO",
    icon: "Search",
    children: [
      { label: "SEO Settings", href: "/admin/seo" },
    ],
  },
  {
    label: "Marketing",
    icon: "Megaphone",
    children: [
      { label: "Campaigns", href: "/admin/marketing" },
      { label: "Subscribers & Newsletter", href: "/admin/subscriptions" },
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
      { label: "Footer & Social Media", href: "/admin/settings?tab=footer" },
      { label: "Email", href: "/admin/settings?tab=email" },
      { label: "Razorpay", href: "/admin/settings?tab=razorpay" },
      { label: "Google Analytics", href: "/admin/settings?tab=ga" },
      { label: "Feature Flags", href: "/admin/settings?tab=features" },
    ],
  },
];

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { settings } = useSiteSettings();
  const siteName = settings.siteName || SITE_NAME;
  const logoUrl = settings.logoUrl;
  const email = settings.email || SITE_EMAIL;
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Bookings: true,
    Rooms: true,
  });

  const toggleGroup = (groupLabel: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupLabel]: !prev[groupLabel] }));
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
            {logoUrl ? (
              <div className="relative h-8 w-auto min-w-[32px] max-w-[100px] flex items-center justify-center">
                <img
                  src={logoUrl}
                  alt={siteName}
                  className="max-h-8 max-w-full object-contain rounded"
                />
              </div>
            ) : (
              <div className="size-8 rounded bg-accent flex items-center justify-center font-serif font-bold text-white text-sm">
                {siteName ? siteName.charAt(0).toUpperCase() : "R"}
              </div>
            )}
            <div>
              <span className="font-serif font-bold text-base tracking-wide text-white block leading-none">
                {siteName}
              </span>
              <span className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">
                Admin Console
              </span>
            </div>
          </Link>
          <button onClick={onClose} className="p-1 rounded text-white/60 hover:text-white lg:hidden">
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
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
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
        <div className="p-4 border-t border-white/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-full bg-accent/20 border border-accent/40 text-accent font-bold text-xs flex items-center justify-center">
              AD
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Admin User</p>
              <p className="text-[10px] text-white/50">{email}</p>
            </div>
          </div>
          <Link href="/" className="text-xs text-accent hover:underline font-medium">
            Website ↗
          </Link>
        </div>
      </aside>
    </>
  );
}
