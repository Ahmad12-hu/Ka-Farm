const CACHE_NAME = "ka-farm-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.hostname.includes("firebase") || url.pathname.startsWith("/api/")) {
    return;
  }

  event.respondWith(
    fetch(request).catch(async () => {
      const cached = await caches.match(request);
      if (cached) return cached;

      const fallback = await caches.match("/index.html");
      if (fallback) return fallback;

      return new Response("Offline", {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "Content-Type": "text/plain" },
      });
    })
  );
});

console.log("[SW] Service Worker loaded");
