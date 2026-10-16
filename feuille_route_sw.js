// Service worker de feuille_route.html : « réseau d'abord ».
// Seule la page elle-même est gardée (sans le jeton) pour pouvoir la rouvrir sans réseau.
// Les arrêts (données clients) ne passent jamais par ce cache : ils sont gardés par la page, effacés à l'expiration du lien.
const CACHE='feuille-route-v1';

self.addEventListener('install',e=>{self.skipWaiting();});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('feuille-route-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request, url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==location.origin||!/\/feuille_route\.html$/.test(url.pathname)) return;
  const key=url.origin+url.pathname;   // une seule copie, quel que soit le jeton
  e.respondWith(
    fetch(req).then(res=>{
      if(res.ok){const copy=res.clone(); caches.open(CACHE).then(c=>c.put(key,copy));}
      return res;
    }).catch(()=>caches.open(CACHE).then(c=>c.match(key)).then(r=>r||new Response('Pas de réseau.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}})))
  );
});
