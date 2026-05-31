# DATABASE — Prisma / Postgres

**Status:** ✅ extracted into the `@bosba/database` workspace package. Authoritative details live
in `database/README.md`.

## Where it lives
| Area | Path |
|------|------|
| Schema | `database/prisma/schema.prisma` |
| Seed | `database/seeds/seed.ts` |
| Client singleton + type re-exports | `database/index.ts` (`@bosba/database`) |
| Prisma config | `bosba-ecommerce/prisma.config.ts` → schema `../database/prisma/schema.prisma` |
| Compat shim | `bosba-ecommerce/src/lib/prisma.ts` re-exports `@bosba/database` |
| Migrations | none yet — uses `prisma db push` |

**Engine:** one Supabase Postgres, shared by website + admin + API.

## Commands (run from `bosba-ecommerce`, where `.env` lives)
```bash
cd bosba-ecommerce
npx prisma generate
npm run db:push      # apply schema
npm run db:seed      # runs ../database/seeds/seed.ts  (writes data — use a safe DB)
npx prisma studio
```

## Known drift
Schema has `Address.commune` the live DB may lack → `npm run db:push`.
</content>
