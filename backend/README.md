# backend/ — `@bosba/backend` (shared services)

> ✅ **Status: real workspace package** for framework-agnostic services.
> Verified with `tsc` and `next build`.

## What this is
Reusable backend service logic with **no framework dependencies** (only `cloudinary` + Node
built-ins). It's an npm workspace package; `bosba-ecommerce` imports it.

## What moved here
| Subpath | File | Purpose |
|---------|------|---------|
| `@bosba/backend/payments/payway` | `payments/payway.ts` | ABA PayWay transactions + callback verify |
| `@bosba/backend/notifications/telegram` | `notifications/telegram.ts` | Telegram order messages |
| `@bosba/backend/notifications/email` | `notifications/email.ts` | Email (Resend) |
| `@bosba/backend/uploads/cloudinary` | `uploads/cloudinary.ts` | Cloudinary upload/delete |
| `@bosba/backend/utils/currency` | `utils/currency.ts` | USD/KHR formatting + conversion |

Inside `bosba-ecommerce`, the old `src/lib/<x>.ts` files are now thin re-export shims, so
existing `@/lib/<x>` imports are unchanged.

## What deliberately STAYED in bosba-ecommerce (and why)
| Stayed | Reason |
|--------|--------|
| `src/lib/auth.ts` | NextAuth web config — tightly coupled to next-auth + the app |
| `src/lib/mobile-auth.ts`, `src/lib/google-mobile-oauth.ts` | Need `next-auth/jwt` (+ prisma). Pulling next-auth into this package **duplicates React** and breaks the build, so they stay with the app's auth. |
| `src/app/api/**` (all route handlers) | Next.js can only serve routes from its own `app/` dir |
| `src/middleware.ts` | Next.js middleware |

> **Hard rule learned:** `@bosba/backend` must never depend on `next`, `next-auth`, `react`, or
> `react-dom`. Doing so installs a second framework copy under `backend/node_modules` and causes
> `TypeError: Cannot read properties of null (reading 'useContext')` at build. Keep this package
> framework-free; anything needing next-auth belongs in `bosba-ecommerce`.

## Empty subfolders (reserved, not yet used)
`api/`, `auth/`, `middleware/`, `validators/` — kept as placeholders for future framework-free
helpers. The real API routes and auth stay in the app as noted above.

## How apps use it
```ts
import { createABATransaction } from "@bosba/backend/payments/payway";
import { formatPrice } from "@bosba/backend/utils/currency";
```

## Config wiring (for reference)
- root `package.json` workspaces include `backend`
- `bosba-ecommerce/next.config.mjs` → `transpilePackages: ["@bosba/database", "@bosba/backend"]`
</content>
