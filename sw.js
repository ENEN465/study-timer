const CACHE_NAME = 'study-timer-v1';
const ASSETS = [
  'index.html',
  'style.css',
  'script.js',
  'manifest.json',
  'https://cdn-icons-png.flaticon.com/512/3125/3125848.png'
];

// 설치 시 리소스 캐싱
self.addEventListener('install', (e) => {
  self.skipWaiting(); // 새로운 서비스 워커가 즉시 활성화되도록 함
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // 주소가 틀려도 전체가 실패하지 않도록 하나씩 추가하는 방식 권장
      return Promise.all(
        ASSETS.map(asset => cache.add(asset).catch(err => console.log(`캐싱 실패: ${asset}`, err)))
      );
    })
  );
});
// 네트워크 요청 시 캐시 우선 응답
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
