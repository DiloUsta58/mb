/* =====================================
   SERVICE WORKER – VERSIONED PWA CACHE
===================================== */

const CACHE_VERSION = "inventur-baffle-1.0.5"; // <- bei jedem Release ändern
const BASE_PATH = "/mb/";

const ASSETS = [
  BASE_PATH,
  BASE_PATH + "index.html",
  BASE_PATH + "style.css",
  BASE_PATH + "app.js",
  BASE_PATH + "manifest.json",

  BASE_PATH + "icons/icon_16.png",
  BASE_PATH + "icons/icon_32.png",
  BASE_PATH + "icons/icon_48.png",
  BASE_PATH + "icons/icon_64.png",
  BASE_PATH + "icons/icon_128.png",
  BASE_PATH + "icons/icon_256.png"
];

/* ================= INSTALL ================= */
self.addEventListener("install", event => {
  console.log("SW installiert");

  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(ASSETS))
  );
});

/* ================= ACTIVATE ================= */
self.addEventListener("activate", event => {
  console.log("SW aktiviert");

  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => key !== CACHE_VERSION && caches.delete(key))
      )
    )
  );
});

/* 👉 wartet auf Freigabe vom Frontend */
self.addEventListener("message", event => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

/* ================= FETCH ================= */
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});
