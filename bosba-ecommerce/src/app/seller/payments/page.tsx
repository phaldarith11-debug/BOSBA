"use client";
import { useEffect, useState } from "react";
import { Loader2, Wallet, Clock, CheckCircle2 } from "lucide-react";

interface Payments {
  payouts: { id: string; amountUsd: number; status: string; createdAt: string; reference: string | null; note: string | null }[];
  pendingUsd: number;
  paidUsd: number;
  commissionPct: number;
  payoutMethod: string | null;
  payoutAccount: string | null;
  payoutName: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  PAID: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
};

export default function SellerPaymentsPage() {
  const [data, setData] = useState<Payments | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/seller/payments").then((r) => (r.ok ? r.json() : null)).then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments &amp; Payouts</h1>
        <p className="text-sm text-gray-500 mt-0.5">Earnings after {data?.commissionPct ?? 10}% platform commission.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2"><Clock className="h-4.5 w-4.5" /></div>
          <p className="text-2xl font-bold text-gray-900">${data?.pendingUsd.toFixed(2) ?? "0.00"}</p>
          <p className="text-xs text-gray-500">Pending payout</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-2"><CheckCircle2 className="h-4.5 w-4.5" /></div>
          <p className="text-2xl font-bold text-gray-900">${data?.paidUsd.toFixed(2) ?? "0.00"}</p>
          <p className="text-xs text-gray-500">Total paid out</p>
        </div>
      </div>

      {/* Payout details */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Wallet className="h-4 w-4 text-gray-400" /> Payout account</h2>
        {data?.payoutMethod ? (
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="text-gray-400">Method:</span> {data.payoutMethod.toUpperCase()}</p>
            <p><span className="text-gray-400">Account:</span> {data.payoutAccount ?? "—"}</p>
            <p><span className="text-gray-400">Name:</span> {data.payoutName ?? "—"}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-400">No payout method set. Add it in your <a href="/seller/profile" className="text-emerald-600 underline">Business Profile</a>.</p>
        )}
      </div>

      {/* Payout history */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100"><h2 className="font-semibold text-gray-900">Payout history</h2></div>
        {!data || data.payouts.length === 0 ? (
          <p className="text-sm text-gray-400 py-12 text-center">No payouts yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr><th className="px-5 py-3 text-left">Date</th><th className="px-5 py-3 text-left">Reference</th><th className="px-5 py-3 text-center">Status</th><th className="px-5 py-3 text-right">Amount</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.payouts.map((p) => (
                <tr key={p.id}>
                  <td className="px-5 py-3 text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-gray-500">{p.reference ?? "—"}</td>
                  <td className="px-5 py-3 text-center"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-600"}`}>{p.status}</span></td>
                  <td className="px-5 py-3 text-right font-semibold">${p.amountUsd.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
