# BOSBA — Project Structure

Simple sibling folders. **No** monorepo, workspaces, turbo, `apps/`, `packages/`, or `scripts/`.

```
BOSBA/
├── bosba-ecommerce/   Next.js app — customer website + admin dashboard + API backend + Prisma/DB
├── bosba-mobile/      Expo / React Native app (calls the API over HTTP)
├── docs/              This documentation (setup + team guide)
├── assets/            Misc. assets (e.g. the Expo Go test APK — gitignored)
└── README.md
```

## Why dashboard / backend / database are NOT separate folders

In a Next.js app these are **not separate things** — they are parts of the one app by design:

- The **admin dashboard** is a set of Next.js routes (`src/app/admin/*`).
- The **backend** is Next.js route handlers (`src/app/api/*`) plus service libs (`src/lib/*`).
- The **database** is Prisma (`prisma/schema.prisma`), generated and used in-process.

Pulling them into sibling folders (`dashboard/`, `backend/`, `database/`) would mean either
turning each into its own deployable app with workspace wiring (**the complex monorepo we are
avoiding**), or just moving folders and breaking every import so nothing runs. So we keep one
clean Next.js app and map the logical roles to real locations below.

## Where each logical role actually lives

| Logical role  | Real location                        | Notes |
|---------------|--------------------------------------|-------|
| **Website**   | `bosba-ecommerce/src/app/[locale]/`, `src/app/(auth)/` | Customer-facing storefront (i18n: en/km) |
| **Dashboard** | `bosba-ecommerce/src/app/admin/`     | Admin UI: products, orders, customers, zones, reports, settings… |
| **Backend**   | `bosba-ecommerce/src/app/api/` + `src/lib/` | API route handlers + shared services |
| **Database**  | `bosba-ecommerce/prisma/`            | `schema.prisma` + `seed.ts`; one Supabase Postgres |
| **Mobile**    | `bosba-mobile/`                      | Expo app; calls `/api/mobile/*` over HTTP |

### Backend detail — `bosba-ecommerce/src/lib/`

| File | Role |
|------|------|
| `auth.ts` | NextAuth config (web login/register) |
| `mobile-auth.ts`, `google-mobile-oauth.ts` | Mobile token auth + Google OAuth |
| `prisma.ts` | Prisma client singleton |
| `payway.ts` | ABA PayWay payment integration |
| `telegram.ts` | Telegram order notifications |
| `email.ts` | Email sending |
| `cloudinary.ts` | Image uploads |
| `currency.ts` | Currency helpers |

### API routes — `bosba-ecommerce/src/app/api/`

`admin/`, `auth/`, `mobile/`, `orders/`, `payment/`, `products/`, `coupons/`,
`delivery-zones/`, `app-settings/`, `telegram/`, `upload/`, `user/`

## How the pieces share data (no shared code files)

Each folder is its own Node project with its own `node_modules`, so they do **not** import each
other's TypeScript. Sharing happens two ways:

1. **Shared database** — the website + admin + API all use the same Supabase Postgres via Prisma.
2. **Shared HTTP API** — the mobile app calls `bosba-ecommerce`'s API over the network
   (`EXPO_PUBLIC_API_URL` → `/api/mobile/*`). This already works today.

## Focus features and where they live

| Feature            | Lives in |
|--------------------|----------|
| Product sync       | API `api/products`, `api/mobile/products`; admin `admin/products` |
| Login / register   | Web `src/app/(auth)` + `lib/auth.ts`; mobile `lib/mobile-auth.ts`, `api/mobile/auth/*` |
| Checkout           | Web `app/[locale]/(shop)/checkout`; mobile `app/checkout.tsx`; `lib/payway.ts`, `api/payment` |
| Orders             | `api/orders`, `api/mobile/orders`; admin `admin/orders` |
| Dashboard          | `src/app/admin/*` |
| Delivery zones     | `api/delivery-zones`; admin `admin/zones` |

## If you ever DO want true separation (not now)

A real standalone `backend/` or `dashboard/` means rebuilding each as its own deployable app
(frontends that call the API over HTTP). That is a deliberate project with real risk to working
features — do it intentionally, never as a mechanical folder move. For now: one app, clearly
organized, everything works.
</content>
</invoke>
