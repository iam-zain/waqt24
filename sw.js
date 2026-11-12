// BUILD and the ?v= hashes below are rewritten by tools/build.py; do not edit them by hand.
const BUILD = '39471bfe';
const CACHE_NAME = 'waqt24-' + BUILD;         // the page shell; replaced on every build
// Quran page images and Azaan recordings live in their own cache that survives every build, so a reader
// who already downloaded a page never re-downloads it because something else in the app changed.
const QURAN_CACHE = 'waqt24-quran-v1';
// Fonts, icons and the versioned scripts/styles: each file has its own URL (?v=hash), so unchanged ones stay
// cached across updates and only the changed files download again.
const STATIC_CACHE = 'waqt24-static-v1';
const SHELL = ['./', './index.html'];
const VERSIONED = [
  './styles.css?v=ae3203e9',
  './app.js?v=8040b312',
  './data.js?v=1ae03d30',
  './i18n.js?v=d17dbf5f',
];
const STATIC = [
  './fonts/scheherazade-400.woff2',
  './fonts/scheherazade-700.woff2',
  './fonts/inter-latin.woff2',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-192.png',
  './icons/maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const shell = await caches.open(CACHE_NAME);
    await Promise.all(SHELL.map((a) => shell.add(new Request(a, { cache: 'reload' })).catch(() => {})));
    const st = await caches.open(STATIC_CACHE);
    // only fetch what isn't saved yet, so an update doesn't re-download unchanged files
    for (const a of VERSIONED.concat(STATIC)) {
      if (!(await st.match(a))) { try { await st.add(a); } catch (e) {} }
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE_NAME && k !== QURAN_CACHE && k !== STATIC_CACHE).map((k) => caches.delete(k)));
    // drop versioned files from earlier builds
    const st = await caches.open(STATIC_CACHE);
    const keep = new Set(VERSIONED.map((a) => new URL(a, self.location).href));
    for (const req of await st.keys()) {
      if (new URL(req.url).searchParams.has('v') && !keep.has(req.url)) await st.delete(req);
    }
    await self.clients.claim();
  })());
});

// The page shell (tiny) is network-first so a new release is seen at once; everything else is cache-first.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const isShell = event.request.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html');
  if (isShell) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then((res) => {
          if (res.ok) { const clone = res.clone(); caches.open(CACHE_NAME).then((c) => c.put(event.request, clone)).catch(() => {}); }
          return res;
        })
        .catch(() => caches.match(event.request).then((r) => r || caches.match('./index.html')))
    );
    return;
  }

  // Azaan recordings: <audio> asks with Range headers and gets 206 replies, which the Cache API refuses
  // to store. Fetch the whole file once, keep it, and answer every Range request from that copy.
  if (url.pathname.includes('/azan/')) {
    event.respondWith(serveMedia(event.request));
    return;
  }

  if (url.pathname.includes('/quran/')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((res) => {
          if (res.ok && res.status === 200) {
            const clone = res.clone();
            caches.open(QURAN_CACHE).then((cache) => cache.put(event.request, clone)).catch(() => {});
          }
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
        if (res.ok && res.status === 200) {
          const clone = res.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, clone)).catch(() => {});
        }
        return res;
      });
    })
  );
});

async function serveMedia(request) {
  const cache = await caches.open(QURAN_CACHE);
  let res = await cache.match(request.url);
  if (!res) {
    const full = await fetch(request.url); // no Range header: the whole file
    if (!(full.ok && full.status === 200)) return full;
    try { await cache.put(request.url, full.clone()); } catch (e) {}
    res = full;
  }
  const range = request.headers.get('range');
  const m = range && /bytes=(\d*)-(\d*)/.exec(range);
  if (!m) return res;
  const buf = await res.arrayBuffer();
  const size = buf.byteLength;
  const start = m[1] === '' ? Math.max(0, size - parseInt(m[2], 10)) : parseInt(m[1], 10);
  const end = (m[1] !== '' && m[2] !== '') ? Math.min(parseInt(m[2], 10), size - 1) : size - 1;
  if (isNaN(start) || start >= size || end < start) {
    return new Response(null, { status: 416, headers: { 'Content-Range': 'bytes */' + size } });
  }
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': res.headers.get('Content-Type') || 'audio/mpeg',
      'Content-Range': 'bytes ' + start + '-' + end + '/' + size,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes'
    }
  });
}

// Tapping a prayer notification brings the app forward
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ('focus' in c) return c.focus(); }
      return self.clients.openWindow('./index.html');
    })
  );
});
