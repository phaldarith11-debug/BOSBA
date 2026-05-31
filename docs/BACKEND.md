# BACKEND — API & services

**Status:** lives **inside** `bosba-ecommerce` today (Next.js route handlers + libs). The
top-level `backend/` folder is an empty scaffold + plan (see `backend/README.md`).

## Where it lives today
| Area | Path |
|------|------|
| API routes | `bosba-ecommerce/src/app/api/` (`admin`, `auth`, `mobile`, `orders`, `payment`, `products`, `coupons`, `delivery-zones`, `app-settings`, `telegram`, `upload`, `user`) |
| Auth | `src/lib/auth.ts`, `src/lib/mobile-auth.ts`, `src/lib/google-mobile-oauth.ts` |
| Payments | `src/lib/payway.ts` + `src/app/api/payment/` |
| Notifications | `src/lib/telegram.ts`, `src/lib/email.ts` |
| Uploads | `src/lib/cloudinary.ts` + `src/app/api/upload/` |
| Prisma client | `src/lib/prisma.ts` |
| Middleware | `src/middleware.ts` |

## How clients reach it
- Website + admin: in-process (same Next.js app).
- Mobile: over HTTP at `/api/mobile/*`.

## ⚠️ Move note
Next.js route handlers **cannot run from a plain sibling folder**. Moving the API would break the
website and mobile. A standalone `backend/` service = a deliberate rewrite (e.g. Express/Hono).
Until then, the API stays in `bosba-ecommerce`.
</content>
