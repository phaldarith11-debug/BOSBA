"use client";
import { useState, Suspense } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { canAccessArea, homeForRole, type DashboardArea } from "@/lib/authz";

type Accent = "red" | "emerald" | "indigo";

const ACCENT_CLASSES: Record<Accent, { box: string; ring: string; button: string }> = {
  red:     { box: "bg-red-600",     ring: "focus:ring-red-500",     button: "bg-red-600 hover:bg-red-700" },
  emerald: { box: "bg-emerald-600", ring: "focus:ring-emerald-500", button: "bg-emerald-600 hover:bg-emerald-700" },
  indigo:  { box: "bg-indigo-600",  ring: "focus:ring-indigo-500",  button: "bg-indigo-600 hover:bg-indigo-700" },
};

interface Props {
  area: DashboardArea;
  title: string;
  subtitle: string;
  accent?: Accent;
}

function LoginForm({ area, title, subtitle, accent = "red" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? `/${area}`;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const a = ACCENT_CLASSES[accent];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", { ...form, redirect: false });
    if (res?.error) {
      setLoading(false);
      toast.error("Invalid email or password");
      return;
    }
    // Confirm this account may enter this area; otherwise send it to its own home.
    const session = await getSession();
    const role = (session?.user as { role?: string } | undefined)?.role;
    setLoading(false);
    if (canAccessArea(role, area)) {
      router.push(callbackUrl);
    } else {
      toast.error(`This account does not have ${area} access`);
      const home = homeForRole(role);
      if (home !== `/${area}`) setTimeout(() => router.push(home), 1200);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Toaster position="top-right" />
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className={`w-14 h-14 ${a.box} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
            <Lock className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              autoFocus
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${a.ring}`}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={`w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${a.ring}`}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full ${a.button} text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50`}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export function DashboardLogin(props: Props) {
  return (
    <Suspense>
      <LoginForm {...props} />
    </Suspense>
  );
}
