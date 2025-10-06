self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open('mf-cache-v1').then((cache) => cache.addAll([
      '/',
      '/offline',
      '/manifest.webmanifest',
    ]))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('/offline'))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req).then((res) => {
        const copy = res.clone();
        caches.open('mf-cache-v1').then((cache) => cache.put(req, copy));
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
