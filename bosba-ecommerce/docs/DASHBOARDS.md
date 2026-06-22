# BOSBA Dashboards — Roles, Seller Center & Developer CMS

Three role-based dashboards backed by NextAuth + Prisma. Everything the website
and mobile app render is controllable from the database (no source edits).

## Roles

`OWNER · ADMIN · MANAGER · EDITOR · STAFF · VIEWER · SELLER · DEVELOPER · CUSTOMER`

Defined in `database/prisma/schema.prisma` (`enum Role`) and
`src/lib/authz.ts` (area access + helpers).

| Role | Lands on | Access |
|------|----------|--------|
| OWNER / ADMIN | `/admin` | Everything (all three areas) |
| MANAGER / EDITOR / STAFF | `/admin` | Admin dashboard |
| VIEWER | `/admin` | Admin dashboard (read-only) |
| SELLER | `/seller` | Seller Center (own data only) |
| DEVELOPER | `/developer` | Developer CMS |
| CUSTOMER | `/` | Storefront only |

Login redirect logic: `homeForRole()` in `src/lib/authz.ts`, applied by the shop
login page (`src/app/[locale]/(auth)/login/page.tsx`). Each dashboard also has its
own login page (`/admin/login`, `/seller/login`, `/developer/login`).

## Security

- **Middleware** (`src/middleware.ts`) guards `/admin`, `/seller`, `/developer`
  by role via `canAccessArea()`, and rejects deactivated sessions.
- **Server guards**: `requireArea()` (`src/lib/authz-server.ts`) and
  `requireSeller()` (`src/lib/seller-server.ts`) protect every API route.
- **Seller scoping**: every seller query is filtered by `sellerId = session.user.id`,
  so a vendor can only ever see/edit their own products, orders, and payouts.
- **Deactivated accounts** cannot sign in (`auth.ts` throws `ACCOUNT_DEACTIVATED`)
  and lose dashboard access immediately via middleware.

## URLs

| Dashboard | URL |
|-----------|-----|
| Admin | `/admin` (login `/admin/login`) |
| Seller Center | `/seller` (login `/seller/login`) |
| Developer CMS | `/developer` (login `/developer/login`) |
| User management | `/admin/staff` |

### Seller Center
`/seller` overview · `/seller/products` (+ `/new`, `/[id]/edit`) ·
`/seller/orders` · `/seller/stock` · `/seller/sales` · `/seller/payments` ·
`/seller/profile`

### Developer CMS
`/developer` overview · `/developer/system` (site settings) ·
`/developer/themes` (colors/fonts/logo) · `/developer/app-config` ·
`/developer/homepage` (section builder) · `/developer/menus` (menu builder) ·
`/developer/feature-flags` · `/developer/maintenance` · `/developer/api` (status) ·
`/developer/layout` · `/developer/logs`

## Admin → User management (`/admin/staff`)

OWNER/ADMIN only. Create accounts (any role incl. Seller/Developer), change role,
**activate/deactivate**, and **reset password**. API: `src/app/api/admin/staff/*`.

## How the CMS controls web + mobile

Settings live in the `Settings` key/value table and are edited from the Developer
console (whitelisted keys in `src/lib/setting-registry.ts`).

- **Website** reads them server-side: `src/lib/site-settings.ts` (brand/colors,
  injected as CSS vars in `src/app/[locale]/layout.tsx`).
- **Mobile app** reads the same keys via `GET /api/app-settings`.
- **Feature flags**: `GET /api/feature-flags` → `{ key: boolean }` for both surfaces.
- **Maintenance mode**: `maintenance_mode=true` shows a holding screen to shoppers
  while staff keep full access (`src/app/[locale]/layout.tsx` + `MaintenanceScreen`).

## Database migration

Applied with `prisma db push` (no SQL migration file; matches existing workflow):

- `Role` enum: added `OWNER`, `STAFF`, `VIEWER`.
- `User.active Boolean @default(true)`.
- `Product.sellerId String?` (nullable; NULL = platform/admin-owned) + `status`.
- New models: `SellerProfile`, `Payout`, `FeatureFlag`, `SystemLog`.

To re-apply: `cd bosba-ecommerce && npx prisma db push && npx prisma generate`.

## Seed / test accounts

`npm run db:seed` (in `bosba-ecommerce/`) creates / repairs:

| Email | Role | Dashboard |
|-------|------|-----------|
| `admin@bosba.com` | ADMIN | `/admin` |
| `seller@bosba.com` | SELLER | `/seller` |
| `developer@bosba.com` | DEVELOPER | `/developer` |

**Default password (local dev only): `Bosba!Dev2026`**
(`admin@bosba.com` keeps whatever password it already had.)

> ⚠️ **Change before any public deploy.** Either:
> - Set a different seed password: `SEED_PASSWORD="…" npm run db:seed`, or
> - Reset each password from **Admin → Users & Roles** (key icon), or
> - Create fresh accounts there and deactivate/delete the demo ones.

## Testing steps

1. `cd bosba-ecommerce && npm run dev`
2. **Admin**: sign in at `/admin/login` as `admin@bosba.com` → lands on `/admin`.
   Open **Users & Roles**, create a Seller and a Developer, try
   activate/deactivate and reset-password.
3. **Seller**: sign in at `/seller/login` as `seller@bosba.com` → `/seller`.
   Add a product, edit stock, view orders/sales/payments, edit profile. Confirm
   you see only your own products.
4. **Developer**: sign in at `/developer/login` as `developer@bosba.com` →
   `/developer`. Edit Site Settings / Theme (watch the storefront update),
   create a feature flag, toggle **Maintenance** on and load `/` in a private
   window (shopper sees the maintenance screen; staff still get through).
5. **Security**: while signed in as the seller, visit `/admin` and `/developer`
   → redirected to the area login. Deactivate the seller from Admin → they can
   no longer sign in.
