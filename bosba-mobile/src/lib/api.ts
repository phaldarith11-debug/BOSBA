// Android emulator: http://10.0.2.2:3000
// Physical device (same WiFi): http://YOUR_LAN_IP:3000  (run: ipconfig | findstr IPv4)
// Production: https://yourdomain.com
export const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "https://your-bosba-domain.com";

const TIMEOUT_MS = 12_000; // 12 seconds — generous for mobile networks

async function apiFetch(path: string, init?: RequestInit) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
    clearTimeout(timer);

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `Server error (${res.status})` }));
      throw new Error(err.error ?? `HTTP ${res.status}`);
    }
    return res.json();
  } catch (error) {
    clearTimeout(timer);
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error(
          "Request timed out.\n\nTips:\n• Make sure your phone and PC are on the same WiFi\n• Check EXPO_PUBLIC_API_URL in your .env file\n• Android emulator: use 10.0.2.2, not localhost\n• Physical device: use your PC's LAN IP"
        );
      }
      if (error.message.includes("Network request failed") || error.message.includes("Failed to fetch")) {
        throw new Error(
          "Cannot reach the server.\n\nTips:\n• Make sure the Next.js server is running (npm run dev)\n• Android emulator uses 10.0.2.2:3000, not localhost\n• Physical device needs your PC's LAN IP (run: ipconfig)"
        );
      }
    }
    throw error;
  }
}

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// ── Products ──────────────────────────────────────────────────────────────────

export function getProducts(params?: Record<string, string>) {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return apiFetch(`/api/products${qs}`);
}

export function getProduct(slug: string) {
  return apiFetch(`/api/products/${slug}`);
}

// ── Delivery zones ────────────────────────────────────────────────────────────

export function getDeliveryZones() {
  return apiFetch("/api/delivery-zones");
}

// ── Orders ────────────────────────────────────────────────────────────────────

export function createOrder(body: unknown, token: string) {
  return apiFetch("/api/mobile/orders", {
    method: "POST",
    body: JSON.stringify(body),
    headers: authHeader(token),
  });
}

export function getMobileOrders(token: string) {
  return apiFetch("/api/mobile/orders", { headers: authHeader(token) });
}

export function getOrder(id: string, token: string) {
  return apiFetch(`/api/mobile/orders/${id}`, { headers: authHeader(token) });
}

// ── Notifications ─────────────────────────────────────────────────────────────

export function getNotifications(token: string) {
  return apiFetch("/api/mobile/notifications", { headers: authHeader(token) });
}

export function markNotificationRead(id: string, token: string) {
  return apiFetch(`/api/mobile/notifications/${id}/read`, {
    method: "PATCH",
    headers: authHeader(token),
  });
}

// ── User profile ──────────────────────────────────────────────────────────────

export function getProfile(token: string) {
  return apiFetch("/api/mobile/auth/me", { headers: authHeader(token) });
}

export function updateProfile(body: unknown, token: string) {
  return apiFetch("/api/user/profile", {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: authHeader(token),
  });
}
