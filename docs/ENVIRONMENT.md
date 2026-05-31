# ENVIRONMENT — Variables reference

> Real values live in each app's `.env` (never commit). Templates are in each `.env.example`.

## bosba-ecommerce (website + admin + API)
| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Supabase Postgres connection (pooled) |
| `DIRECT_URL` | Direct Postgres connection (migrations) |
| `NEXTAUTH_SECRET` | NextAuth session signing |
| `NEXTAUTH_URL` | Base URL of the site |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth (web + mobile) |
| `CLOUDINARY_*` | Image uploads |
| `PAYWAY_*` / ABA keys | ABA PayWay payments (`src/lib/payway.ts`) |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | Order notifications |
| email vars | Email sending (`src/lib/email.ts`) |

## bosba-mobile (Expo)
| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_API_URL` | URL of the Next.js backend (LAN IP in dev, domain in prod) |
| Google OAuth vars | Mobile Google sign-in |

> Tips for `EXPO_PUBLIC_API_URL`: Android emulator → `http://10.0.2.2:3000`; physical device →
> your PC's LAN IP (`ipconfig`); production → your deployed domain.
</content>
