// Network-first so a redeploy reaches online users immediately; the cache is the offline fallback.
const CACHE = 'lcars-life-v4';
const SHELL = [
  './',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
  'blueprint.webp',
  'sfx/key1.mp3',
  'sfx/key2.mp3',
  'sfx/key3.mp3',
  'sfx/hail.mp3',
  'sfx/undo.mp3',
  'sfx/confirm.mp3'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== location.origin) return;
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(request, copy));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then(hit => hit || (request.mode === 'navigate' ? caches.match('./') : Response.error()))
      )
  );
});
