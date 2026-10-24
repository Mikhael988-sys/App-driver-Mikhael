// Service worker de feuille_route.html : « réseau d'abord ».
// Gardés pour rouvrir la page sans réseau : la page elle-même (sans le jeton) et les fichiers de la carte (Leaflet).
// Les arrêts (données clients) ne passent jamais par ce cache : ils sont gardés par la page, effacés à l'expiration du lien.
const CACHE='feuille-route-v2';
const LEAFLET=/^https:\/\/unpkg\.com\/leaflet@1\.9\.4\/dist\/leaflet\.(js|css)$/;

self.addEventListener('install',e=>{self.skipWaiting();});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('feuille-route-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request, url=new URL(req.url);
  if(req.method!=='GET') return;
  const page=url.origin===location.origin&&/\/feuille_route\.html$/.test(url.pathname);
  const lib=LEAFLET.test(url.origin+url.pathname);
  if(!page&&!lib) return;
  const key=url.origin+url.pathname;   // une seule copie, quel que soit le jeton
  e.respondWith(
    fetch(req).then(res=>{
      if(res.ok||res.type==='opaque'){const copy=res.clone(); caches.open(CACHE).then(c=>c.put(key,copy));}
      return res;
    }).catch(()=>caches.open(CACHE).then(c=>c.match(key)).then(r=>r||new Response('Pas de réseau.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}})))
  );
});
