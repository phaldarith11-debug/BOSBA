"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Plus, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Pencil, Save, X,
  ExternalLink, Loader2, LinkIcon,
} from "lucide-react";
import {
  MENU_LOCATIONS, DEVICES,
  type MenuItemDTO, type MenuLocation, type Device,
} from "@/lib/menu-blocks";

const API = "/api/developer/menus";

export default function MenuBuilderPage() {
  const [location, setLocation] = useState<MenuLocation>("header");
  const [items, setItems] = useState<MenuItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(async (loc: MenuLocation) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}?location=${loc}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setItems(data.items ?? []);
    } catch {
      toast.error("Could not load menu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(location);
  }, [location, load]);

  async function addItem() {
    setBusy(true);
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, labelEn: "New link", url: "/" }),
      });
      if (!res.ok) throw new Error();
      const { item } = await res.json();
      await load(location);
      setEditingId(item.id);
    } catch {
      toast.error("Could not add link");
    } finally {
      setBusy(false);
    }
  }

  async function patch(id: string, body: Record<string, unknown>, okMsg?: string) {
    setBusy(true);
    try {
      const res = await fetch(`${API}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      if (okMsg) toast.success(okMsg);
      await load(location);
    } catch {
      toast.error("Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(item: MenuItemDTO) {
    if (!window.confirm(`Delete “${item.labelEn}”? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`${API}/${item.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Deleted");
      await load(location);
    } catch {
      toast.error("Delete failed");
    } finally {
      setBusy(false);
    }
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const a = items[index];
    const b = items[target];
    setBusy(true);
    try {
      await Promise.all([
        fetch(`${API}/${a.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: b.sortOrder }),
        }),
        fetch(`${API}/${b.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: a.sortOrder }),
        }),
      ]);
      await load(location);
    } catch {
      toast.error("Reorder failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Builder</h1>
          <p className="mt-1 text-sm text-gray-500">
            Control navigation links for the website &amp; mobile app. Drafts stay private;
            published links go live instantly.
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <ExternalLink className="h-4 w-4" /> View site
        </a>
      </div>

      {/* Location tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {MENU_LOCATIONS.map((loc) => (
          <button
            key={loc.location}
            onClick={() => { setEditingId(null); setLocation(loc.location); }}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              location === loc.location
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {loc.label}
          </button>
        ))}
      </div>

      <p className="mb-3 text-xs text-gray-400">
        {MENU_LOCATIONS.find((l) => l.location === location)?.description}
      </p>

      <button
        onClick={addItem}
        disabled={busy}
        className="mb-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
      >
        <Plus className="h-4 w-4" /> Add link
      </button>

      {loading ? (
        <div className="flex items-center gap-2 py-16 text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-14 text-center">
          <p className="text-3xl">🔗</p>
          <p className="mt-2 font-medium text-gray-700">No links yet</p>
          <p className="text-sm text-gray-400">Add a link to build this menu.</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item, i) => (
            <li key={item.id} className="rounded-2xl border border-gray-100 bg-white shadow-sm">
              <MenuRow
                item={item}
                first={i === 0}
                last={i === items.length - 1}
                busy={busy}
                editing={editingId === item.id}
                onEdit={() => setEditingId(editingId === item.id ? null : item.id)}
                onMoveUp={() => move(i, -1)}
                onMoveDown={() => move(i, 1)}
                onTogglePublish={() =>
                  patch(
                    item.id,
                    { status: item.status === "published" ? "draft" : "published" },
                    item.status === "published" ? "Unpublished" : "Published — now live"
                  )
                }
                onToggleVisible={() => patch(item.id, { visible: !item.visible })}
                onDelete={() => remove(item)}
                onSave={async (body) => {
                  await patch(item.id, body, "Saved");
                  setEditingId(null);
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "green" | "gray" | "amber" }) {
  const tones = {
    green: "bg-green-100 text-green-700",
    gray: "bg-gray-100 text-gray-600",
    amber: "bg-amber-100 text-amber-700",
  };
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${tones[tone]}`}>{children}</span>;
}

