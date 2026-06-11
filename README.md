# BOSBA — Full-Stack eCommerce Platform

Cambodia-based eCommerce platform supporting Khmer and English, with ABA/ACLEDA/Wing payments, Expo mobile app, Next.js website, and built-in admin dashboard.

---

## Project Structure

```
D:\BOSBA\
├── bosba-ecommerce/     # Website + Admin Dashboard + Backend API
│   ├── src/
│   │   ├── app/
│   │   │   ├── [locale]/          # Localized shop pages (en/km)
│   │   │   │   ├── (auth)/        # Login, Register, Reset Password, Verify Email
│   │   │   │   └── (shop)/        # Home, Products, Cart, Checkout, Orders, Profile, Wishlist
│   │   │   ├── admin/             # Admin dashboard (unlocalized)
│   │   │   │   ├── login/
│   │   │   │   ├── products/
│   │   │   │   ├── categories/
│   │   │   │   ├── orders/
│   │   │   │   ├── customers/
│   │   │   │   ├── zones/         # Delivery zones
│   │   │   │   ├── coupons/
│   │   │   │   ├── reports/       # Sales analytics
│   │   │   │   └── settings/
│   │   │   └── api/               # REST API routes
│   │   │       ├── auth/          # NextAuth + register + verify + reset
│   │   │       ├── products/      # Product listing + detail
│   │   │       ├── orders/        # Order CRUD
│   │   │       ├── payment/       # ABA, Wing, COD, callback
│   │   │       ├── coupons/       # Coupon validation
│   │   │       ├── upload/        # Cloudinary image upload
│   │   │       ├── telegram/      # Telegram bot webhook
│   │   │       ├── delivery-zones/
│   │   │       ├── user/          # Profile, password, OAuth providers
│   │   │       ├── mobile/        # Mobile-specific endpoints (JWT auth)
│   │   │       │   ├── auth/      # login, google, facebook, apple, me
│   │   │       │   ├── products/
│   │   │       │   └── orders/
│   │   │       └── admin/         # Admin-only endpoints
│   │   │           ├── products/
│   │   │           ├── categories/
│   │   │           ├── orders/
│   │   │           ├── customers/
│   │   │           ├── zones/
│   │   │           ├── analytics/
│   │   │           └── settings/
│   │   ├── components/
│   │   │   ├── admin/             # AdminSidebar, ProductForm
│   │   │   ├── layout/            # Header, Footer, AnnouncementBar, LanguageSwitcher
│   │   │   ├── orders/            # OrderCard, OrderTimeline
│   │   │   ├── payment/           # ABAQRDisplay, CODConfirmation, WingPaymentInfo
│   │   │   ├── products/          # ProductCard, ProductGrid, ProductFilters
│   │   │   └── ui/                # Button, Badge, Modal, Spinner, SkeletonCard
│   │   ├── constants/             # App-wide constants (routes, limits, currencies)
│   │   ├── hooks/                 # useDebounce, useLocalStorage
│   │   ├── i18n/                  # next-intl routing, navigation, request
│   │   ├── lib/                   # auth, cloudinary, currency, email, payway, prisma, telegram
│   │   ├── store/                 # Zustand stores: cart, currency, wishlist
│   │   ├── types/                 # TypeScript types and next-auth augmentation
│   │   └── utils/                 # Shared pure utility functions
│   ├── prisma/
│   │   ├── schema.prisma          # Full DB schema (Users, Products, Orders, ...)
│   │   └── seed.ts                # Seed script
│   ├── messages/                  # i18n JSON files (en.json, km.json)
│   ├── .env.example               # Environment variable template
│   └── docs/
│       └── API.md                 # API route reference
│
└── bosba-mobile/        # Expo Mobile App (Android + iOS + Tablet)
    ├── app/
    │   ├── (auth)/                # Login, Register, Forgot Password
    │   ├── (tabs)/                # Home, Products, Cart, Profile (bottom tabs)
    │   ├── product/[slug].tsx     # Product detail
    │   ├── checkout.tsx           # Checkout flow
    │   ├── order/[id].tsx         # Order tracking detail
    │   └── notifications.tsx      # Notification center
    ├── src/
    │   ├── components/
    │   │   ├── cart/              # CartItem
    │   │   ├── common/            # EmptyState, LoadingSpinner
    │   │   ├── product/           # ProductCard
    │   │   └── ui/                # (shared primitives)
    │   ├── constants/             # API base URL, colors, screen names
    │   ├── context/               # AuthContext
    │   ├── hooks/                 # useProducts, useOrders
    │   ├── lib/                   # api.ts, notifications.ts
    │   ├── store/                 # Zustand cart store
    │   └── types.ts               # Shared TypeScript types
    ├── assets/                    # App icons, splash, images
    ├── .env.example               # Mobile env template
    └── eas.json                   # EAS Build profiles
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Website + Admin | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Auth | NextAuth v4, Google/Facebook/Apple OAuth |
| Database | PostgreSQL via Supabase, Prisma ORM |
| Image Upload | Cloudinary |
| Payment | ABA PayWay QR, Wing Money, COD |
| Email | Resend |
| Notifications | Telegram Bot API |
| i18n | next-intl (English + Khmer) |
| State | Zustand |
| Mobile | Expo SDK 56, Expo Router, React Native |
| Mobile Auth | JWT (stored in expo-secure-store) |
| CI/CD Mobile | EAS Build |

---

## Quick Start

### Prerequisites

- Node.js 20+
- Git
- A PostgreSQL database (Supabase recommended)
- Cloudinary account (free tier works)

### 1 — Clone & Install

```bash
# Website
cd bosba-ecommerce
npm install

