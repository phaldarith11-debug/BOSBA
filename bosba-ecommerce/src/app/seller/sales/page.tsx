"use client";
import { useEffect, useState } from "react";
import { Loader2, BarChart3, DollarSign, Package } from "lucide-react";

interface Sales {
  months: { month: string; revenue: number; units: number }[];
  topProducts: { name: string; revenue: number; units: number }[];
  totalRevenueUsd: number;
  totalUnits: number;
}

export default function SellerSalesPage() {
  const [data, setData] = useState<Sales | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/seller/sales").then((r) => (r.ok ? r.json() : null)).then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>;

  const maxRev = Math.max(1, ...(data?.months.map((m) => m.revenue) ?? [1]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sales Report</h1>
        <p className="text-sm text-gray-500 mt-0.5">Revenue and best-sellers for your store.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2"><DollarSign className="h-4.5 w-4.5" /></div>
          <p className="text-2xl font-bold text-gray-900">${data?.totalRevenueUsd.toFixed(2) ?? "0.00"}</p>
          <p className="text-xs text-gray-500">Total revenue</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2"><Package className="h-4.5 w-4.5" /></div>
          <p className="text-2xl font-bold text-gray-900">{data?.totalUnits ?? 0}</p>
          <p className="text-xs text-gray-500">Units sold</p>
        </div>
      </div>

      {/* Monthly bars */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-gray-400" /> Monthly revenue</h2>
        {!data || data.months.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">No sales data yet.</p>
        ) : (
          <div className="space-y-2">
            {data.months.map((m) => (
              <div key={m.month} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-16">{m.month}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full flex items-center justify-end pr-2" style={{ width: `${(m.revenue / maxRev) * 100}%` }}>
                    <span className="text-[10px] font-semibold text-white">${m.revenue.toFixed(0)}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-400 w-12 text-right">{m.units}u</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top products */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Top products</h2>
        {!data || data.topProducts.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">No products sold yet.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {data.topProducts.map((p, i) => (
              <div key={p.name + i} className="flex items-center justify-between py-2.5">
                <span className="text-sm text-gray-700">{i + 1}. {p.name}</span>
                <span className="text-sm font-semibold text-gray-900">${p.revenue.toFixed(2)} <span className="text-xs text-gray-400 font-normal">· {p.units}u</span></span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