function MenuRow({
  item, first, last, busy, editing,
  onEdit, onMoveUp, onMoveDown, onTogglePublish, onToggleVisible, onDelete, onSave,
}: {
  item: MenuItemDTO;
  first: boolean;
  last: boolean;
  busy: boolean;
  editing: boolean;
  onEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onTogglePublish: () => void;
  onToggleVisible: () => void;
  onDelete: () => void;
  onSave: (body: Record<string, unknown>) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 p-3.5">
        <div className="flex flex-col">
          <button onClick={onMoveUp} disabled={first || busy} className="text-gray-400 hover:text-gray-700 disabled:opacity-30" aria-label="Move up">
            <ArrowUp className="h-4 w-4" />
          </button>
          <button onClick={onMoveDown} disabled={last || busy} className="text-gray-400 hover:text-gray-700 disabled:opacity-30" aria-label="Move down">
            <ArrowDown className="h-4 w-4" />
          </button>
        </div>

        <LinkIcon className="h-4 w-4 flex-shrink-0 text-gray-300" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">{item.labelEn}</span>
            <Badge tone={item.status === "published" ? "green" : "amber"}>
              {item.status === "published" ? "Published" : "Draft"}
            </Badge>
            <Badge tone="gray">
              {item.device === "web" ? "Web" : item.device === "mobile" ? "Mobile" : "Web + Mobile"}
            </Badge>
            {!item.visible && <Badge tone="gray">Hidden</Badge>}
          </div>
          <p className="mt-0.5 truncate text-xs text-gray-400">{item.url}</p>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={onToggleVisible} disabled={busy} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" aria-label="Toggle visibility">
            {item.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
          <button onClick={onEdit} disabled={busy} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" aria-label="Edit">
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={onTogglePublish}
            disabled={busy}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
              item.status === "published"
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {item.status === "published" ? "Unpublish" : "Publish"}
          </button>
          <button onClick={onDelete} disabled={busy} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600" aria-label="Delete">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {editing && <MenuEditor item={item} onCancel={onEdit} onSave={onSave} />}
    </div>
  );
}

function MenuEditor({
  item, onCancel, onSave,
}: {
  item: MenuItemDTO;
  onCancel: () => void;
  onSave: (body: Record<string, unknown>) => void;
}) {
  const [form, setForm] = useState({
    labelEn: item.labelEn ?? "",
    labelKm: item.labelKm ?? "",
    url: item.url ?? "",
    icon: item.icon ?? "",
    device: item.device as Device,
    visible: item.visible,
  });

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  return (
    <div className="border-t border-gray-100 bg-gray-50/60 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Label (English)">
          <input className={inputCls} value={form.labelEn} onChange={(e) => set("labelEn", e.target.value)} />
        </Field>
        <Field label="Label (Khmer)">
          <input className={`${inputCls} font-khmer`} value={form.labelKm} onChange={(e) => set("labelKm", e.target.value)} />
        </Field>
        <Field label="URL" full>
          <input className={inputCls} placeholder="/products?category=food or https://…" value={form.url} onChange={(e) => set("url", e.target.value)} />
        </Field>
        <Field label="Icon (optional, for mobile)">
          <input className={inputCls} placeholder="e.g. Home, ShoppingBag" value={form.icon} onChange={(e) => set("icon", e.target.value)} />
        </Field>
        <Field label="Show on">
          <select className={inputCls} value={form.device} onChange={(e) => set("device", e.target.value as Device)}>
            {DEVICES.map((d) => (
              <option key={d} value={d}>
                {d === "web" ? "Website only" : d === "mobile" ? "Mobile app only" : "Website + Mobile"}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Visible">
          <label className="flex h-[42px] items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={form.visible} onChange={(e) => set("visible", e.target.checked)} className="h-4 w-4 rounded" />
            {form.visible ? "Shown" : "Hidden"}
          </label>
        </Field>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button onClick={() => onSave(form)} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          <Save className="h-4 w-4" /> Save
        </button>
        <button onClick={onCancel} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100">
          <X className="h-4 w-4" /> Cancel
        </button>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100";

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</span>
      {children}
    </label>
  );
}
