/* TEAM EYSL v167 — single-flight startup recovery, no render storm */
(()=>{if(window.__EYSL_STARTUP_V167__)return;window.__EYSL_STARTUP_V167__=true;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let running=false,loaded=false,lastAttempt=0;
function empty(){const t=document.getElementById('home')?.innerText||'';return /등록된 공지가 없습니다/.test(t)&&/다가오는 일정이 없어요/.test(t)}
async function recover(reason){const now=Date.now();if(running||loaded||now-lastAttempt<2500)return;running=true;lastAttempt=now;try{
 let member=null;for(let i=0;i<3&&!member;i++){try{member=await window.memberFromSession?.()}catch(_){}if(!member)await sleep(250)}
 if(member?.status==='approved'&&!window.currentUser?.memberId){try{await window.setCurrentUserFromMember?.(member)}catch(_){}}
 if(!member&&!window.currentUser?.memberId)return;
 try{await window.loadPersistentContent?.();loaded=true}catch(e){console.warn('startup load failed',reason,e);return}
 // loadPersistentContent already triggers the normal render path. Do NOT fan out renderHome/training/race/calendar here.
 try{window.applyRole?.()}catch(_){}
}finally{running=false}}
function boot(){setTimeout(()=>{if(empty())recover('boot')},900);setTimeout(()=>{if(!loaded&&empty())recover('boot-retry')},3200)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&!loaded&&empty())recover('resume')});
window.addEventListener('pageshow',()=>{if(!loaded&&empty())recover('pageshow')});
})();