// Service worker: lets the app install to the home screen and work offline.
// See docs/implementation-notes.md → Offline & install.
//
// - App files (page, code, styles, decks, audio manifest, icons) are network-first, so a push to
//   GitHub Pages shows up on the next load. The cached copy is used offline, or after
//   NETWORK_TIMEOUT_MS on a bad connection.
// - Audio clips (data/audio/*.mp3) are cache-first. Their names are content hashes, so a cached
//   clip never goes stale. Each clip is cached the first time it's fetched, and Settings → App →
//   "Download all audio" fetches the rest (app.js uses the same AUDIO_CACHE).

const SHELL_CACHE = 'learnthai-shell-v1';  // bump if SHELL changes, so stale entries are dropped
const AUDIO_CACHE = 'learnthai-audio';
const NETWORK_TIMEOUT_MS = 4000;
const SHELL = [
  './', 'index.html', 'app.js', 'styles.css', 'mobile.css', 'app.webmanifest',
  'data/decks.json', 'data/audio/manifest.json',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    await cache.addAll(SHELL.map((url) => new Request(url, { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith('learnthai-shell-') && key !== SHELL_CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(/\/data\/audio\/[^/]+\.mp3$/.test(url.pathname) ? audio(req) : networkFirst(req));
});

async function networkFirst(req) {
  const cache = await caches.open(SHELL_CACHE);
  // 'no-cache' revalidates with the server (usually a cheap 304) instead of trusting the HTTP
  // cache, where GitHub Pages lets copies live for 10 minutes. By URL, because a navigation
  // request can't be re-issued with options.
  const network = fetch(req.url, { cache: 'no-cache' }).then(async (res) => {
    if (res.ok) await cache.put(req, res.clone());
    return res;
  });
  network.catch(() => {});  // a late failure after the timeout fallback isn't an error
  const timeout = new Promise((resolve) => setTimeout(resolve, NETWORK_TIMEOUT_MS));
  try {
    const res = await Promise.race([network, timeout]);
    if (res) return res;
  } catch {
    // offline: fall through to the cache
  }
  return (await cache.match(req, { ignoreSearch: true })) || network;
}

async function audio(req) {
  const cache = await caches.open(AUDIO_CACHE);
  let res = await cache.match(req.url);
  if (!res) {
    res = await fetch(req.url);  // the whole file, even if the player asked for a byte range
    if (!res.ok) return res;
    await cache.put(req.url, res.clone());
  }
  const range = req.headers.get('range');
  return range ? rangeResponse(res, range) : res;
}

// Safari's <audio> requests byte ranges and won't play a plain 200 in reply.
async function rangeResponse(res, header) {
  const buf = await res.arrayBuffer();
  const size = buf.byteLength;
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  let start = 0;
  let end = size - 1;
  if (m && m[1]) {
    start = Number(m[1]);
    if (m[2]) end = Math.min(Number(m[2]), size - 1);
  } else if (m && m[2]) {
    start = Math.max(0, size - Number(m[2]));  // "bytes=-N": the last N bytes
  }
  if (start >= size) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
  }
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Length': String(end - start + 1),
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
    },
  });
}
