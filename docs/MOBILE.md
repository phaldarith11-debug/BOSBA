# MOBILE — Expo app

**Folder:** `bosba-mobile/` (Expo / React Native, expo-router)

## Where things live
| Area | Path |
|------|------|
| Screens / routes | `app/` (expo-router: `(tabs)/`, `(auth)/`, `checkout.tsx`, `order/[id].tsx`) |
| API client | `src/lib/api.ts` (calls `/api/mobile/*`) |
| Auth context | `src/context/auth.tsx` |
| App settings context | `src/context/app-settings.tsx` |
| i18n | `src/i18n/translations.ts` |

## How it connects to the backend
The app calls the Next.js server over HTTP at `EXPO_PUBLIC_API_URL` → `/api/mobile/*`.
It does **not** import backend code or touch the database directly.

## Run
```bash
cd bosba-mobile
npm start        # scan QR in Expo Go
```

## Related env
`EXPO_PUBLIC_API_URL` (your PC's LAN IP in dev) + Google OAuth — see `docs/ENVIRONMENT.md`.
</content>
