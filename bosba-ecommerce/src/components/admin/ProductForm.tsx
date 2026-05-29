"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Category { id: string; nameEn: string }

interface FormValues {
  nameEn: string;
  nameKm: string;
  slug: string;
  descriptionEn: string;
  descriptionKm: string;
  priceUsd: string;
  priceKhr: string;
  comparePrice: string;
  stock: string;
  sku: string;
  featured: boolean;
  active: boolean;
  categoryId: string;
  images: string[];
}

interface Props {
  categories: Category[];
  initialValues?: Partial<FormValues>;
  productId?: string;
}

const KHR_RATE = Number(process.env.NEXT_PUBLIC_KHR_RATE ?? 4100);

function slugify(str: string) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function ProductForm({ categories, initialValues, productId }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<FormValues>({
    nameEn: "", nameKm: "", slug: "",
    descriptionEn: "", descriptionKm: "",
    priceUsd: "", priceKhr: "", comparePrice: "",
    stock: "0", sku: "",
    featured: false, active: true,
    categoryId: "", images: [],
    ...initialValues,
  });

  function set(patch: Partial<FormValues>) {
    setForm((f) => ({ ...f, ...patch }));
  }

  function handleNameEnChange(value: string) {
    setForm((f) => ({
      ...f,
      nameEn: value,
      // Auto-update slug only if it hasn't been manually edited
      slug: !f.slug || f.slug === slugify(f.nameEn) ? slugify(value) : f.slug,
    }));
  }

  function handlePriceUsdChange(value: string) {
    const usd = parseFloat(value);
    setForm((f) => ({
      ...f,
      priceUsd: value,
      priceKhr: usd > 0 ? String(Math.round(usd * KHR_RATE)) : f.priceKhr,
    }));
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (form.images.length + files.length > 6) {
      toast.error("Maximum 6 images per product");
      return;
    }
    setUploading(true);
    const uploaded: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (res.ok) {
          const { url } = await res.json();
          uploaded.push(url);
        } else {
          toast.error(`Failed to upload ${file.name}`);
        }
      }
      if (uploaded.length) {
        setForm((f) => ({ ...f, images: [...f.images, ...uploaded] }));
        toast.success(`${uploaded.length} image(s) uploaded`);
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.categoryId) { toast.error("Select a category"); return; }
    if (!form.images.length) { toast.error("Upload at least one image"); return; }
    const priceUsd = parseFloat(form.priceUsd);
    if (!priceUsd || priceUsd <= 0) { toast.error("Enter a valid price"); return; }

    setSaving(true);
    try {
      const payload = {
        nameEn: form.nameEn.trim(),
        nameKm: form.nameKm.trim(),
        slug: form.slug.trim(),
        descriptionEn: form.descriptionEn.trim() || null,
        descriptionKm: form.descriptionKm.trim() || null,
        priceUsd,
        priceKhr: parseInt(form.priceKhr) || Math.round(priceUsd * KHR_RATE),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
        stock: parseInt(form.stock) || 0,
        sku: form.sku.trim() || null,
        featured: form.featured,
        active: form.active,
        categoryId: form.categoryId,
        images: form.images,
      };

      const url = productId ? `/api/admin/products/${productId}` : "/api/products";
      const method = productId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(productId ? "Product updated!" : "Product created!");
        router.push("/admin/products");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Failed to save");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Left: main info ───────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Names */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900">Product Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (English) <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={form.nameEn}
                  onChange={(e) => handleNameEnChange(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Product name in English"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (Khmer) <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={form.nameKm}
                  onChange={(e) => set({ nameKm: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="ឈ្មោះផលិតផល"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={form.slug}
                  onChange={(e) => set({ slug: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="product-url-slug"
                />
                <p className="text-xs text-gray-400 mt-1">Auto-generated from English name. Must be unique.</p>
              </div>
            </div>
          </div>

          {/* Descriptions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900">Descriptions</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (English)</label>
              <textarea
                value={form.descriptionEn}
                onChange={(e) => set({ descriptionEn: e.target.value })}
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                placeholder="Describe the product in English..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (Khmer)</label>
              <textarea
                value={form.descriptionKm}
                onChange={(e) => set({ descriptionKm: e.target.value })}
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                placeholder="ពណ៌នាផលិតផល..."
              />
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Images</h2>
              <span className="text-xs text-gray-400">{form.images.length}/6</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {form.images.map((img, i) => (
                <div key={img + i} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <Image src={img} alt="" fill className="object-cover" sizes="150px" />
                  {i === 0 && (
                    <span className="absolute top-1 left-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded font-medium leading-tight">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => set({ images: form.images.filter((_, j) => j !== i) })}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {form.images.length < 6 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-red-400 hover:bg-red-50 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      <span className="text-xs">Add photo</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <p className="text-xs text-gray-400 mt-3">
              First image is the cover photo. JPEG, PNG, or WebP. Max 6 images.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>
        </div>

        {/* ── Right: sidebar fields ──────────────────────────── */}
        <div className="space-y-6">
          {/* Pricing */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900">Pricing</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price USD <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.priceUsd}
                  onChange={(e) => handlePriceUsdChange(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price KHR</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">៛</span>
                <input
                  type="number"
                  min="0"
                  value={form.priceKhr}
                  onChange={(e) => set({ priceKhr: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Auto from USD"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Auto-computed at ×{KHR_RATE}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Compare Price USD</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.comparePrice}
                  onChange={(e) => set({ comparePrice: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Original price (for discount %)"
                />
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900">Inventory</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => set({ stock: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
              <input
                value={form.sku}
                onChange={(e) => set({ sku: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Optional product code"
              />
            </div>
          </div>

          {/* Category & Status */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900">Organisation</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={form.categoryId}
                onChange={(e) => set({ categoryId: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">— Select category —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.nameEn}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set({ featured: e.target.checked })}
                className="h-4 w-4 rounded text-red-600 focus:ring-red-500"
              />
              <span className="text-sm text-gray-700">Featured (shown on homepage)</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => set({ active: e.target.checked })}
                className="h-4 w-4 rounded text-red-600 focus:ring-red-500"
              />
              <span className="text-sm text-gray-700">Active (visible in store)</span>
            </label>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-red-600 text-white font-semibold py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving…" : productId ? "Update Product" : "Create Product"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
