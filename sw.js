/* Cache public same-origin app assets only. Never store Auth, API or personal data. */
const CACHE = 'yarikuri-cloud-static-v7';
const ASSETS = ['./', './index.html', './yarikuri.css', './cloud.js', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
const ALLOWED = new Set(ASSETS.map(path => new URL(path, self.registration.scope).pathname));
self.addEventListener('message', event => {
  if(event.data?.type==='YARIKURI_CACHE_POLICY') event.ports[0]?.postMessage(CACHE);
});
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('yarikuri-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request=event.request, url=new URL(request.url);
  if (request.method!=='GET' || url.origin!==self.location.origin || !ALLOWED.has(url.pathname) || url.search || request.headers.has('authorization')) return;
  event.respondWith(fetch(request, request.mode==='navigate'?{cache:'no-cache'}:{}).then(response => {
    if(response.ok && response.type==='basic') { const copy=response.clone(); event.waitUntil(caches.open(CACHE).then(cache=>cache.put(request,copy))); }
    return response;
  }).catch(()=>caches.match(request)));
});
