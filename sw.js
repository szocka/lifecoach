// LifeCoach Service Worker
const CACHE = 'lifecoach-v1';
const ASSETS = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

// Install: cache all assets
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: serve from cache, fallback to network
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => caches.match('./index.html')))
  );
});

// Notification click: focus app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cls => {
    if (cls.length > 0) return cls[0].focus();
    return clients.openWindow('./');
  }));
});

// Receive message from main thread to show notification
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(e.data.title, {
      body: e.data.body,
      icon: './icon-192.png',
      badge: './icon-192.png',
      tag: e.data.tag || 'lifecoach',
      renotify: true,
      vibrate: [200, 100, 200]
    });
  }
});
