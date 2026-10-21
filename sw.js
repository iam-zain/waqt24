const CACHE_NAME = 'waqt24-v170';
// Quran page images live in their own cache that survives every CACHE_NAME bump above, so a reader
// who already downloaded a page never re-downloads it just because something else in the app changed.
const QURAN_CACHE = 'waqt24-quran-v1';
// Fonts, icons and other static files: kept across updates; only the page and data files refresh
const STATIC_CACHE = 'waqt24-static-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './data.js?v=28',
  './i18n.js?v=28',
  './fonts/scheherazade-400.woff2',
  './fonts/scheherazade-700.woff2',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    // only fetch what isn't saved yet, so an update doesn't re-download the fonts and icons
    caches.open(STATIC_CACHE).then(async (cache) => {
      for (const a of CORE_ASSETS) { if (!(await caches.match(a))) { try { await cache.add(a); } catch (e) {} } }
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME && k !== QURAN_CACHE && k !== STATIC_CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first for the HTML shell and data.js so updates arrive quickly; cache-first for everything else.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const isHTML = event.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/data.js') || url.pathname.endsWith('/i18n.js') || url.pathname === '/';

  if (isHTML) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request).then((r) => r || caches.match('./index.html')))
    );
    return;
  }

  // Quran page images: fetched on demand the first time they're viewed, then kept in their own
  // cache indefinitely (not part of the app's install-time download).
  if (url.pathname.includes('/quran/') || url.pathname.includes('/azan/')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((res) => {
          const clone = res.clone();
          caches.open(QURAN_CACHE).then((cache) => cache.put(event.request, clone));
          return res;
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((res) => {
        const clone = res.clone();
        caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, clone));
        return res;
      });
    })
  );
});
