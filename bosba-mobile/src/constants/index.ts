export const COLORS = {
  primary:    "#e51b1b",
  primaryDark:"#c41414",
  background: "#f9fafb",
  surface:    "#ffffff",
  border:     "#e5e7eb",
  text:       "#111827",
  textMuted:  "#6b7280",
  textLight:  "#9ca3af",
  success:    "#10b981",
  warning:    "#f59e0b",
  danger:     "#ef4444",
} as const;

export const FONT_SIZE = {
  xs:   11,
  sm:   13,
  md:   15,
  lg:   17,
  xl:   20,
  xxl:  24,
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING:    "Pending",
  CONFIRMED:  "Confirmed",
  PROCESSING: "Processing",
  SHIPPED:    "Shipped",
  DELIVERED:  "Delivered",
  CANCELLED:  "Cancelled",
  REFUNDED:   "Refunded",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING:  "Pending",
  PAID:     "Paid",
  FAILED:   "Failed",
  REFUNDED: "Refunded",
};

export const SCREEN_NAMES = {
  HOME:          "(tabs)/index",
  PRODUCTS:      "(tabs)/products",
  CART:          "(tabs)/cart",
  PROFILE:       "(tabs)/profile",
  LOGIN:         "(auth)/login",
  REGISTER:      "(auth)/register",
  FORGOT:        "(auth)/forgot-password",
  PRODUCT:       "product/[slug]",
  CHECKOUT:      "checkout",
  ORDER:         "order/[id]",
  NOTIFICATIONS: "notifications",
} as const;
