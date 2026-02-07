/* =====================================
   SERVICE WORKER – VERSIONED PWA CACHE
===================================== */

/* 👉 VERSION HIER BEI JEDEM RELEASE ÄNDERN */
const CACHE_VERSION = "inventur-baffle-1.1.2";

const BASE_PATH = "/mb/";

/* Alle Dateien die offline verfügbar sein sollen */
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

  /* 👉 Neuer SW aktiviert sich sofort */
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => {
        return cache.addAll(ASSETS);
      })
  );
});


/* ================= ACTIVATE ================= */
self.addEventListener("activate", event => {

  /* 👉 Alte Cache Versionen löschen */
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_VERSION) {
            return caches.delete(key);
          }
        })
      )
    )
  );

  /* 👉 übernimmt sofort alle offenen Tabs */
  self.clients.claim();
});


/* ================= FETCH ================= */
self.addEventListener("fetch", event => {

  event.respondWith(
    caches.match(event.request)
      .then(response => {

        /* Cache first → dann Netzwerk */
        return response || fetch(event.request);

      })
  );

});