# Mobile
cd ../bosba-mobile
npm install
```

### 2 — Configure Environment Variables

```bash
# Website
cd bosba-ecommerce
copy .env.example .env.local
# Fill in all values in .env.local

# Mobile
cd ../bosba-mobile
copy .env.example .env
# Set EXPO_PUBLIC_API_URL to your backend URL
```

### 3 — Set Up the Database

```bash
cd bosba-ecommerce

# Push schema to database
npm run db:push

# Run seed data (optional — adds sample products + categories)
npm run db:seed

# Open Prisma Studio to browse data
npm run db:studio
```

---

## Run Commands

### Website + Admin Dashboard + Backend API

```bash
cd bosba-ecommerce

npm run dev          # Development server — http://localhost:3000
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint check
```

**Key URLs (dev):**
- Store: http://localhost:3000/en
- Admin: http://localhost:3000/admin
- Prisma Studio: http://localhost:5555 (after `npm run db:studio`)

### Mobile App

```bash
cd bosba-mobile

npm start                  # Expo dev server (scan QR with Expo Go)
npm run start:clear        # Clear cache and start
npm run tunnel             # Use ngrok tunnel (for physical device on different network)
npm run android            # Open on Android emulator
npm run ios                # Open on iOS simulator (macOS only)
```

**EAS Production Builds:**

```bash
npm run build:android      # Android APK/AAB (production)
npm run build:ios          # iOS IPA (production, macOS + Apple account)
npm run build:all          # Both platforms
npm run build:android:dev  # Android development build
```

### Database Commands

```bash
cd bosba-ecommerce

