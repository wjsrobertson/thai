// Saved audio clips, in IndexedDB. Shared by sw.js (importScripts) and the page (a <script> before
// app.js), so both use the same store.
//
// Not Cache Storage: Safari reads through all of a site's cache storage when the app starts, and
// with 16,000 clips saved that made every launch take 14 s on an iPhone (0.04 s with them deleted;
// 2026-10-07). IndexedDB finds a clip by its key without reading the rest.
//
// Database 'learnthai-clips', store 'clips': file name (e.g. 'e70e2639e25f74eb.mp3') -> the MP3's
// bytes (an ArrayBuffer). Every call returns a promise.
self.ClipStore = (() => {
  let connection = null;
  const open = () => (connection ||= new Promise((resolve, reject) => {
    const req = indexedDB.open('learnthai-clips', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('clips');
    req.onsuccess = () => {
      const db = req.result;
      db.onversionchange = () => { db.close(); connection = null; };
      db.onclose = () => { connection = null; };
      resolve(db);
    };
    req.onerror = () => { connection = null; reject(req.error); };
  }));

  // One transaction: `fn` gets the store and may return a request, whose result the promise gives
  // once the transaction has committed.
  async function run(mode, fn) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('clips', mode);
      const req = fn(tx.objectStore('clips'));
      tx.oncomplete = () => resolve(req ? req.result : undefined);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  return {
    get: (file) => run('readonly', (store) => store.get(file)),
    put: (file, bytes) => run('readwrite', (store) => { store.put(bytes, file); }),
    keys: () => run('readonly', (store) => store.getAllKeys()),
    delete: (files) => run('readwrite', (store) => { for (const f of files) store.delete(f); }),
    clear: () => run('readwrite', (store) => { store.clear(); }),
  };
})();
