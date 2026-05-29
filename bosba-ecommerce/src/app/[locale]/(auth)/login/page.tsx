"use client";
import { useState, useEffect } from "react";
import { signIn, getProviders } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Eye, EyeOff, ArrowRight, Mail, Lock, AlertCircle } from "lucide-react";

/* ── Brand icons ────────────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
      <path fill="#1877F2" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.514c-1.491 0-1.956.93-1.956 1.886v2.269h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
      <path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}

function Spinner() {
  return (
    <span className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <span key={i} className="w-1.5 h-1.5 bg-current rounded-full animate-bounce-dot" style={{ animationDelay: `${i * 160}ms` }} />
      ))}
    </span>
  );
}

type ProviderKey = "google" | "facebook" | "apple";

const OAUTH_PROVIDERS: { id: ProviderKey; label: string; icon: React.ReactNode; className: string }[] = [
  {
    id: "apple",
    label: "Continue with Apple",
    icon: <AppleIcon />,
    className: "bg-black text-white hover:bg-gray-900 border-black",
  },
  {
    id: "google",
    label: "Continue with Google",
    icon: <GoogleIcon />,
    className: "bg-white text-gray-700 hover:bg-gray-50 border-gray-200",
  },
  {
    id: "facebook",
    label: "Continue with Facebook",
    icon: <FacebookIcon />,
    className: "bg-[#1877F2] text-white hover:bg-[#166FE5] border-[#1877F2]",
  },
];

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<ProviderKey | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);

  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  useEffect(() => {
    getProviders().then((p) => {
      if (p) setAvailableProviders(Object.keys(p));
    });
    const err = searchParams.get("error");
    if (err === "OAuthAccountNotLinked") {
      toast.error("This email is already registered. Sign in with email first, then link your account in Settings.");
    }
  }, [searchParams]);

  async function handleOAuth(provider: ProviderKey) {
    setOauthLoading(provider);
    await signIn(provider, { callbackUrl });
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setUnverifiedEmail(null);
    const res = await signIn("credentials", { ...form, redirect: false, callbackUrl });
    setLoading(false);
    if (res?.ok) {
      toast.success(t("success"));
      router.push(callbackUrl);
      router.refresh();
    } else {
      const checkRes = await fetch("/api/auth/check-unverified", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      if (checkRes.ok) {
        const { unverified } = await checkRes.json();
        if (unverified) { setUnverifiedEmail(form.email); return; }
      }
      toast.error(t("error"));
    }
  }

  const visibleOAuth = OAUTH_PROVIDERS.filter((p) => availableProviders.includes(p.id));

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* ── Brand panel ─────────────────────────────────────────── */}
      <div className="hidden md:flex flex-col justify-between p-12 bg-hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%">
            <defs><pattern id="ldots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1.5" fill="white"/></pattern></defs>
            <rect width="100%" height="100%" fill="url(#ldots)"/>
          </svg>
        </div>
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-red-400/20 rounded-full blur-3xl"/>
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-orange-400/10 rounded-full blur-3xl"/>
        <Link href="/" className="relative text-3xl font-black text-white tracking-tight">BOSBA</Link>
        <div className="relative">
          <div className="text-5xl mb-5">🛍️</div>
          <blockquote className="text-white/90 text-xl font-medium leading-relaxed mb-6">
            &ldquo;Cambodia&rsquo;s premium online marketplace — shop with confidence.&rdquo;
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {["🧑","👩","🧔"].map((e, i) => (
                <div key={i} className="w-9 h-9 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-sm">{e}</div>
              ))}
            </div>
            <p className="text-white/70 text-sm">Join 10,000+ happy shoppers</p>
          </div>
        </div>
      </div>

      {/* ── Form panel ──────────────────────────────────────────── */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 bg-white overflow-y-auto">
        <div className="max-w-sm w-full mx-auto">
          <Link href="/" className="text-2xl font-black gradient-text md:hidden mb-6 inline-block">BOSBA</Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
            <p className="text-sm text-gray-500 mt-1">{t("subtitle")}</p>
          </div>

          {/* Unverified email warning */}
          {unverifiedEmail && (
            <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"/>
              <div>
                <p className="text-sm font-semibold text-amber-800">Email not verified</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  <Link href={`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`} className="underline font-semibold">Click here to verify your email</Link> before signing in.
                </p>
              </div>
            </div>
          )}

          {/* All sign-in method buttons */}
          <div className="space-y-3 mb-6">
            {/* OAuth buttons — only rendered when provider is configured */}
            {visibleOAuth.map((provider) => (
              <button
                key={provider.id}
                onClick={() => handleOAuth(provider.id)}
                disabled={!!oauthLoading || loading}
                className={`w-full flex items-center justify-center gap-3 border rounded-xl py-3 px-4 text-sm font-semibold active:scale-[0.98] transition-all disabled:opacity-60 ${provider.className}`}
              >
                {oauthLoading === provider.id ? <Spinner /> : <>{provider.icon} {provider.label}</>}
              </button>
            ))}

            {/* Divider — only when OAuth options exist */}
            {visibleOAuth.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200"/>
                <span className="text-xs text-gray-400 font-medium">or</span>
                <div className="flex-1 h-px bg-gray-200"/>
              </div>
            )}

            {/* Continue with Email — always visible */}
            <button
              onClick={() => setShowEmailForm(!showEmailForm)}
              disabled={!!oauthLoading}
              className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 px-4 text-sm font-semibold bg-white text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
              Continue with Email
            </button>
          </div>

          {/* Email/password form — expands when email button clicked */}
          {showEmailForm && (
            <form onSubmit={handleEmailSubmit} className="space-y-4 animate-fade-up">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("email")}</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">{t("password")}</label>
                  <Link href="/forgot-password" className="text-xs text-red-500 hover:text-red-600 font-medium hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-3.5 rounded-xl hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {loading ? <Spinner /> : <>{t("submit")} <ArrowRight className="h-4 w-4"/></>}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            {t("noAccount")}{" "}
            <Link href="/register" className="text-red-600 font-semibold hover:underline">{t("register")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
