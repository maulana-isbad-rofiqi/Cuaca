// public/sw.js
const CACHE_NAME = 'cuaca-app-v2';
const FALLBACK_HTML = '/index.html';

// daftar asset internal yang pasti ada di situs (gunakan path root '/')
const PRECACHE_URLS = [
  '/',                    // penting: cache root as fallback
  '/index.html',
  '/manifest.json',
  // tambahkan file statis lokalmu di sini (css, js, icon) bila ada:
  // '/styles.css',
  // '/app.js',
  // '/apple-touch-icon.png'
];

// daftar asset eksternal yang ingin dicoba cache (HATI-HATI: bisa gagal kalau provider tidak mengizinkan CORS)
const EXTERNAL_URLS = [
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap'
];

self.addEventListener('install', (event) => {
  // segera aktifkan SW baru
  self.skipWaiting();

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // cache internal assets reliably
      await cache.addAll(PRECACHE_URLS);

      // try to cache external resources but don't fail install if they are blocked by CORS
      await Promise.all(EXTERNAL_URLS.map(async (url) => {
        try {
          // use fetch with mode no-cors as fallback (note: response opaque - you can cache it but can't read)
          const resp = await fetch(url, { mode: 'no-cors' });
          // Put in cache if fetch succeeded (may be opaque)
          await cache.put(url, resp);
        } catch (err) {
          // ignore external asset caching errors to avoid breaking install
          console.warn('External asset cache failed', url, err);
        }
      }));
    })()
  );
});

self.addEventListener('activate', (event) => {
  // Ambil kendali klien secepatnya
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Navigation requests (HTML) -> network-first with cache fallback
  if (req.mode === 'navigate' || (req.method === 'GET' && req.headers.get('accept') && req.headers.get('accept').includes('text/html'))) {
    event.respondWith((async () => {
      try {
        const networkResponse = await fetch(req);
        // update cache for fallback
        const cache = await caches.open(CACHE_NAME);
        cache.put(FALLBACK_HTML, networkResponse.clone().catch(()=>{}));
        return networkResponse;
      } catch (err) {
        // network failed -> return cached fallback HTML
        const cached = await caches.match(FALLBACK_HTML);
        return cached || new Response('<h1>Offline</h1><p>Konten tidak tersedia.</p>', { headers: { 'Content-Type': 'text/html' } });
      }
    })());
    return;
  }

  // For static resources (css, js, images) -> cache-first, then network & update cache
  if (req.method === 'GET' && (req.destination === 'style' || req.destination === 'script' || req.destination === 'image' || req.destination === 'font')) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      try {
        const response = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        // cache a clone (best-effort)
        cache.put(req, response.clone().catch(()=>{}));
        return response;
      } catch (err) {
        // try to serve something from cache
        return caches.match(req) || Response.error();
      }
    })());
    return;
  }

  // For other requests, try network first then cache
  event.respondWith((async () => {
    try {
      return await fetch(req);
    } catch (err) {
      return await caches.match(req);
    }
  })());
});
