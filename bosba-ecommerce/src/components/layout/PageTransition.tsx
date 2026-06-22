"use client";

import { usePathname } from "@/i18n/navigation";

/**
 * Replays a subtle enter animation on every route change by keying the wrapper
 * on the pathname (so React remounts it and the CSS animation runs again).
 * Lightweight — no animation library. Respects prefers-reduced-motion via the
 * .animate-page-enter media guard in globals.css.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-page-enter">
      {children}
    </div>
  );
}
