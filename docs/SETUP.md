# SETUP — Getting BOSBA running locally

## Prerequisites
- Node.js 18+ and npm
- A PostgreSQL database (Supabase recommended)
- Expo Go app on your phone (for mobile testing)

## 1. Install dependencies
```bash
cd bosba-ecommerce && npm install
cd ../bosba-mobile && npm install
```

## 2. Configure environment
Copy each `.env.example` to `.env` and fill values — see `docs/ENVIRONMENT.md`.
```bash
cd bosba-ecommerce && cp .env.example .env
cd ../bosba-mobile && cp .env.example .env
```

## 3. Set up the database
```bash
cd bosba-ecommerce
npx prisma generate
npx prisma db push
npx prisma db seed   # optional sample data
```

## 4. Run the website + admin + API
```bash
cd bosba-ecommerce
npm run dev          # http://localhost:3000  (admin at /admin)
```

## 5. Run the mobile app
```bash
cd bosba-mobile
npm start            # scan QR with Expo Go
```
Set `EXPO_PUBLIC_API_URL` in `bosba-mobile/.env` to your PC's LAN IP (e.g. `http://192.168.1.97:3000`).

See also: `WEBSITE.md`, `DASHBOARD.md`, `BACKEND.md`, `DATABASE.md`, `MOBILE.md`.
</content>
