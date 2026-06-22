"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Plus, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Pencil, Save, X,
  ExternalLink, Globe, Smartphone, Loader2,
} from "lucide-react";
import {
  SECTION_LIBRARY, SECTION_TYPES, DEVICES,
  type PageSectionDTO, type SectionType, type Device,
} from "@/lib/cms-blocks";

const API = "/api/developer/sections";

export default function HomepageBuilderPage() {
  const [sections, setSections] = useState<PageSectionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API}?page=home`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSections(data.sections ?? []);
    } catch {
      toast.error("Could not load sections");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function addBlock(type: SectionType) {
    setBusy(true);
    setAdding(false);
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: "home", type }),
      });
      if (!res.ok) throw new Error();
      const { section } = await res.json();
      toast.success(`${SECTION_LIBRARY[type].label} added (draft)`);
      await load();
      setEditingId(section.id);
    } catch {
      toast.error("Could not add block");
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
      await load();
    } catch {
      toast.error("Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(s: PageSectionDTO) {
    if (!window.confirm(`Delete this ${SECTION_LIBRARY[s.type].label}? This cannot be undone.`))
      return;
    setBusy(true);
    try {
      const res = await fetch(`${API}/${s.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Deleted");
      await load();
    } catch {
      toast.error("Delete failed");
    } finally {
      setBusy(false);
    }
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= sections.length) return;
    const a = sections[index];
    const b = sections[target];
    // Swap their sortOrder values, then reload in the new order.
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
      await load();
    } catch {
      toast.error("Reorder failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Homepage Builder</h1>
          <p className="mt-1 text-sm text-gray-500">
            Drag-free, no-code blocks. Drafts stay private; published blocks appear on the
            live website &amp; mobile app instantly.
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

      {/* Add block */}
      <div className="relative mb-5">
        <button
          onClick={() => setAdding((v) => !v)}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Add block
        </button>
        {adding && (
          <div className="absolute z-10 mt-2 w-72 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
            {SECTION_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => addBlock(type)}
                className="flex w-full flex-col items-start rounded-lg px-3 py-2 text-left hover:bg-gray-50"
              >
                <span className="text-sm font-semibold text-gray-800">
                  {SECTION_LIBRARY[type].label}
                </span>
                <span className="text-xs text-gray-400">
                  {SECTION_LIBRARY[type].description}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center gap-2 py-20 text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : sections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <p className="text-3xl">🧱</p>
          <p className="mt-2 font-medium text-gray-700">No blocks yet</p>
          <p className="text-sm text-gray-400">Add a block to start building the homepage.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {sections.map((s, i) => (
            <li
              key={s.id}
              className="rounded-2xl border border-gray-100 bg-white shadow-sm"
            >
              <SectionRow
                s={s}
                first={i === 0}
                last={i === sections.length - 1}
                busy={busy}
                editing={editingId === s.id}
                onEdit={() => setEditingId(editingId === s.id ? null : s.id)}
                onMoveUp={() => move(i, -1)}
                onMoveDown={() => move(i, 1)}
                onTogglePublish={() =>
                  patch(
                    s.id,
                    { status: s.status === "published" ? "draft" : "published" },
                    s.status === "published" ? "Unpublished" : "Published — now live"
                  )
                }
                onToggleVisible={() => patch(s.id, { visible: !s.visible })}
                onDelete={() => remove(s)}
                onSave={async (body) => {
                  await patch(s.id, body, "Saved");
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
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

function SectionRow({
  s, first, last, busy, editing,
  onEdit, onMoveUp, onMoveDown, onTogglePublish, onToggleVisible, onDelete, onSave,
}: {
  s: PageSectionDTO;
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
  const meta = SECTION_LIBRARY[s.type];
  return (
    <div>
      <div className="flex items-center gap-3 p-3.5">
        {/* Reorder */}
        <div className="flex flex-col">
          <button onClick={onMoveUp} disabled={first || busy} className="text-gray-400 hover:text-gray-700 disabled:opacity-30" aria-label="Move up">
            <ArrowUp className="h-4 w-4" />
          </button>
          <button onClick={onMoveDown} disabled={last || busy} className="text-gray-400 hover:text-gray-700 disabled:opacity-30" aria-label="Move down">
            <ArrowDown className="h-4 w-4" />
          </button>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">{meta.label}</span>
            <Badge tone={s.status === "published" ? "green" : "amber"}>
              {s.status === "published" ? "Published" : "Draft"}
            </Badge>
            <Badge tone="gray">
              {s.device === "web" ? "Web" : s.device === "mobile" ? "Mobile" : "Web + Mobile"}
            </Badge>
            {!s.visible && <Badge tone="gray">Hidden</Badge>}
          </div>
          <p className="mt-0.5 truncate text-xs text-gray-400">
            {s.titleEn || s.titleKm || meta.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button onClick={onToggleVisible} disabled={busy} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" aria-label="Toggle visibility" title={s.visible ? "Hide" : "Show"}>
            {s.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
          <button onClick={onEdit} disabled={busy} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" aria-label="Edit">
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={onTogglePublish}
            disabled={busy}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
              s.status === "published"
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {s.status === "published" ? "Unpublish" : "Publish"}
          </button>
          <button onClick={onDelete} disabled={busy} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600" aria-label="Delete">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {editing && <SectionEditor s={s} onCancel={onEdit} onSave={onSave} />}
    </div>
  );
}

function SectionEditor({
  s, onCancel, onSave,
}: {
  s: PageSectionDTO;
  onCancel: () => void;
  onSave: (body: Record<string, unknown>) => void;
}) {
  const fields = SECTION_LIBRARY[s.type].fields;
  const [form, setForm] = useState({
    titleEn: s.titleEn ?? "",
    titleKm: s.titleKm ?? "",
    subtitleEn: s.subtitleEn ?? "",
    subtitleKm: s.subtitleKm ?? "",
    image: s.image ?? "",
    buttonText: s.buttonText ?? "",
    buttonLink: s.buttonLink ?? "",
    bgColor: s.bgColor ?? "",
    textColor: s.textColor ?? "",
    device: s.device as Device,
    visible: s.visible,
  });

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  return (
    <div className="border-t border-gray-100 bg-gray-50/60 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.includes("title") && (
          <>
            <Field label="Title (English)">
              <input className={inputCls} value={form.titleEn} onChange={(e) => set("titleEn", e.target.value)} />
            </Field>
            <Field label="Title (Khmer)">
              <input className={`${inputCls} font-khmer`} value={form.titleKm} onChange={(e) => set("titleKm", e.target.value)} />
            </Field>
          </>
        )}
        {fields.includes("subtitle") && (
          <>
            <Field label="Subtitle (English)">
              <textarea rows={2} className={inputCls} value={form.subtitleEn} onChange={(e) => set("subtitleEn", e.target.value)} />
            </Field>
            <Field label="Subtitle (Khmer)">
              <textarea rows={2} className={`${inputCls} font-khmer`} value={form.subtitleKm} onChange={(e) => set("subtitleKm", e.target.value)} />
            </Field>
          </>
        )}
        {fields.includes("image") && (
          <Field label="Image URL" full>
            <input className={inputCls} placeholder="https://… (Cloudinary)" value={form.image} onChange={(e) => set("image", e.target.value)} />
          </Field>
        )}
        {fields.includes("button") && (
          <>
            <Field label="Button text">
              <input className={inputCls} value={form.buttonText} onChange={(e) => set("buttonText", e.target.value)} />
            </Field>
            <Field label="Button link">
              <input className={inputCls} placeholder="/products or https://…" value={form.buttonLink} onChange={(e) => set("buttonLink", e.target.value)} />
            </Field>
          </>
        )}
        {fields.includes("colors") && (
          <>
            <Field label="Background color">
              <input className={inputCls} placeholder="#7f1d1d or rgb(…)" value={form.bgColor} onChange={(e) => set("bgColor", e.target.value)} />
            </Field>
            <Field label="Text color">
              <input className={inputCls} placeholder="#ffffff" value={form.textColor} onChange={(e) => set("textColor", e.target.value)} />
            </Field>
          </>
        )}
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
            {form.visible ? <Globe className="h-4 w-4" /> : <Smartphone className="h-4 w-4 opacity-40" />}
            {form.visible ? "Shown" : "Hidden"}
          </label>
        </Field>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => onSave(form)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <Save className="h-4 w-4" /> Save
        </button>
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100"
        >
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
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </span>
      {children}
    </label>
  );
}
