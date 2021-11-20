const CACHE_NAME = 'budget-tracker'
const DATA_CACHE_NAME = "budget-tacker-v2"


const FILES_TO_CACHE = [
    '/index.html',
    '/css/styles.css',
    '/js/idb.js',
    '/js/index.js',
    '/manifest.json',
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-144x144.png',
    '/icons/icon-152x152.png',
    '/icons/icon-192x192.png',
    '/icons/icon-384x384.png',
    '/icons/icon-512x512.png'
];

self.addEventListener('install', function (evt) {
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('files successfully pre-cached')
            return cache.addAll(FILES_TO_CACHE)
        })
    )
});

self.addEventListener('activate', function (evt) {
    evt.waitUntil(
        caches.keys().then(keyList => {
          return Promise.all(
              keyList.map(key => {
                  if (key != CACHE_NAME && key !== DATA_CACHE_NAME) {
                      console.log('removed old cache data', key);
                      return caches.delete(key);
                  }
              })
          )
        })
    );
    //self.ClientReactList.claim();
});

self.addEventListener('fetch', function (evt) {
    if (evt.request.url.includes('/api/')) {
        evt.respondWith(
            caches
                .open(DATA_CACHE_NAME)
                .then(cache => {
                    return fetch(evt.request)
                        .then(response => {
                            // If the response was good, clone it and store it in the cache.
                            if (response.status === 200) {
                                cache.put(evt.request.url, response.clone());
                            }

                            return response;
                        })
                        .catch(err => {
                            // Network request failed, try to get it from the cache.
                            return cache.match(evt.request);
                        });
                })
                .catch(err => console.log(err))
        );

        return;
    }

    evt.respondWith(
        fetch(evt.request).catch(function () {
            return caches.match(evt.request).then(function (response) {
                if (response) {
                    return response;
                } else if (evt.request.headers.get('accept').includes('text/html')) {
                    // return the cached home page for all requests for html pages
                    return caches.match('/');
                }
            });
        })
    );

});