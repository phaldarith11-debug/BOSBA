# database/ — Prisma / Migrations / Seeds (scaffold)

> ⚠️ **Status: empty scaffold.** The **live** Prisma schema and seed are still inside
> `bosba-ecommerce/prisma/` and are used in-process by the Next.js app. Nothing has been moved
> here, so nothing is broken. Moving them now would break `prisma generate` and the running app.

## What this folder is for
A future single home for the database definition (schema, migrations, seeds, backups). For now it
documents the real location so the team knows where the source of truth is.

## Where the database REALLY lives today
| Scaffold folder | Real location today |
|-----------------|---------------------|
| `prisma/` | `bosba-ecommerce/prisma/schema.prisma` (the live schema) |
| `seeds/` | `bosba-ecommerce/prisma/seed.ts` |
| `migrations/` | **none yet** — the project uses `prisma db push` (no migration history) |
| `backups/` | (empty — put manual DB dumps here) |
| config | `bosba-ecommerce/prisma.config.ts` |

**Database engine:** one Supabase Postgres, shared by the website, admin, and API.

## ⚠️ Do NOT move the schema yet
`bosba-ecommerce` reads its schema from `bosba-ecommerce/prisma/`. Relocating it requires
repointing the Prisma config + `generate`/`db push` paths and re-verifying — a small but real
change. Until that's done deliberately, **the schema stays in `bosba-ecommerce/prisma/`.**

### Known DB drift (unresolved)
Schema has `Address.commune` but the live Supabase DB may lack the column. To sync:
```bash
cd bosba-ecommerce && npx prisma db push
```

## Scaffold layout
```
database/
├── README.md
├── prisma/       # (future) schema.prisma
├── migrations/   # (future) migration history
├── seeds/        # (future) seed.ts
└── backups/      # manual DB dumps
```

## How to use (today)
```bash
cd bosba-ecommerce
npx prisma generate     # generate client
npx prisma db push      # apply schema to DB
npx prisma db seed      # run seed
npx prisma studio       # browse data
```

## Related environment variables
`DATABASE_URL` / `DIRECT_URL` in `bosba-ecommerce/.env` — see `docs/ENVIRONMENT.md`.
</content>
