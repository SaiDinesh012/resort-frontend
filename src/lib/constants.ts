export const SITE_NAME = "Royal Grand IN Resorts";
export const SITE_TAGLINE = "Stay Once, Carry Memories Forever";
export const SITE_DESCRIPTION =
  "Nestled amidst the lush forests and serene landscapes of Maredumilli, Royal Grand IN Resorts offers an unparalleled luxury escape where royalty meets the wild.";
export const SITE_PHONE = "+91 98765 43210";
export const SITE_EMAIL = "reservations@royalgrandin.com";
export const SITE_ADDRESS = "Maredumilli, East Godavari District, Andhra Pradesh 533288, India";

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Rooms", href: "/rooms" },
  { label: "Packages", href: "/packages" },
  { label: "Experiences", href: "/resort" },
  { label: "Gallery", href: "/gallery" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export const ADMIN_NAV = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: "LayoutDashboard",
  },
  {
    label: "Bookings",
    icon: "CalendarCheck",
    children: [
      { label: "All Bookings", href: "/admin/bookings" },
      { label: "Upcoming", href: "/admin/bookings?status=upcoming" },
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
      { label: "All Packages", href: "/admin/packages" },
      { label: "Activities", href: "/admin/packages/activities" },
      { label: "Meals", href: "/admin/packages/meals" },
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
      { label: "Legal Policies", href: "/admin/legal" },
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
      { label: "Promotions", href: "/admin/marketing/promotions" },
      { label: "Coupons", href: "/admin/marketing/coupons" },
      { label: "UTM Tracking", href: "/admin/marketing/utm" },
    ],
  },
  {
    label: "Analytics",
    icon: "BarChart3",
    children: [
      { label: "Overview", href: "/admin/analytics" },
      { label: "Booking Funnel", href: "/admin/analytics/funnel" },
      { label: "Revenue", href: "/admin/analytics/revenue" },
    ],
  },
  {
    label: "Settings",
    icon: "Settings",
    children: [
      { label: "Resort Details", href: "/admin/settings" },
      { label: "Email", href: "/admin/settings/email" },
      { label: "Payment", href: "/admin/settings/payment" },
      { label: "Analytics", href: "/admin/settings/analytics" },
      { label: "Feature Flags", href: "/admin/settings/features" },
    ],
  },
];

export const ROOM_TYPES = ["Deluxe Room", "Premium Suite", "Jungle Villa", "Honeymoon Cottage", "Family Suite", "Presidential Suite"];
export const AMENITIES = ["WiFi", "Air Conditioning", "Private Pool", "Jacuzzi", "Butler Service", "Mini Bar", "Room Service", "Balcony", "Forest View", "Mountain View", "Garden View", "Fireplace"];
export const BOOKING_STATUSES = ["confirmed", "pending", "cancelled", "completed", "no-show"] as const;
export const PAYMENT_STATUSES = ["paid", "pending", "failed", "refunded", "partial"] as const;
