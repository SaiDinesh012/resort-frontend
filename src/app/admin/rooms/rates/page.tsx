"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Save, Loader2, Check, RefreshCw, Sparkles, IndianRupee } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { Room } from "@/types/room";

export default function RatesManagementPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);
  const [surgePercentage, setSurgePercentage] = useState<number>(10);
  const [applyingGlobalSurge, setApplyingGlobalSurge] = useState(false);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/rooms`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setRooms(data);
      }
    } catch (err) {
      console.error("Failed to load rooms for rates", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handlePriceChange = (roomId: string, field: "basePrice" | "weekendPrice" | "taxRate", val: number) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, [field]: val } : r))
    );
  };

  const handleAutoWeekendRate = (roomId: string) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? { ...r, weekendPrice: Math.round(r.basePrice * 1.25) }
          : r
      )
    );
  };

  const handleSaveRoomRate = async (room: Room) => {
    try {
      setSavingId(room.id);
      await fetch(`${API_BASE_URL}/rooms/${room.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          basePrice: Number(room.basePrice),
          weekendPrice: Number(room.weekendPrice),
          taxRate: Number(room.taxRate || 18),
        }),
      });
      setSavedSuccessId(room.id);
      setTimeout(() => setSavedSuccessId(null), 2500);
    } catch (err) {
      console.error("Failed to update rate", err);
      alert("Failed to save room rate.");
    } finally {
      setSavingId(null);
    }
  };

  const handleApplySeasonalMultiplier = async (factor: number) => {
    if (!confirm(`Apply ${(factor - 1) * 100 > 0 ? "+" : ""}${Math.round((factor - 1) * 100)}% seasonal adjustment to all room base rates?`)) return;
    try {
      setApplyingGlobalSurge(true);
      for (const room of rooms) {
        const newBase = Math.round(room.basePrice * factor);
        const newWeekend = Math.round(room.weekendPrice * factor);
        await fetch(`${API_BASE_URL}/rooms/${room.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            basePrice: newBase,
            weekendPrice: newWeekend,
          }),
        });
      }
      await fetchRooms();
      alert("Seasonal rates applied successfully to all inventory!");
    } catch (err) {
      console.error("Failed to apply global surge", err);
    } finally {
      setApplyingGlobalSurge(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Rates & Dynamic Pricing</h1>
          <p className="text-xs text-warm-gray mt-1">
            Configure weekday rates, weekend surges, and seasonal tariff adjustments live across all resort inventory
          </p>
        </div>
        <button
          onClick={fetchRooms}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-border bg-surface text-charcoal text-xs font-semibold hover:bg-background transition-colors cursor-pointer"
        >
          <RefreshCw className="size-3.5" /> Refresh Tariffs
        </button>
      </div>

      {/* Global Surge & Seasonal Toolbar */}
      <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <TrendingUp className="size-5" />
          </div>
          <div>
            <h3 className="font-semibold text-charcoal text-sm">Quick Seasonal Multipliers</h3>
            <p className="text-[11px] text-warm-gray">Batch adjust base tariffs across all room categories for holidays or off-season</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            disabled={applyingGlobalSurge}
            onClick={() => handleApplySeasonalMultiplier(1.20)}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer shadow-xs disabled:opacity-50"
          >
            +20% Peak Holiday Surge
          </button>
          <button
            type="button"
            disabled={applyingGlobalSurge}
            onClick={() => handleApplySeasonalMultiplier(1.10)}
            className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold cursor-pointer shadow-xs disabled:opacity-50"
          >
            +10% Weekend Surge
          </button>
          <button
            type="button"
            disabled={applyingGlobalSurge}
            onClick={() => handleApplySeasonalMultiplier(0.90)}
            className="px-3 py-1.5 rounded-lg border border-border bg-white hover:bg-slate-50 text-charcoal font-semibold cursor-pointer disabled:opacity-50"
          >
            -10% Monsoon Discount
          </button>
        </div>
      </div>

      {/* Room Rates Table */}
      <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="font-serif font-bold text-charcoal text-base">Room Category Tariffs</div>
          <span className="text-xs text-warm-gray">Changes save directly to MongoDB Atlas</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-warm-gray flex flex-col items-center gap-2">
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="text-xs">Loading live room rates...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-background border-b border-border text-warm-gray font-semibold">
                  <th className="p-4">Room Category</th>
                  <th className="p-4">Weekday Base Rate (₹)</th>
                  <th className="p-4">Weekend Rate (₹)</th>
                  <th className="p-4">GST / Tax Rate (%)</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-charcoal font-medium">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-semibold text-charcoal">
                      <div className="text-sm font-bold">{room.name}</div>
                      <span className="text-[11px] text-warm-gray font-normal">{room.type}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 max-w-[160px]">
                        <span className="text-warm-gray font-bold">₹</span>
                        <input
                          type="number"
                          value={room.basePrice}
                          onChange={(e) => handlePriceChange(room.id, "basePrice", Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-md border border-border bg-white text-charcoal text-xs font-semibold focus:outline-none focus:border-primary"
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 max-w-[240px]">
                        <span className="text-warm-gray font-bold">₹</span>
                        <input
                          type="number"
                          value={room.weekendPrice}
                          onChange={(e) => handlePriceChange(room.id, "weekendPrice", Number(e.target.value))}
                          className="w-28 px-2.5 py-1.5 rounded-md border border-border bg-white text-charcoal text-xs font-semibold focus:outline-none focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() => handleAutoWeekendRate(room.id)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-warm-gray text-[10px] font-bold cursor-pointer transition-colors"
                          title="Auto-calculate weekend price as +25%"
                        >
                          +25% Auto
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 max-w-[100px]">
                        <input
                          type="number"
                          value={room.taxRate || 18}
                          onChange={(e) => handlePriceChange(room.id, "taxRate", Number(e.target.value))}
                          className="w-16 px-2.5 py-1.5 rounded-md border border-border bg-white text-charcoal text-xs font-semibold focus:outline-none focus:border-primary"
                        />
                        <span className="text-warm-gray font-bold">%</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        disabled={savingId === room.id}
                        onClick={() => handleSaveRoomRate(room)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                          savedSuccessId === room.id
                            ? "bg-emerald-600 text-white"
                            : "bg-primary text-white hover:bg-primary-dark"
                        }`}
                      >
                        {savingId === room.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : savedSuccessId === room.id ? (
                          <Check className="size-3.5" />
                        ) : (
                          <Save className="size-3.5" />
                        )}
                        {savedSuccessId === room.id ? "Saved!" : "Save Rate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
