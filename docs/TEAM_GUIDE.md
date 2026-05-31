# TEAM GUIDE

## Project at a glance
```
BOSBA/
├── bosba-ecommerce/   Website + admin dashboard + API backend + Prisma (ONE Next.js app)
├── bosba-mobile/      Expo mobile app (calls the API over HTTP)
├── dashboard/         Scaffold only — admin still lives in bosba-ecommerce
├── backend/           Scaffold only — API still lives in bosba-ecommerce
├── database/          Scaffold only — schema still lives in bosba-ecommerce/prisma
├── docs/              Documentation (this folder)
└── README.md
```

## Important: scaffold vs. live
`dashboard/`, `backend/`, and `database/` are **empty scaffolds with plans** — the real, working
code still lives inside `bosba-ecommerce`. This keeps the website and mobile app unbroken. See each
folder's `README.md` for what would move later and why it hasn't moved yet.

## Why not split them now?
`bosba-ecommerce` is one Next.js app where website + admin + API + Prisma are integrated by design.
Splitting them into separate running apps is the complex monorepo we are avoiding. Keep it simple:
one app, clearly documented.

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
