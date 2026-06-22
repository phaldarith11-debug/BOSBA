"use client";
import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, FlaskConical, X } from "lucide-react";
import toast from "react-hot-toast";

interface Flag { id: string; key: string; enabled: boolean; description: string | null }

export default function DeveloperFeatureFlagsPage() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ key: "", description: "", enabled: false });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/developer/feature-flags");
    if (res.ok) setFlags((await res.json()).flags);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function toggle(f: Flag) {
    const res = await fetch(`/api/developer/feature-flags/${f.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled: !f.enabled }),
    });
    if (res.ok) { setFlags((fs) => fs.map((x) => x.id === f.id ? { ...x, enabled: !x.enabled } : x)); }
    else toast.error("Failed");
  }

  async function remove(f: Flag) {
    if (!confirm(`Delete flag "${f.key}"?`)) return;
    const res = await fetch(`/api/developer/feature-flags/${f.id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Deleted"); load(); } else toast.error("Failed");
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/developer/feature-flags", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) { toast.success("Flag created"); setShowAdd(false); setForm({ key: "", description: "", enabled: false }); load(); }
    else { const d = await res.json(); toast.error(d.error ?? "Failed"); }
  }

  const input = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feature Flags</h1>
          <p className="text-sm text-gray-500 mt-0.5">Toggle features on web + mobile without deploying. Read flags via <code className="text-xs bg-gray-100 px-1 rounded">/api/feature-flags</code>.</p>
        </div>
        <button onClick={() => setShowAdd((v) => !v)} className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-indigo-700">
          <Plus className="h-4 w-4" /> New Flag
        </button>
      </div>

      {showAdd && (
        <form onSubmit={add} className="bg-white rounded-2xl shadow-sm p-6 border border-indigo-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">New Feature Flag</h2>
            <button type="button" onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Key <span className="text-red-500">*</span></label>
              <input required value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} className={input} placeholder="checkout.aba_auto" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={input} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} className="rounded" /> Enabled on creation
          </label>
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Create
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
        ) : flags.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-400"><FlaskConical className="h-10 w-10 mb-3" /><p className="text-sm">No feature flags yet.</p></div>
        ) : (
          <div className="divide-y divide-gray-100">
            {flags.map((f) => (
              <div key={f.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm font-medium text-gray-900">{f.key}</p>
                  {f.description && <p className="text-xs text-gray-400 mt-0.5">{f.description}</p>}
                </div>
                <button onClick={() => toggle(f)} className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${f.enabled ? "bg-indigo-600" : "bg-gray-300"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${f.enabled ? "translate-x-5" : ""}`} />
                </button>
                <button onClick={() => remove(f)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
