# backend/ — Shared Backend Logic / Services (scaffold)

> ⚠️ **Status: empty scaffold.** The real backend is currently **live inside the Next.js app**
> at `bosba-ecommerce/src/app/api/` (route handlers) and `bosba-ecommerce/src/lib/` (services).
> Nothing has been moved here, so nothing is broken. This folder documents what *could* move
> later — it is NOT a working server yet.

## What this folder is for
A future home for shared backend logic if you ever extract a standalone API service. For now it
is documentation + placeholders only.

## Where the backend REALLY lives today
| Scaffold folder | Real location today | Notes |
|-----------------|---------------------|-------|
| `api/` | `bosba-ecommerce/src/app/api/` | Next.js route handlers: `admin`, `auth`, `mobile`, `orders`, `payment`, `products`, `coupons`, `delivery-zones`, `app-settings`, `telegram`, `upload`, `user` |
| `auth/` | `bosba-ecommerce/src/lib/auth.ts`, `mobile-auth.ts`, `google-mobile-oauth.ts` | NextAuth + mobile token auth |
| `services/` | `bosba-ecommerce/src/lib/` | business helpers |
| `payments/` | `bosba-ecommerce/src/lib/payway.ts` + `src/app/api/payment/` | ABA PayWay |
| `notifications/` | `bosba-ecommerce/src/lib/telegram.ts`, `email.ts` | Telegram + email |
| `uploads/` | `bosba-ecommerce/src/lib/cloudinary.ts` + `src/app/api/upload/` | Cloudinary |
| `validators/` | (inline in routes today) | move validation schemas here later |
| `utils/` | `bosba-ecommerce/src/utils/`, `src/lib/currency.ts` | helpers |
| `middleware/` | `bosba-ecommerce/src/middleware.ts` | Next.js middleware |

## ⚠️ Do NOT move the API yet
Next.js **route handlers cannot run from a plain sibling folder** — they only work inside the
Next.js app. Moving `src/app/api/*` here would break the website and the mobile app (which calls
`/api/mobile/*`). A real standalone backend = rebuilding it as its own service (e.g. Express/Hono),
a deliberate project. Until then, the API stays in `bosba-ecommerce` and this folder is a plan.

## Scaffold layout
```
backend/
├── README.md
├── api/  auth/  services/  middleware/
├── payments/  notifications/  uploads/
├── validators/  utils/
```

## How to run (today)
The backend runs as part of the website: `cd bosba-ecommerce && npm run dev` (API at `/api/*`).

## Related environment variables
See `docs/ENVIRONMENT.md` (database URL, NextAuth secret, PayWay, Telegram, Cloudinary, email).
</content>
