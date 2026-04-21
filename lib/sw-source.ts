// Service worker source served by app/sw.js/route.ts
// Keep this file in sync — do NOT reference public/sw.js (deleted to bypass Vercel edge cache).
export const SW_SOURCE = `const CACHE_VERSION = 'v8';
const STATIC_CACHE = \`mamatrack-static-\${CACHE_VERSION}\`;
const DYNAMIC_CACHE = \`mamatrack-dynamic-\${CACHE_VERSION}\`;

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

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;
  if (url.pathname === '/sw.js' || url.pathname === '/service-worker.js') return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, clone)).catch(() => {});
          return response;
        })
        .catch(() => caches.match(request).then(r => r || caches.match('/')))
    );
    return;
  }

  if (url.pathname.includes('/_next/static/')) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then(cache => cache.put(request, clone)).catch(() => {});
          return response;
        });
      })
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, clone)).catch(() => {});
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'MamaTrack';

  const defaultActions = {
    'daily-tip':          [{ action: 'open', title: 'Lire' }, { action: 'dismiss', title: 'OK' }],
    'hydration-reminder': [{ action: 'log-water', title: "J'ai bu" }, { action: 'dismiss', title: 'Plus tard' }],
    'kick-reminder':      [{ action: 'start-count', title: 'Commencer' }, { action: 'dismiss', title: 'Deja fait' }],
    'weekly-milestone':   [{ action: 'open', title: 'Decouvrir' }],
  };

  const tag = data.tag || 'mamatrack-push';
  const actions = data.actions || defaultActions[tag] || [];

  const options = {
    body: data.body || '',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: tag,
    data: { url: data.url || '/', tag: tag },
    vibrate: [100, 50, 100],
    actions: actions,
    requireInteraction: ['appointment', 'kick-reminder'].some(function(t) { return tag.includes(t); }),
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'hydration-reminder') {
    event.waitUntil(
      (async () => {
        const hour = new Date().getHours();
        if (hour >= 8 && hour < 22) {
          await self.registration.showNotification('Hydratation !', {
            body: "N'oubliez pas de boire de l'eau. Votre corps et bebe en ont besoin !",
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            tag: 'water-reminder',
            data: { url: '/tracking' },
          });
        }
      })()
    );
  }

  if (event.tag === 'medication-morning') {
    event.waitUntil(
      self.registration.showNotification('Medicaments du matin', {
        body: "N'oubliez pas de prendre vos vitamines/medicaments du matin !",
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'medication-morning',
        data: { url: '/tracking' },
      })
    );
  }

  if (event.tag === 'medication-evening') {
    event.waitUntil(
      self.registration.showNotification('Medicaments du soir', {
        body: "N'oubliez pas de prendre vos vitamines/medicaments du soir !",
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'medication-evening',
        data: { url: '/tracking' },
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  var action = event.action;
  var data = event.notification.data || {};
  var tag = data.tag || '';
  var url = data.url || '/';

  if (action === 'dismiss') return;

  if (action === 'log-water') {
    url = '/tracking?action=log-water';
  } else if (action === 'start-count') {
    url = '/tracking?action=kick-count';
  } else if (tag.includes('appointment')) {
    url = '/agenda';
  } else if (tag === 'daily-tip' || tag === 'weekly-milestone') {
    url = '/';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
`;