npm run db:push            # Sync schema to DB (no migration file)
npm run db:migrate         # Create and apply a migration
npm run db:seed            # Seed with sample data
npm run db:studio          # Open Prisma Studio (GUI)
```

---

## Environment Variables

### bosba-ecommerce — see `.env.example` for full list

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string (pooled) |
| `DIRECT_URL` | Yes | PostgreSQL direct URL (for migrations) |
| `NEXTAUTH_SECRET` | Yes | Random secret for session encryption |
| `NEXTAUTH_URL` | Yes | Full URL of the site |
| `GOOGLE_CLIENT_ID` | OAuth | Google OAuth credentials |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary account name |
| `RESEND_API_KEY` | Email | Transactional email via Resend |
| `TELEGRAM_BOT_TOKEN` | Optional | Telegram order notifications |

### bosba-mobile — see `.env.example` for full list

| Variable | Required | Description |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | Yes | URL of the Next.js backend |

---

## Admin Dashboard

Access at `/admin` (no locale prefix).

| Page | URL |
|---|---|
| Dashboard | /admin |
| Products | /admin/products |
| Categories | /admin/categories |
| Orders | /admin/orders |
| Customers | /admin/customers |
| Delivery Zones | /admin/zones |
| Coupons | /admin/coupons |
| Sales Reports | /admin/reports |
| Settings | /admin/settings |

Default admin account is created by the seed script or by setting `role = ADMIN` directly in the database.

---

## Mobile App Routes

| Screen | File |
|---|---|
| Home / Products | `app/(tabs)/index.tsx` |
| Product Listing | `app/(tabs)/products.tsx` |
| Cart | `app/(tabs)/cart.tsx` |
| Profile | `app/(tabs)/profile.tsx` |
| Product Detail | `app/product/[slug].tsx` |
| Checkout | `app/checkout.tsx` |
| Order Tracking | `app/order/[id].tsx` |
| Notifications | `app/notifications.tsx` |
| Login | `app/(auth)/login.tsx` |
| Register | `app/(auth)/register.tsx` |
| Forgot Password | `app/(auth)/forgot-password.tsx` |

---

## Website Routes

| Page | URL |
|---|---|
| Home | `/en` or `/km` |
| Products | `/en/products` |
| Product Detail | `/en/products/[slug]` |
| Cart | `/en/cart` |
| Checkout | `/en/checkout` |
| Orders | `/en/orders/[id]` |
| Profile | `/en/profile` |
| Wishlist | `/en/wishlist` |
| Login | `/en/login` |
| Register | `/en/register` |
| Forgot Password | `/en/forgot-password` |

---

## Database Schema

Key models in `prisma/schema.prisma`:

```
User              — customers and admin accounts
Account           — OAuth provider links (NextAuth)
Session           — active sessions (NextAuth)
Category          — product categories (hierarchical, supports parent/child)
Product           — products with USD/KHR dual pricing
ProductVariant    — size, color, and other variants per product
Order             — customer orders with full pricing breakdown
OrderItem         — line items within each order
Address           — saved shipping addresses
DeliveryZone      — delivery zones with pricing by province
Coupon            — discount codes
PaymentTransaction — ABA/Wing payment records
WishlistItem      — customer wishlists
Review            — product reviews and ratings
Notification      — user notification inbox
AuditLog          — admin action audit trail
Settings          — key/value app settings
```

---

## Team Workflow

### Naming Conventions

- Files: `PascalCase.tsx` for components, `camelCase.ts` for utilities/hooks
- Folders: `kebab-case/` for route folders, `camelCase/` for code folders
- Variables/functions: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Database models: `PascalCase`
- API routes: `/api/resource` (plural), `/api/resource/[id]`

### Branch Strategy

```
main            — production-ready code
dev             — integration branch
feature/xxx     — new features
fix/xxx         — bug fixes
hotfix/xxx      — urgent production fixes
```

### Adding a New Feature

1. Branch off `dev`: `git checkout -b feature/your-feature`
2. Make changes in the relevant sub-project
3. Test locally (run dev server + Expo)
4. Open PR to `dev`

---

## Useful Commands

```bash
# Find all TODO comments across the project
grep -r "TODO" bosba-ecommerce/src bosba-mobile/src

# Check TypeScript errors
cd bosba-ecommerce && npx tsc --noEmit
cd bosba-mobile && npx tsc --noEmit

# Format code (if prettier is installed)
npx prettier --write .
```

---

## Support

- Expo docs: https://docs.expo.dev/versions/v56.0.0/
- Next.js docs: https://nextjs.org/docs
- Prisma docs: https://www.prisma.io/docs
- Supabase docs: https://supabase.com/docs
#   B O S B A  
 #   B O S B A  
 #   B O S B A  
 #   B O S B A  
 #   B O S B A  
 