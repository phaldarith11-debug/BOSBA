"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Loader2, Package, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface SellerProduct {
  id: string;
  nameEn: string;
  slug: string;
  priceUsd: string | number;
  stock: number;
  active: boolean;
  images: string[];
  category?: { nameEn: string } | null;
}

export default function SellerProductsPage() {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/seller/products");
    if (res.ok) setProducts((await res.json()).products);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function remove(id: string, name: string) {
    if (!confirm(`Deactivate "${name}"? It will be hidden from the store.`)) return;
    const res = await fetch(`/api/seller/products/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Product deactivated"); load(); }
    else toast.error("Failed");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} product{products.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/seller/products/new" className="flex items-center gap-2 bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors">
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Package className="h-10 w-10 mb-3" />
            <p className="text-sm">No products yet.</p>
            <Link href="/seller/products/new" className="mt-3 text-emerald-600 font-semibold text-sm hover:underline">Add your first product</Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Product</th>
                <th className="px-5 py-3 text-left">Category</th>
                <th className="px-5 py-3 text-right">Price</th>
                <th className="px-5 py-3 text-right">Stock</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <span className="font-medium text-gray-900">{p.nameEn}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{p.category?.nameEn ?? "—"}</td>
                  <td className="px-5 py-3 text-right font-medium">${Number(p.priceUsd).toFixed(2)}</td>
                  <td className={`px-5 py-3 text-right ${p.stock <= 5 ? "text-amber-600 font-semibold" : "text-gray-700"}`}>{p.stock}</td>
                  <td className="px-5 py-3 text-center">
                    {p.active
                      ? <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Active</span>
                      : <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Inactive</span>}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/seller/products/${p.id}/edit`} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Edit">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button onClick={() => remove(p.id, p.nameEn)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Deactivate">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
