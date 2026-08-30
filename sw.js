const VERSION='team-eysl-final113-remove-aggregation';
const CACHE=`team-eysl-${VERSION}`;
const PRECACHE=['/manifest.webmanifest','/icon-192.png','/icon-512.png','/apple-touch-icon.png','/timestamp-v94.js','/join-date-v96.js','/activity-comments-v98.js','/application-order-v99.js','/manual-roster-v100.js','/attendance-save-v105.js','/attendance-layout-v109.js','/attendance-fix-v111.js','/ui-order-v112.js','/remove-aggregation-v113.js'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(PRECACHE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
async function navigationResponse(req){
  try{
    const res=await fetch(req,{cache:'no-store'});
    if(!res.ok)return res;
    let html=await res.text();
    if(!html.includes('/timestamp-v94.js'))html=html.replace('</body>','<script src="/timestamp-v94.js?v=final113"></script></body>');
    if(!html.includes('/join-date-v96.js'))html=html.replace('</body>','<script src="/join-date-v96.js?v=final113"></script></body>');
    if(!html.includes('/activity-comments-v98.js'))html=html.replace('</body>','<script src="/activity-comments-v98.js?v=final113"></script></body>');
    if(!html.includes('/application-order-v99.js'))html=html.replace('</body>','<script src="/application-order-v99.js?v=final113"></script></body>');
    if(!html.includes('/manual-roster-v100.js'))html=html.replace('</body>','<script src="/manual-roster-v100.js?v=final113"></script></body>');
    if(!html.includes('/attendance-save-v105.js'))html=html.replace('</body>','<script src="/attendance-save-v105.js?v=final113"></script></body>');
    if(!html.includes('/attendance-layout-v109.js'))html=html.replace('</body>','<script src="/attendance-layout-v109.js?v=final113"></script></body>');
    if(!html.includes('/attendance-fix-v111.js'))html=html.replace('</body>','<script src="/attendance-fix-v111.js?v=final113"></script></body>');
    if(!html.includes('/ui-order-v112.js'))html=html.replace('</body>','<script src="/ui-order-v112.js?v=final113"></script></body>');
    if(!html.includes('/remove-aggregation-v113.js'))html=html.replace('</body>','<script src="/remove-aggregation-v113.js?v=final113"></script></body>');
    return new Response(html,{status:res.status,statusText:res.statusText,headers:new Headers(res.headers)});
  }catch(_){
    const cached=await caches.match('/index.html');
    if(cached)return cached;
    return new Response('TEAM EYSL offline',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
  }
}
self.addEventListener('fetch',event=>{
  const req=event.request;if(req.method!=='GET')return;
  const url=new URL(req.url);if(url.origin!==self.location.origin)return;
  if(req.mode==='navigate'){event.respondWith(navigationResponse(req));return;}
  event.respondWith(fetch(req,{cache:'no-store'}).then(res=>{if(res&&res.ok){const copy=res.clone();caches.open(CACHE).then(cache=>cache.put(req,copy)).catch(()=>{});}return res;}).catch(()=>caches.match(req)));
});
self.addEventListener('push',event=>{
  let data={};try{data=event.data?event.data.json():{}}catch(_){try{data={body:event.data?event.data.text():''}}catch(__){data={}}}
  const title=data.title||'TEAM EYSL';
  event.waitUntil(self.registration.showNotification(title,{body:data.body||'새 알림이 도착했어요.',icon:data.icon||'/icon-192.png',badge:data.badge||'/icon-192.png',tag:data.tag||'team-eysl',data:{url:data.url||'/'}}));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();const target=event.notification?.data?.url||'/';
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{for(const client of list){if('focus'in client){client.navigate(target).catch(()=>{});return client.focus();}}if(clients.openWindow)return clients.openWindow(target);}));
});
self.addEventListener('message',event=>{if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting();});
