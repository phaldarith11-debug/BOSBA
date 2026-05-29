"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, Link } from "@/i18n/navigation";
import toast from "react-hot-toast";
import {
  MessageCircle, CheckCircle2, XCircle, ExternalLink, Loader2, Unlink,
  User, Camera, Save, Eye, EyeOff, Lock, Package, ShoppingBag, AlertCircle,
} from "lucide-react";

type Profile = {
  id: string;
  name: string | null;
  nameKm: string | null;
  email: string;
  phone: string | null;
  image: string | null;
  emailVerified: string | null;
  role: string;
  createdAt: string;
};

type TelegramStatus = { linked: boolean; deepLink: string | null } | null;

function TelegramWidget() {
  const [status, setStatus] = useState<TelegramStatus>(null);
  const [loading, setLoading] = useState(true);
  const [unlinking, setUnlinking] = useState(false);

  async function load() {
    setLoading(true);
    try { const r = await fetch("/api/telegram/link"); if (r.ok) setStatus(await r.json()); }
    finally { setLoading(false); }
  }

  async function unlink() {
    setUnlinking(true);
    const r = await fetch("/api/telegram/link", { method: "DELETE" });
    setUnlinking(false);
    if (r.ok) { toast.success("Telegram unlinked"); setStatus((p) => p ? { ...p, linked: false } : p); }
    else toast.error("Failed to unlink");
  }

  useEffect(() => { load(); }, []);

  if (loading) return <div className="flex items-center gap-2 text-sm text-gray-400"><Loader2 className="h-4 w-4 animate-spin" /> Checking…</div>;

  if (status?.linked) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 rounded-full p-2"><CheckCircle2 className="h-5 w-5 text-green-600" /></div>
          <div>
            <p className="text-sm font-medium text-gray-900">Telegram linked</p>
            <p className="text-xs text-gray-500">You&apos;ll receive order updates in Telegram.</p>
          </div>
        </div>
        <button onClick={unlink} disabled={unlinking} className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors">
          {unlinking ? <Loader2 className="h-3 w-3 animate-spin" /> : <Unlink className="h-3 w-3" />} Unlink
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-blue-50 rounded-full p-2"><XCircle className="h-5 w-5 text-blue-400" /></div>
        <div>
          <p className="text-sm font-medium text-gray-900">Not linked</p>
          <p className="text-xs text-gray-500">Link Telegram to get order updates instantly.</p>
        </div>
      </div>
      {status?.deepLink ? (
        <a href={status.deepLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-white bg-[#0088cc] hover:bg-[#0077bb] rounded-lg px-3 py-1.5 transition-colors">
          <MessageCircle className="h-3.5 w-3.5" /> Link Telegram <ExternalLink className="h-3 w-3 opacity-70" />
        </a>
      ) : <p className="text-xs text-gray-400 italic">Bot not configured</p>}
    </div>
  );
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", nameKm: "", phone: "", image: "" });

  const [pwForm, setPwForm] = useState({ current: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/user/profile")
        .then((r) => r.json())
        .then((data) => {
          setProfile(data);
          setForm({ name: data.name ?? "", nameKm: data.nameKm ?? "", phone: data.phone ?? "", image: data.image ?? "" });
        });
    }
  }, [session]);

  if (status === "loading" || !session?.user) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-red-500" /></div>;
  }

  async function handleSaveProfile() {
    setSaving(true);
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      const updated = await res.json();
      setProfile((prev) => prev ? { ...prev, ...updated } : prev);
      await update({ name: updated.name });
      toast.success("Profile updated");
      setEditing(false);
    } else {
      toast.error("Failed to update profile");
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        setForm((prev) => ({ ...prev, image: url }));
        await fetch("/api/user/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: url }),
        });
        setProfile((prev) => prev ? { ...prev, image: url } : prev);
        toast.success("Avatar updated");
      }
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.password !== pwForm.confirm) { toast.error("Passwords do not match"); return; }
    if (pwForm.password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setChangingPw(true);
    const res = await fetch("/api/user/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.password }),
    });
    setChangingPw(false);
    if (res.ok) {
      toast.success("Password changed");
      setPwForm({ current: "", password: "", confirm: "" });
    } else {
      const d = await res.json();
      toast.error(d.error ?? "Failed to change password");
    }
  }

  async function resendVerification() {
    if (!profile?.email) return;
    setResendingVerification(true);
    const res = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: profile.email }),
    });
    setResendingVerification(false);
    if (res.ok) toast.success("Verification email sent! Check your inbox.");
    else toast.error("Could not send email.");
  }

  const initials = (profile?.name ?? session.user.name ?? "U").charAt(0).toUpperCase();
  const isVerified = !!profile?.emailVerified;
  const pwStrength = pwForm.password.length >= 12 ? 3 : pwForm.password.length >= 8 ? 2 : pwForm.password.length > 0 ? 1 : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      {/* Email verification warning */}
      {profile && !isVerified && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Email not verified</p>
            <p className="text-xs text-amber-700 mt-0.5">Verify your email to secure your account and receive order updates.</p>
          </div>
          <button
            onClick={resendVerification}
            disabled={resendingVerification}
            className="text-xs font-semibold text-amber-700 border border-amber-300 rounded-lg px-3 py-1.5 hover:bg-amber-100 transition-colors flex-shrink-0"
          >
            {resendingVerification ? "Sending…" : "Send Code"}
          </button>
        </div>
      )}

      {/* Avatar + basic info */}
      <section className="bg-white rounded-2xl shadow-sm border p-6">
        <div className="flex items-start gap-5">
          <div className="relative flex-shrink-0">
            {form.image || profile?.image ? (
              <img src={form.image || profile?.image || ""} alt="avatar" className="w-20 h-20 rounded-2xl object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-red-100 flex items-center justify-center">
                <span className="text-3xl font-black text-red-500">{initials}</span>
              </div>
            )}
            <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border-2 border-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50 shadow-sm">
              {uploadingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-500" /> : <Camera className="w-3.5 h-3.5 text-gray-500" />}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
            </label>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-bold text-gray-900 text-lg">{profile?.name ?? session.user.name ?? "—"}</p>
              {isVerified ? (
                <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                  Unverified
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{profile?.email}</p>
            {profile?.phone && <p className="text-sm text-gray-500 mt-0.5">{profile.phone}</p>}
            <button
              onClick={() => setEditing(!editing)}
              className="mt-3 text-xs font-semibold text-red-600 hover:text-red-700 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors"
            >
              {editing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>

        {editing && (
          <div className="mt-6 space-y-4 pt-6 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Name (EN)</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">ឈ្មោះ (KH)</label>
                <input
                  value={form.nameKm}
                  onChange={(e) => setForm({ ...form, nameKm: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+855 12 345 678"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
              />
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex items-center gap-2 bg-red-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        )}
      </section>

      {/* Change password */}
      <section className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-5 flex items-center gap-2">
          <Lock className="w-4 h-4" /> Change Password
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Current Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={pwForm.current}
                onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-gray-50 focus:bg-white"
                placeholder="Enter current password"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">New Password</label>
            <input
              type={showPw ? "text" : "password"}
              minLength={8}
              value={pwForm.password}
              onChange={(e) => setPwForm({ ...pwForm, password: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-gray-50 focus:bg-white"
              placeholder="Min. 8 characters"
            />
            {pwForm.password.length > 0 && (
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex gap-1 flex-1">
                  {[1,2,3].map((l) => <div key={l} className={`h-1 flex-1 rounded-full transition-colors ${pwStrength >= l ? (pwStrength===3?"bg-green-500":pwStrength===2?"bg-yellow-500":"bg-red-400") : "bg-gray-200"}`} />)}
                </div>
                <span className="text-[11px] text-gray-400">{pwStrength===3?"Strong":pwStrength===2?"Good":"Weak"}</span>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Confirm New Password</label>
            <input
              type={showPw ? "text" : "password"}
              value={pwForm.confirm}
              onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
              className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all bg-gray-50 focus:bg-white ${pwForm.confirm && pwForm.confirm !== pwForm.password ? "border-red-300 focus:ring-red-300" : "border-gray-200 focus:ring-red-400 focus:border-transparent"}`}
              placeholder="Repeat new password"
            />
          </div>
          <button
            type="submit"
            disabled={changingPw || !pwForm.current || !pwForm.password}
            className="flex items-center gap-2 bg-gray-900 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-gray-700 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {changingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {changingPw ? "Updating…" : "Change Password"}
          </button>
        </form>
      </section>

      {/* Telegram */}
      <section className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-2">
          <MessageCircle className="w-4 h-4" /> Telegram Notifications
        </h2>
        <p className="text-xs text-gray-400 mb-5">Get instant order status updates in Telegram.</p>
        <TelegramWidget />
      </section>

      {/* Quick links */}
      <section className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Quick Links</h2>
        <nav className="space-y-1">
          {[
            { href: "/orders", icon: <Package className="w-4 h-4" />, label: "My Orders" },
            { href: "/cart", icon: <ShoppingBag className="w-4 h-4" />, label: "My Cart" },
          ].map(({ href, icon, label }) => (
            <Link key={href} href={href} className="flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 hover:text-red-600 group">
              <span className="text-gray-400 group-hover:text-red-400 transition-colors">{icon}</span>
              <span className="text-sm font-medium">{label}</span>
              <span className="ml-auto text-gray-300 group-hover:text-red-300">→</span>
            </Link>
          ))}
        </nav>
      </section>
    </div>
  );
}
