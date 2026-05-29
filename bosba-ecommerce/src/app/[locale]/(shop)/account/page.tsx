"use client";
import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import toast from "react-hot-toast";
import { Loader2, CheckCircle2, Plus, Trash2, Shield } from "lucide-react";

type ProviderInfo = {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  connectClass: string;
};

function GoogleIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>;
}
function FacebookIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#1877F2" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.514c-1.491 0-1.956.93-1.956 1.886v2.269h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>;
}
function AppleIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>;
}

const PROVIDER_META: Record<string, ProviderInfo> = {
  google: { id: "google", name: "Google", icon: <GoogleIcon/>, color: "text-gray-700", connectClass: "border-gray-200 hover:bg-gray-50 text-gray-700" },
  facebook: { id: "facebook", name: "Facebook", icon: <FacebookIcon/>, color: "text-[#1877F2]", connectClass: "border-[#1877F2]/30 hover:bg-blue-50 text-[#1877F2]" },
  apple: { id: "apple", name: "Apple", icon: <AppleIcon/>, color: "text-gray-900", connectClass: "border-gray-300 hover:bg-gray-50 text-gray-900" },
};

const ALL_PROVIDERS = ["google", "facebook", "apple"];

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [connected, setConnected] = useState<string[]>([]);
  const [hasPassword, setHasPassword] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/user/providers")
        .then((r) => r.json())
        .then((data) => {
          setConnected(data.providers ?? []);
          setHasPassword(data.hasPassword ?? false);
        })
        .finally(() => setLoading(false));
    }
  }, [session]);

  if (status === "loading" || loading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-red-500"/></div>;
  }

  async function handleConnect(provider: string) {
    await signIn(provider, { callbackUrl: "/account" });
  }

  async function handleDisconnect(provider: string) {
    if (connected.length === 1 && !hasPassword) {
      toast.error("Set a password first before removing your only login method.");
      return;
    }
    setRemoving(provider);
    const res = await fetch(`/api/user/providers/${provider}`, { method: "DELETE" });
    setRemoving(null);
    if (res.ok) {
      toast.success(`${PROVIDER_META[provider]?.name} disconnected`);
      setConnected((prev) => prev.filter((p) => p !== provider));
    } else {
      const data = await res.json();
      toast.error(data.error ?? "Failed to disconnect");
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage how you sign in to BOSBA</p>
      </div>

      {/* Security summary */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4"/> Security
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <span className="text-gray-600">Email</span>
            <span className="font-medium text-gray-900">{session?.user?.email}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <span className="text-gray-600">Password</span>
            <span className={`font-medium ${hasPassword ? "text-green-600" : "text-amber-500"}`}>
              {hasPassword ? "Set" : "Not set"}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Email verified</span>
            <span className={`font-medium ${(session?.user as { emailVerified?: Date | null })?.emailVerified ? "text-green-600" : "text-amber-500"}`}>
              {(session?.user as { emailVerified?: Date | null })?.emailVerified ? "Verified ✓" : "Not verified"}
            </span>
          </div>
        </div>
        {!hasPassword && (
          <a href="/profile" className="mt-4 inline-flex text-xs text-red-500 hover:underline font-medium">
            → Set a password in Profile settings
          </a>
        )}
      </div>

      {/* Connected accounts */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Connected Accounts</h2>
        <p className="text-xs text-gray-400 mb-5">You can sign in using any connected account.</p>

        <div className="space-y-3">
          {ALL_PROVIDERS.map((pid) => {
            const meta = PROVIDER_META[pid];
            if (!meta) return null;
            const isConnected = connected.includes(pid);
            const isRemoving = removing === pid;

            return (
              <div key={pid} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${isConnected ? "border-green-200 bg-green-50/50" : "border-gray-100 bg-gray-50/50"}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isConnected ? "bg-white shadow-sm" : "bg-white"}`}>
                    {meta.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{meta.name}</p>
                    <p className="text-xs text-gray-500">{isConnected ? "Connected" : "Not connected"}</p>
                  </div>
                </div>

                {isConnected ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500"/>
                    <button
                      onClick={() => handleDisconnect(pid)}
                      disabled={!!removing}
                      className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {isRemoving ? <Loader2 className="w-3 h-3 animate-spin"/> : <Trash2 className="w-3 h-3"/>}
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnect(pid)}
                    className={`flex items-center gap-1.5 text-xs font-semibold border rounded-lg px-3 py-1.5 transition-colors ${meta.connectClass}`}
                  >
                    <Plus className="w-3 h-3"/> Connect
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
        <h2 className="text-sm font-semibold text-red-500 uppercase tracking-wide mb-4">Danger Zone</h2>
        <p className="text-sm text-gray-500 mb-4">These actions are permanent and cannot be undone.</p>
        <button className="text-sm font-medium text-red-500 border border-red-200 rounded-xl px-4 py-2.5 hover:bg-red-50 transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );
}
