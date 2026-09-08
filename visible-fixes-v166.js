/* TEAM EYSL v166 — visible fixes: home all schedule, race status, PB cards */
(()=>{if(window.__EYSL_VISIBLE_V166__)return;window.__EYSL_VISIBLE_V166__=true;
const css=document.createElement('style');css.textContent=`
/* PB cards — exact native classes */
.pbgrid .pb{position:relative;overflow:hidden;border:1px solid #e2d9f1!important;background:linear-gradient(145deg,#ffffff 0%,#f7f3fc 100%)!important;box-shadow:0 7px 20px rgba(93,72,132,.07)!important;padding:16px!important}
.pbgrid .pb:after{content:'PB';position:absolute;right:13px;top:12px;padding:4px 7px;border-radius:999px;background:#eee8f8;color:#705aa0;font-size:9px;font-weight:900;letter-spacing:.08em}
.pbgrid .pb .stroke{color:#6f657d!important;font-weight:700}.pbgrid .pb .time{font-size:24px!important;letter-spacing:-.02em}
/* record controls */
.recordTabs button,.filters button{color:#17181b!important;background:#fff!important;border-color:#dfe2e7!important}.recordTabs button.active,.filters button.active{background:#705aa0!important;border-color:#705aa0!important;color:#fff!important}
`;document.head.appendChild(css);
function fixRaceStatus(){document.querySelectorAll('.statusCard').forEach(card=>{const all=(card.textContent||'').replace(/\s+/g,' ');if(!/신청완료/.test(all))return;const top=card.querySelector('.statusTop');if(!top)return;[...top.querySelectorAll('.tag,span,div')].filter(x=>!x.children.length).forEach(el=>{if((el.textContent||'').trim()==='신청 마감'){el.textContent='신청완료';el.classList.add('ok')}})})}
function bindAllSchedule(){const home=document.getElementById('home');if(!home)return;[...home.querySelectorAll('.link')].forEach(el=>{if((el.textContent||'').trim()!=='전체보기'||el.dataset.v166)return;el.dataset.v166='1';el.removeAttribute('onclick');el.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id==='schedule'));document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.page==='schedule'));window.scrollTo(0,0);requestAnimationFrame(()=>{try{window.renderCalendar?.()}catch(err){console.warn('v166 calendar render',err)}})},true)})}
function apply(){fixRaceStatus();bindAllSchedule()}
const o=new MutationObserver(()=>requestAnimationFrame(apply));const start=()=>{apply();o.observe(document.body,{childList:true,subtree:true})};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();})();