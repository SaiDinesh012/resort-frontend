export interface LegalPolicyData {
  slug: string;
  title: string;
  subtitle: string;
  content: string;
  lastUpdated: string;
  status: "published" | "draft";
  order: number;
}

export const initialLegalPolicies: LegalPolicyData[] = [
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    subtitle: "How Royal Grand IN Resorts protects and respects your personal privacy",
    lastUpdated: "October 2026",
    status: "published",
    order: 1,
    content: `## 1. Introduction
At **Royal Grand IN Resorts** (Maredumilli, Andhra Pradesh), we hold the privacy and trust of our guests in the highest regard. This Privacy Policy details the types of information we collect when you make reservations, visit our website, or reside at our sanctuary in Maredumilli, and how we handle and protect that information.

## 2. Information We Collect
To provide a bespoke luxury retreat experience, we collect information including:
- **Contact Details:** Full name, phone number, email address, and residential address.
- **Reservation Details:** Check-in and check-out dates, room or suite selections, number of accompanying adults and children, and special dietary or wellness preferences.
- **Government Identification:** Valid identification (Aadhaar, Passport, Voter ID, or Driving License) as mandated by Indian hospitality regulations upon arrival.
- **Payment Information:** Transaction references processed via authorized, PCI-DSS compliant payment gateways. We do not store raw credit card numbers or banking passwords on our servers.

## 3. How We Use Your Information
Your information is utilized solely to:
- Confirm, manage, and facilitate your accommodations and resort experiences.
- Customize your dining, nature excursions, and wellness rituals.
- Send booking confirmations, itineraries, and concierge arrival assistance.
- Comply with applicable local and national statutory legal obligations.

## 4. Data Protection & Confidentiality
We maintain stringent technical, operational, and organizational security protocols to safeguard your personal data against unauthorized access, loss, or misuse. We strictly adhere to a **no-third-party sale** policy; your data is never rented or traded for commercial gain.

## 5. Contact the Privacy Concierge
For inquiries or to request updates or deletion of your stored records, please reach out directly:
- **Email:** reservations@royalgrandin.com
- **Phone:** +91 98765 43210
- **Address:** Royal Grand IN Resorts, Maredumilli, East Godavari District, Andhra Pradesh 533288, India`,
  },
  {
    slug: "terms-and-conditions",
    title: "Terms & Conditions",
    subtitle: "General terms of residency, booking guidelines, and resort policies",
    lastUpdated: "October 2026",
    status: "published",
    order: 2,
    content: `## 1. Booking & Reservation Policy
- All bookings are confirmed upon receipt of valid advance payment or authorized deposit via our official booking portal.
- Rates quoted are in Indian Rupees (INR) and are subject to applicable government Goods and Services Tax (GST).
- The maximum occupancy limits per room and suite must be honored as specified at the time of reservation.

## 2. Check-in & Check-out Timings
- **Check-in Time:** 02:00 PM onwards. Early check-in is subject to room readiness and prior confirmation by the concierge desk.
- **Check-out Time:** 11:00 AM. Late check-out requests must be coordinated with the front desk and may attract additional hourly tariff.
- All arriving adult guests must present original government-recognized photo identification upon check-in.

## 3. Nature Sanctuary & Forest Conduct
Royal Grand IN Resorts is located in the pristine biodiversity belt of Maredumilli. To preserve this sanctuary for all:
- **Quiet Hours:** In accordance with forest conservation ethics, outdoor music and amplified sound are strictly restricted after 10:00 PM.
- **Flora & Fauna:** Guests are strictly prohibited from disturbing wildlife, plucking rare flora, or littering in forest trails and waterfall areas.
- **Smoking & Fire Safety:** Open fires are permitted only in designated campfire pits supervised by resort naturalists. Smoking inside enclosed rooms and villas is strictly prohibited.

## 4. Liability & Personal Valuables
- While 24/7 security is maintained across resort premises, guests are encouraged to utilize in-room electronic safes for valuable personal items.
- The resort is not liable for loss or damage to personal belongings unattended in common areas or during off-property forest treks.

## 5. Jurisdiction
These Terms and Conditions shall be governed by and construed in accordance with the laws of India, subject to the jurisdiction of courts in East Godavari District, Andhra Pradesh.`,
  },
  {
    slug: "cancellation-policy",
    title: "Cancellation & Refund Policy",
    subtitle: "Fair terms for reservation cancellations, date modifications, and refunds",
    lastUpdated: "October 2026",
    status: "published",
    order: 3,
    content: `## 1. Standard Cancellation Timeline
We understand that travel plans may change due to unforeseen circumstances. Our cancellation policy is designed to be fair to our guests while accounting for the boutique, limited-inventory nature of our forest resort:

- **7 or More Days Prior to Check-in:** 100% refund of the total booking amount (less any banking processing transaction fee of 3%).
- **Between 3 and 7 Days Prior to Check-in:** 50% retention charge; remaining 50% will be refunded to the original payment source.
- **Less than 72 Hours Prior to Check-in:** 100% retention charge; non-refundable.
- **No-Show or Early Departure:** Non-refundable. Full booking tariff applies.

## 2. Date Modification Policy
- Requests for date amendments made **7 or more days** prior to arrival are accommodated free of charge, subject to room category availability and applicable seasonal tariff differentials.
- Modifications within 7 days of check-in are treated on a case-by-case basis at management discretion.

## 3. Monsoon & Mountain Access (Force Majeure)
Maredumilli experiences dramatic monsoon beauty. In the extraordinary event of severe weather advisories, landslides, or state administrative closures that physically restrict road access to Maredumilli:
- Guests will be offered a **complimentary 100% credit voucher** valid for 12 months from the original check-in date.

## 4. Refund Processing Window
- Approved refunds are credited directly back to the original method of payment (credit/debit card, UPI, or net banking) within **5 to 7 business banking days**.
- To initiate a cancellation, please email **reservations@royalgrandin.com** quoting your unique booking confirmation number (e.g., RG-XXXXXX).`,
  },
];
