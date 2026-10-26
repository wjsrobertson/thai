// Service worker: lets the app install to the home screen and work offline.
// See docs/implementation-notes.md → Offline & install.
//
// - App files (SHELL: page, code, styles, decks, audio manifest, icons) are cache-first, so the
//   app opens instantly whatever the connection. Each launch also checks the server for a new
//   version in the background (refreshShell). Once a new version has stayed put for a minute,
//   the whole set is swapped in together, so a page never mixes files from two versions. Open
//   pages are told (they show a "New version ready" bar) only if the code or looks changed;
//   new cards and stories just arrive at the next launch.
// - Audio clips (data/audio/*.mp3) are served from the saved-clip store (audio-store.js,
//   IndexedDB) when they're there, else fetched and saved. Their names are content hashes, so a
//   saved clip never goes stale. Settings → App → "Download all audio" fetches the rest. They used
//   to live in Cache Storage, which made iPhone launches crawl (see audio-store.js).
// - Anything else on the site is network-first, falling back to the cache.

importScripts('audio-store.js'); // self.ClipStore

const SHELL_CACHE = 'learnthai-shell-v22';  // bump if SHELL changes, so stale entries are dropped
const OLD_AUDIO_CACHE = 'learnthai-audio'; // where clips were kept until 2026-10-07: deleted on activate
const NETWORK_TIMEOUT_MS = 4000;
// Paths relative to the service worker's scope ('' is the app's root URL).
const SHELL = [
  '', 'index.html', 'app.js', 'spell.js', 'tones.js', 'typing.js', 'time.js', 'styles.css', 'mobile.css', 'app.webmanifest',
  'data/decks.json', 'data/audio/manifest.json', 'data/audio/timings.json', 'audio-store.js',
  'data/write-model.bin', // From memory's handwriting model (app.js writeModel)
  'fonts/NotoLoopedThai-Regular.woff2', 'fonts/NotoLoopedThai-Bold.woff2',
  'fonts/NotoSansThai-Regular.woff2', 'fonts/NotoSansThai-Bold.woff2',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png',
  // The Alphabet's letter pictures (app.js LETTER_PICS): add each new one here too.
  ...[
    'chicken', 'egg', 'bottle', 'buffalo', 'person', 'bell', 'snake', 'plate', 'cymbals',
    'elephant', 'chain', 'tree', 'woman', 'headdress', 'ox-goad', 'pedestal', 'montho', 'old-man',
    'novice-monk', 'child', 'turtle', 'bag', 'soldier', 'flag', 'mouse', 'leaf', 'fish', 'bee',
    'lid', 'tray', 'tooth', 'junk', 'horse', 'giant', 'boat', 'monkey', 'ring', 'pavilion',
    'hermit', 'tiger', 'chest', 'kite', 'basin', 'owl'
  ].map((n) => `images/letters/${n}.svg`),
];
const shellUrl = (path) => new URL(path, self.registration.scope).href;

// Set on install when an older worker is being replaced: a new sw.js is a code change, so open
// pages are told once this one has taken over.
let replacing = false;

