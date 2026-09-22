"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Search, Download, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Customer } from "@/types/customer";

export default function CustomersManagementPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/customers");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCustomers(data);
      }
    } catch (err) {
      console.error("Failed to load customers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleStatusChange = async (customerId: string, newStatus: string) => {
    try {
      await fetch(`/api/customers/${customerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchCustomers();
    } catch (err) {
      console.error("Failed to update customer status", err);
    }
  };

  const handleExportCSV = () => {
    if (customers.length === 0) return;
    const headers = ["Name,Email,Phone,City,Country,Total Bookings,Total Spend,Last Booking,Status\n"];
    const rows = customers.map(c =>
      `"${c.firstName} ${c.lastName}","${c.email}","${c.phone}","${c.city || ''}","${c.country || 'India'}","${c.totalBookings}","${c.totalSpend}","${c.lastBookingDate || ''}","${c.status}"`
    ).join("\n");

    const blob = new Blob([...headers, rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resort_customers_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const filtered = customers.filter((c) =>
    `${c.firstName} ${c.lastName} ${c.email} ${c.phone}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Customer Directory</h1>
          <p className="text-xs text-warm-gray mt-1">Manage guest profiles, loyalty history, and spending records live from MongoDB</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-border bg-surface text-charcoal text-xs font-semibold hover:bg-background cursor-pointer"
        >
          <Download className="size-3.5" /> Export Guests CSV
        </button>
      </div>

      <div className="bg-surface rounded-xl border border-border p-4 shadow-xs">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-warm-gray" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-md border border-border text-xs text-charcoal focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-warm-gray gap-2 bg-surface rounded-xl border border-border">
          <Loader2 className="size-5 animate-spin text-primary" /> Loading customer directory...
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-background border-b border-border text-warm-gray font-semibold uppercase tracking-wider">
                  <th className="p-3.5">Guest</th>
                  <th className="p-3.5">Contact</th>
                  <th className="p-3.5">Total Bookings</th>
                  <th className="p-3.5">Total Spend</th>
                  <th className="p-3.5">Last Booking</th>
                  <th className="p-3.5">Tags</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-charcoal font-medium">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-background/50">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        {c.avatar ? (
                          <Image src={c.avatar} alt={c.firstName} width={32} height={32} className="rounded-full size-8 object-cover" />
                        ) : (
                          <div className="size-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
                            {c.firstName?.[0] || "G"}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold">{c.firstName} {c.lastName}</p>
                          <p className="text-[11px] text-warm-gray">{c.city || "Chikmagalur"}, {c.country || "India"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <p>{c.email}</p>
                      <p className="text-[11px] text-warm-gray">{c.phone}</p>
                    </td>
                    <td className="p-3.5 font-bold">{c.totalBookings}</td>
                    <td className="p-3.5 font-bold text-primary">{formatCurrency(c.totalSpend)}</td>
                    <td className="p-3.5">{c.lastBookingDate ? formatDate(c.lastBookingDate) : "—"}</td>
                    <td className="p-3.5">
                      <div className="flex gap-1">
                        {c.tags?.map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded bg-accent/15 text-accent font-semibold text-[10px]">{t}</span>
                        )) || "VIP Guest"}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <select
                        value={c.status}
                        onChange={(e) => handleStatusChange(c.id, e.target.value)}
                        className="px-2 py-1 border border-border rounded bg-background text-[11px] font-semibold focus:outline-none"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </td>
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
