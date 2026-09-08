/* TEAM EYSL v159 — training canonical roster incl. app-unregistered */
(()=>{
 if(window.__EYSL_TRAINING_ROSTER_V159__)return;window.__EYSL_TRAINING_ROSTER_V159__=true;
 const TARGET='a606d356-fb6b-424b-b4f8-b7226233ed6b';
 const roster=['민선/97/여/강남','재연/91/여/강남','승현/99/남/양재','창두/93/남/구로','아람/87/여/관악','승희/94/여/송파','준석/94/남/영등포','재건/90/남/강동','윤/99/여/중랑','종명/89/남/강남','유빈/97/여/성북','태진/85/남/용산','혜린/97/여/성북','광섭/91/남/송파','서희/82/여/양재','준혁/94/남/강남','규리/01/여/경기','민석/00/남/잠실','나연/96/여/강남','민정/86/여/서초'];
 function patchActivity(){const a=(window.activities||[]).find(x=>x.id===TARGET);if(!a)return;a.capacity=20;a.details={...(a.details||{}),participants:[...roster]};}
 function patchTrainingCard(){document.querySelectorAll('.statusCard').forEach(card=>{if(!/2026-09-19/.test(card.textContent||''))return;[...card.querySelectorAll('p,span,div')].filter(x=>!x.children.length).forEach(el=>{if(/^13\/20\s*·/.test((el.textContent||'').trim()))el.textContent=(el.textContent||'').replace(/^13\/20/,'20/20');});});}
 function patchStatusPage(){const h=[...document.querySelectorAll('h1,h2,h3')].find(x=>x.textContent.trim()==='신청 현황');if(!h)return;const page=h.closest('.page')||document;const title=[...page.querySelectorAll('*')].find(x=>!x.children.length&&x.textContent.trim()==='팀아이슬 훈련');if(!title)return;const summary=[...page.querySelectorAll('*')].find(x=>!x.children.length&&x.textContent.trim()==='13/20');if(summary)summary.textContent='20/20';const head=[...page.querySelectorAll('h2,h3')].find(x=>/^신청완료\s+13명$/.test(x.textContent.trim()));if(head)head.textContent='신청완료 20명';const cards=[...page.querySelectorAll('.card')];const listCard=cards.find(c=>/신청완료/.test(c.textContent||'')&&/민선\/97/.test(c.textContent||''));if(!listCard)return;const existing=new Set([...listCard.querySelectorAll('b')].map(x=>x.textContent.trim()));for(const name of roster){if(existing.has(name))continue;const row=document.createElement('div');row.className='row';row.style.borderBottom='1px solid #edf0f2';row.innerHTML=`<div class="icon"></div><div class="grow"><b>${name}</b><p>신청완료</p></div>`;listCard.appendChild(row);}}
 function apply(){patchActivity();patchTrainingCard();patchStatusPage();}
 const wrap=n=>{const f=window[n];if(typeof f!=='function'||f.__v159)return;const w=function(){patchActivity();const r=f.apply(this,arguments);requestAnimationFrame(apply);return r};w.__v159=true;window[n]=w};
 ['renderTrainingList','openTrainingStatus','renderApplicationStatus','loadPersistentContent'].forEach(wrap);
 const obs=new MutationObserver(()=>requestAnimationFrame(apply));
 const start=()=>{apply();obs.observe(document.body,{childList:true,subtree:true});};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();