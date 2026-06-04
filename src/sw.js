// Custom Aurora Space Health service worker (vite-plugin-pwa injectManifest).
// Responsibilities:
//   1. Precache the built app shell (offline support) — parity with the old generateSW.
//   2. Cache Google Fonts at runtime.
//   3. Handle Web Push: show notifications and focus/open the app on click.

import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

cleanupOutdatedCaches();
// self.__WB_MANIFEST is injected at build time by vite-plugin-pwa.
precacheAndRoute(self.__WB_MANIFEST || []);

// Google Fonts (stylesheets + webfonts)
registerRoute(
  ({ url }) => url.origin === "https://fonts.googleapis.com",
  new CacheFirst({ cacheName: "google-fonts-stylesheets" })
);
registerRoute(
  ({ url }) => url.origin === "https://fonts.gstatic.com",
  new CacheFirst({
    cacheName: "google-fonts-webfonts",
    plugins: [new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 })],
  })
);

// Activate updated SW immediately
self.skipWaiting();
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// ── WEB PUSH ────────────────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "Aurora Space Health";
  const options = {
    body: payload.body || "Solar activity is changing — open Aurora to see how it may affect you.",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: payload.tag || "aurora-solar",
    renotify: true,
    data: { url: payload.url || "/" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          if ("navigate" in client) {
            try { client.navigate(target); } catch { /* cross-origin or unsupported */ }
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })
  );
});
