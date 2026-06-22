"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, Truck, ShieldCheck, ChevronRight } from "lucide-react";
import { useSiteSettings } from "@/components/SiteSettingsProvider";

/**
 * First-launch onboarding carousel. Shown AT MOST ONCE (localStorage-gated) to
 * installed-app users, and ONLY when the Developer CMS enables it
 * (onboarding_enabled). Desktop website is never affected.
 *
 * Why it used to "take over home after a few seconds": the show decision runs in
 * an effect after hydration (1–3s on a phone), and the seen-flag was only saved
 * when the user pressed a button — so closing the app re-showed it every launch.
 * Now it is OFF by default and the flag is written the moment it opens.
 */
const SEEN_KEY = "bosba_onboarding_done";

const SLIDES = [
  {
    icon: ShoppingBag,
    emoji: "🛍️",
    title: "Welcome to BOSBA",
    body: "Cambodia's online store — thousands of quality products in KHR & USD, right in your pocket.",
  },
  {
    icon: Truck,
    emoji: "🚚",
    title: "Fast nationwide delivery",
    body: "Order from anywhere and get it delivered across Cambodia. Track every order in real time.",
  },
  {
    icon: ShieldCheck,
    emoji: "🔒",
    title: "Shop with confidence",
    body: "Pay safely with ABA, Wing or Cash on Delivery. Easy returns and 24/7 support.",
  },
];

function shouldShow(enabled: boolean): boolean {
  if (typeof window === "undefined") return false;
  // Testing escape hatch: append ?onboarding=1 to preview it in any browser.
  if (new URLSearchParams(window.location.search).get("onboarding") === "1") return true;
  if (!enabled) return false; // OFF unless the Developer CMS turns it on
  if (localStorage.getItem(SEEN_KEY)) return false;
  const standalone =
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  // Installed-app users only, so the public mobile website isn't interrupted.
  return standalone;
}

function markSeen() {
  try { localStorage.setItem(SEEN_KEY, "1"); } catch { /* ignore */ }
}

export function Onboarding() {
  const { onboardingEnabled } = useSiteSettings();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Defer to mount so we read the real display-mode.
    if (shouldShow(onboardingEnabled)) {
      // Persist immediately: even if the user force-closes the app instead of
      // finishing, it will NOT show again on the next launch.
      markSeen();
      setOpen(true);
    }
  }, [onboardingEnabled]);

  function finish() {
    markSeen();
    setOpen(false);
  }

  if (!open) return null;

  const last = step === SLIDES.length - 1;
  const slide = SLIDES[step];
  const Icon = slide.icon;

  return (
    <div className="fixed inset-0 z-[90] flex flex-col bg-white pt-safe pb-safe md:hidden">
      {/* Skip */}
      <div className="flex justify-end px-5 pt-3">
        <button
          onClick={finish}
          className="rounded-full px-4 py-1.5 text-sm font-semibold text-gray-400 active:scale-95"
        >
          Skip
        </button>
      </div>

      {/* Slide */}
      <div key={step} className="animate-ob-slide flex flex-1 flex-col items-center justify-center px-8 text-center">
        <div className="relative mb-8 flex h-44 w-44 items-center justify-center rounded-[2.5rem] bg-brand-gradient shadow-glass">
          <span className="text-7xl">{slide.emoji}</span>
          <div className="absolute -bottom-3 -right-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-card">
            <Icon className="h-7 w-7 text-brand-600" />
          </div>
        </div>
        <h2 className="text-2xl font-black text-gray-900">{slide.title}</h2>
        <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-gray-500">{slide.body}</p>
      </div>

      {/* Dots */}
      <div className="mb-6 flex justify-center gap-2">
        {SLIDES.map((_, i) => (
          <span
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === step ? "w-6 bg-brand-600" : "w-2 bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Action */}
      <div className="px-6 pb-8">
        <button
          onClick={() => (last ? finish() : setStep((s) => s + 1))}
          className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-brand-gradient py-4 text-base font-bold text-white shadow-btn active:scale-[0.98] transition-transform"
        >
          {last ? "Get Started" : "Next"}
          {!last && <ChevronRight className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}
