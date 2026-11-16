// Service Worker for RSG Mobile Mechanics
// Network-first for HTML/JS/CSS so portal login and deploys are never stuck on stale files.

const CACHE_NAME = 'rsg-mobile-mechanics-v4';
const urlsToCache = [
  '/images/rsg-logo.jpg',
  '/images/reiner-with-van.jpg'
];

self.addEventListener('install', function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (name) { return name !== CACHE_NAME; })
          .map(function (name) { return caches.delete(name); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

function isNetworkFirst(request) {
  if (request.mode === 'navigate') return true;
  const accept = request.headers.get('accept') || '';
  if (accept.includes('text/html')) return true;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;
  // Never cache-first portal or site scripts/styles
  if (/\.(?:js|css)(?:$|\?)/i.test(url.pathname)) return true;
  if (/^\/portal/i.test(url.pathname)) return true;
  return false;
}

self.addEventListener('fetch', function (event) {
  const request = event.request;
  if (request.method !== 'GET') return;

  if (isNetworkFirst(request)) {
    event.respondWith(
      fetch(request)
        .then(function (response) {
          return response;
        })
        .catch(function () {
          return caches.match(request);
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(function (cached) {
      if (cached) return cached;
      return fetch(request).then(function (response) {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const copy = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(request, copy);
        });
        return response;
      });
    })
  );
});
