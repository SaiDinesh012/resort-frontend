import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import connectDB from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BookingDetailPage({ params }: Props) {
  const { id } = await params;
  await connectDB();

  const bookingDoc = await Booking.findOne({ $or: [{ id }, { bookingNumber: id }] });
  if (!bookingDoc) notFound();

  const booking = JSON.parse(JSON.stringify(bookingDoc));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/admin/bookings" className="inline-flex items-center gap-1.5 text-xs text-warm-gray hover:text-charcoal mb-2">
            <ArrowLeft className="size-3.5" /> Back to Bookings
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl font-bold text-charcoal">Booking #{booking.bookingNumber}</h1>
            <StatusBadge status={booking.bookingStatus} />
          </div>
        </div>

        <div className="flex gap-2">
          <button className="px-3 py-1.5 rounded-md border border-border text-charcoal text-xs font-semibold hover:bg-background flex items-center gap-1.5">
            <Printer className="size-3.5" /> Print Details
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Customer & Room Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-4">
            <h2 className="font-serif text-lg font-bold text-charcoal border-b border-border pb-3">Guest Information</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div><p className="text-warm-gray">Guest Name</p><p className="font-semibold text-charcoal text-sm">{booking.guestDetails.firstName} {booking.guestDetails.lastName}</p></div>
              <div><p className="text-warm-gray">Email</p><p className="font-medium text-charcoal">{booking.guestDetails.email}</p></div>
              <div><p className="text-warm-gray">Phone</p><p className="font-medium text-charcoal">{booking.guestDetails.phone}</p></div>
              <div><p className="text-warm-gray">Location</p><p className="font-medium text-charcoal">{booking.guestDetails.city}, {booking.guestDetails.country}</p></div>
            </div>
            {booking.guestDetails.specialRequests && (
              <div className="pt-3 border-t border-border text-xs">
                <p className="text-warm-gray">Special Requests</p>
                <p className="font-medium text-charcoal mt-1 bg-amber-50 p-2.5 rounded text-amber-800 border border-amber-200">{booking.guestDetails.specialRequests}</p>
              </div>
            )}
          </div>

          <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-4">
            <h2 className="font-serif text-lg font-bold text-charcoal border-b border-border pb-3">Reservation Details</h2>
            <div className="grid sm:grid-cols-3 gap-4 text-xs">
              <div><p className="text-warm-gray">Accommodation</p><p className="font-semibold text-charcoal text-sm">{booking.roomName || booking.packageName}</p></div>
              <div><p className="text-warm-gray">Check-in</p><p className="font-medium text-charcoal">{formatDate(booking.checkIn)}</p></div>
              <div><p className="text-warm-gray">Check-out</p><p className="font-medium text-charcoal">{formatDate(booking.checkOut)} ({booking.nights} nights)</p></div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-surface rounded-xl border border-border p-6 shadow-card">
            <h2 className="font-serif text-lg font-bold text-charcoal border-b border-border pb-3 mb-4">Booking Activity Timeline</h2>
            <div className="space-y-4 text-xs">
              {(booking.timeline || []).map((item: any, idx: number) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="size-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-charcoal">{item.event}</p>
                    <p className="text-warm-gray">{item.description}</p>
                    <p className="text-[10px] text-warm-gray/70 mt-0.5">{formatDate(item.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Payment Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface rounded-xl border border-border p-6 shadow-card space-y-4">
            <h2 className="font-serif text-lg font-bold text-charcoal border-b border-border pb-3">Payment Summary</h2>
            <div className="space-y-2 text-xs text-warm-gray">
              <div className="flex justify-between"><span>Subtotal ({booking.nights} nights)</span><span>{formatCurrency(booking.priceBreakdown.subtotal)}</span></div>
              <div className="flex justify-between"><span>Tax & Service Fees</span><span>{formatCurrency(booking.priceBreakdown.taxAmount)}</span></div>
              {booking.priceBreakdown.discountAmount > 0 && (
                <div className="flex justify-between text-success"><span>Discount</span><span>-{formatCurrency(booking.priceBreakdown.discountAmount)}</span></div>
              )}
              <div className="flex justify-between font-bold text-charcoal text-sm pt-2 border-t border-border">
                <span>Grand Total</span>
                <span className="text-primary">{formatCurrency(booking.priceBreakdown.total)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="text-warm-gray">Payment Status:</span>
              <StatusBadge status={booking.paymentStatus} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
