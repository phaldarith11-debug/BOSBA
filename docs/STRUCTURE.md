# BOSBA — Project Structure

Lightweight **npm workspaces** (NO turbo, NO complex tooling).

```
BOSBA/
├── bosba-ecommerce/   Next.js app — customer website + admin dashboard + API route handlers
├── bosba-mobile/      Expo app (NOT a workspace — talks to the API over HTTP)
├── database/          @bosba/database — Prisma schema, seed, client singleton
├── backend/           @bosba/backend  — framework-free services (payments, notifications, …)
├── dashboard/         scaffold only (admin still lives in bosba-ecommerce — see below)
├── docs/              documentation
└── README.md
```

Root `package.json` → `workspaces: ["bosba-ecommerce", "database", "backend"]`.
`bosba-mobile` is intentionally excluded (Expo/Metro breaks with workspace hoisting).

## What's a real package vs. what stays in the app

| Folder | Status | Notes |
|--------|--------|-------|
| `database/` | ✅ real `@bosba/database` | owns `prisma/schema.prisma`, `seeds/seed.ts`, the Prisma client singleton |
| `backend/` | ✅ real `@bosba/backend` | the 5 framework-free services; depends only on `cloudinary` |
| `dashboard/` | 🗒 scaffold (deferred) | admin = Next.js routes → would need a 2nd Next.js app; not done |
| `bosba-ecommerce/` | the Next.js app | website + admin UI + all `api/**` route handlers + NextAuth |
| `bosba-mobile/` | standalone Expo app | calls `/api/mobile/*` |

## Why dashboard, auth, and API routes stay in `bosba-ecommerce`
- **Admin dashboard** (`src/app/admin/`) and **API routes** (`src/app/api/`) are Next.js routes —
  they only run inside the Next.js app, so they can't be plain packages.
- **NextAuth-coupled code** (`auth.ts`, `mobile-auth.ts`, `google-mobile-oauth.ts`) stays in the
  app: pulling `next-auth` into `@bosba/backend` would duplicate React and break the build.

## How the pieces share data
1. **Shared package code** — `bosba-ecommerce` imports `@bosba/database` and `@bosba/backend`.
2. **Shared database** — one Supabase Postgres via Prisma.
3. **Shared HTTP API** — `bosba-mobile` calls `bosba-ecommerce`'s `/api/mobile/*`.

## Where each logical role lives
| Role | Location |
|------|----------|
| Website | `bosba-ecommerce/src/app/[locale]/`, `(auth)/` |
| Dashboard (admin) | `bosba-ecommerce/src/app/admin/` |
| Backend API | `bosba-ecommerce/src/app/api/` (route handlers) + `@bosba/backend` (services) |
| Auth | `bosba-ecommerce/src/lib/auth.ts`, `mobile-auth.ts`, `google-mobile-oauth.ts` |
| Database | `@bosba/database` (`database/`) |
| Mobile | `bosba-mobile/` |

## Setup
```bash
cd BOSBA && npm install              # installs all workspaces (not mobile)
cd bosba-ecommerce && npx prisma generate && npm run dev
cd ../bosba-mobile && npm install && npm start
```
See per-folder `README.md` and the other files in `docs/` for detail.
</content>
