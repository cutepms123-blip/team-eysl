/* TEAM EYSL v163 — deterministic startup recovery */
(()=>{
 if(window.__EYSL_STARTUP_V163__)return;window.__EYSL_STARTUP_V163__=true;
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 let running=false,lastGood=0;
 function homeLooksEmpty(){const n=document.getElementById('latestNotice');const u=document.getElementById('upcomingList');const text=(document.getElementById('home')?.innerText||'');return /등록된 공지가 없습니다/.test(text)&&/다가오는 일정이 없어요/.test(text)}
 async function recover(reason){if(running)return;running=true;try{
   let member=null;
   for(let i=0;i<4&&!member;i++){try{member=await window.memberFromSession?.()}catch(_){}if(!member)await sleep(250*(i+1))}
   if(member?.status==='approved'&&!window.currentUser?.memberId){try{await window.setCurrentUserFromMember?.(member)}catch(_){}}
   if(!member&&!window.currentUser?.memberId)return;
   let ok=false;
   for(let i=0;i<3&&!ok;i++){try{await window.loadPersistentContent?.();ok=true}catch(e){console.warn('startup recovery load',reason,i,e);await sleep(400*(i+1))}}
   try{window.applyRole?.();window.renderHome?.();window.renderTrainingList?.();window.renderRaceList?.();window.renderCalendar?.()}catch(e){console.warn('startup recovery render',e)}
   if(ok)lastGood=Date.now();
 }finally{running=false}}
 function schedule(){setTimeout(()=>{if(homeLooksEmpty())recover('empty-home')},1200);setTimeout(()=>{if(homeLooksEmpty())recover('empty-home-late')},3500)}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&(homeLooksEmpty()||Date.now()-lastGood>15*60*1000))recover('resume')});
 window.addEventListener('pageshow',e=>{if(e.persisted||homeLooksEmpty())recover('pageshow')});
})();