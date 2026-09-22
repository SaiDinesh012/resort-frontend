"use client";

import { useState, useEffect } from "react";
import { CreditCard, IndianRupee, RefreshCw, CheckCircle, Loader2 } from "lucide-react";
import { KpiCard } from "@/components/admin/KpiCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Payment } from "@/types/payment";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/payments");
      const data = await res.json();
      if (Array.isArray(data)) {
        setPayments(data);
      }
    } catch (err) {
      console.error("Failed to load payments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const totalCollected = payments.filter((p) => p.status === "success").reduce((acc, p) => acc + p.amount, 0);
  const successCount = payments.filter((p) => p.status === "success").length;
  const refundedTotal = payments.filter((p) => p.status === "refunded").reduce((acc, p) => acc + (p.refundAmount || p.amount), 0);
  const pendingTotal = payments.filter((p) => p.status === "pending").reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-charcoal">Payments & Transactions</h1>
        <p className="text-xs text-warm-gray mt-1">Payment logs, Razorpay transactions, refunds, and financial metrics live from MongoDB</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Collected" value={formatCurrency(totalCollected)} isPositive icon={<IndianRupee className="size-4" />} />
        <KpiCard title="Successful Payments" value={String(successCount)} icon={<CheckCircle className="size-4 text-emerald-600" />} />
        <KpiCard title="Refunded Amount" value={formatCurrency(refundedTotal)} icon={<RefreshCw className="size-4 text-blue-600" />} />
        <KpiCard title="Pending Payments" value={formatCurrency(pendingTotal)} icon={<CreditCard className="size-4 text-amber-600" />} />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-warm-gray gap-2 bg-surface rounded-xl border border-border">
          <Loader2 className="size-5 animate-spin text-primary" /> Loading payment records...
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden">
          <div className="p-4 border-b border-border font-serif font-bold text-charcoal text-base">Payment Logs</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-background border-b border-border text-warm-gray font-semibold uppercase tracking-wider">
                  <th className="p-3.5">Payment ID</th>
                  <th className="p-3.5">Booking #</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Method</th>
                  <th className="p-3.5">Gateway</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-charcoal font-medium">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-background/50">
                    <td className="p-3.5 font-mono font-bold text-primary">{p.paymentId}</td>
                    <td className="p-3.5 font-mono text-warm-gray">{p.bookingNumber}</td>
                    <td className="p-3.5">{p.customerName}</td>
                    <td className="p-3.5 font-bold">{formatCurrency(p.amount)}</td>
                    <td className="p-3.5 uppercase">{p.method}</td>
                    <td className="p-3.5 capitalize">{p.gateway}</td>
                    <td className="p-3.5"><StatusBadge status={p.status} size="sm" /></td>
                    <td className="p-3.5">{formatDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
