/* StampScaner PWA — service worker.
   Caches the app shell so it boots offline. Network-first for everything,
   falling back to the cached shell when offline. */

const CACHE = 'stampscaner-app-v2';
const SHELL = [
  '/app/',
  '/app/index.html',
  '/app/app.css',
  '/app/app.js',
  '/app/manifest.json',
  '/app/icon-192.png',
  '/app/icon-512.png',
  '/app/icon-apple-180.png',
  '/app/splash.png',
  '/css/style.css',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);

  // Never cache API calls — always go to the network, surface errors to the app.
  if (url.origin === 'https://api.stampscaner.com') return;

  // Same-origin GETs use cache-first for shell assets, network-first otherwise.
  if (req.method !== 'GET') return;

  e.respondWith(
    caches.match(req).then(cached => {
      const fresh = fetch(req).then(resp => {
        // Cache successful same-origin responses so navigation works offline.
        if (resp && resp.status === 200 && resp.type === 'basic') {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return resp;
      }).catch(() => cached || caches.match('/app/'));
      return cached || fresh;
    })
  );
});
