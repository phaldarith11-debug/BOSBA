"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";

interface Category { id: string; nameEn: string; nameKm: string }

export interface ProductFormValues {
  nameEn: string;
  nameKm: string;
  descriptionEn: string;
  descriptionKm: string;
  categoryId: string;
  priceUsd: string;
  stock: string;
  images: string; // comma/newline separated URLs in the form
  active: boolean;
}

const EMPTY: ProductFormValues = {
  nameEn: "", nameKm: "", descriptionEn: "", descriptionKm: "",
  categoryId: "", priceUsd: "", stock: "0", images: "", active: true,
};

export function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductFormValues>(EMPTY);
  const [loading, setLoading] = useState(!!productId);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/seller/categories").then((r) => r.json()).then((d) => setCategories(d.categories ?? []));
  }, []);

  useEffect(() => {
    if (!productId) return;
    fetch(`/api/seller/products/${productId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d?.product) { toast.error("Product not found"); router.push("/seller/products"); return; }
        const p = d.product;
        setForm({
          nameEn: p.nameEn ?? "", nameKm: p.nameKm ?? "",
          descriptionEn: p.descriptionEn ?? "", descriptionKm: p.descriptionKm ?? "",
          categoryId: p.categoryId ?? "", priceUsd: String(p.priceUsd ?? ""),
          stock: String(p.stock ?? 0), images: (p.images ?? []).join("\n"), active: p.active,
        });
      })
      .finally(() => setLoading(false));
  }, [productId, router]);

  function set<K extends keyof ProductFormValues>(k: K, v: ProductFormValues[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      nameEn: form.nameEn,
      nameKm: form.nameKm,
      descriptionEn: form.descriptionEn,
      descriptionKm: form.descriptionKm,
      categoryId: form.categoryId,
      priceUsd: Number(form.priceUsd),
      stock: Number(form.stock),
      active: form.active,
      images: form.images.split(/[\n,]/).map((s) => s.trim()).filter(Boolean),
    };
    const res = await fetch(
      productId ? `/api/seller/products/${productId}` : "/api/seller/products",
      {
        method: productId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    setSaving(false);
    if (res.ok) {
      toast.success(productId ? "Product updated" : "Product created");
      router.push("/seller/products");
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error ?? "Failed to save");
    }
  }

  const input = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>;

  return (
    <form onSubmit={submit} className="space-y-6 max-w-2xl">
      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name (English) <span className="text-red-500">*</span></label>
            <input required value={form.nameEn} onChange={(e) => set("nameEn", e.target.value)} className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name (Khmer)</label>
            <input value={form.nameKm} onChange={(e) => set("nameKm", e.target.value)} className={input} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
          <select required value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={input}>
            <option value="">Select a category…</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
          </select>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD) <span className="text-red-500">*</span></label>
            <input required type="number" min="0" step="0.01" value={form.priceUsd} onChange={(e) => set("priceUsd", e.target.value)} className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
            <input type="number" min="0" value={form.stock} onChange={(e) => set("stock", e.target.value)} className={input} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (English)</label>
            <textarea rows={3} value={form.descriptionEn} onChange={(e) => set("descriptionEn", e.target.value)} className={input} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Khmer)</label>
            <textarea rows={3} value={form.descriptionKm} onChange={(e) => set("descriptionKm", e.target.value)} className={input} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URLs</label>
          <textarea rows={2} value={form.images} onChange={(e) => set("images", e.target.value)} className={input} placeholder="One URL per line (Cloudinary, etc.)" />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="rounded" />
          Active (visible in store)
        </label>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.push("/seller/products")} className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={saving} className="flex items-center gap-2 bg-emerald-600 text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-emerald-700 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {productId ? "Save Changes" : "Create Product"}
        </button>
      </div>
    </form>
  );
}
