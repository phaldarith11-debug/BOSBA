// @bosba/backend — shared backend services with no framework dependencies.
//
// Only framework-agnostic service logic lives here (payments, notifications,
// uploads, utils). NextAuth-coupled helpers (auth.ts, mobile-auth.ts,
// google-mobile-oauth.ts) and the Next.js API route handlers stay in
// bosba-ecommerce, because pulling next/next-auth into this package would
// duplicate React in the build.
//
// Import a specific subpath, e.g.:
//   import { createABATransaction } from "@bosba/backend/payments/payway";
export * from "./payments/payway";
export * from "./notifications/telegram";
export * from "./notifications/email";
export * from "./uploads/cloudinary";
export * from "./utils/currency";
