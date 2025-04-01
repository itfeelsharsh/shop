/* 
 * KamiKoto Shop Service Worker - No Cache Version
 * This service worker is minimal and does not use any caching
 */

// Use this instead of direct self references to satisfy linter
// eslint-disable-next-line no-restricted-globals
const serviceWorkerSelf = self;

// Install event - no caching
serviceWorkerSelf.addEventListener('install', (event) => {
  console.log('Service Worker: Installing... (Caching Disabled)');
  // Skip waiting to activate immediately
  event.waitUntil(
    Promise.resolve().then(() => {
      return serviceWorkerSelf.skipWaiting();
    })
  );
});

// Activate event - actively clear any existing caches
serviceWorkerSelf.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating... (Caching Disabled)');
  
  // Remove all caches to ensure nothing is cached
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Service Worker: Removing cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('Service Worker: Activated - All caching is disabled');
      // Take control of all clients
      return serviceWorkerSelf.clients.claim();
    })
  );
});

// Fetch event - always use network, never cache
serviceWorkerSelf.addEventListener('fetch', (event) => {
  // Only handle navigation requests to provide minimal PWA functionality
  if (event.request.mode === 'navigate' && event.request.method === 'GET') {
    event.respondWith(
      fetch(event.request).catch(() => {
        console.log('Service Worker: Network fetch failed, no cache available');
        // Minimal fallback without caching
        return fetch('/index.html');
      })
    );
  }
  // All other requests pass through directly to network
  // No response modification or caching
});

// Message event
serviceWorkerSelf.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker: Skip waiting requested by client');
    serviceWorkerSelf.skipWaiting();
  }
}); 