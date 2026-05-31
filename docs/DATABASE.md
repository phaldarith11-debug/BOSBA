# DATABASE — Prisma / Postgres

**Status:** the live schema is **inside** `bosba-ecommerce/prisma/`. The top-level `database/`
folder is an empty scaffold (see `database/README.md`). Do not move the schema yet.

## Where it lives today
| Area | Path |
|------|------|
| Schema | `bosba-ecommerce/prisma/schema.prisma` |
| Seed | `bosba-ecommerce/prisma/seed.ts` |
| Prisma config | `bosba-ecommerce/prisma.config.ts` |
| Client singleton | `bosba-ecommerce/src/lib/prisma.ts` |
| Migrations | none yet — uses `prisma db push` (no migration history) |

**Engine:** one Supabase Postgres, shared by website + admin + API.

## Commands
```bash
cd bosba-ecommerce
npx prisma generate     # generate client
npx prisma db push      # apply schema to DB
npx prisma db seed      # seed data
npx prisma studio       # browse data
```

## ⚠️ Known drift
Schema has `Address.commune` that the live DB may be missing. Sync with `npx prisma db push`.

## Related env
`DATABASE_URL`, `DIRECT_URL` in `bosba-ecommerce/.env` — see `docs/ENVIRONMENT.md`.
</content>
