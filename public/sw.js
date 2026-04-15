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

// Push notification handler
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'MamaTrack';

  // Map tags to relevant action buttons when not provided by the payload
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

// Periodic sync for automatic reminders (hydration, medication)
// Only fires when the browser supports periodic background sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'hydration-reminder') {
    event.waitUntil(
      (async () => {
        const hour = new Date().getHours();
        // Only remind between 8am and 10pm
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

// Notification click handler — routes based on action and tag
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  var action = event.action; // e.g. 'open', 'log-water', 'start-count', 'dismiss'
  var data = event.notification.data || {};
  var tag = data.tag || '';
  var url = data.url || '/';

  // Handle specific actions
  if (action === 'dismiss') return; // just close the notification

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
