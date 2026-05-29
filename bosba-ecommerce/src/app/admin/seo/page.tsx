"use client";
import { useState, useEffect } from "react";
import { Save, Loader2, Search, Globe, Tag } from "lucide-react";
import toast from "react-hot-toast";

const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

const SEO_FIELDS = [
  {
    section: "Global SEO",
    icon: Globe,
    fields: [
      { key: "seo.siteName",        label: "Site Name",            placeholder: "BOSBA - Cambodia's Online Store" },
      { key: "seo.defaultTitle",    label: "Default Page Title",   placeholder: "BOSBA | Quality Products in Cambodia" },
      { key: "seo.titleTemplate",   label: "Title Template",       placeholder: "%s | BOSBA", hint: "Use %s for page title" },
      { key: "seo.defaultDesc",     label: "Default Meta Description", placeholder: "Shop quality products...", multiline: true },
      { key: "seo.keywords",        label: "Default Keywords",     placeholder: "cambodia shop, online store, ABA, ACLEDA", hint: "Comma-separated" },
      { key: "seo.canonicalUrl",    label: "Canonical Base URL",   placeholder: "https://bosba.com" },
    ],
  },
  {
    section: "Open Graph / Social",
    icon: Tag,
    fields: [
      { key: "seo.ogImage",         label: "Default OG Image URL", placeholder: "https://bosba.com/og-image.jpg", hint: "1200×630px recommended" },
      { key: "seo.twitterHandle",   label: "Twitter/X Handle",     placeholder: "@bosba" },
      { key: "seo.facebookAppId",   label: "Facebook App ID",      placeholder: "123456789" },
    ],
  },
  {
    section: "Technical",
    icon: Search,
    fields: [
      { key: "seo.googleVerify",    label: "Google Search Console Verification", placeholder: "google-site-verification=..." },
      { key: "seo.bingVerify",      label: "Bing Webmaster Verification",        placeholder: "XXXXXXXXXXXXXXXXXXXXXXXX" },
      { key: "seo.googleAnalytics", label: "Google Analytics ID",                placeholder: "G-XXXXXXXXXX" },
      { key: "seo.robots",          label: "robots.txt Content",                 placeholder: "User-agent: *\nAllow: /\nDisallow: /admin/", multiline: true },
    ],
  },
];

export default function SeoManagerPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (res.ok) toast.success("SEO settings saved!");
    else toast.error("Failed to save");
    setSaving(false);
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SEO Manager</h1>
          <p className="text-sm text-gray-500 mt-1">Configure meta tags, social sharing, and search engine settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-red-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving…" : "Save SEO Settings"}
        </button>
      </div>

      <div className="space-y-4">
        {SEO_FIELDS.map(({ section, icon: Icon, fields }) => (
          <div key={section} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
              <Icon className="h-4 w-4 text-gray-500" />
              <h2 className="font-semibold text-gray-900">{section}</h2>
            </div>
            <div className="p-6 grid sm:grid-cols-2 gap-5">
              {fields.map((f) => (
                <div key={f.key} className={f.multiline ? "sm:col-span-2" : ""}>
                  <label className={labelCls}>{f.label}</label>
                  {f.multiline ? (
                    <textarea
                      value={settings[f.key] ?? ""}
                      onChange={(e) => setSettings((p) => ({ ...p, [f.key]: e.target.value }))}
                      rows={3}
                      className={`${inputCls} resize-none font-mono`}
                      placeholder={f.placeholder}
                    />
                  ) : (
                    <input
                      value={settings[f.key] ?? ""}
                      onChange={(e) => setSettings((p) => ({ ...p, [f.key]: e.target.value }))}
                      className={inputCls}
                      placeholder={f.placeholder}
                    />
                  )}
                  {f.hint && <p className="text-xs text-gray-400 mt-1">{f.hint}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
        <p className="text-sm font-semibold text-amber-900">Per-product SEO</p>
        <p className="text-xs text-amber-700 mt-1">
          Individual product SEO is managed via the product editor. The settings above are global defaults used when no product-level override is set.
        </p>
      </div>
    </div>
  );
}
