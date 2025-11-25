// public/sw.js
const CACHE_NAME = 'cuaca-app-v2';
const FALLBACK_HTML = '/';
const PRECACHE = ['/', '/index.html', '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', evt => {
  self.skipWaiting();
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE).catch(()=>{/*ignore add failures*/}))
  );
});

self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', evt => {
  const req = evt.request;

  // Navigation (HTML) -> network-first
  if (req.mode === 'navigate' || (req.method === 'GET' && req.headers.get('accept')?.includes('text/html'))) {
    evt.respondWith((async () => {
      try {
        const res = await fetch(req);
        caches.open(CACHE_NAME).then(cache => cache.put(FALLBACK_HTML, res.clone()).catch(()=>{}));
        return res;
      } catch {
        const cached = await caches.match(FALLBACK_HTML);
        return cached || new Response('<h1>Offline</h1>', { headers: { 'Content-Type': 'text/html' } });
      }
    })());
    return;
  }

  // Static assets -> cache-first
  if (['style','script','image','font'].includes(req.destination)) {
    evt.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;
        return fetch(req).then(res => { 
          caches.open(CACHE_NAME).then(c => c.put(req, res.clone()).catch(()=>{}));
          return res;
        }).catch(()=>caches.match(req));
      })
    );
    return;
  }

  // Others -> try network then cache
  evt.respondWith(fetch(req).catch(()=>caches.match(req)));
});
