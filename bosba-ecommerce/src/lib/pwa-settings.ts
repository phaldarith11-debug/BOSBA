import { cache } from "react";
import { prisma } from "@/lib/prisma";

// PWA identity the dashboard CMS controls. Read by app/manifest.ts and the
// theme-color/meta tags so admins can rebrand the installed app without a
// redeploy. Falls back to BOSBA defaults if the DB is unreachable (build time).
export type PwaSettings = {
  appName: string;
  shortName: string;
  themeColor: string;
  backgroundColor: string;
  icon192: string;
  icon512: string;
};

export const PWA_DEFAULTS: PwaSettings = {
  appName: "BOSBA",
  shortName: "BOSBA",
  themeColor: "#e51b1b",
  backgroundColor: "#ffffff",
  icon192: "/icons/icon-192.png",
  icon512: "/icons/icon-512.png",
};

const KEYS = [
  "pwa_app_name",
  "pwa_short_name",
  "pwa_theme_color",
  "pwa_background_color",
  "pwa_icon_192",
  "pwa_icon_512",
  // Reused brand keys so the PWA inherits brand identity when no PWA-specific
  // override is set.
  "brand_name",
  "primary_color",
];

// Accept only safe hex colors for values injected into the manifest / <meta>.
function safeHex(v: string | undefined, fallback: string): string {
  if (!v) return fallback;
  const s = v.trim();
  return /^#[0-9a-fA-F]{3,8}$/.test(s) ? s : fallback;
}

function nonEmpty(v: string | undefined, fallback: string): string {
  const s = v?.trim();
  return s ? s : fallback;
}

export const getPwaSettings = cache(async (): Promise<PwaSettings> => {
  let map: Record<string, string> = {};
  try {
    const rows = await prisma.settings.findMany({ where: { key: { in: KEYS } } });
    map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  } catch {
    // DB unreachable during build/prerender — defaults keep the app installable.
  }

  return {
    appName: nonEmpty(map.pwa_app_name, nonEmpty(map.brand_name, PWA_DEFAULTS.appName)),
    shortName: nonEmpty(map.pwa_short_name, nonEmpty(map.brand_name, PWA_DEFAULTS.shortName)),
    themeColor: safeHex(map.pwa_theme_color, safeHex(map.primary_color, PWA_DEFAULTS.themeColor)),
    backgroundColor: safeHex(map.pwa_background_color, PWA_DEFAULTS.backgroundColor),
    icon192: nonEmpty(map.pwa_icon_192, PWA_DEFAULTS.icon192),
    icon512: nonEmpty(map.pwa_icon_512, PWA_DEFAULTS.icon512),
  };
});
