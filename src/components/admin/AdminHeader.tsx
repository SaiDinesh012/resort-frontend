"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Bell, Search, Globe, ChevronDown, LogOut, Settings } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { clearLocalUserData } from "@/lib/utils";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export function AdminHeader({ onToggleSidebar, title, breadcrumbs = [] }: AdminHeaderProps) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleLogout = () => {
    clearLocalUserData();
    window.location.replace("/login");
  };

  return (
    <header className="h-16 bg-surface border-b border-border sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-md text-warm-gray hover:text-charcoal hover:bg-background lg:hidden cursor-pointer"
        >
          <Menu className="size-5" />
        </button>

        <div>
          {breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} className="text-xs mb-0.5" />}
          {title && <h1 className="font-serif text-lg font-bold text-charcoal leading-none">{title}</h1>}
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Global Search */}
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-warm-gray pointer-events-none" />
          <input
            type="text"
            placeholder="Search bookings, rooms, guests..."
            className="w-full pl-9 pr-3 py-1.5 rounded-md border border-border bg-background text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Public Website Preview Link */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark px-3 py-1.5 rounded-md border border-primary/20 hover:bg-primary/5 transition-colors"
        >
          <Globe className="size-3.5" />
          <span>View Site</span>
        </Link>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-md text-warm-gray hover:text-charcoal hover:bg-background relative cursor-pointer"
          >
            <Bell className="size-5" />
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-accent animate-pulse" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-surface rounded-lg border border-border shadow-panel p-4 z-50 animate-slide-up">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-border">
                <h3 className="font-semibold text-charcoal text-xs">Notifications</h3>
                <span className="text-[10px] text-primary font-bold">2 New</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="p-2 rounded bg-background">
                  <p className="font-medium text-charcoal">New Booking #VNP-2024-0001</p>
                  <p className="text-warm-gray text-[11px]">Arjun Sharma booked Premium Forest Suite</p>
                </div>
                <div className="p-2 rounded bg-background">
                  <p className="font-medium text-charcoal">Refund Processed</p>
                  <p className="text-warm-gray text-[11px]">₹17,640 refunded for Rahul Gupta</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-md hover:bg-background transition-colors cursor-pointer"
          >
            <div className="size-8 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center">
              AD
            </div>
            <ChevronDown className="size-4 text-warm-gray hidden sm:block" />
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface rounded-lg border border-border shadow-panel p-1 z-50 animate-slide-up">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-xs font-semibold text-charcoal">Resort Manager</p>
                <p className="text-[10px] text-warm-gray">manager@vanapriya.com</p>
              </div>
              <Link href="/admin/settings" className="flex items-center gap-2 px-3 py-2 text-xs text-charcoal hover:bg-background rounded-md">
                <Settings className="size-3.5 text-warm-gray" /> Settings
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-error hover:bg-red-50 rounded-md cursor-pointer text-left"
              >
                <LogOut className="size-3.5" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
