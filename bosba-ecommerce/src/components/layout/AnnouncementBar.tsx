"use client";
import { useState } from "react";
import { X, Tag } from "lucide-react";
import { useLocale } from "next-intl";
import { useSiteSettings } from "@/components/SiteSettingsProvider";

/**
 * Top promo bar — text is controlled by the Developer CMS (App Settings →
 * announcement_en / announcement_km). When no announcement is set it renders
 * nothing, so it is never a hardcoded/stale message. Hidden inside the installed
 * PWA via the `hide-in-app` class.
 */
export function AnnouncementBar() {
  const locale = useLocale();
  const { announcementEn, announcementKm } = useSiteSettings();
  const [dismissed, setDismissed] = useState(false);

  const text = (locale === "km" ? announcementKm : announcementEn) || announcementEn;
  if (!text || dismissed) return null;

  return (
    <div className="hide-in-app relative bg-gray-950 text-white py-2.5 px-4 flex items-center justify-center">
      <div className="flex items-center gap-2.5 text-xs sm:text-sm">
        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse-slow flex-shrink-0" />
        <Tag className="h-3.5 w-3.5 text-yellow-400 flex-shrink-0" />
        <p className={`text-center ${locale === "km" ? "text-khmer" : ""}`}>{text}</p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
        aria-label="Dismiss announcement"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
