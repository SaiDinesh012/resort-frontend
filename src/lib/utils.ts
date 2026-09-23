import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  });
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function calculateNights(checkIn: string, checkOut: string): number {
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  return Math.max(0, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "…";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? singular + "s");
}

/**
 * Completely removes all client-side stored session, user tokens,
 * localStorage, sessionStorage, and cookies upon logout.
 */
export function clearLocalUserData() {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem("resortUserSession");
    localStorage.clear();
  } catch (e) {
    console.error("Error clearing localStorage", e);
  }

  try {
    sessionStorage.removeItem("resortUserSession");
    sessionStorage.clear();
  } catch (e) {
    console.error("Error clearing sessionStorage", e);
  }

  try {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
      if (name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
      }
    }
  } catch (e) {
    console.error("Error clearing cookies", e);
  }

  try {
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("resort-auth-change"));
  } catch (e) {
    console.error("Error dispatching auth events", e);
  }
}

export const UNSPLASH_RESORT = "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80";
export const UNSPLASH_POOL = "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80";
export const UNSPLASH_ROOM1 = "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80";
export const UNSPLASH_ROOM2 = "https://images.unsplash.com/photo-1560347876-aeef00ee58a1?w=800&q=80";
export const UNSPLASH_ROOM3 = "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80";
export const UNSPLASH_ROOM4 = "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80";
export const UNSPLASH_PACKAGE1 = "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80";
export const UNSPLASH_PACKAGE2 = "https://images.unsplash.com/photo-1525543907670-e66477e39090?w=800&q=80";
export const UNSPLASH_BEACH = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80";
export const UNSPLASH_SPA = "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80";
export const UNSPLASH_DINING = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80";
export const UNSPLASH_AVATAR1 = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80";
export const UNSPLASH_AVATAR2 = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80";
export const UNSPLASH_AVATAR3 = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80";
