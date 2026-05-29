const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const LOW_STOCK_THRESHOLD = Number(process.env.TELEGRAM_LOW_STOCK_THRESHOLD ?? 5);

export async function sendTelegramMessage(text: string, chatId?: string): Promise<void> {
  const target = chatId ?? ADMIN_CHAT_ID;
  if (!BOT_TOKEN || !target) return;
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: target, text, parse_mode: "HTML" }),
    });
  } catch {
    // Fire-and-forget — never let Telegram failures break the main flow
  }
}

/* ── Admin: new order ────────────────────────────────────────────────────── */
export function buildNewOrderMessage(order: {
  orderNumber: string;
  user: { name?: string | null; phone?: string | null };
  items: Array<{ nameEn: string; quantity: number; priceUsd: number | string }>;
  subtotalUsd: number | string;
  deliveryFeeUsd: number | string;
  discountUsd: number | string;
  totalUsd: number | string;
  totalKhr: number;
  paymentMethod: string;
  deliveryZone?: { nameEn: string } | null;
  address?: { province?: string | null } | null;
}): string {
  const itemLines = order.items
    .map((i) => `  • ${i.nameEn} × ${i.quantity} — $${Number(i.priceUsd).toFixed(2)}`)
    .join("\n");

  const fee = Number(order.deliveryFeeUsd);
  const discount = Number(order.discountUsd);
  const feeLine = fee === 0 ? "  🚚 Delivery: Free!" : `  🚚 Delivery: $${fee.toFixed(2)}`;
  const discountLine = discount > 0 ? `  🏷 Coupon: -$${discount.toFixed(2)}\n` : "";
  const province = order.address?.province ?? order.deliveryZone?.nameEn ?? "—";

  return [
    `🛍 <b>New Order #${order.orderNumber}</b>`,
    "",
    `👤 Customer: ${order.user.name ?? "Guest"}`,
    `📞 Phone: ${order.user.phone ?? "N/A"}`,
    `📍 Province: ${province}`,
    `💳 Payment: ${order.paymentMethod.replace(/_/g, " ")}`,
    "",
    `📦 Items (${order.items.length}):`,
    itemLines,
    "",
    feeLine,
    discountLine + `💰 Total: <b>$${Number(order.totalUsd).toFixed(2)}</b> / ៛${order.totalKhr.toLocaleString()}`,
  ].join("\n");
}

/* ── Admin: order status changed (admin view) ────────────────────────────── */
export function buildAdminStatusMessage(order: {
  orderNumber: string;
  user: { name?: string | null; phone?: string | null };
  status: string;
  trackingCode?: string | null;
}): string {
  const statusEmoji: Record<string, string> = {
    CONFIRMED: "✅", PROCESSING: "⚙️", SHIPPED: "🚚",
    DELIVERED: "✅✅", CANCELLED: "❌", REFUNDED: "↩️",
  };
  const emoji = statusEmoji[order.status] ?? "🔔";
  const trackingLine = order.trackingCode
    ? `\n📬 Tracking: <code>${order.trackingCode}</code>` : "";
  return [
    `${emoji} <b>Order #${order.orderNumber} → ${order.status}</b>`,
    `👤 ${order.user.name ?? "Guest"} (${order.user.phone ?? "N/A"})`,
    trackingLine,
  ].join("\n");
}

/* ── Customer: order status changed ─────────────────────────────────────── */
export function buildCustomerStatusMessage(order: {
  orderNumber: string;
  status: string;
  trackingCode?: string | null;
  totalUsd: number | string;
  totalKhr: number;
}): string {
  const statusLabel: Record<string, string> = {
    CONFIRMED:  "✅ Confirmed — we have received your order!",
    PROCESSING: "⚙️ Processing — your order is being packed.",
    SHIPPED:    "🚚 Shipped — your order is on its way!",
    DELIVERED:  "🎉 Delivered — enjoy your purchase!",
    CANCELLED:  "❌ Cancelled — please contact us if this is unexpected.",
    REFUNDED:   "↩️ Refunded — your refund is being processed.",
  };
  const label = statusLabel[order.status] ?? `🔔 Status: ${order.status}`;
  const trackingLine = order.trackingCode
    ? `\n📬 Tracking code: <code>${order.trackingCode}</code>` : "";

  return [
    `📦 <b>Order #${order.orderNumber} Update</b>`,
    "",
    label,
    trackingLine,
    "",
    `💰 Order total: $${Number(order.totalUsd).toFixed(2)} / ៛${order.totalKhr.toLocaleString()}`,
    "",
    "Questions? Reply to this message or call us.",
  ].join("\n");
}

/* ── Admin: low stock alert ──────────────────────────────────────────────── */
export function buildLowStockMessage(products: Array<{
  nameEn: string;
  sku?: string | null;
  stock: number;
}>): string {
  const lines = products.map(
    (p) => `  • ${p.nameEn}${p.sku ? ` (${p.sku})` : ""} — <b>${p.stock} left</b>`
  );
  return [
    `⚠️ <b>Low Stock Alert</b>`,
    "",
    `${products.length} product${products.length > 1 ? "s" : ""} running low (≤${LOW_STOCK_THRESHOLD} units):`,
    lines.join("\n"),
    "",
    "Top up soon to avoid stockouts.",
  ].join("\n");
}

export { LOW_STOCK_THRESHOLD };

/* ── Legacy export kept for backwards compat ─────────────────────────────── */
export function buildOrderNotification(order: {
  orderNumber: string;
  user: { name?: string | null; phone?: string | null };
  totalUsd: number | string;
  totalKhr: number;
  paymentMethod: string;
  status: string;
}): string {
  return buildNewOrderMessage({
    ...order,
    items: [],
    subtotalUsd: order.totalUsd,
    deliveryFeeUsd: 0,
    discountUsd: 0,
  });
}
