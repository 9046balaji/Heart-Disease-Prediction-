// Service Worker for offline functionality
const CACHE_NAME = 'heartguard-v1';
const ASSETS_CACHE_NAME = 'heartguard-assets-v1';

// URLs to cache for offline use
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  // Add other critical URLs here
];

// Asset URLs to cache (images, CSS, JS, etc.)
const assetsToCache = [
  // Add asset URLs here
  // Example: '/assets/images/logo.png',
  // Example: '/assets/css/main.css',
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME)
        .then((cache) => {
          console.log('Opened cache for critical resources');
          return cache.addAll(urlsToCache);
        }),
      caches.open(ASSETS_CACHE_NAME)
        .then((cache) => {
          console.log('Opened cache for assets');
          return cache.addAll(assetsToCache);
        })
    ])
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if found
        if (response) {
          return response;
        }

        // Clone the request because it's a stream and can only be consumed once
        const fetchRequest = event.request.clone();

        // Fetch from network
        return fetch(fetchRequest).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response because it's a stream and can only be consumed once
          const responseToCache = response.clone();

          // Cache the response for future use
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, ASSETS_CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});