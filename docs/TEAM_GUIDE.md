# TEAM GUIDE

## Project at a glance (npm workspaces, no turbo)
```
BOSBA/
├── bosba-ecommerce/   Website + admin dashboard + API route handlers + NextAuth (Next.js app)
├── bosba-mobile/      Expo mobile app (NOT a workspace — calls the API over HTTP)
├── database/          @bosba/database — Prisma schema, seed, client  ✅ real package
├── backend/           @bosba/backend  — framework-free services       ✅ real package
├── dashboard/         scaffold only — admin still lives in bosba-ecommerce (deferred)
├── docs/              Documentation (this folder)
└── README.md
```
Root `workspaces: [bosba-ecommerce, database, backend]`. Run `npm install` from the BOSBA root.

## What's a real package vs. what stays in the app
- ✅ `@bosba/database` and `@bosba/backend` are real workspace packages; `bosba-ecommerce`
  imports them. The old `src/lib/*` files are thin re-export shims, so `@/lib/*` imports are
  unchanged.
- 🗒 `dashboard/` is still a scaffold: admin pages are Next.js routes, so a real split means a
  SECOND Next.js app — deferred on purpose.
- Stays in `bosba-ecommerce` by necessity: all `api/**` route handlers, NextAuth (`auth.ts`,
  `mobile-auth.ts`, `google-mobile-oauth.ts`), middleware. `@bosba/backend` must never depend on
  next/next-auth/react (it duplicates React and breaks the build).

## Naming & branches
- Branch per feature; current work branch: `aba-integration`.
- Don't commit `.env`, `node_modules`, or build artifacts (`*.apk/*.aab/*.ipa` are gitignored).

## Where to look for a feature
| Feature | Location |
|---------|----------|
| Product sync | `api/products`, `api/mobile/products`, admin `admin/products` |
| Login/register | web `(auth)` + `lib/auth.ts`; mobile `lib/mobile-auth.ts`, `api/mobile/auth/*` |
| Checkout | web `[locale]/(shop)/checkout`; mobile `app/checkout.tsx`; `lib/payway.ts` |
| Orders | `api/orders`, `api/mobile/orders`, admin `admin/orders` |
| Delivery zones | `api/delivery-zones`, admin `admin/zones` |

See also `docs/STRUCTURE.md` for the full role→location map.
</content>
