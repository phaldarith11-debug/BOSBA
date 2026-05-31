# dashboard/ — Admin Dashboard (scaffold)

> ⚠️ **Status: empty scaffold.** The admin dashboard is currently **live inside the Next.js app**
> at `bosba-ecommerce/src/app/admin/`. Nothing has been moved here, so nothing is broken.
> This folder is prepared for a future, deliberate extraction — not a mechanical move.

## What this folder is for
A place to (eventually) hold the admin dashboard as its own area: products, orders, customers,
payments, delivery zones, website settings, mobile app settings, logo, brand name, colors,
banners, and menus.

## Where the dashboard REALLY lives today
| Thing | Real location |
|-------|---------------|
| Admin pages | `bosba-ecommerce/src/app/admin/` (products, orders, customers, zones, reports, settings, banners, coupons, content, media, reviews, seo, staff, activity, notifications…) |
| Admin components | `bosba-ecommerce/src/components/admin/` |
| Admin login | `bosba-ecommerce/src/app/admin/login/` |

The admin UI is made of **Next.js routes**, so it cannot simply be dragged into this plain folder
and still run. Extracting it = creating a separate Next.js app that calls the shared API over HTTP.
Do that as an intentional project, build-verified, never as a copy-paste.

## Scaffold layout
```
dashboard/
├── README.md
├── app/         # (future) dashboard pages
├── components/  # (future) dashboard UI components
├── lib/         # (future) API client / helpers
├── styles/      # (future) dashboard styles
└── types/       # (future) shared TS types
```

## How to run (today)
The dashboard runs as part of the website:
```bash
cd bosba-ecommerce
npm run dev
# visit http://localhost:3000/admin
```

## Related environment variables
Same as `bosba-ecommerce` (NextAuth, database, Cloudinary, etc.) — see `docs/ENVIRONMENT.md`.
</content>
