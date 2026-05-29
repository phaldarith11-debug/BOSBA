"use client";
import { useState, useEffect } from "react";
import { Loader2, Save, Globe } from "lucide-react";
import toast from "react-hot-toast";

const LANG_TABS = [
  { key: "en", label: "English", flag: "🇬🇧" },
  { key: "km", label: "ខ្មែរ",    flag: "🇰🇭" },
  { key: "ja", label: "日本語",   flag: "🇯🇵" },
  { key: "zh", label: "中文",     flag: "🇨🇳" },
] as const;
type LangKey = (typeof LANG_TABS)[number]["key"];

interface Section {
  id: string;
  label: string;
  description: string;
  keys: { suffix: string; placeholder: string; multiline?: boolean }[];
}

const SECTIONS: Section[] = [
  {
    id: "hero",
    label: "Hero Section",
    description: "The main banner on the homepage",
    keys: [
      { suffix: "badge",    placeholder: "Free delivery in Phnom Penh" },
      { suffix: "title",    placeholder: "Shop Cambodia's" },
      { suffix: "highlight",placeholder: "Best Products" },
      { suffix: "subtitle", placeholder: "Pay in USD or KHR...", multiline: true },
      { suffix: "cta",      placeholder: "Shop Now →" },
    ],
  },
  {
    id: "delivery",
    label: "Delivery Strip",
    description: "The delivery zone banner below featured products",
    keys: [
      { suffix: "title",    placeholder: "We Deliver Across Cambodia" },
      { suffix: "zones",    placeholder: "Phnom Penh • Siem Reap • ..." },
      { suffix: "cta",      placeholder: "Start Shopping" },
    ],
  },
  {
    id: "featured",
    label: "Featured Products",
    description: "Section titles for the featured products area",
    keys: [
      { suffix: "title",   placeholder: "Featured Products" },
      { suffix: "viewAll", placeholder: "View all →" },
    ],
  },
  {
    id: "announcement",
    label: "Announcement Bar",
    description: "The top announcement stripe (leave empty to hide)",
    keys: [
      { suffix: "text", placeholder: "Free delivery on orders over $30 · Use WELCOME10 for 10% off", multiline: true },
    ],
  },
];

type SettingsMap = Record<string, string>;

export default function ContentEditorPage() {
  const [activeLang, setActiveLang] = useState<LangKey>("en");
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => { setSettings(data); })
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  function setValue(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function settingKey(sectionId: string, suffix: string) {
    return `content.${activeLang}.${sectionId}.${suffix}`;
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) toast.success("Content saved!");
      else toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Homepage Content Editor</h1>
          <p className="text-sm text-gray-500 mt-1">
            Edit the text content for each section of your homepage in all languages
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-red-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving…" : "Save All"}
        </button>
      </div>

      {/* Language tabs */}
      <div className="flex gap-2 flex-wrap">
        {LANG_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveLang(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeLang === t.key
                ? "bg-red-600 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
            }`}
          >
            <span>{t.flag}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
        <Globe className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-blue-900">
            Editing: {LANG_TABS.find((t) => t.key === activeLang)?.label} content
          </p>
          <p className="text-xs text-blue-700 mt-0.5">
            These values override the default translation file for this language. Leave a field empty to use the default.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {SECTIONS.map((section) => (
          <div key={section.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-900">{section.label}</h2>
              <p className="text-xs text-gray-500 mt-0.5">{section.description}</p>
            </div>
            <div className="p-6 space-y-4">
              {section.keys.map((k) => {
                const key = settingKey(section.id, k.suffix);
                return (
                  <div key={k.suffix}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                      {k.suffix.replace(/([A-Z])/g, " $1")}
                    </label>
                    {k.multiline ? (
                      <textarea
                        value={settings[key] ?? ""}
                        onChange={(e) => setValue(key, e.target.value)}
                        rows={2}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                        placeholder={k.placeholder}
                      />
                    ) : (
                      <input
                        value={settings[key] ?? ""}
                        onChange={(e) => setValue(key, e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder={k.placeholder}
                      />
                    )}
                    <p className="text-xs text-gray-400 mt-1">Default: &quot;{k.placeholder}&quot;</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-red-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving…" : "Save All Content"}
        </button>
      </div>
    </div>
  );
}
