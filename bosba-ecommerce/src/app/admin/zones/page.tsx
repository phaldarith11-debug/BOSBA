"use client";
import { useEffect, useState } from "react";
import { MapPin, Plus, Pencil, Power, X, Check, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";

const ALL_PROVINCES = [
  "Phnom Penh",
  "Siem Reap",
  "Sihanoukville",
  "Battambang",
  "Kampong Cham",
  "Kampong Chhnang",
  "Kampong Speu",
  "Kampong Thom",
  "Kampot",
  "Kandal",
  "Kep",
  "Koh Kong",
  "Kratié",
  "Mondulkiri",
  "Oddar Meanchey",
  "Pailin",
  "Preah Sihanouk",
  "Preah Vihear",
  "Prey Veng",
  "Pursat",
  "Ratanakiri",
  "Svay Rieng",
  "Takéo",
  "Tboung Khmum",
  "Other Province",
];

type Zone = {
  id: string;
  nameEn: string;
  nameKm: string;
  priceUsd: number;
  priceKhr: number;
  freeOverUsd: number | null;
  estimatedDays: number;
  provinces: string[];
  sortOrder: number;
  active: boolean;
};

const EMPTY_ZONE: Omit<Zone, "id"> = {
  nameEn: "",
  nameKm: "",
  priceUsd: 0,
  priceKhr: 0,
  freeOverUsd: null,
  estimatedDays: 3,
  provinces: [],
  sortOrder: 99,
  active: true,
};

function ZoneModal({
  zone,
  onClose,
  onSave,
}: {
  zone: Partial<Zone> & { id?: string };
  onClose: () => void;
  onSave: (data: Omit<Zone, "id">, id?: string) => Promise<void>;
}) {
  const isNew = !zone.id;
  const KHR_RATE = Number(process.env.NEXT_PUBLIC_KHR_RATE ?? 4100);

  const [form, setForm] = useState<Omit<Zone, "id">>({
    nameEn: zone.nameEn ?? "",
    nameKm: zone.nameKm ?? "",
    priceUsd: zone.priceUsd ?? 0,
    priceKhr: zone.priceKhr ?? 0,
    freeOverUsd: zone.freeOverUsd ?? null,
    estimatedDays: zone.estimatedDays ?? 3,
    provinces: zone.provinces ?? [],
    sortOrder: zone.sortOrder ?? 99,
    active: zone.active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [showProvinces, setShowProvinces] = useState(false);

  function setField<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  function toggleProvince(p: string) {
    setForm((prev) => ({
      ...prev,
      provinces: prev.provinces.includes(p)
        ? prev.provinces.filter((x) => x !== p)
        : [...prev.provinces, p],
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nameEn.trim()) return toast.error("English name is required");
    setSaving(true);
    try {
      await onSave(
        { ...form, priceKhr: Math.round(form.priceUsd * KHR_RATE) },
        zone.id
      );
      onClose();
    } catch {
      toast.error("Failed to save zone");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-semibold">{isNew ? "New Delivery Zone" : "Edit Zone"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name (English) *</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                value={form.nameEn}
                onChange={(e) => setField("nameEn", e.target.value)}
                placeholder="Phnom Penh"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name (Khmer)</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                value={form.nameKm}
                onChange={(e) => setField("nameKm", e.target.value)}
                placeholder="ភ្នំពេញ"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Fee (USD)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                value={form.priceUsd}
                onChange={(e) => setField("priceUsd", Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Free Delivery Over (USD)
                <span className="text-gray-400 font-normal ml-1">— leave blank to disable</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                value={form.freeOverUsd ?? ""}
                onChange={(e) =>
                  setField("freeOverUsd", e.target.value === "" ? null : Number(e.target.value))
                }
                placeholder="e.g. 20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Days</label>
              <input
                type="number"
                min="1"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                value={form.estimatedDays}
                onChange={(e) => setField("estimatedDays", Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input
                type="number"
                min="0"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                value={form.sortOrder}
                onChange={(e) => setField("sortOrder", Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowProvinces((v) => !v)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              {showProvinces ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              Provinces ({form.provinces.length} selected)
            </button>

            {showProvinces && (
              <div className="mt-2 border rounded-lg p-3 grid grid-cols-2 gap-1 max-h-56 overflow-y-auto">
                {ALL_PROVINCES.map((p) => (
                  <label key={p} className="flex items-center gap-2 text-sm cursor-pointer py-0.5">
                    <input
                      type="checkbox"
                      checked={form.provinces.includes(p)}
                      onChange={() => toggleProvince(p)}
                      className="accent-red-500"
                    />
                    {p}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setField("active", e.target.checked)}
                className="accent-red-500"
              />
              Active (visible to customers)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {isNew ? "Create Zone" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminZonesPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Zone | null>(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/zones");
    const data = await res.json();
    setZones(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSave(data: Omit<Zone, "id">, id?: string) {
    const url = id ? `/api/admin/zones/${id}` : "/api/admin/zones";
    const method = id ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("save failed");
    toast.success(id ? "Zone updated" : "Zone created");
    await load();
  }

  async function toggleActive(zone: Zone) {
    const res = await fetch(`/api/admin/zones/${zone.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...zone, active: !zone.active }),
    });
    if (!res.ok) return toast.error("Failed to update zone");
    toast.success(zone.active ? "Zone deactivated" : "Zone activated");
    await load();
  }

  const activeZones = zones.filter((z) => z.active);
  const inactiveZones = zones.filter((z) => !z.active);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery Zones</h1>
          <p className="text-sm text-gray-500 mt-1">
            {activeZones.length} active zone{activeZones.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 font-medium"
        >
          <Plus className="h-4 w-4" /> New Zone
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading zones…</div>
      ) : (
        <>
          <ZoneTable zones={activeZones} onEdit={setEditing} onToggle={toggleActive} />

          {inactiveZones.length > 0 && (
            <div className="mt-8">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Inactive Zones
              </h2>
              <ZoneTable zones={inactiveZones} onEdit={setEditing} onToggle={toggleActive} inactive />
            </div>
          )}
        </>
      )}

      {(editing || creating) && (
        <ZoneModal
          zone={editing ?? EMPTY_ZONE}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function ZoneTable({
  zones,
  onEdit,
  onToggle,
  inactive,
}: {
  zones: Zone[];
  onEdit: (z: Zone) => void;
  onToggle: (z: Zone) => void;
  inactive?: boolean;
}) {
  if (zones.length === 0) return null;

  return (
    <div className={`bg-white rounded-xl shadow-sm border overflow-hidden ${inactive ? "opacity-60" : ""}`}>
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Zone</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">Fee (USD)</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">Free Over</th>
            <th className="text-center px-4 py-3 font-medium text-gray-600">Days</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Provinces</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {zones.map((zone) => (
            <tr key={zone.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-400 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">{zone.nameEn}</div>
                    {zone.nameKm && (
                      <div className="text-xs text-gray-500">{zone.nameKm}</div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-right font-mono">
                {zone.priceUsd === 0 ? (
                  <span className="text-green-600 font-semibold">Free</span>
                ) : (
                  <span>${zone.priceUsd.toFixed(2)}</span>
                )}
              </td>
              <td className="px-4 py-3 text-right font-mono text-gray-500">
                {zone.freeOverUsd != null ? (
                  <span className="text-green-600">${zone.freeOverUsd.toFixed(2)}</span>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-center text-gray-600">
                {zone.estimatedDays}d
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1 max-w-xs">
                  {zone.provinces.slice(0, 3).map((p) => (
                    <span
                      key={p}
                      className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full"
                    >
                      {p}
                    </span>
                  ))}
                  {zone.provinces.length > 3 && (
                    <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                      +{zone.provinces.length - 3} more
                    </span>
                  )}
                  {zone.provinces.length === 0 && (
                    <span className="text-gray-400 text-xs italic">No provinces assigned</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => onEdit(zone)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onToggle(zone)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      zone.active
                        ? "text-gray-400 hover:text-orange-600 hover:bg-orange-50"
                        : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                    }`}
                    title={zone.active ? "Deactivate" : "Activate"}
                  >
                    <Power className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
