/**
 * PURE settings registry (no server imports) — safe to import from client
 * components and the edge. Server-side readers live in `dev-settings.ts`.
 *
 * Every key the Developer CMS may edit is declared here, grouped by the screen
 * that owns it. The website (src/lib/site-settings.ts) and mobile app
 * (/api/app-settings) read these same keys, so one edit controls both surfaces.
 */
export type SettingField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "color" | "boolean" | "number" | "select";
  placeholder?: string;
  help?: string;
  options?: { value: string; label: string }[];
};

export type SettingGroup = {
  id: string;
  title: string;
  description: string;
  fields: SettingField[];
};

export const SETTING_GROUPS: SettingGroup[] = [
  {
    id: "system",
    title: "Site Settings",
    description: "Core identity and contact info shown across the website and mobile app.",
    fields: [
      { key: "brand_name", label: "Brand name", type: "text", placeholder: "BOSBA" },
      { key: "brand_logo", label: "Logo URL", type: "text", placeholder: "https://…" },
      { key: "site_phone", label: "Contact phone", type: "text" },
      { key: "site_email", label: "Contact email", type: "text" },
      { key: "social_facebook", label: "Facebook URL", type: "text" },
      { key: "social_instagram", label: "Instagram URL", type: "text" },
      { key: "social_telegram", label: "Telegram URL", type: "text" },
      { key: "usd_khr_rate", label: "USD → KHR rate", type: "number", placeholder: "4100" },
      { key: "free_delivery_over_usd", label: "Free delivery over (USD)", type: "number" },
    ],
  },
  {
    id: "theme",
    title: "Theme & Branding",
    description: "Colors, fonts, and logo. Applied live to the website via CSS variables.",
    fields: [
      { key: "primary_color", label: "Primary color", type: "color", help: "Hex / rgb() / hsl()" },
      { key: "secondary_color", label: "Secondary color", type: "color" },
      { key: "brand_logo", label: "Logo URL", type: "text" },
      {
        key: "font_family", label: "Font family", type: "select", options: [
          { value: "", label: "Default (system)" },
          { value: "Inter", label: "Inter" },
          { value: "Poppins", label: "Poppins" },
          { value: "Roboto", label: "Roboto" },
          { value: "Nunito", label: "Nunito" },
        ],
      },
      {
        key: "radius_scale", label: "Corner radius", type: "select", options: [
          { value: "", label: "Default" },
          { value: "0", label: "Square" },
          { value: "0.5", label: "Subtle" },
          { value: "1", label: "Rounded" },
        ],
      },
    ],
  },
  {
    id: "app",
    title: "App Settings",
    description: "Homepage hero text and announcements consumed by web + mobile.",
    fields: [
      { key: "announcement_en", label: "Announcement (EN)", type: "text" },
      { key: "announcement_km", label: "Announcement (KM)", type: "text" },
      { key: "homepage_hero_title_en", label: "Hero title (EN)", type: "text" },
      { key: "homepage_hero_title_km", label: "Hero title (KM)", type: "text" },
      { key: "homepage_hero_subtitle_en", label: "Hero subtitle (EN)", type: "textarea" },
      { key: "homepage_hero_subtitle_km", label: "Hero subtitle (KM)", type: "textarea" },
    ],
  },
  {
    id: "pwa",
    title: "Installed App (PWA)",
    description: "Controls the installable app: name, icons, theme/splash colors. Read by the web app manifest. Leave a field blank to inherit from Brand/Theme.",
    fields: [
      { key: "pwa_app_name", label: "App name", type: "text", placeholder: "BOSBA", help: "Defaults to Brand name" },
      { key: "pwa_short_name", label: "Short name", type: "text", placeholder: "BOSBA", help: "Shown under the home-screen icon" },
      { key: "pwa_theme_color", label: "Theme color", type: "color", help: "Status bar / toolbar. Hex only. Defaults to primary color." },
      { key: "pwa_background_color", label: "Splash background", type: "color", help: "Launch splash background. Hex only. Default #ffffff" },
      { key: "pwa_icon_192", label: "App icon 192px URL", type: "text", placeholder: "/icons/icon-192.png" },
      { key: "pwa_icon_512", label: "App icon 512px URL", type: "text", placeholder: "/icons/icon-512.png" },
      { key: "pwa_splash_enabled", label: "Show launch splash", type: "boolean", help: "Brief branded splash on the first install/launch only. Auto-dismisses; never blocks." },
      { key: "splash_tagline", label: "Splash tagline", type: "text", placeholder: "Cambodia's Online Store" },
      { key: "onboarding_enabled", label: "Show first-launch onboarding", type: "boolean", help: "OFF by default. When on, the welcome carousel shows ONCE on the first launch and can be skipped." },
    ],
  },
  {
    id: "maintenance",
    title: "Maintenance",
    description: "Take the storefront offline for shoppers while staff keep full access.",
    fields: [
      { key: "maintenance_mode", label: "Maintenance mode", type: "boolean", help: "When on, shoppers see a maintenance screen. Admin/Seller/Developer dashboards stay open." },
      { key: "maintenance_message_en", label: "Message (EN)", type: "textarea", placeholder: "We'll be back soon." },
      { key: "maintenance_message_km", label: "Message (KM)", type: "textarea" },
    ],
  },
];

/** Flat set of every editable key, for write validation. */
export const ALL_SETTING_KEYS = new Set(
  SETTING_GROUPS.flatMap((g) => g.fields.map((f) => f.key))
);

export function groupById(id: string) {
  return SETTING_GROUPS.find((g) => g.id === id);
}
