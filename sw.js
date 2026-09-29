// 閲覧ページをオフラインでも開けるようにするための仕組み（Service Worker）。
// 表示中はキャッシュを使い、裏で最新版を取りに行く（次回起動時に反映）。
const CACHE = 'jobcalendar-viewer-v2';
const ASSETS = ['viewer.html', 'i18n.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  const path = url.pathname.slice(new URL(self.registration.scope).pathname.length);
  if (!ASSETS.includes(path)) return;   // 作成ツールなど他のファイルには関与しない

  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(path);
      const update = fetch(e.request)
        .then(res => { if (res.ok) cache.put(path, res.clone()); return res; })
        .catch(() => null);
      return cached || (await update) || Response.error();
    })
  );
});
