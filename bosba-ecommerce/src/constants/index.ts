export const APP_NAME = "BOSBA";
export const DEFAULT_LOCALE = "en";
export const SUPPORTED_LOCALES = ["en", "km"] as const;

export const DEFAULT_EXCHANGE_RATE = 4100;
export const SUPPORTED_CURRENCIES = ["USD", "KHR"] as const;

export const PAGINATION_LIMIT = 24;
export const ADMIN_PAGINATION_LIMIT = 20;

export const MAX_CART_QUANTITY = 99;
export const MAX_IMAGES_PER_PRODUCT = 8;
export const MAX_UPLOAD_SIZE_MB = 10;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  ABA_BANK: "ABA Bank",
  ACLEDA_BANK: "ACLEDA Bank",
  WING_MONEY: "Wing Money",
  COD: "Cash on Delivery",
  PI_PAY: "Pi Pay",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

export const ROUTES = {
  HOME: "/",
  PRODUCTS: "/products",
  CART: "/cart",
  CHECKOUT: "/checkout",
  PROFILE: "/profile",
  WISHLIST: "/wishlist",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  ADMIN: "/admin",
  ADMIN_PRODUCTS: "/admin/products",
  ADMIN_CATEGORIES: "/admin/categories",
  ADMIN_ORDERS: "/admin/orders",
  ADMIN_CUSTOMERS: "/admin/customers",
  ADMIN_ZONES: "/admin/zones",
  ADMIN_COUPONS: "/admin/coupons",
  ADMIN_REPORTS: "/admin/reports",
  ADMIN_SETTINGS: "/admin/settings",
} as const;

export const API_ROUTES = {
  PRODUCTS: "/api/products",
  ORDERS: "/api/orders",
  UPLOAD: "/api/upload",
  DELIVERY_ZONES: "/api/delivery-zones",
  COUPONS_VALIDATE: "/api/coupons/validate",
  ADMIN_PRODUCTS: "/api/admin/products",
  ADMIN_CATEGORIES: "/api/admin/categories",
  ADMIN_ORDERS: "/api/admin/orders",
  ADMIN_CUSTOMERS: "/api/admin/customers",
  ADMIN_ZONES: "/api/admin/zones",
  ADMIN_SETTINGS: "/api/admin/settings",
} as const;
