// 閲覧ページをオフラインでも開けるようにするための仕組み（Service Worker）。
// ネットにつながっていれば常に最新版を取得し（更新がすぐ反映される）、
// つながらないとき・応答が遅いときだけ保存済みの版を使う。
const CACHE = 'jobcalendar-viewer-v5';
const ASSETS = ['viewer.html', 'common.js', 'i18n.js', 'share.js', 'vendor/qrcode.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];
const TIMEOUT_MS = 3000;

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS.map(a => new Request(a, { cache: 'no-cache' }))))
      .then(() => self.skipWaiting())
  );
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
  if (!ASSETS.includes(path)) return;   // 作成ページなど他のファイルには関与しない

  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // ブラウザの一時キャッシュを通さず、サーバーに更新有無を確認して取得
    const network = fetch(e.request.url, { cache: 'no-cache' })
      .then(res => { if (res.ok) cache.put(path, res.clone()); return res; });
    const timeout = new Promise(resolve => setTimeout(resolve, TIMEOUT_MS, null));
    try {
      const res = await Promise.race([network, timeout]);
      if (res && res.ok) return res;
    } catch (err) { /* オフライン */ }
    const cached = await cache.match(path);
    if (cached) return cached;
    return network.catch(() => Response.error());
  })());
});
