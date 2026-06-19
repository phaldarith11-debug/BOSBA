"use client";
import { useState, useEffect } from "react";
import { UserPlus, Trash2, Shield, ChevronDown, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";

interface StaffMember {
  id: string;
  name: string | null;
  email: string;
  role: string;
  image: string | null;
  createdAt: string;
  emailVerified: string | null;
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN:     "bg-red-100 text-red-700",
  MANAGER:   "bg-blue-100 text-blue-700",
  EDITOR:    "bg-purple-100 text-purple-700",
  SELLER:    "bg-emerald-100 text-emerald-700",
  DEVELOPER: "bg-indigo-100 text-indigo-700",
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  ADMIN:     "Full access. Can manage staff, settings, and all content.",
  MANAGER:   "Can manage products, orders, banners, and coupons. Cannot manage staff or system settings.",
  EDITOR:    "Can manage products, categories, and banners only.",
  SELLER:    "Marketplace vendor. Manages only their own products, orders, and payouts in the Seller Center.",
  DEVELOPER: "Platform/system access. Manages feature flags, themes, layout, API and maintenance tools.",
};

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "EDITOR" });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/staff");
    if (res.ok) setStaff(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Staff member added!");
      setShowAdd(false);
      setForm({ name: "", email: "", password: "", role: "EDITOR" });
      load();
    } else {
      const d = await res.json();
      toast.error(d.error ?? "Failed");
    }
    setSaving(false);
  }

  async function handleRoleChange(id: string, role: string) {
    const res = await fetch(`/api/admin/staff/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) { toast.success("Role updated"); load(); }
    else { const d = await res.json(); toast.error(d.error ?? "Failed"); }
  }

  async function handleRemove(id: string, email: string) {
    if (!confirm(`Remove staff access for ${email}? They will become a regular customer.`)) return;
    const res = await fetch(`/api/admin/staff/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Staff access removed"); load(); }
    else { const d = await res.json(); toast.error(d.error ?? "Failed"); }
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff & Roles</h1>
          <p className="text-sm text-gray-500 mt-0.5">{staff.length} staff member{staff.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="flex items-center gap-2 bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          Add Staff
        </button>
      </div>

      {/* Role permissions info */}
      <div className="grid sm:grid-cols-3 gap-4">
        {Object.entries(ROLE_DESCRIPTIONS).map(([role, desc]) => (
          <div key={role} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-gray-500" />
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ROLE_COLORS[role]}`}>{role}</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* Add staff form */}
      {showAdd && (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-red-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900">Add Staff Member</h2>
            <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleAdd} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="Jane Smith" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} placeholder="jane@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
              <input required type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputCls} placeholder="Min. 8 characters" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role <span className="text-red-500">*</span></label>
              <select required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputCls}>
                <option value="EDITOR">Editor</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
                <option value="SELLER">Seller</option>
                <option value="DEVELOPER">Developer</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="flex items-center gap-2 bg-red-600 text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? "Adding…" : "Add Staff Member"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Staff table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Member</th>
                <th className="px-5 py-3 text-left">Role</th>
                <th className="px-5 py-3 text-left">Joined</th>
                <th className="px-5 py-3 text-left">Verified</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-700 font-bold text-sm flex-shrink-0">
                        {(member.name ?? member.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.name ?? "—"}</p>
                        <p className="text-xs text-gray-400">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="relative inline-block">
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-full appearance-none pr-6 cursor-pointer border-0 focus:ring-2 focus:ring-offset-1 focus:ring-red-500 ${ROLE_COLORS[member.role] ?? "bg-gray-100 text-gray-700"}`}
                      >
                        <option value="EDITOR">EDITOR</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="SELLER">SELLER</option>
                        <option value="DEVELOPER">DEVELOPER</option>
                      </select>
                      <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none" />
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-xs">
                    {new Date(member.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    {member.emailVerified ? (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Verified</span>
                    ) : (
                      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Pending</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => handleRemove(member.id, member.email)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove staff access"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {staff.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-400">No staff members yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
