// ==========================================================================
// EmeraldQuest — Service Worker (offline caching)
// ==========================================================================

const CACHE_NAME = 'emeraldquest-v6';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg',
  './css/variables.css',
  './css/base.css',
  './css/animations.css',
  './css/components.css',
  './css/screens.css',
  './css/responsive.css',
  './js/config.js',
  './js/data.js',
  './js/state.js',
  './js/auth.js',
  './js/router.js',
  './js/effects.js',
  './js/emeralds.js',
  './js/api.js',
  './js/chat.js',
  './js/characters.js',
  './js/pets.js',
  './js/shop.js',
  './js/quests.js',
  './js/battle.js',
  './js/app.js'
];

// Install — cache all assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — cache-first, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET and API calls
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.hostname === 'api.anthropic.com' || url.hostname === 'api.github.com') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // Cache successful same-origin responses
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() => {
      // Offline fallback for navigation
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});
