"use client";
import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";
import { groupById, type SettingField } from "@/lib/setting-registry";

/**
 * Generic settings editor for one registry group. Loads the current values from
 * /api/developer/settings and writes them back, validated server-side against
 * the key whitelist.
 */
export function SettingsForm({ groupId }: { groupId: string }) {
  const group = groupById(groupId);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/developer/settings")
      .then((r) => (r.ok ? r.json() : {}))
      .then((d) => setValues(d ?? {}))
      .finally(() => setLoading(false));
  }, []);

  if (!group) return <p className="text-sm text-red-500">Unknown settings group.</p>;

  function set(key: string, v: string) { setValues((x) => ({ ...x, [key]: v })); }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload: Record<string, string> = {};
    for (const f of group!.fields) payload[f.key] = values[f.key] ?? "";
    const res = await fetch("/api/developer/settings", {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) toast.success("Settings saved"); else toast.error("Failed to save");
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>;

  return (
    <form onSubmit={save} className="space-y-6 max-w-2xl">
      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        {group.fields.map((f) => (
          <Field key={f.key} field={f} value={values[f.key] ?? ""} onChange={(v) => set(f.key, v)} />
        ))}
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={saving} className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Settings
        </button>
      </div>
    </form>
  );
}

function Field({ field, value, onChange }: { field: SettingField; value: string; onChange: (v: string) => void }) {
  const input = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

  if (field.type === "boolean") {
    return (
      <label className="flex items-center justify-between gap-4 cursor-pointer">
        <span>
          <span className="block text-sm font-medium text-gray-700">{field.label}</span>
          {field.help && <span className="block text-xs text-gray-400 mt-0.5">{field.help}</span>}
        </span>
        <button
          type="button"
          onClick={() => onChange(value === "true" ? "false" : "true")}
          className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value === "true" ? "bg-indigo-600" : "bg-gray-300"}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${value === "true" ? "translate-x-5" : ""}`} />
        </button>
      </label>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
      {field.type === "textarea" ? (
        <textarea rows={2} value={value} onChange={(e) => onChange(e.target.value)} className={input} placeholder={field.placeholder} />
      ) : field.type === "select" ? (
        <select value={value} onChange={(e) => onChange(e.target.value)} className={input}>
          {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : field.type === "color" ? (
        <div className="flex items-center gap-2">
          <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={input} placeholder="#dc2626" />
          <span className="w-9 h-9 rounded-lg border border-gray-200 flex-shrink-0" style={{ background: value || "transparent" }} />
        </div>
      ) : (
        <input type={field.type === "number" ? "number" : "text"} value={value} onChange={(e) => onChange(e.target.value)} className={input} placeholder={field.placeholder} />
      )}
      {field.help && field.type !== "color" && <p className="text-xs text-gray-400 mt-1">{field.help}</p>}
    </div>
  );
}
