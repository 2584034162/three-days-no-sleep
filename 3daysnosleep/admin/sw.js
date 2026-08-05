const ADMIN_CACHE = 'stm-admin-v3.2';

const ADMIN_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './admin-icon-192.png',
  './admin-icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(ADMIN_CACHE).then(cache => cache.addAll(ADMIN_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== ADMIN_CACHE)
          .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;

  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // API 请求走网络，不缓存。
  if (url.pathname.startsWith('/api/')) return;

  // 只处理 admin 这个静态站自己的资源。
  if (url.origin !== location.origin) return;

  event.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(ADMIN_CACHE).then(cache => cache.put(req, copy));
        return res;
      })
      .catch(() => {
        return caches.match(req).then(cached => {
          return cached || caches.match('./index.html');
        });
      })
  );
});
