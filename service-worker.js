const CACHE_NAME = 'webcam-pwa-v1';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './assets/icon.png',
    './CSS/index.css',
    './CSS/img/logo-dark.png',
    './CSS/svg/camera.svg',
    './script_js/index.js',
    './script_js/animations.js',
    './script_js/animations-simple.js',
    './script_js/video-config.js',
    './script_js/mp4-recorder.js',
    './script_js/simple-mp4-recorder.js',
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ASSETS);
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
