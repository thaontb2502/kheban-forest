const CACHE_NAME = 'kheban-forest-v101';

const APP_ASSETS = [
  './',
  './index.html',
  './app.js',
  './styles.css',
  './gallery.json',
  './manifest.webmanifest',
  './forest_blocks.geojson',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
];

const REMOTE_ASSETS = [
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css',
  'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_ASSETS);
    await Promise.allSettled(
      REMOTE_ASSETS.map(async (url) => {
        const request = new Request(url, { mode: 'no-cors' });
        const response = await fetch(request);
        await cache.put(request, response);
      }),
    );
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  if (url.origin === self.location.origin) {
    if (
      url.pathname === '/' ||
      url.pathname === '/index.html' ||
      url.pathname === '/app.js' ||
      url.pathname === '/styles.css' ||
      url.pathname === '/gallery.json' ||
      url.pathname === '/manifest.webmanifest' ||
      url.pathname === '/forest_blocks.geojson' ||
      url.pathname === '/icon-192.png' ||
      url.pathname === '/icon-512.png' ||
      url.pathname === '/apple-touch-icon.png'
    ) {
      event.respondWith(cacheFirst(request));
      return;
    }
    if (url.pathname.startsWith('/images/')) {
      event.respondWith(cacheFirst(request));
      return;
    }
  }

  if (isTileRequest(url)) {
    event.respondWith(cacheFirst(request));
  }
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }
  const response = await fetch(request);
  if (response && (response.ok || response.type === 'opaque')) {
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response && (response.ok || response.type === 'opaque')) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    return cache.match('./index.html');
  }
}

function isTileRequest(url) {
  if (url.origin === 'https://server.arcgisonline.com' && url.pathname.includes('/MapServer/tile/')) {
    return true;
  }
  if (url.origin === 'https://mt1.google.com' && url.pathname.startsWith('/vt/')) {
    return true;
  }
  if (url.origin === 'https://tile.openstreetmap.org' && /^\/\d+\/\d+\/\d+\.(png|jpg|jpeg|webp)$/.test(url.pathname)) {
    return true;
  }
  if (url.origin === 'https://gibs.earthdata.nasa.gov' && url.pathname.includes('/GoogleMapsCompatible_Level9/')) {
    return true;
  }
  return false;
}
