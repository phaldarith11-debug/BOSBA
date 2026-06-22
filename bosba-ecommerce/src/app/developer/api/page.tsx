import { CheckCircle2, XCircle, KeyRound } from "lucide-react";

export const dynamic = "force-dynamic";

/**
 * Read-only integration status. Shows whether each server-side key is present in
 * the environment — never the value. Keys are configured via env vars / hosting
 * dashboard, not editable here, so secrets are never exposed to the browser.
 */
const INTEGRATIONS: { label: string; envs: string[]; note: string }[] = [
  { label: "Database (Supabase/Postgres)", envs: ["DATABASE_URL"], note: "Primary data store" },
  { label: "NextAuth", envs: ["NEXTAUTH_SECRET"], note: "Session signing" },
  { label: "Google OAuth", envs: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"], note: "Social login" },
  { label: "Facebook OAuth", envs: ["FACEBOOK_CLIENT_ID", "FACEBOOK_CLIENT_SECRET"], note: "Social login" },
  { label: "Apple Sign In", envs: ["APPLE_ID", "APPLE_SECRET"], note: "Social login" },
  { label: "Cloudinary", envs: ["CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"], note: "Image uploads" },
  { label: "Resend (email)", envs: ["RESEND_API_KEY"], note: "Transactional email" },
  { label: "Telegram bot", envs: ["TELEGRAM_BOT_TOKEN"], note: "Order notifications" },
  { label: "Google Maps", envs: ["NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"], note: "Checkout map picker" },
  { label: "ABA PayWay (auto)", envs: ["ABA_MERCHANT_ID", "ABA_API_KEY"], note: "Automatic payments (currently paused)" },
];

function present(envs: string[]) {
  return envs.every((e) => !!process.env[e] && process.env[e] !== "");
}

export default function DeveloperApiPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">API &amp; Integration Status</h1>
        <p className="text-sm text-gray-500 mt-1">
          Whether each integration is configured. Values live in environment variables and are never shown here.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="divide-y divide-gray-100">
          {INTEGRATIONS.map((it) => {
            const ok = present(it.envs);
            return (
              <div key={it.label} className="flex items-center gap-4 px-5 py-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${ok ? "bg-green-50" : "bg-gray-100"}`}>
                  <KeyRound className={`h-4 w-4 ${ok ? "text-green-600" : "text-gray-400"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{it.label}</p>
                  <p className="text-xs text-gray-400">{it.note} · <span className="font-mono">{it.envs.join(", ")}</span></p>
                </div>
                {ok ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-green-600"><CheckCircle2 className="h-4 w-4" /> Configured</span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-semibold text-gray-400"><XCircle className="h-4 w-4" /> Not set</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
