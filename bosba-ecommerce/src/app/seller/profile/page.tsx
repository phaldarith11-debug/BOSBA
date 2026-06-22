"use client";
import { useEffect, useState } from "react";
import { Loader2, Save, UserCircle } from "lucide-react";
import toast from "react-hot-toast";

interface Profile {
  storeName: string | null;
  storeNameKm: string | null;
  bio: string | null;
  logo: string | null;
  phone: string | null;
  payoutMethod: string | null;
  payoutAccount: string | null;
  payoutName: string | null;
  commissionPct: number;
  approved: boolean;
}

export default function SellerProfilePage() {
  const [p, setP] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/seller/profile").then((r) => r.json()).then((d) => setP(d.profile)).finally(() => setLoading(false));
  }, []);

  function set<K extends keyof Profile>(k: K, v: Profile[K]) { setP((x) => x ? { ...x, [k]: v } : x); }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!p) return;
    setSaving(true);
    const res = await fetch("/api/seller/profile", {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p),
    });
    setSaving(false);
    if (res.ok) toast.success("Profile saved"); else toast.error("Failed to save");
  }

  if (loading || !p) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>;

  const input = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

  return (
    <form onSubmit={save} className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Profile</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Commission: {p.commissionPct}% ·{" "}
            {p.approved ? <span className="text-green-600">Approved</span> : <span className="text-amber-600">Pending approval</span>}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2"><UserCircle className="h-4 w-4 text-gray-400" /> Store details</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store name</label>
            <input value={p.storeName ?? ""} onChange={(e) => set("storeName", e.target.value)} className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store name (Khmer)</label>
            <input value={p.storeNameKm ?? ""} onChange={(e) => set("storeNameKm", e.target.value)} className={input} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
          <input value={p.logo ?? ""} onChange={(e) => set("logo", e.target.value)} className={input} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio / description</label>
          <textarea rows={3} value={p.bio ?? ""} onChange={(e) => set("bio", e.target.value)} className={input} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact phone</label>
          <input value={p.phone ?? ""} onChange={(e) => set("phone", e.target.value)} className={input} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Payout details</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
            <select value={p.payoutMethod ?? ""} onChange={(e) => set("payoutMethod", e.target.value)} className={input}>
              <option value="">Select…</option>
              <option value="aba">ABA</option>
              <option value="bank">Bank transfer</option>
              <option value="cash">Cash</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account no. / phone</label>
            <input value={p.payoutAccount ?? ""} onChange={(e) => set("payoutAccount", e.target.value)} className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account holder</label>
            <input value={p.payoutName ?? ""} onChange={(e) => set("payoutName", e.target.value)} className={input} />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={saving} className="flex items-center gap-2 bg-emerald-600 text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-emerald-700 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Profile
        </button>
      </div>
    </form>
  );
}
