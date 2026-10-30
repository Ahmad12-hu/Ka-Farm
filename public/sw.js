// KA Farm - Service Worker (mode hors-ligne réel)
// ------------------------------------------------------------------
// Stratégies :
//   - Navigations (documents HTML) : réseau d'abord, puis cache, puis /offline.html
//   - Assets statiques (css/js/images/fonts) : stale-while-revalidate
//   - /api/* et origines externes : laissés au réseau (aucun cache)
// ------------------------------------------------------------------

const CACHE_NAME = "ka-farm-v2";

// En développement (localhost), on ne met rien en cache : le serveur Vite et
// son HMR doivent toujours servir la version fraîche des modules.
const IS_DEV_HOST =
  self.location.hostname === "localhost" || self.location.hostname === "127.0.0.1";

// Ressources pré-cachées à l'installation (best-effort : un échec isolé
// n'empêche pas l'installation du service worker). Les assets hashés (CSS/JS
// buildés) seront mis en cache à la volée par la stratégie stale-while-revalidate.
const PRECACHE_URLS = ["/", "/index.html", "/offline.html"];

async function precache() {
  if (IS_DEV_HOST) return;
  const cache = await caches.open(CACHE_NAME);
  await Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url)));
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

const STATIC_ASSET_RE = /\.(css|js|mjs|png|jpe?g|svg|webp|gif|ico|woff2?|ttf|eot)$/i;

async function handleNavigate(request) {
  try {
    const response = await fetch(request);
    const copy = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
    return response;
  } catch {
    return (
      (await caches.match(request)) ||
      (await caches.match("/offline.html")) ||
      new Response("Hors ligne", { status: 503, headers: { "Content-Type": "text/plain" } })
    );
  }
}

async function handleStaticAsset(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const network = fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  if (cached) return cached;
  const fresh = await network;
  return fresh || new Response("", { status: 504, statusText: "Offline" });
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  if (IS_DEV_HOST) return;

  const url = new URL(request.url);
  // API et origines externes (Firebase, CDN, GeoJSON…) : réseau uniquement.
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigate(request));
    return;
  }

  if (STATIC_ASSET_RE.test(url.pathname)) {
    event.respondWith(handleStaticAsset(request));
  }
});

console.log("[SW] Service Worker loaded");
