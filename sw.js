const CACHE = "live-qr-v1";

self.addEventListener("install", e => {
    e.waitUntil(
        caches.open(CACHE).then(c =>
            c.addAll([
                "/",
                "/index.html",
                "/css/style.css",
                "/js/app.js",
                "/js/pwa.js",
                "/manifest.json"
            ])
        )
    );
    self.skipWaiting();
});

self.addEventListener("fetch", e => {
    e.respondWith(
        fetch(e.request).catch(() => caches.match(e.request))
    );
});
