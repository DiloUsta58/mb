/* ===== Service Worker ===== */

const CACHE_NAME = "inventur-baffle-v1";
const BASE_PATH = "/mb/";   // deine App liegt im Ordner /mb/

const ASSETS = [
  BASE_PATH,
  BASE_PATH + "index.html",
  BASE_PATH + "css/style.css",
  BASE_PATH + "js/app.js",
  BASE_PATH + "manifest.json",

  BASE_PATH + "icons/icon_16.png",
  BASE_PATH + "icons/icon_32.png",
  BASE_PATH + "icons/icon_48.png",
  BASE_PATH + "icons/icon_64.png",
  BASE_PATH + "icons/icon_128.png",
  BASE_PATH + "icons/icon_256.png"
];

/* INSTALL */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

/* ACTIVATE */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    })
  );
});

/* FETCH */
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
