"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface FormValues {
  titleEn: string; titleKm: string; titleJa: string; titleZh: string;
  subtitleEn: string; subtitleKm: string; subtitleJa: string; subtitleZh: string;
  image: string; link: string; buttonText: string;
  position: string; sortOrder: string; active: boolean;
  startsAt: string; endsAt: string;
}

interface Props { initialValues?: Partial<FormValues>; bannerId?: string }

const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";
const LANG_TABS = [
  { key: "en", label: "EN" },
  { key: "km", label: "KM" },
  { key: "ja", label: "JA" },
  { key: "zh", label: "ZH" },
] as const;
type LangKey = (typeof LANG_TABS)[number]["key"];

export function BannerForm({ initialValues, bannerId }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lang, setLang] = useState<LangKey>("en");
  const [form, setForm] = useState<FormValues>({
    titleEn: "", titleKm: "", titleJa: "", titleZh: "",
    subtitleEn: "", subtitleKm: "", subtitleJa: "", subtitleZh: "",
    image: "", link: "", buttonText: "",
    position: "hero", sortOrder: "0", active: true,
    startsAt: "", endsAt: "",
    ...initialValues,
  });
  const set = (patch: Partial<FormValues>) => setForm((f) => ({ ...f, ...patch }));

  async function handleImg(files: FileList | null) {
    if (!files?.[0]) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", files[0]);
    fd.append("folder", "bosba/banners");
    const res = await fetch("/api/admin/media", { method: "POST", body: fd });
    if (res.ok) { const { url } = await res.json(); set({ image: url }); toast.success("Uploaded"); }
    else toast.error("Upload failed");
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.titleEn) { toast.error("English title is required"); return; }
    if (!form.image) { toast.error("Banner image is required"); return; }
    setSaving(true);
    try {
      const url = bannerId ? `/api/admin/banners/${bannerId}` : "/api/admin/banners";
      const method = bannerId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success(bannerId ? "Banner updated!" : "Banner created!");
        router.push("/admin/banners");
        router.refresh();
      } else {
        const d = await res.json();
        toast.error(d.error ?? "Failed");
      }
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!bannerId || !confirm("Delete this banner?")) return;
    const res = await fetch(`/api/admin/banners/${bannerId}`, { method: "DELETE" });
    if (res.ok) { toast.success("Deleted"); router.push("/admin/banners"); router.refresh(); }
    else toast.error("Delete failed");
  }

  const titleKey = `title${lang.charAt(0).toUpperCase() + lang.slice(1)}` as keyof FormValues;
  const subtitleKey = `subtitle${lang.charAt(0).toUpperCase() + lang.slice(1)}` as keyof FormValues;

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Text content */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Banner Content</h2>
              <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                {LANG_TABS.map((t) => (
                  <button key={t.key} type="button" onClick={() => setLang(t.key)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${lang === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  >{t.label}</button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Title{lang === "en" && <span className="text-red-500"> *</span>}</label>
              <input
                required={lang === "en"}
                value={(form[titleKey] as string) ?? ""}
                onChange={(e) => set({ [titleKey]: e.target.value } as Partial<FormValues>)}
                className={inputCls}
                placeholder={lang === "km" ? "ចំណងជើងផ្ទាំង" : lang === "ja" ? "バナータイトル" : lang === "zh" ? "横幅标题" : "Banner headline"}
              />
            </div>
            <div>
              <label className={labelCls}>Subtitle</label>
              <input
                value={(form[subtitleKey] as string) ?? ""}
                onChange={(e) => set({ [subtitleKey]: e.target.value } as Partial<FormValues>)}
                className={inputCls}
                placeholder="Optional subtitle / tagline"
              />
            </div>
          </div>

          {/* Image */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Banner Image <span className="text-red-500">*</span></h2>
            {form.image ? (
              <div className="relative aspect-[21/9] rounded-xl overflow-hidden bg-gray-100 group">
                <Image src={form.image} alt="" fill className="object-cover" sizes="800px" />
                <button type="button" onClick={() => set({ image: "" })}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                className="w-full aspect-[21/9] rounded-xl border-2 border-dashed border-gray-200 hover:border-red-400 hover:bg-red-50 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
              >
                {uploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <><Upload className="h-8 w-8" /><span className="text-sm font-medium">Upload banner image</span><span className="text-xs">Recommended: 1920×600px</span></>}
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImg(e.target.files)} />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Settings */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900">Settings</h2>
            <div>
              <label className={labelCls}>Position</label>
              <select value={form.position} onChange={(e) => set({ position: e.target.value })} className={inputCls}>
                <option value="hero">Hero Slider</option>
                <option value="promo">Promo Bar</option>
                <option value="sidebar">Sidebar</option>
                <option value="popup">Popup</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Sort Order</label>
              <input type="number" min="0" value={form.sortOrder} onChange={(e) => set({ sortOrder: e.target.value })} className={inputCls} placeholder="0" />
            </div>
            <div>
              <label className={labelCls}>Button / CTA Link</label>
              <input value={form.link} onChange={(e) => set({ link: e.target.value })} className={inputCls} placeholder="/products" />
            </div>
            <div>
              <label className={labelCls}>Button Text</label>
              <input value={form.buttonText} onChange={(e) => set({ buttonText: e.target.value })} className={inputCls} placeholder="Shop Now" />
            </div>
          </div>

          {/* Scheduling */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-900">Scheduling</h2>
            <div>
              <label className={labelCls}>Start Date</label>
              <input type="datetime-local" value={form.startsAt} onChange={(e) => set({ startsAt: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>End Date</label>
              <input type="datetime-local" value={form.endsAt} onChange={(e) => set({ endsAt: e.target.value })} className={inputCls} />
            </div>
            <p className="text-xs text-gray-400">Leave blank to always show</p>
          </div>

          {/* Status */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Status</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <div onClick={() => set({ active: !form.active })}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${form.active ? "bg-green-500" : "bg-gray-300"}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.active ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
              <span className="text-sm text-gray-700">{form.active ? "Active" : "Inactive"}</span>
            </label>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button type="submit" disabled={saving}
              className="w-full bg-red-600 text-white font-semibold py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving…" : bannerId ? "Update Banner" : "Create Banner"}
            </button>
            <button type="button" onClick={() => router.back()}
              className="w-full border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >Cancel</button>
            {bannerId && (
              <button type="button" onClick={handleDelete}
                className="w-full border border-red-200 text-red-600 font-medium py-2.5 rounded-xl hover:bg-red-50 transition-colors text-sm"
              >Delete Banner</button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
