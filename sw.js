const VERSION='team-eysl-final178-runtime-stability';
const CACHE=`team-eysl-${VERSION}`;

const PRECACHE=[
  '/manifest.webmanifest','/icon-192.png','/icon-512.png','/apple-touch-icon.png',
  '/timestamp-v94.js','/join-date-v96.js','/activity-comments-v98.js','/application-order-v99.js',
  '/manual-roster-v100.js','/ui-order-v112.js','/remove-aggregation-v113.js',
  '/notice-poll-v115.js','/notice-upload-fix-v116.js','/notice-engagement-v117.js',
  '/notice-interaction-fix-v118.js','/notice-date-picker-v119.js','/notice-deadline-layout-v121.js',
  '/race-attachment-v123.js','/race-time-fields-v124.js','/race-application-v125.js',
  '/race-ui-v142.js','/schedule-deadline-race-v142.js','/race-detail-v150.js',
  '/author-monthly-deadline-v145.js','/attendance-nav-ui-v153.js','/attendance-schedule-race-v154.js',
  '/training-roster-v159.js','/compact-status-v155.js','/ui-refresh-v160.js','/runtime-fix-v162.js',
  '/auth-session-v126.js','/records-style-v164.js','/race-status-v165.js','/visible-fixes-v166.js',
  '/canonical-ui-v172.js','/application-save-v175.js','/nav-wait-status-v176.js',
  '/runtime-stability-v178.js'
];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(cache=>cache.addAll(PRECACHE))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

async function navigationResponse(req){
  try{
    const res=await fetch(req,{cache:'no-store'});
    if(!res.ok)return res;

    let html=await res.text();
    const files=PRECACHE.filter(path=>path.endsWith('.js')).map(path=>path.slice(1));

    for(const file of files){
      const escaped=file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      html=html.replace(
        new RegExp(`<script[^>]+src=["'][^"']*/${escaped}[^"']*["'][^>]*><\\/script>`,'g'),
        ''
      );
      html=html.replace('</body>',`<script src="/${file}?v=final178"></script></body>`);
    }

    const headers=new Headers(res.headers);
    headers.delete('content-length');
    headers.delete('content-encoding');
    headers.delete('etag');
    headers.set('cache-control','no-store');

    return new Response(html,{
      status:res.status,
      statusText:res.statusText,
      headers
    });
  }catch(err){
    console.error('TEAM EYSL navigation fetch:',err);
    return new Response('TEAM EYSL offline',{
      status:503,
      headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}
    });
  }
}

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;

  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;

  if(req.mode==='navigate'){
    event.respondWith(navigationResponse(req));
    return;
  }

  event.respondWith(
    fetch(req,{cache:'no-store'}).catch(()=>caches.match(req))
  );
});

self.addEventListener('push',event=>{
  let data={};
  try{data=event.data?event.data.json():{}}catch(_){ }

  event.waitUntil(
    self.registration.showNotification(data.title||'TEAM EYSL',{
      body:data.body||'새 알림이 도착했어요.',
      icon:'/icon-192.png',
      badge:'/icon-192.png',
      tag:data.tag||'team-eysl',
      data:{url:data.url||'/'}
    })
  );
});

self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const target=event.notification?.data?.url||'/';

  event.waitUntil(
    clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
      for(const client of list){
        if('focus' in client){
          if('navigate' in client)client.navigate(target).catch(()=>{});
          return client.focus();
        }
      }
      if(clients.openWindow)return clients.openWindow(target);
      return undefined;
    })
  );
});

self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
});
