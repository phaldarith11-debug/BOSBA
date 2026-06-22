/* BOSBA service worker — hand-rolled, no build step.
 *
 * Goals: speed up repeat loads, keep the app usable offline, and NEVER break
 * Next.js routing or auth. Strategy summary:
 *   - Navigations: network-first with a TIMEOUT → cached page → /offline.html
 *     (a slow/flaky mobile network can no longer hang the installed PWA forever)
 *   - Build assets (_next/static, icons, fonts): cache-first (immutable)
 *   - Remote images (Cloudinary/Unsplash): stale-while-revalidate
 *   - API / admin / seller / developer / auth / account: never intercepted
 *
 * Bump CACHE_VERSION to invalidate ALL caches on the next activation. This is
 * also the kill-switch for any older, broken cache an installed device is stuck
 * on — the new worker wipes them in `activate`.
 */

const CACHE_VERSION = "v3";
const STATIC_CACHE = `bosba-static-${CACHE_VERSION}`;
const PAGES_CACHE = `bosba-pages-${CACHE_VERSION}`;
const IMAGES_CACHE = `bosba-images-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline.html";

// How long to wait for the network on a navigation before falling back to the
// last cached copy of that page. Prevents the "stuck on splash forever" symptom.
const NAV_TIMEOUT_MS = 3500;

// Precached app shell — must stay tiny and always available offline.
const PRECACHE_URLS = [
  OFFLINE_URL,
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

const MAX_PAGES = 50;
const MAX_IMAGES = 60;

// Never let the SW touch these — dynamic, authenticated, or routing internals
// where a stale/cached response would cause bugs. (Dashboards live outside the
// [locale] segment, so these exact prefixes are correct.)
const BYPASS_PREFIXES = [
  "/api/",
  "/admin",
  "/seller",
  "/developer",
  "/_next/data",
];

// Page paths that may be served network-first but must NEVER be cached/served
// stale, because they are user/auth specific. Matched after stripping an
// optional /xx locale prefix so /km/login etc. are covered too.
const NON_CACHEABLE_NAV = [
  "/login", "/register", "/logout",
  "/profile", "/account", "/orders",
  "/checkout", "/cart",
  "/verify-email", "/forgot-password", "/reset-password",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()) // a single missing precache file must not abort install
  );
});

self.addEventListener("activate", (event) => {
  const keep = new Set([STATIC_CACHE, PAGES_CACHE, IMAGES_CACHE]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// Allow the page to tell a waiting SW to activate immediately.
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

function isBypassed(url) {
  return BYPASS_PREFIXES.some((p) => url.pathname.startsWith(p));
}

// Strip a leading two-letter locale (e.g. /km/login → /login) so auth checks
// work for every locale, then test against the non-cacheable list.
function isCacheableNav(url) {
  const path = url.pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";
  return !NON_CACHEABLE_NAV.some((p) => path === p || path.startsWith(p + "/"));
}

// A response we can safely cache and later replay for a navigation. Redirected
// or opaque responses CANNOT be replayed for a navigate request (the browser
// throws a network error), which is a classic cause of a broken installed PWA.
function isCacheableResponse(response) {
  return (
    response &&
    response.ok &&
    !response.redirected &&
    response.type === "basic" &&
    (response.headers.get("Cache-Control") || "").indexOf("no-store") === -1
  );
}

async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxItems) return;
  for (let i = 0; i < keys.length - maxItems; i++) await cache.delete(keys[i]);
}

// Navigations: prefer fresh content, but never hang the app. If the network is
// slow/down and we have a cached copy of this page, show it; otherwise fall
// back to the branded offline page.
async function handleNavigation(request) {
  const url = new URL(request.url);
  const cache = await caches.open(PAGES_CACHE);
  const cacheable = isCacheableNav(url);

  const network = fetch(request)
    .then((response) => {
      if (cacheable && isCacheableResponse(response)) {
        const copy = response.clone();
        cache.put(request, copy).then(() => trimCache(PAGES_CACHE, MAX_PAGES));
      }
      return response;
    });

  const cached = cacheable
    ? await cache.match(request, { ignoreSearch: true })
    : null;

  // No usable cache → we must wait for the network (first load), but on failure
  // show the offline page instead of spinning forever.
  if (!cached || cached.redirected) {
    try {
      return await network;
    } catch {
      return (await caches.match(OFFLINE_URL)) || Response.error();
    }
  }

  // We have a cached page → race the network against a short timeout so a slow
  // connection can't block first paint. The network keeps updating the cache.
  const timeout = new Promise((resolve) => setTimeout(() => resolve("TIMEOUT"), NAV_TIMEOUT_MS));
  const winner = await Promise.race([network.catch(() => "ERROR"), timeout]);
  if (winner && winner !== "TIMEOUT" && winner !== "ERROR") return winner;
  return cached;
}

// Immutable build output — serve from cache, fetch once on miss.
async function handleStatic(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const copy = response.clone();
      caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
    }
    return response;
  } catch {
    return Response.error();
  }
}

// Remote images — show cached instantly, refresh in the background.
async function handleImage(request) {
  const cache = await caches.open(IMAGES_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response && (response.ok || response.type === "opaque")) {
        cache.put(request, response.clone());
        trimCache(IMAGES_CACHE, MAX_IMAGES);
      }
      return response;
    })
    .catch(() => null);
  return cached || (await network) || Response.error();
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only ever handle GET; everything else (POST logins, mutations) goes straight
  // to the network untouched.
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  // Pass-through for dynamic/auth/routing-sensitive paths.
  if (sameOrigin && isBypassed(url)) return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  if (sameOrigin && (url.pathname.startsWith("/_next/static") || url.pathname.startsWith("/icons/"))) {
    event.respondWith(handleStatic(request));
    return;
  }

  if (request.destination === "image") {
    event.respondWith(handleImage(request));
    return;
  }

  // Default: let the browser handle it normally.
});

/* ── Push notifications (scaffolding) ──────────────────────────────────────
 * Wired and ready, but no subscriptions are created until a VAPID key is set
 * and the client opts in (see src/lib/push.ts). Safe to ship disabled.
 */
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: "BOSBA", body: event.data ? event.data.text() : "" };
  }
  const title = payload.title || "BOSBA";
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { url: payload.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
