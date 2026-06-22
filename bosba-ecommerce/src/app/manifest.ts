import type { MetadataRoute } from "next";
import { getPwaSettings } from "@/lib/pwa-settings";

// Served at /manifest.webmanifest. Next automatically injects the
// <link rel="manifest"> tag for this file convention. Driven by the dashboard
// CMS (app name, colors, icons) via getPwaSettings().
export const dynamic = "force-dynamic";

function iconType(url: string): string {
  if (/\.png(\?|$)/i.test(url)) return "image/png";
  if (/\.svg(\?|$)/i.test(url)) return "image/svg+xml";
  if (/\.(jpe?g)(\?|$)/i.test(url)) return "image/jpeg";
  if (/\.webp(\?|$)/i.test(url)) return "image/webp";
  return "image/png";
}

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const pwa = await getPwaSettings();

  return {
    // Stable identity so the OS keeps a single installed app across deploys and
    // brand changes (name can change without spawning a "new" PWA).
    id: "/",
    name: pwa.appName,
    short_name: pwa.shortName,
    description: "Shop quality products with KHR & USD pricing. Delivery across Cambodia.",
    // Customer home. Under next-intl `localePrefix: "as-needed"` the default
    // (English) home IS "/", so this opens the real storefront — never admin or
    // an auth page. `?source=pwa` lets analytics distinguish installed launches.
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: pwa.backgroundColor,
    theme_color: pwa.themeColor,
    lang: "en",
    dir: "ltr",
    categories: ["shopping", "business"],
    icons: [
      {
        src: pwa.icon192,
        sizes: "192x192",
        type: iconType(pwa.icon192),
        purpose: "any",
      },
      {
        src: pwa.icon512,
        sizes: "512x512",
        type: iconType(pwa.icon512),
        purpose: "any",
      },
      // Bundled maskable variants — keep the brand mark inside the safe zone so
      // platform masks (circle/squircle) never clip it.
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
