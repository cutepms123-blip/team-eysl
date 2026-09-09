/* TEAM EYSL v176 — full training wait status + black navigation controls */
(()=>{if(window.__EYSL_NAV_WAIT_V176__)return;window.__EYSL_NAV_WAIT_V176__=true;
const css=document.createElement('style');css.textContent=`
.hamb{color:#111318!important}
.back{color:#111318!important}
.menuClose,.drawerClose,.sideClose{color:#111318!important}
`;
document.head.appendChild(css);
function isFullTraining(t){const cap=Number(t?.capacity||0);return cap>0&&Array.isArray(t?.participants)&&t.participants.length>=cap}
function paintHomeWaitStatus(){const home=document.getElementById('home');if(!home)return;home.querySelectorAll('.row,.statusCard,.card').forEach(card=>{const text=card.textContent||'';if(!/팀아이슬 훈련/.test(text))return;const date=(text.match(/2026-\d{2}-\d{2}/)||[])[0];let t=null;if(date)t=Object.values(window.trainings||{}).find(x=>x?.date===date);if(!t)return;if(!isFullTraining(t))return;const applied=t.participants?.includes(window.currentUser?.nickname);const waiting=t.waitlist?.some?.(w=>(w?.name||w)===window.currentUser?.nickname);if(applied||waiting)return;card.querySelectorAll('.tag,.statusPill,span').forEach(el=>{if((el.textContent||'').trim()==='신청 가능'){el.textContent='대기 가능';el.classList.remove('ok','eysl-status-open');el.style.background='#fff2c9';el.style.color='#7a5b00'}})})}
function blackNav(){document.querySelectorAll('.hamb,.back,.menuClose,.drawerClose,.sideClose').forEach(el=>{el.style.color='#111318';el.querySelectorAll('svg,path,line,polyline').forEach(s=>{s.style.stroke='#111318';if(s.tagName.toLowerCase()==='path'&&s.getAttribute('fill')&&s.getAttribute('fill')!=='none')s.style.fill='#111318'})});const drawer=document.querySelector('.drawer,.sideMenu,.menuPanel');if(drawer)drawer.querySelectorAll('button').forEach(b=>{if((b.textContent||'').trim()==='×'||(b.textContent||'').trim()==='✕')b.style.color='#111318'})}
function apply(){paintHomeWaitStatus();blackNav()}
['renderHome','renderTrainingList','openTraining','showPage','openMenu','toggleMenu'].forEach(name=>{const old=window[name];if(typeof old!=='function'||old.__v176)return;const wrapped=function(){const r=old.apply(this,arguments);requestAnimationFrame(apply);return r};wrapped.__v176=true;window[name]=wrapped});
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(apply),{once:true}):requestAnimationFrame(apply);
})();