"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface FormValues {
  nameEn: string;
  nameKm: string;
  nameJa: string;
  nameZh: string;
  slug: string;
  description: string;
  image: string;
  parentId: string;
}

interface Category { id: string; nameEn: string }

interface Props {
  categories?: Category[];
  initialValues?: Partial<FormValues>;
  categoryId?: string;
}

function slugify(str: string) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const LANG_TABS = [
  { key: "en", label: "English" },
  { key: "km", label: "ខ្មែរ" },
  { key: "ja", label: "日本語" },
  { key: "zh", label: "中文" },
] as const;

type LangKey = (typeof LANG_TABS)[number]["key"];

export function CategoryForm({ categories = [], initialValues, categoryId }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeLang, setActiveLang] = useState<LangKey>("en");
  const [form, setForm] = useState<FormValues>({
    nameEn: "", nameKm: "", nameJa: "", nameZh: "",
    slug: "", description: "", image: "", parentId: "",
    ...initialValues,
  });

  function set(patch: Partial<FormValues>) {
    setForm((f) => ({ ...f, ...patch }));
  }

  async function handleImageFile(files: FileList | null) {
    if (!files?.[0]) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", files[0]);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        set({ image: url });
        toast.success("Image uploaded");
      } else {
        toast.error("Upload failed");
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nameEn.trim()) { toast.error("English name is required"); return; }
    if (!form.slug.trim()) { toast.error("Slug is required"); return; }

    setSaving(true);
    try {
      const payload = {
        nameEn: form.nameEn.trim(),
        nameKm: form.nameKm.trim() || form.nameEn.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || null,
        image: form.image || null,
        parentId: form.parentId || null,
      };

      const url = categoryId
        ? `/api/admin/categories/${categoryId}`
        : "/api/admin/categories";
      const method = categoryId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(categoryId ? "Category updated!" : "Category created!");
        router.push("/admin/categories");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Failed to save");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!categoryId) return;
    if (!confirm("Delete this category? Products in it will be unaffected.")) return;
    const res = await fetch(`/api/admin/categories/${categoryId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Category deleted");
      router.push("/admin/categories");
      router.refresh();
    } else {
      const d = await res.json();
      toast.error(d.error ?? "Cannot delete");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: names + description */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Category Details</h2>
              {/* Language tabs */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                {LANG_TABS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setActiveLang(t.key)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      activeLang === t.key
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {activeLang === "en" && "Name (English)"}{activeLang === "km" && "Name (ខ្មែរ)"}
                {activeLang === "ja" && "Name (日本語)"}{activeLang === "zh" && "Name (中文)"}
                {activeLang === "en" && <span className="text-red-500"> *</span>}
              </label>
              {activeLang === "en" && (
                <input
                  required
                  value={form.nameEn}
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm((f) => ({
                      ...f, nameEn: v,
                      slug: !f.slug || f.slug === slugify(f.nameEn) ? slugify(v) : f.slug,
                    }));
                  }}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Category name in English"
                />
              )}
              {activeLang === "km" && (
                <input
                  value={form.nameKm}
                  onChange={(e) => set({ nameKm: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="ឈ្មោះប្រភេទ"
                />
              )}
              {activeLang === "ja" && (
                <input
                  value={form.nameJa}
                  onChange={(e) => set({ nameJa: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="カテゴリー名"
                />
              )}
              {activeLang === "zh" && (
                <input
                  value={form.nameZh}
                  onChange={(e) => set({ nameZh: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="类别名称"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug <span className="text-red-500">*</span></label>
              <input
                required
                value={form.slug}
                onChange={(e) => set({ slug: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="category-slug"
              />
              <p className="text-xs text-gray-400 mt-1">Auto-generated. Used in URLs: /products?category={form.slug || "..."}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => set({ description: e.target.value })}
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                placeholder="Optional description..."
              />
            </div>
          </div>
        </div>

        {/* Right: image, parent, actions */}
        <div className="space-y-6">
          {/* Image */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Category Image</h2>
            {form.image ? (
              <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 group">
                <Image src={form.image} alt="Category" fill className="object-cover" sizes="300px" />
                <button
                  type="button"
                  onClick={() => set({ image: "" })}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full aspect-video rounded-xl border-2 border-dashed border-gray-200 hover:border-red-400 hover:bg-red-50 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <Upload className="h-6 w-6" />
                    <span className="text-sm">Upload image</span>
                  </>
                )}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageFile(e.target.files)}
            />
          </div>

          {/* Parent category */}
          {categories.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-4">Parent Category</h2>
              <select
                value={form.parentId}
                onChange={(e) => set({ parentId: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">— None (top-level) —</option>
                {categories
                  .filter((c) => c.id !== categoryId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>{c.nameEn}</option>
                  ))}
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-red-600 text-white font-semibold py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving…" : categoryId ? "Update Category" : "Create Category"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            {categoryId && (
              <button
                type="button"
                onClick={handleDelete}
                className="w-full border border-red-200 text-red-600 font-medium py-2.5 rounded-xl hover:bg-red-50 transition-colors text-sm"
              >
                Delete Category
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
