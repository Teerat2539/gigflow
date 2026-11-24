/* GigFlow service worker — ให้ติดตั้งเป็นแอปได้ และเปิดใช้งานได้แม้ออฟไลน์
   - หน้าแอป (index.html): โหลดจากเน็ตก่อน → ได้เวอร์ชันล่าสุดเสมอ, ถ้าออฟไลน์ใช้สำเนาในเครื่อง
   - ไลบรารี/ฟอนต์/ไอคอน: ใช้สำเนาในเครื่องทันที แล้วอัปเดตเบื้องหลัง
   - ไม่แตะคำขอล็อกอินและข้อมูล (Google Sign-In, Google Drive, Routes API) */
const CACHE = 'gigflow-cache-v2';
const CORE = ['./', './index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];
const CACHEABLE_HOSTS = ['unpkg.com', 'cdn.tailwindcss.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  if (sameOrigin && url.pathname.startsWith('/__/')) return;                 // ไฟล์ระบบของ Firebase Hosting

  // หน้าแอป: network-first
  if (req.mode === 'navigate' || (sameOrigin && (url.pathname.endsWith('/') || url.pathname.endsWith('.html')))) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok && req.cache !== 'no-store') { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req.mode === 'navigate' ? './index.html' : req, copy)); }
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
    return;
  }

  // ไฟล์ของแอป + ไลบรารีจาก CDN: stale-while-revalidate
  if (sameOrigin || CACHEABLE_HOSTS.includes(url.hostname)) {
    e.respondWith(
      caches.open(CACHE).then((c) =>
        c.match(req).then((hit) => {
          const net = fetch(req).then((res) => { if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; }).catch(() => hit);
          return hit || net;
        })
      )
    );
  }
});
