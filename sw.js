const CACHE_NAME = 'cemetery-pwa-v1';
const OFFLINE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
    ))
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Только GET имеет смысл кешировать
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).catch(() => {
        // Если сеть недоступна и ресурса нет в кеше
        if (request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
