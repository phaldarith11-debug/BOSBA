# DASHBOARD — Admin dashboard

**Status:** lives **inside** `bosba-ecommerce` today. The top-level `dashboard/` folder is an
empty scaffold for a possible future extraction (see `dashboard/README.md`).

## Where it lives today
| Area | Path |
|------|------|
| Admin pages | `bosba-ecommerce/src/app/admin/` |
| Admin components | `bosba-ecommerce/src/components/admin/` |
| Admin login | `bosba-ecommerce/src/app/admin/login/` |

Sections present: products, orders, customers, zones, reports, settings, banners, coupons,
content, media, reviews, seo, staff, activity, notifications, categories.

## Run
```bash
cd bosba-ecommerce
npm run dev      # http://localhost:3000/admin
```

## Future control scope (planned)
Products, orders, customers, payments, delivery zones, website settings, mobile app settings,
logo, brand name, colors, banners, menus.

## ⚠️ Extraction note
The admin UI is Next.js routes — it cannot be dragged into the plain `dashboard/` folder and still
run. A real split = a separate Next.js app calling the shared API over HTTP. Deliberate project,
build-verified, never a copy-paste.
</content>
