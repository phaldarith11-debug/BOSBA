# BACKEND — API & services

**Status:** partly extracted. Framework-free services moved to the `@bosba/backend` workspace
package; API route handlers + NextAuth stay in `bosba-ecommerce`. Authoritative details in
`backend/README.md`.

## In `@bosba/backend` (the `backend/` folder)
| Subpath | Purpose |
|---------|---------|
| `@bosba/backend/payments/payway` | ABA PayWay |
| `@bosba/backend/notifications/telegram` | Telegram messages |
| `@bosba/backend/notifications/email` | Email (Resend) |
| `@bosba/backend/uploads/cloudinary` | Cloudinary |
| `@bosba/backend/utils/currency` | USD/KHR helpers |

`bosba-ecommerce/src/lib/<x>.ts` are thin shims re-exporting these, so `@/lib/<x>` imports are
unchanged. **`@bosba/backend` must never depend on next/next-auth/react** (duplicates React).

## Still in `bosba-ecommerce` (by necessity)
| Area | Path | Why |
|------|------|-----|
| API routes | `src/app/api/**` | Next.js route handlers |
| Web auth | `src/lib/auth.ts` | NextAuth config |
| Mobile auth helpers | `src/lib/mobile-auth.ts`, `src/lib/google-mobile-oauth.ts` | need `next-auth/jwt` |
| Middleware | `src/middleware.ts` | Next.js middleware |

## How clients reach it
Website + admin: in-process. Mobile: HTTP `/api/mobile/*`.
</content>
