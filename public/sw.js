// Minimal service worker: enables PWA installability.
// Network-first passthrough — no offline caching yet, so users
// always see live listings.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {
  // default browser handling
});
