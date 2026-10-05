/* Ojasvini service worker (hand-rolled, no build dependency).
 * Strategies:
 *  - navigations: network-first, runtime-cache app shell, /offline fallback
 *  - static/img/audio (/uploads, /icons, /_next/static): cache-first
 *  - API GET (except /api/auth/*): stale-while-revalidate
 *  - everything else (incl. all POSTs): network only — writes go via the
 *    IndexedDB outbox (client flushes on reconnect / Background Sync).
 */
const VERSION = "ojas-v1";
const CORE = ["/offline", "/manifest.webmanifest", "/icons/icon-192.svg", "/icons/icon-512.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

function isSafeApiGet(url) {
  return url.pathname.startsWith("/api/") && !url.pathname.startsWith("/api/auth/");
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return; // writes: network only (outbox covers offline)
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || (!url.protocol.startsWith("http"))) return;

  // App navigations: network-first, cache the shell, offline fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(request, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(request).then((hit) => hit || caches.match("/offline")))
    );
    return;
  }

  // Static assets + uploads: cache-first.
  if (
    url.pathname.startsWith("/_next/static") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/uploads/")
  ) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(request, copy)).catch(() => {});
            return res;
          })
      )
    );
    return;
  }

  // Safe API GETs: stale-while-revalidate.
  if (isSafeApiGet(url)) {
    event.respondWith(
      caches.match(request).then((hit) => {
        const net = fetch(request).then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(request, copy)).catch(() => {});
          return res;
        });
        return hit || net;
      })
    );
  }
});

// Background Sync: wake the client to flush the outbox.
self.addEventListener("sync", (event) => {
  if (event.tag === "ojas-outbox") {
    event.waitUntil(
      self.clients.matchAll({ type: "window" }).then((clients) => {
        clients.forEach((c) => c.postMessage({ type: "ojas-flush-outbox" }));
      })
    );
  }
});

self.addEventListener("message", (event) => {
  if (event.data === "ojas-skip-waiting") self.skipWaiting();
});
