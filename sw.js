const CACHE_NAME = 'fire-store-v2';

// 1. Kurulum aşaması: Dosyaları önbelleğe al
self.addEventListener('install', e => {
  self.skipWaiting(); // Yeni Service Worker'ın hemen devreye girmesini sağlar
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(['./', './index.html']))
  );
});

// 2. Aktivasyon aşaması: Eski önbellekleri (v1) temizle
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache); // Eski cache'i sil
          }
        })
      );
    })
  );
});

// 3. İstekleri yakalama: Önce İnternet, sonra Önbellek (Network First)
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // İnternet var ve yeni sayfa çekildiyse, önbelleği de yenisiyle güncelle
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, resClone));
        return res;
      })
      .catch(() => {
        // İnternet yoksa (offline) önbellekteki versiyonu göster
        return caches.match(e.request);
      })
  );
});