self.addEventListener('install', (event) => {
  replacing = !!self.registration.active;
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    await cache.addAll(SHELL.map((path) => new Request(shellUrl(path), { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if ((key.startsWith('learnthai-shell-') && key !== SHELL_CACHE) || key === OLD_AUDIO_CACHE) await caches.delete(key);
    }
    await self.clients.claim();
    if (replacing) await tellPages();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (/\/data\/audio\/[^/]+\.mp3$/.test(url.pathname)) {
    event.respondWith(audio(req));
  } else if (SHELL.some((path) => shellUrl(path) === url.origin + url.pathname)) {
    event.respondWith(cacheFirst(req));
    if (req.mode === 'navigate') event.waitUntil(refreshShell());
  } else {
    event.respondWith(networkFirst(req));
  }
});

async function cacheFirst(req) {
  const cache = await caches.open(SHELL_CACHE);
  const cached = await cache.match(req, { ignoreSearch: true });
  if (cached) return cached;
  const res = await fetch(req);
  if (res.ok) await cache.put(req, res.clone());
  return res;
}

// What identifies a file's version: GitHub Pages sends an ETag, simpler servers a Last-Modified.
const versionOf = (res) => res.headers.get('etag') || res.headers.get('last-modified') || res.headers.get('content-length');

// A new version is stored only once the site has looked the same for this long. GitHub Pages takes
// about 30 s to publish, and a check in the middle could see some files new and some old.
const SETTLE_MS = 60 * 1000;
const LOOKS = 5;  // then give up until the next launch (pushes can come every few minutes)
// Not a file on the site: what the first look at a new version saw, and when, kept in the shell
// cache so a worker stopped mid-wait (an iPhone does that) carries on from it at the next launch.
const PENDING = 'update-pending';

// Once per launch: revalidate the whole shell (mostly cheap 304s). A deploy restamps every file,
// so the stamps say only that something was published; once it has settled, store the new set and
// tell open pages if anything but data/ changed (the user's call, 2026-10-26: the bar came after
// every push of cards). Offline, or a missing file, keeps the current version.
let refreshing = null;
function refreshShell() {
  refreshing ||= (async () => {
    try {
      for (let look = 1; ; look++) {
        if (!(await caches.has(SHELL_CACHE))) return;  // a newer worker has replaced this one
        const cache = await caches.open(SHELL_CACHE);
        const fresh = await Promise.all(SHELL.map(async (path) => {
          const url = shellUrl(path);
          const res = await fetch(url, { cache: 'no-cache' });
          if (!res.ok) throw new Error(`${res.status} ${url}`);
          return { path, url, res, old: await cache.match(url) };
        }));
        if (fresh.every((f) => f.old && versionOf(f.old) === versionOf(f.res))) {
          await cache.delete(shellUrl(PENDING));
          return;
        }
        const versions = fresh.map((f) => versionOf(f.res)).join('\n');
        let pending = await cache.match(shellUrl(PENDING)).then((r) => r?.json()).catch(() => null);
        if (pending?.versions === versions && Date.now() - pending.since >= SETTLE_MS) {
          await store(cache, fresh);
          return;
        }
        for (const f of fresh) f.res.body?.cancel().catch(() => {});  // the next look downloads them
        if (pending?.versions !== versions) {
          pending = { versions, since: Date.now() };
          await cache.put(shellUrl(PENDING), new Response(JSON.stringify(pending)));
        }
        if (look === LOOKS) return;
        await new Promise((resolve) => setTimeout(resolve, pending.since + SETTLE_MS - Date.now()));
      }
    } catch {
      // keep the current version
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

// Stores a settled new version, and tells open pages if any file outside data/ has new bytes.
async function store(cache, fresh) {
  let code = false;
  for (const f of fresh) {
    if (code || f.path.startsWith('data/') || (f.old && versionOf(f.old) === versionOf(f.res))) continue;
    code = !f.old || !sameBytes(await f.old.arrayBuffer(), await f.res.clone().arrayBuffer());
  }
  await Promise.all(fresh.map((f) => cache.put(f.url, f.res)));
  await cache.delete(shellUrl(PENDING));
  if (code) await tellPages();
}

function sameBytes(a, b) {
  if (a.byteLength !== b.byteLength) return false;
  const x = new Uint8Array(a);
  const y = new Uint8Array(b);
  for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return false;
  return true;
}

async function tellPages() {
  for (const client of await self.clients.matchAll({ type: 'window' })) client.postMessage({ type: 'update-ready' });
}

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
  const file = new URL(req.url).pathname.split('/').pop();
  let buf = await ClipStore.get(file).catch(() => null);
  if (!buf) {
    const res = await fetch(req.url);  // the whole file, even if the player asked for a byte range
    if (!res.ok) return res;
    buf = await res.arrayBuffer();
    await ClipStore.put(file, buf).catch(() => {}); // saved for next time, and offline
  }
  const range = req.headers.get('range');
  if (range) return rangeResponse(buf, range);
  return new Response(buf, {
    headers: { 'Content-Type': 'audio/mpeg', 'Content-Length': String(buf.byteLength), 'Accept-Ranges': 'bytes' },
  });
}

// Safari's <audio> requests byte ranges and won't play a plain 200 in reply.
function rangeResponse(buf, header) {
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
