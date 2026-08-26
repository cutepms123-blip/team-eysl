const VERSION='team-eysl-final80-push-autofix';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request)))});
self.addEventListener('push',event=>{
 let data={};try{data=event.data?event.data.json():{}}catch(_){data={body:event.data?.text()||''}}
 const title=data.title||'TEAM EYSL';
 event.waitUntil(self.registration.showNotification(title,{
  body:data.body||'새 알림이 도착했어요.',
  icon:data.icon||'/icon-192.png',
  badge:data.badge||'/icon-192.png',
  tag:data.tag||`team-eysl-${Date.now()}`,
  renotify:true,
  silent:false,
  timestamp:Date.now(),
  data:{url:data.url||'/'},
  vibrate:[120,60,120]
 }));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 const target=new URL(event.notification.data?.url||'/',self.location.origin).href;
 event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
  for(const c of list){if('focus'in c){c.navigate(target);return c.focus()}}
  return clients.openWindow?clients.openWindow(target):null;
 }));
});

// FINAL70_NAV_NETWORK_FIRST
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.mode==='navigate' || new URL(req.url).pathname==='/' || new URL(req.url).pathname.endsWith('/index.html')){
    event.respondWith((async()=>{
      try{
        const fresh=await fetch(req,{cache:'no-store'});
        const c=await caches.open(VERSION);
        c.put(req,fresh.clone());
        return fresh;
      }catch(_){
        return (await caches.match(req)) || (await caches.match('/index.html'));
      }
    })());
  }
});
