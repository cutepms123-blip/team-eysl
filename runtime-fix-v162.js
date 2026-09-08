/* TEAM EYSL v162 — visible runtime fixes */
(()=>{
 if(window.__EYSL_RUNTIME_V162__)return;window.__EYSL_RUNTIME_V162__=true;
 const SEP19='a606d356-fb6b-424b-b4f8-b7226233ed6b';
 const SEP19_ROSTER=['민선/97/여/강남','재연/91/여/강남','승현/99/남/양재','창두/93/남/구로','아람/87/여/관악','승희/94/여/송파','준석/94/남/영등포','재건/90/남/강동','윤/99/여/중랑','종명/89/남/강남','유빈/97/여/성북','태진/85/남/용산','혜린/97/여/성북','광섭/91/남/송파','서희/82/여/양재','준혁/94/남/강남','규리/01/여/경기','민석/00/남/잠실','나연/96/여/강남','민정/86/여/서초'];
 const css=document.createElement('style');css.textContent=`#teamEvents .eventHubBtn{position:relative;padding-left:76px!important;background:#fff!important;border-left:3px solid #9B8ACB!important}#teamEvents .eventHubBtn .eyslV162Icon{position:absolute;left:20px;width:40px;height:40px;border-radius:13px;background:#F0E9FF;display:flex;align-items:center;justify-content:center;font-size:20px}.raceParticipationPerson,.relayTeamCard{padding:12px 0;border-bottom:1px solid #edf0f2}.raceParticipationPerson:last-child,.relayTeamCard:last-child{border-bottom:0}.raceParticipationPerson b,.relayTeamCard b{font-size:12px}.raceParticipationPerson p,.relayTeamCard p{font-size:10px;color:#777;margin:5px 0 0;line-height:1.55}`;document.head.appendChild(css);
 const icons=['🏊','⏰','⚡','🏅','🏆','📊'];
 function decorateEvents(){document.querySelectorAll('#teamEvents .eventHubBtn').forEach((b,i)=>{if(b.querySelector('.eyslV162Icon'))return;const s=document.createElement('i');s.className='eyslV162Icon';s.textContent=icons[i]||'✦';b.prepend(s)})}
 function patchTraining(){try{const t=trainings?.[SEP19];if(!t)return;t.capacity=20;t.participants=[...SEP19_ROSTER]}catch(_){}}
 const oldLoad=window.loadPersistentContent;if(typeof oldLoad==='function')window.loadPersistentContent=async function(){const r=await oldLoad.apply(this,arguments);patchTraining();try{renderHome();renderTrainingList();renderCalendar()}catch(_){}return r};
 const oldRTL=window.renderTrainingList;if(typeof oldRTL==='function')window.renderTrainingList=function(){patchTraining();return oldRTL.apply(this,arguments)};
 const oldOpenGeneric=window.openGenericApplyStatus;if(typeof oldOpenGeneric==='function')window.openGenericApplyStatus=async function(kind,id){
  if(kind!=='race')return oldOpenGeneric.apply(this,arguments);let item;try{item=races.find(x=>x.id===id)||race}catch(_){return oldOpenGeneric.apply(this,arguments)}if(!item||!activityHasStarted(item))return oldOpenGeneric.apply(this,arguments);
  applyStatusBackPage='raceDetail';showPage('applyStatus');const box=document.getElementById('applyStatusBody');box.innerHTML='<div class="card meta">참가 종목 불러오는 중...</div>';
  try{const {data,error}=await dbClient.rpc('get_race_participation_display_v162',{p_activity_id:id});if(error)throw error;const people=data?.people||[],relays=data?.relays||[];
   const phtml=people.length?people.map(p=>{const ev=(p.personal||[]).map(x=>`${x.stroke}${x.distance?` ${x.distance}m`:''}`).join(' · ')||'개인종목 기록 없음';return `<div class="raceParticipationPerson"><b>${escHtml(p.name)}</b><p>${escHtml(ev)}</p></div>`}).join(''):'<div class="meta">개인 참가종목 데이터가 없습니다.</div>';
   const counts={};const rhtml=relays.length?relays.map(r=>{counts[r.event]=(counts[r.event]||0)+1;return `<div class="relayTeamCard"><b>${escHtml(r.event)} ${String.fromCharCode(64+counts[r.event])}팀</b><p>${(r.members||[]).map(escHtml).join(' → ')}</p></div>`}).join(''):'<div class="meta">단체전 기록이 없습니다.</div>';
   box.innerHTML=`<div class="detail"><div class="detailrow"><b>대회</b><span>${escHtml(item.title)}</span></div><div class="detailrow"><b>참가 인원</b><span>${people.length}명</span></div></div><div class="section"><h2>개인별 참가 종목</h2></div><div class="card">${phtml}</div><div class="section"><h2>단체전</h2></div><div class="card">${rhtml}</div>`;
  }catch(e){console.error(e);box.innerHTML='<div class="card meta">대회 참가 정보를 불러오지 못했습니다.</div>'}
 };
 function hideListStatus(){document.querySelectorAll('#trainingCards .actions button,#raceCards .actions button').forEach(b=>{if(/신청현황/.test(b.textContent||''))b.style.display='none'})}
 function apply(){decorateEvents();patchTraining();hideListStatus()}
 const obs=new MutationObserver(()=>requestAnimationFrame(apply));const start=()=>{apply();try{renderTrainingList()}catch(_){}obs.observe(document.body,{childList:true,subtree:true})};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();