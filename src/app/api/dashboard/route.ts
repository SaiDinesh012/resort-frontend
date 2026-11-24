import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";
import Room from "@/lib/models/Room";
import Payment from "@/lib/models/Payment";

function formatCompactCurrency(val: number): string {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
  if (val >= 10000) return `₹${(val / 1000).toFixed(1)}k`;
  return `₹${Math.round(val).toLocaleString("en-IN")}`;
}

export async function GET() {
  try {
    await connectDB();

    const [bookings, rooms, payments] = await Promise.all([
      Booking.find({}).sort({ createdAt: -1 }).lean(),
      Room.find({}).lean(),
      Payment.find({}).sort({ createdAt: -1 }).lean(),
    ]);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const todayStr = now.toISOString().slice(0, 10);

    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    // 1. Total Revenue
    const successfulPayments = payments.filter((p: any) => p.status === "success");
    let totalRevenue = successfulPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    if (totalRevenue === 0) {
      totalRevenue = bookings
        .filter((b: any) => b.paymentStatus === "paid" || b.bookingStatus === "confirmed" || b.bookingStatus === "completed")
        .reduce((sum: number, b: any) => sum + (b.priceBreakdown?.total || 0), 0);
    }

    // Revenue growth: this month vs last month
    const thisMonthRevenue = successfulPayments
      .filter((p: any) => {
        const d = new Date(p.createdAt || p.updatedAt || now);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      })
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastMonthYear = lastMonthDate.getFullYear();
    const lastMonthIndex = lastMonthDate.getMonth();
    const lastMonthRevenue = successfulPayments
      .filter((p: any) => {
        const d = new Date(p.createdAt || p.updatedAt || now);
        return d.getFullYear() === lastMonthYear && d.getMonth() === lastMonthIndex;
      })
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    let revenueChange = "+0.0%";
    let isRevenuePositive = true;
    if (lastMonthRevenue > 0) {
      const diff = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
      revenueChange = `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`;
      isRevenuePositive = diff >= 0;
    } else if (thisMonthRevenue > 0) {
      revenueChange = "+100%";
      isRevenuePositive = true;
    }

    // 2. Today's Bookings
    const todayBookingsList = bookings.filter((b: any) => {
      const bDate = b.createdAt ? new Date(b.createdAt).toISOString().slice(0, 10) : "";
      return bDate === todayStr;
    });
    const todayBookingsCount = todayBookingsList.length;

    const yesterdayBookingsCount = bookings.filter((b: any) => {
      const bDate = b.createdAt ? new Date(b.createdAt).toISOString().slice(0, 10) : "";
      return bDate === yesterdayStr;
    }).length;

    const bookingsDiff = todayBookingsCount - yesterdayBookingsCount;
    const bookingsChange = bookingsDiff > 0 ? `+${bookingsDiff}` : bookingsDiff < 0 ? `${bookingsDiff}` : "+0";

    // 3. Upcoming Check-ins (next 48h)
    const upcomingCheckIns = bookings.filter((b: any) => {
      if (b.bookingStatus === "cancelled") return false;
      if (!b.checkIn) return false;
      const cDate = new Date(b.checkIn);
      return cDate >= new Date(todayStr) && cDate <= in48h;
    });

    // 4. Rooms Status (Available & Occupied)
    const totalRooms = rooms.length;
    const currentlyOccupiedRoomIds = new Set<string>();
    bookings.forEach((b: any) => {
      if (b.bookingStatus === "cancelled" || !b.checkIn || !b.checkOut) return;
      const cIn = new Date(b.checkIn);
      const cOut = new Date(b.checkOut);
      if (cIn <= now && cOut >= now && b.roomId) {
        currentlyOccupiedRoomIds.add(b.roomId);
      }
    });

    const occupiedRoomsCount = rooms.filter(
      (r: any) => r.status === "occupied" || currentlyOccupiedRoomIds.has(r.id) || currentlyOccupiedRoomIds.has(r._id?.toString())
    ).length;

    const availableRoomsCount = Math.max(0, totalRooms - occupiedRoomsCount);
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRoomsCount / totalRooms) * 100) : 0;

    // 5. Pending Payments
    const pendingPaymentsList = payments.filter((p: any) => p.status === "pending");
    let pendingAmount = pendingPaymentsList.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    let pendingCount = pendingPaymentsList.length;

    if (pendingAmount === 0) {
      const pendingBookings = bookings.filter((b: any) => b.paymentStatus === "pending" && b.bookingStatus !== "cancelled");
      pendingAmount = pendingBookings.reduce((sum: number, b: any) => sum + (b.priceBreakdown?.total || 0), 0);
      pendingCount = pendingBookings.length;
    }

    // 6. Charts: Monthly Revenue & Occupancy Trend
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueByMonth = monthNames.map((name) => ({ month: name, revenue: 0, bookings: 0 }));
    const occupancyByMonth = monthNames.map((name) => ({ month: name, occupancy: 0 }));

    payments.forEach((p: any) => {
      if (p.status !== "success") return;
      const d = new Date(p.createdAt || p.updatedAt || now);
      if (d.getFullYear() === currentYear) {
        const m = d.getMonth();
        if (m >= 0 && m < 12) {
          revenueByMonth[m].revenue += p.amount || 0;
        }
      }
    });

    const hasChartRevenue = revenueByMonth.some((item) => item.revenue > 0);
    if (!hasChartRevenue) {
      bookings.forEach((b: any) => {
        if (b.bookingStatus === "cancelled") return;
        const d = new Date(b.createdAt || b.checkIn || now);
        if (d.getFullYear() === currentYear) {
          const m = d.getMonth();
          if (m >= 0 && m < 12) {
            revenueByMonth[m].revenue += b.priceBreakdown?.total || 0;
          }
        }
      });
    }

    bookings.forEach((b: any) => {
      if (b.bookingStatus === "cancelled") return;
      const d = new Date(b.createdAt || b.checkIn || now);
      if (d.getFullYear() === currentYear) {
        const m = d.getMonth();
        if (m >= 0 && m < 12) {
          revenueByMonth[m].bookings += 1;
        }
      }

      if (b.checkIn && b.checkOut && totalRooms > 0) {
        const cIn = new Date(b.checkIn);
        const cOut = new Date(b.checkOut);
        for (let m = 0; m < 12; m++) {
          const monthStart = new Date(currentYear, m, 1);
          const monthEnd = new Date(currentYear, m + 1, 0, 23, 59, 59);
          if (cIn <= monthEnd && cOut >= monthStart) {
            const overlapStart = Math.max(cIn.getTime(), monthStart.getTime());
            const overlapEnd = Math.min(cOut.getTime(), monthEnd.getTime());
            const nights = Math.max(0, Math.round((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)));
            const daysInMonth = new Date(currentYear, m + 1, 0).getDate();
            const monthlyCapacity = totalRooms * daysInMonth;
            if (monthlyCapacity > 0) {
              const addRate = Math.round((nights / monthlyCapacity) * 100);
              occupancyByMonth[m].occupancy = Math.min(100, occupancyByMonth[m].occupancy + addRate);
            }
          }
        }
      }
    });

    const recentBookings = bookings.slice(0, 5);

    return NextResponse.json({
      kpis: {
        totalRevenue: {
          value: totalRevenue,
          formatted: formatCompactCurrency(totalRevenue),
          change: revenueChange,
          isPositive: isRevenuePositive,
          subtitle: "Year to date",
        },
        todayBookings: {
          value: todayBookingsCount,
          formatted: String(todayBookingsCount),
          change: bookingsChange,
          isPositive: bookingsDiff >= 0,
          subtitle: "New reservations",
        },
        upcomingCheckIns: {
          value: upcomingCheckIns.length,
          formatted: String(upcomingCheckIns.length),
          subtitle: "Next 48 hours",
        },
        availableRooms: {
          value: availableRoomsCount,
          total: totalRooms,
          formatted: String(availableRoomsCount),
          subtitle: `Out of ${totalRooms} total`,
        },
        occupiedRooms: {
          value: occupiedRoomsCount,
          occupancyRate,
          formatted: String(occupiedRoomsCount),
          subtitle: `${occupancyRate}% Occupancy`,
        },
        pendingPayments: {
          value: pendingAmount,
          count: pendingCount,
          formatted: formatCompactCurrency(pendingAmount),
          change: pendingCount > 0 ? `-${pendingCount}` : "0",
          isPositive: pendingCount === 0,
          subtitle: `${pendingCount} invoice${pendingCount === 1 ? "" : "s"} pending`,
        },
      },
      charts: {
        year: currentYear,
        revenueOverTime: revenueByMonth,
        occupancyTrend: occupancyByMonth,
      },
      recentBookings,
    });
  } catch (error: any) {
    console.error("Dashboard statistics error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to calculate dashboard statistics" },
      { status: 500 }
    );
  }
}
