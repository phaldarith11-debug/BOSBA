# database/ — `@bosba/database` (Prisma)

> ✅ **Status: real workspace package.** This folder now owns the Prisma schema, seed, and the
> shared Prisma client. `bosba-ecommerce` imports it as `@bosba/database`. Verified with
> `prisma generate`, `tsc`, and `next build`.

## What this is
The single source of database truth for BOSBA: schema, seed, and a configured Prisma client
singleton. It is an npm **workspace** package (no turbo). `bosba-mobile` is intentionally NOT in
the workspace (Expo/Metro doesn't play well with hoisting) — mobile reaches data via the HTTP API.

## Layout
```
database/
├── package.json        # @bosba/database
├── index.ts            # exports `prisma` singleton + re-exports all Prisma types
├── prisma/
│   └── schema.prisma   # the live schema (moved here from bosba-ecommerce)
├── seeds/
│   └── seed.ts         # seed script
├── migrations/         # (empty — project uses `prisma db push`)
└── backups/            # manual DB dumps
```

## How apps use it
```ts
import { prisma } from "@bosba/database";          // configured client
import type { Role, OrderStatus } from "@bosba/database"; // (types also still come from @prisma/client)
```
Inside `bosba-ecommerce`, `@/lib/prisma` re-exports `prisma` from here, so existing imports are
unchanged.

## Commands (run from `bosba-ecommerce`, where `.env` lives)
```bash
cd bosba-ecommerce
npx prisma generate     # reads ../database/prisma/schema.prisma → shared @prisma/client
npm run db:push         # apply schema to DB
npm run db:seed         # runs ../database/seeds/seed.ts
npx prisma studio
```
> Prisma is driven from `bosba-ecommerce` so it picks up `DATABASE_URL`/`DIRECT_URL` from that
> app's `.env` — no env duplication.

## Config wiring (for reference)
- `bosba-ecommerce/prisma.config.ts` → `schema: ../database/prisma/schema.prisma`
- `bosba-ecommerce/next.config.mjs` → `transpilePackages: ["@bosba/database"]`
- generator output: default (the shared `@prisma/client`, hoisted to root `node_modules`)

## Known DB drift
Schema has `Address.commune` that the live DB may lack — sync with `npm run db:push`.
</content>
