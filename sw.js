/* spacelibre VI — service worker.
   Keeps the whole site in a cache and serves it from there ("use the cache when
   there is one"), revalidating in the background so new releases still arrive.
   The cache name carries the release version, so a new release installs a new
   worker, repopulates the cache and drops the old one. */
const CACHE = 'spacelibre-vi-v1.5.32';
const PRECACHE = [
  './',
  'styles.css',
  'app.js',
  'i18n.js',
  'i18n-data.js',
  'svg-sources.js',
  'icons/favicon.svg',
  'icons/favicon-32.png',
  'icons/apple-touch-icon.png',
  'site.webmanifest'
];

// Cache entries are keyed by path only, so the versioned files the page asks for
// (e.g. styles.css?v=1.5.19) hit the same entry as the precached copy.
function cacheKey(url) {
  const parsed = new URL(url, self.location.href);
  parsed.search = '';
  return parsed.href;
}

function isCacheable(response) {
  return !!response && response.ok && response.type !== 'opaque' && response.type !== 'opaqueredirect';
}

async function put(cache, key, response) {
  if (isCacheable(response)) { try { await cache.put(key, response); } catch (error) {} }
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(PRECACHE.map(async (path) => {
      // cache: 'reload' bypasses the HTTP cache so a new release is fetched fresh.
      try { await put(cache, cacheKey(path), await fetch(path, { cache: 'reload' })); } catch (error) {}
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name !== CACHE).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(respond(request));
});

async function respond(request) {
  const cache = await caches.open(CACHE);
  const key = cacheKey(request.url);
  const cached = await cache.match(key);
  const path = new URL(request.url).pathname;
  // A corrected film and its scene/markup must arrive together; a cached
  // former release must not keep showing an older interpretation of the logo.
  if (path.includes('/08-motion/') || path.endsWith('/spacelibre-motion-source.zip')) {
    try {
      const response = await fetch(request, { cache: 'no-cache' });
      if (!response.ok) { if (cached) return cached; return response; }
      if (!request.headers?.has('range')) await put(cache, key, response.clone());
      return response;
    } catch (error) { if (cached) return cached; throw error; }
  }
  const network = fetch(request).then((response) => { put(cache, key, response.clone()); return response; });
  if (cached) { network.catch(() => {}); return cached; }
  try { return await network; } catch (error) {
    const shell = await cache.match(cacheKey('./'));
    if (shell) return shell;
    throw error;
  }
}
