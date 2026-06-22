import { cache } from "react";
import { prisma } from "@/lib/prisma";

// Brand/identity settings the public WEBSITE reads from the dashboard CMS.
// Mirrors the keys the mobile app already consumes via /api/app-settings, so a
// single dashboard edit controls both surfaces.
export type SiteSettings = {
  brandName: string;
  brandLogo: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  announcementEn: string | null;
  announcementKm: string | null;
  // PWA launch behaviour (CMS-controlled). Splash defaults ON, onboarding OFF.
  splashEnabled: boolean;
  splashTagline: string | null;
  onboardingEnabled: boolean;
};

const KEYS = [
  "brand_name", "brand_logo", "primary_color", "secondary_color",
  "announcement_en", "announcement_km",
  "pwa_splash_enabled", "splash_tagline", "onboarding_enabled",
];

// Only accept safe CSS color values (hex / rgb() / hsl()) so a settings value
// can never inject arbitrary CSS into the injected <style>.
function safeColor(v?: string): string | null {
  if (!v) return null;
  const s = v.trim();
  return /^#[0-9a-fA-F]{3,8}$|^(rgb|hsl)a?\([\d.,%\s/]+\)$/.test(s) ? s : null;
}

// cache() dedupes the query within a single request render.
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  let map: Record<string, string> = {};
  try {
    const rows = await prisma.settings.findMany({ where: { key: { in: KEYS } } });
    map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  } catch {
    // DB unreachable (e.g. during build/prerender) — fall back to defaults so
    // the site still renders instead of crashing.
  }
  return {
    brandName: map.brand_name?.trim() || "BOSBA",
    brandLogo: map.brand_logo?.trim() || null,
    primaryColor: safeColor(map.primary_color),
    secondaryColor: safeColor(map.secondary_color),
    announcementEn: map.announcement_en?.trim() || null,
    announcementKm: map.announcement_km?.trim() || null,
    // Splash defaults ON unless explicitly turned off; onboarding defaults OFF.
    splashEnabled: map.pwa_splash_enabled !== "false",
    splashTagline: map.splash_tagline?.trim() || null,
    onboardingEnabled: map.onboarding_enabled === "true",
  };
});
