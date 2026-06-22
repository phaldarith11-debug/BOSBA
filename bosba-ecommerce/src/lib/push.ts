// Web Push scaffolding (client-side helpers).
//
// Push is intentionally NOT enabled yet — no subscriptions are created unless a
// VAPID public key is provided via NEXT_PUBLIC_VAPID_PUBLIC_KEY. This keeps the
// structure ready for a future rollout without turning on any paid service.
//
// To enable later:
//   1. Generate VAPID keys (e.g. `npx web-push generate-vapid-keys`).
//   2. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY (client) + VAPID_PRIVATE_KEY (server).
//   3. Add a PushSubscription model and persist subscriptions in
//      /api/push/subscribe, then send via a server cron / API.

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function isPushConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

// Asks for permission, subscribes to push, and registers the subscription with
// the server. No-op (returns null) until push is configured + supported.
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!isPushSupported() || !isPushConfigured()) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const reg = await navigator.serviceWorker.ready;
  const existing = await reg.pushManager.getSubscription();
  const subscription =
    existing ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string
      ) as BufferSource,
    }));

  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription),
  }).catch(() => undefined);

  return subscription;
}
