# BOSBA API Reference

All API routes live under `/api/`. Base URL in production: `https://yourdomain.com`.

Authentication:
- **Website routes** — NextAuth session cookie (set automatically by the browser)
- **Mobile routes** (`/api/mobile/*`) — `Authorization: Bearer <JWT>` header
- **Admin routes** (`/api/admin/*`) — NextAuth session cookie with `role = ADMIN`

---

## Auth Routes (`/api/auth/`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Register new user account |
| POST | `/api/auth/forgot-password` | None | Send password reset email |
| POST | `/api/auth/reset-password` | None | Reset password with token |
| GET | `/api/auth/verify-email` | None | Verify email with token |
| POST | `/api/auth/resend-verification` | None | Resend verification email |
| GET | `/api/auth/check-unverified` | None | Check if email is unverified |
| ALL | `/api/auth/[...nextauth]` | — | NextAuth handler (login, logout, session) |

---

## Product Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | None | List products. Query: `category`, `search`, `featured`, `page`, `limit`, `sort` |
| GET | `/api/products/[slug]` | None | Get single product by slug, includes related products |

**GET /api/products — Query Parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `category` | string | — | Filter by category slug |
| `search` | string | — | Full-text search on nameEn / nameKm |
| `featured` | boolean | false | Show only featured products |
| `page` | number | 1 | Page number |
| `limit` | number | 24 | Items per page (max 50) |
| `sort` | string | `createdAt_desc` | Options: `createdAt_desc`, `price_asc`, `price_desc`, `name_asc` |

---

## Order Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/orders` | Session | Create a new order |
| GET | `/api/orders/[id]` | Session | Get order details (must own the order) |

**POST /api/orders — Body:**
```json
{
  "items": [{ "productId": "...", "quantity": 2 }],
  "addressId": "...",
  "deliveryZoneId": "...",
  "paymentMethod": "ABA_BANK | ACLEDA_BANK | WING_MONEY | COD | PI_PAY",
  "couponCode": "SAVE10",
  "currency": "USD",
  "notes": "..."
}
```

---

## Payment Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/payment/aba/create` | Session | Generate ABA PayWay QR code |
| GET | `/api/payment/aba/status` | Session | Poll ABA payment status |
| POST | `/api/payment/callback` | None | ABA payment webhook callback |
| POST | `/api/payment/manual-confirm` | Admin | Manually mark payment as confirmed |

---

## User Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| GET/PATCH | `/api/user/profile` | Session | Get or update user profile |
| POST | `/api/user/change-password` | Session | Change password |
| GET | `/api/user/providers` | Session | List linked OAuth providers |
| DELETE | `/api/user/providers/[provider]` | Session | Unlink an OAuth provider |

---

## Delivery & Coupons

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/delivery-zones` | None | List active delivery zones |
| POST | `/api/coupons/validate` | None | Validate a coupon code |

---

## Upload

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/upload` | Session | Upload image to Cloudinary. Returns `{ url, publicId }` |

---

## Telegram

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/telegram/webhook` | Signature | Telegram bot webhook receiver |
| POST | `/api/telegram/link` | Session | Link Telegram account to user |

---

## Mobile Routes (`/api/mobile/`)

All mobile routes use JWT in the `Authorization: Bearer <token>` header.

### Mobile Auth

| Method | Path | Description |
|---|---|---|
| POST | `/api/mobile/auth/login` | Email + password login → returns `{ token, user }` |
| POST | `/api/mobile/auth/google` | Google OAuth → returns `{ token, user }` |
| POST | `/api/mobile/auth/facebook` | Facebook OAuth → returns `{ token, user }` |
| POST | `/api/mobile/auth/apple` | Apple Sign In → returns `{ token, user }` |
| GET | `/api/mobile/auth/me` | Get current user from JWT |

### Mobile Products

| Method | Path | Description |
|---|---|---|
| GET | `/api/mobile/products` | List products. Same query params as `/api/products` |

### Mobile Orders

| Method | Path | Description |
|---|---|---|
| GET | `/api/mobile/orders` | List current user's orders (last 50) |
| POST | `/api/mobile/orders` | Create order |
| GET | `/api/mobile/orders/[id]` | Get single order with items + address |

**POST /api/mobile/orders — Body:**
```json
{
  "items": [{ "productId": "...", "quantity": 1 }],
  "address": {
    "fullName": "...",
    "phone": "...",
    "addressLine1": "...",
    "city": "...",
    "province": "..."
  },
  "deliveryZoneId": "...",
  "paymentMethod": "COD",
  "currency": "USD",
  "notes": "..."
}
```

### Mobile Notifications

| Method | Path | Description |
|---|---|---|
| GET | `/api/mobile/notifications` | Get user notifications (last 50) |
| PATCH | `/api/mobile/notifications/[id]/read` | Mark a notification as read |

---

## Admin Routes (`/api/admin/`)

All admin routes require a session with `role = ADMIN`.

### Products

| Method | Path | Description |
|---|---|---|
| PATCH | `/api/admin/products/[id]` | Update product fields |

### Categories

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/categories` | List all categories with product counts |
| POST | `/api/admin/categories` | Create category (`nameEn`, `nameKm` required) |
| PATCH | `/api/admin/categories/[id]` | Update category |
| DELETE | `/api/admin/categories/[id]` | Delete (blocked if products exist in it) |

### Orders

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/orders/export` | Download orders as CSV |

### Customers

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/customers` | List customers with search + pagination |

### Delivery Zones

| Method | Path | Description |
|---|---|---|
| GET/POST | `/api/admin/zones` | List or create delivery zones |
| PATCH/DELETE | `/api/admin/zones/[id]` | Update or delete a zone |

### Analytics

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/analytics` | Dashboard analytics. Query: `range` (days, default 30) |

**GET /api/admin/analytics — Response:**
```json
{
  "summary": {
    "revenueUsd": 1234.56,
    "revenueKhr": 5061696,
    "orderCount": 42,
    "customerCount": 18,
    "avgOrderValueUsd": 29.39
  },
  "topProducts": [...],
  "recentOrders": [...],
  "ordersByStatus": { "PENDING": 5, "DELIVERED": 30 },
  "dailyRevenue": [{ "day": "2026-05-01", "revenue": 120.5, "orders": 4 }],
  "range": 30
}
```

### Settings

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/settings` | Get all settings as `{ key: value }` map |
| PATCH | `/api/admin/settings` | Bulk update settings. Body: `{ "key": "value", ... }` |

---

## Error Format

All errors return:
```json
{ "error": "Human-readable error message" }
```

Common HTTP status codes used:
- `400` — Bad request / missing required fields
- `401` — Not authenticated
- `403` — Forbidden (wrong role)
- `404` — Resource not found
- `409` — Conflict (duplicate slug, category has products, etc.)
- `500` — Internal server error
