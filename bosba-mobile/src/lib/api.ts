import Constants from "expo-constants";

// ── Resolving the API base URL ──────────────────────────────────────────────
//
// Android emulator: http://10.0.2.2:3000
// Physical device (same WiFi): http://YOUR_LAN_IP:3000
// Production: https://yourdomain.com
//
// The #1 cause of "Cannot reach server" in dev is a STALE LAN IP: your PC's
// Wi-Fi address changes when the router reassigns DHCP, but .env still points at
// the old one. To make this self-healing, in development we read the IP of the
// machine actually serving the Metro bundle (Expo exposes it as `hostUri`, e.g.
// "192.168.110.76:8081"). That host is, by definition, reachable from the device
// right now — so we rewrite a stale LAN IP in the configured base to match it.
const DEV_PORT = 3000;
const FALLBACK_API_BASE = "http://192.168.110.76:3000";

// The LAN IP of the PC running Metro, or null (tunnel/localhost/emulator alias).
function liveMetroHost(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    // older field present in some Expo Go payloads
    (Constants as unknown as { expoGoConfig?: { debuggerHost?: string } })
      .expoGoConfig?.debuggerHost ??
    null;
  if (!hostUri) return null;
  const host = hostUri.split(":")[0];
  if (!host || host === "localhost" || host === "127.0.0.1") return null;
  return host;
}

// If `base` uses a LAN IP that no longer matches the live Metro host, swap the
// host so the app keeps working without anyone editing .env. The 10.0.2.2
// emulator alias and non-IP hosts (domains, tunnels) are left untouched.
function alignHostWithMetro(base: string): string {
  if (!__DEV__) return base;
  const live = liveMetroHost();
  if (!live) return base;
  const m = base.match(/^(https?:\/\/)([^/:]+)(:\d+)?(\/.*)?$/i);
  if (!m) return base;
  const [, scheme, host, port = "", rest = ""] = m;
  const isLanIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
  if (!isLanIp || host === "10.0.2.2" || host === live) return base;
  return `${scheme}${live}${port || `:${DEV_PORT}`}${rest}`;
}

function resolveApiBase(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  const configured = envUrl || FALLBACK_API_BASE;
  return alignHostWithMetro(configured);
}

export const API_BASE = resolveApiBase();

if (__DEV__) {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!envUrl) {
    console.warn(
      `[api] ⚠️ EXPO_PUBLIC_API_URL is not set — using ${API_BASE} ` +
        `(auto-detected from Metro / fallback). Set it in bosba-mobile/.env for emulator/tunnel/prod.`
    );
  }
  console.log(`[api] API_BASE = ${API_BASE} (Metro host: ${liveMetroHost() ?? "n/a"})`);
}

const TIMEOUT_MS = 12_000; // 12 seconds — generous for mobile networks
const MAX_RETRIES = 2; // applied to GET requests only (idempotent)
const RETRY_BASE_DELAY_MS = 700;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// A fetch timeout fires `AbortController.abort()`. Depending on the JS engine
// that surfaces as name "AbortError" OR a message like "Aborted" /
// "Fetch request has been canceled" (Expo SDK 56). Detect all of them.
function isAbort(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return error.name === "AbortError" || /abort|cancel/i.test(error.message);
}

// Network/transport failures that are worth retrying (host briefly unreachable,
// flaky Wi-Fi, timeout). HTTP 4xx/5xx responses are NOT retried here.
function isRetryable(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  if (isAbort(error)) return true; // timeout
  return /Network request failed|Failed to fetch|NoRouteToHost|Host unreachable|Unable to resolve host|ECONN|ETIMEDOUT|socket/i.test(
    error.message
  );
}

// Map low-level errors to a clear, actionable message for the UI.
export function friendlyError(error: unknown): Error {
  if (error instanceof Error) {
    if (isAbort(error)) {
      return new Error(
        "Request timed out.\n\nTips:\n• Make sure your phone and PC are on the same WiFi\n• Check EXPO_PUBLIC_API_URL in your .env file\n• Android emulator: use 10.0.2.2, not localhost\n• Physical device: use your PC's LAN IP"
      );
    }
    if (isRetryable(error)) {
      return new Error(
        "Cannot reach the server.\n\nTips:\n• Make sure the Next.js server is running (npm run dev)\n• Confirm EXPO_PUBLIC_API_URL matches your PC's current LAN IP (run: ipconfig)\n• Phone and PC must be on the same WiFi\n• Android emulator uses 10.0.2.2:3000, not localhost\n• If it still fails, allow Node.js through Windows Firewall or use tunnel mode"
      );
    }
    return error; // already a meaningful message (e.g. server-sent error)
  }
  return new Error("Unexpected error");
}

/**
 * fetch() against API_BASE with a hard timeout. Returns the raw Response so the
 * caller can inspect status/body. On a transport failure it throws the RAW
 * error (so retry logic can classify it) — wrap calls in `friendlyError(e)` to
 * present a clear message. Shared by the auth screens so every network call in
 * the app fails fast with consistent timeout behaviour.
 */
export async function fetchWithTimeout(
  path: string,
  init?: RequestInit,
  timeoutMs = TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } finally {
    clearTimeout(timer);
  }
}

// Single attempt with timeout.
async function fetchOnce(path: string, init?: RequestInit) {
  const res = await fetchWithTimeout(path, init);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `Server error (${res.status})` }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

async function apiFetch(path: string, init?: RequestInit) {
  const method = (init?.method ?? "GET").toUpperCase();
  // Only retry idempotent GETs — never retry POST/PATCH (e.g. order creation).
  const retries = method === "GET" ? MAX_RETRIES : 0;

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fetchOnce(path, init);
    } catch (error) {
      lastError = error;
      if (attempt < retries && isRetryable(error)) {
        await delay(RETRY_BASE_DELAY_MS * (attempt + 1));
        continue;
      }
      throw friendlyError(error);
    }
  }
  throw friendlyError(lastError);
}

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// ── Products ──────────────────────────────────────────────────────────────────

export function getProducts(params?: Record<string, string>) {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return apiFetch(`/api/mobile/products${qs}`);
}

export function getProduct(slug: string) {
  return apiFetch(`/api/products/${slug}`);
}

// ── App settings & banners ────────────────────────────────────────────────────

export function getAppSettings() {
  return apiFetch("/api/app-settings");
}

export function getBanners(position = "hero") {
  return apiFetch(`/api/app-settings/banners?position=${position}`);
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

// ── Manual ABA / KHQR payment proof ─────────────────────────────────────────────
// Sends multipart/form-data (screenshot + reference). We can't use apiFetch here
// because it forces a JSON Content-Type; for multipart we must let React Native
// set the multipart boundary itself, so Content-Type is intentionally omitted.
export async function submitPaymentProof(
  params: { orderId: string; refId?: string; imageUri?: string },
  token: string
): Promise<{ success: boolean; status: string; proofUrl: string | null }> {
  const fd = new FormData();
  fd.append("orderId", params.orderId);
  if (params.refId) fd.append("refId", params.refId);
  if (params.imageUri) {
    const name = params.imageUri.split("/").pop() || "proof.jpg";
    const ext = name.split(".").pop()?.toLowerCase();
    const type = ext === "png" ? "image/png" : "image/jpeg";
    // React Native's FormData accepts a {uri,name,type} file object.
    fd.append("file", { uri: params.imageUri, name, type } as unknown as Blob);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(`${API_BASE}/api/mobile/payment/proof`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
      signal: controller.signal,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error ?? "Failed to submit payment proof");
    return data;
  } finally {
    clearTimeout(timer);
  }
}
