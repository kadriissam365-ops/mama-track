const CACHE_VERSION = 'v2';
const STATIC_CACHE = `mamatrack-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `mamatrack-dynamic-${CACHE_VERSION}`;

// Au install : pre-cache les assets critiques
const PRECACHE_URLS = [
  '/',
  '/tracking',
  '/agenda',
  '/manifest.json',
  '/icons/icon-192x192.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Au activate : nettoyer les vieux caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== STATIC_CACHE && k !== DYNAMIC_CACHE)
            .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Stratégie fetch différenciée
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API Supabase : network only (jamais cacher les données)
  if (url.hostname.includes('supabase.co')) {
    return; // laisser passer sans cache
  }

  // Navigation HTML : network first, fallback cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then(r => r || caches.match('/')))
    );
    return;
  }

  // JS/CSS chunks Next.js : cache first (content-addressable)
  if (url.pathname.includes('/_next/static/')) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          caches.open(STATIC_CACHE).then(cache => cache.put(request, response.clone()));
          return response;
        });
      })
    );
    return;
  }

  // Reste : network first avec fallback cache
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, response.clone()));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
