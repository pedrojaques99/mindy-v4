// This is a simple service worker that caches the app shell
// The actual service worker implementation will be handled by vite-plugin-pwa

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Simple fetch handler to ensure the service worker is properly registered
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return new Response('Network error happened', {
          status: 408,
          headers: { 'Content-Type': 'text/plain' },
        });
      })
  );
}); 