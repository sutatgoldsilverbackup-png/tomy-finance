// Service Worker: ทำให้ติดตั้งเป็นแอปได้ และเปิดหน้าแอปได้แม้เน็ตไม่ดี
// หลักการ: ลองโหลดจากเน็ตก่อนเสมอ (ได้เวอร์ชันใหม่ทันที) ถ้าเน็ตล่มค่อยใช้ของที่เก็บไว้
const CACHE_NAME = 'finance-shell-v1';
const SHELL_FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  // ลบแคชเวอร์ชันเก่า
  event.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  // เก็บแคชเฉพาะไฟล์หน้าเว็บของเราเอง ไม่ยุ่งกับข้อมูลจาก Apps Script
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      return res;
    }).catch(() => caches.match(req).then(hit => hit || caches.match('./index.html')))
  );
});
