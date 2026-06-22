"use client";
import { useEffect, useState } from "react";
import { Loader2, Boxes, Check } from "lucide-react";
import toast from "react-hot-toast";

interface Row { id: string; nameEn: string; stock: number; images: string[]; _draft: string; _saving: boolean }

export default function SellerStockPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/seller/products");
    if (res.ok) {
      const d = await res.json();
      setRows(d.products.map((p: { id: string; nameEn: string; stock: number; images: string[] }) => ({
        ...p, _draft: String(p.stock), _saving: false,
      })));
    }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save(id: string) {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    const stock = Number(row._draft);
    if (Number.isNaN(stock) || stock < 0) { toast.error("Enter a valid stock number"); return; }
    setRows((rs) => rs.map((r) => r.id === id ? { ...r, _saving: true } : r));
    const res = await fetch(`/api/seller/products/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stock }),
    });
    if (res.ok) { toast.success("Stock updated"); setRows((rs) => rs.map((r) => r.id === id ? { ...r, stock, _saving: false } : r)); }
    else { toast.error("Failed"); setRows((rs) => rs.map((r) => r.id === id ? { ...r, _saving: false } : r)); }
  }

  const lowCount = rows.filter((r) => r.stock <= 5).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {rows.length} product{rows.length !== 1 ? "s" : ""}
          {lowCount > 0 && <span className="text-amber-600 font-medium"> · {lowCount} low stock</span>}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-400"><Boxes className="h-10 w-10 mb-3" /><p className="text-sm">No products to manage.</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr><th className="px-5 py-3 text-left">Product</th><th className="px-5 py-3 text-right">Current</th><th className="px-5 py-3 text-left">New stock</th><th className="px-5 py-3" /></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">{r.images?.[0] && <img src={r.images[0]} alt="" className="w-full h-full object-cover" />}</div>
                      <span className="font-medium text-gray-900">{r.nameEn}</span>
                    </div>
                  </td>
                  <td className={`px-5 py-3 text-right ${r.stock <= 5 ? "text-amber-600 font-semibold" : "text-gray-700"}`}>{r.stock}</td>
                  <td className="px-5 py-3">
                    <input type="number" min="0" value={r._draft} onChange={(e) => setRows((rs) => rs.map((x) => x.id === r.id ? { ...x, _draft: e.target.value } : x))} className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => save(r.id)} disabled={r._saving || r._draft === String(r.stock)} className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-40">
                      {r._saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
