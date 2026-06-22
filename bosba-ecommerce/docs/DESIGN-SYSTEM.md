# BOSBA Shared Design System (PWA ↔ Expo app)

The installed **PWA** (this Next.js app) and the **Expo mobile app** (`bosba-mobile`)
must look and feel the same. They don't share code yet, but they MUST read the
same backend/CMS and follow the same rules below.

## Single source of truth: the CMS settings API

Both clients read branding/config from the same `Settings` table:

| Client | Endpoint / reader |
|--------|-------------------|
| PWA / website | `src/lib/site-settings.ts` (`getSiteSettings`), `src/lib/pwa-settings.ts`, `/api/feature-flags`, `/api/cms/sections`, `/api/cms/menus` |
| Expo app | `GET /api/app-settings`, `/api/feature-flags`, `/api/cms/sections?device=mobile`, `/api/cms/menus?device=mobile` |

Shared keys (all editable in **Developer CMS**):

| Key | Controls |
|-----|----------|
| `brand_name` | App/brand name |
| `brand_logo` | Logo (URL) |
| `primary_color` / `secondary_color` | Theme colors |
| `font_family` / `radius_scale` | Typography + corner radius |
| `announcement_en` / `announcement_km` | Promo bar |
| `homepage_hero_*` | Hero text |
| `splash_tagline` | Launch splash tagline |
| `pwa_splash_enabled` | Show launch splash |
| `onboarding_enabled` | Show first-launch onboarding |
| `pwa_app_name` / `pwa_short_name` / `pwa_theme_color` / `pwa_background_color` / `pwa_icon_*` | Installed-app identity (manifest) |

Layout/content: `PageSection` (homepage blocks) and `Menu`/`MenuItem` (navigation)
are read by both surfaces with a `device` filter (`web` | `mobile` | `both`).

## Design tokens

- **Primary (brand) color:** `#e51b1b` (BOSBA red) — overridable by `primary_color`.
- **Background:** `#ffffff`. **Text:** `#0f172a` (slate-900) / `#6b7280` (gray-500).
- **Radius:** cards `1rem`–`1.5rem` (rounded-2xl), pills/buttons full.
- **Spacing:** 16px screen gutters, 12px grid gaps on mobile.
- **Safe areas:** honor `env(safe-area-inset-*)` top + bottom on both platforms.

## Components (must match visually)

- **Header:** logo left (with text fallback if image fails), search + cart +
  profile/login right. No hover-only dropdowns on mobile.
- **Bottom tab bar:** Home · Products · Categories · Cart · Profile. Active item
  in brand color, cart badge. Sits above the home indicator (safe-area padding).
- **Product card:** square image, category label, name (2 lines), price in brand
  red, round add-to-cart button + heart wishlist button. Out-of-stock + discount
  badges.
- **Product grid:** **2 columns on mobile**, 3 on tablet, 4 on desktop.
- **States:** loading skeleton, empty state, error state (with retry).
- **Launch:** brief branded splash on first install only; optional one-time
  onboarding carousel (skippable). Never blocks; never shows on every launch.

## Launch behaviour contract (both clients)

1. Open directly to the customer **Home**.
2. Splash: at most once per install, auto-dismiss, never blocks.
3. Onboarding: OFF unless `onboarding_enabled`; then once only, skippable, state
   persisted locally on first show.
4. Never auto-redirect a launch to login/admin/onboarding routes.
