"use client";

import { useEffect, useState } from "react";
import { useSiteSettings } from "@/components/SiteSettingsProvider";

/**
 * Branded launch splash — only shown to installed-app users (display-mode:
 * standalone), AT MOST ONCE EVER (localStorage), and only if it can appear at
 * the very start of a launch. Web/desktop visitors never see it.
 *
 * Why it used to "take over home after a few seconds": the effect runs after
 * hydration, which can be 2–3s on a phone, so the overlay popped in long after
 * home was already interactive. We now SKIP it entirely if hydration was slow,
 * and only show it once ever — subsequent launches go straight to Home.
 */
const SEEN_KEY = "bosba_splash_shown_v2";
const MAX_LAUNCH_DELAY_MS = 2000; // if we mount later than this, don't pop in

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function AppSplash() {
  const { brandName, brandLogo, splashEnabled, splashTagline } = useSiteSettings();
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [logoOk, setLogoOk] = useState(true);

  useEffect(() => {
    if (!splashEnabled) return;
    if (!isStandalone()) return;
    // Already shown once on this device → straight to Home.
    try { if (localStorage.getItem(SEEN_KEY)) return; } catch { /* ignore */ }
    // If hydration was slow, the "launch" moment has passed — don't cover the
    // home page the user is already looking at.
    if (typeof performance !== "undefined" && performance.now() > MAX_LAUNCH_DELAY_MS) {
      try { localStorage.setItem(SEEN_KEY, "1"); } catch { /* ignore */ }
      return;
    }
    try { localStorage.setItem(SEEN_KEY, "1"); } catch { /* ignore */ }
    setShow(true);

    const leave = setTimeout(() => setLeaving(true), 1100);
    const done = setTimeout(() => setShow(false), 1600);
    return () => {
      clearTimeout(leave);
      clearTimeout(done);
    };
  }, [splashEnabled]);

  if (!show) return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-hero-gradient ${
        leaving ? "animate-splash-fade" : ""
      }`}
    >
      {/* glow accents */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-red-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-orange-400/10 blur-3xl" />

      <div className="animate-splash-pop flex flex-col items-center">
        {brandLogo && logoOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={brandLogo}
            alt={brandName}
            onError={() => setLogoOk(false)}
            className="h-20 w-auto object-contain drop-shadow-lg"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-sm shadow-glass">
            <span className="text-5xl font-black text-white">{brandName?.[0] ?? "B"}</span>
          </div>
        )}
        <p className="mt-5 text-2xl font-black tracking-tight text-white">{brandName}</p>
        <p className="mt-1 text-sm text-white/70">{splashTagline || "Cambodia's Online Store"}</p>
      </div>

      {/* loading dots */}
      <div className="absolute bottom-[14%] flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-white/80 animate-bounce-dot"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
