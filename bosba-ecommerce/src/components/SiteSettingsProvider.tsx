"use client";
import { createContext, useContext } from "react";
import type { SiteSettings } from "@/lib/site-settings";

const FALLBACK: SiteSettings = {
  brandName: "BOSBA",
  brandLogo: null,
  primaryColor: null,
  secondaryColor: null,
  announcementEn: null,
  announcementKm: null,
  splashEnabled: true,
  splashTagline: null,
  onboardingEnabled: false,
};

const SiteSettingsContext = createContext<SiteSettings>(FALLBACK);

export function SiteSettingsProvider({
  value,
  children,
}: {
  value: SiteSettings;
  children: React.ReactNode;
}) {
  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

/** Brand name / logo / colors from the dashboard CMS (with safe fallbacks). */
export function useSiteSettings(): SiteSettings {
  return useContext(SiteSettingsContext);
}
