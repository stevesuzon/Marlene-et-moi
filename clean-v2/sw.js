const CACHE='marlene-clean-v9';
const CORE=[
  './',
  'index.html',
  'styles.css?v=9',
  'app.js?v=9',
  'manifest.webmanifest',
  'banner-marlene-et-moi.png',
  'pelote-multicolore.png',
  'icon-192.png',
  'icon-512.png',
  'apple-touch-icon.png',
  'scarf-1.jpg',
  'scarf-2.jpg',
  'scarf-3.jpg',
  'scarf-4.jpg'
];

async function rebuildCache(){
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith('marlene-')).map(k=>caches.delete(k)));
  const cache=await caches.open(CACHE);
  await cache.addAll(CORE).catch(()=>{});
}

self.addEventListener('install',event=>{
  event.waitUntil(rebuildCache());
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE && k.startsWith('marlene-')).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin)return;

  if(event.request.mode==='navigate'){
    event.respondWith(
      fetch(event.request,{cache:'no-store'})
        .then(async response=>{
          const cache=await caches.open(CACHE);
          cache.put('index.html',response.clone()).catch(()=>{});
          return response;
        })
        .catch(()=>caches.match('index.html'))
    );
    return;
  }

  event.respondWith(
    fetch(event.request,{cache:'no-store'})
      .then(async response=>{
        const cache=await caches.open(CACHE);
        cache.put(event.request,response.clone()).catch(()=>{});
        return response;
      })
      .catch(()=>caches.match(event.request))
  );
});
