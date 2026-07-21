// Math Trail service worker — cache-first app shell so the tracker works offline
// (data already lives in localStorage; only the shell needs caching).
// Bump the cache name on EVERY release that changes shell files —
// otherwise returning users keep the previous version (threat model T7).
const CACHE = 'math-trail-v5';
const SHELL = [
  './', './index.html', './styles.css',
  './js/app.mjs', './js/engine.mjs', './js/activities.mjs',
  './js/time.mjs', './js/storage.mjs', './js/demo.mjs', './js/i18n.mjs',
  './js/session.mjs',
  './manifest.webmanifest'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(
      (hit) => hit ||
        fetch(e.request).then((res) => {
          if (res.ok && new URL(e.request.url).origin === location.origin) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return res;
        })
    )
  );
});
