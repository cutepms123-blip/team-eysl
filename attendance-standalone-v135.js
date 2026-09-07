/* TEAM EYSL v135 — standalone attendance detail: no showPage/openAttEvent dependency */
(()=>{
 if(window.__ATT_STANDALONE_V135__)return;window.__ATT_STANDALONE_V135__=true;
 const safe=v=>typeof escHtml==='function'?escHtml(String(v??'')):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const eventById=id=>{try{return (typeof attEvents==='function'?attEvents():[]).find(e=>String(e.id)===String(id))||null}catch(_){return null}};
 function activateDetail(){
   document.querySelectorAll('.page.active').forEach(p=>p.classList.remove('active'));
   const page=document.getElementById('attendanceAdminDetail');
   if(!page)return null;
   page.classList.add('active');page.style.display='block';page.removeAttribute('hidden');
   document.querySelectorAll('.nav button').forEach(b=>b.classList.remove('active'));
   return page;
 }
 function renderStandalone(e){
   const body=document.getElementById('attAdminDetailBody');if(!body||!e)return;
   if(!attRecords[e.id])attRecords[e.id]={};
   const rec=attRecords[e.id];const names=[...new Set([...(e.people||[]),...Object.keys(rec)])];
   const c=typeof attCounts==='function'?attCounts(e):{present:0,late:0,absent:0};
   body.innerHTML=`<div class="detail"><div class="detailrow"><b>일정</b><span>${safe(e.title)}</span></div><div class="detailrow"><b>명단 인원</b><span>${(e.people||[]).length}명</span></div><div class="detailrow"><b>출석 집계</b><span>출석 ${c.present}명 · 지각 ${c.late}명 · 불참 ${c.absent}명</span></div></div><div class="section"><h2>참석자 현황</h2></div><div class="card" id="attStandalonePeopleV135">${names.map(n=>{const r=rec[n]||{};return `<div data-att-v135-name="${safe(n)}" style="padding:12px 0;border-bottom:1px solid #edf0f2"><b style="font-size:12px">${safe(n)}</b><div class="actions"><button type="button" class="attChoice ${r.status==='출석'?'on':''}" data-att-v135-status="출석">출석</button><button type="button" class="attChoice ${r.status==='지각'?'on':''}" data-att-v135-status="지각">지각</button><button type="button" class="attChoice ${r.status==='불참'?'on':''}" data-att-v135-status="불참">불참</button>${r.status==='지각'?`<button type="button" class="attChoice ${r.paid?'on':''}" data-att-v135-paid="1">지각비 납부 완료</button>`:''}</div></div>`}).join('')||'<div class="meta">체크할 인원이 없습니다.</div>'}</div><div id="attStandaloneSaveV135" style="margin-top:16px"><button type="button" class="btn primary" style="width:100%;min-height:48px">출석 저장</button></div>`;
   const title=document.querySelector('#attendanceAdminDetail .pagehead h1');if(title)title.textContent='출석 체크';
   body.querySelectorAll('[data-att-v135-status]').forEach(btn=>btn.onclick=()=>{const row=btn.closest('[data-att-v135-name]');const name=row?.dataset.attV135Name;if(!name)return;const status=btn.dataset.attV135Status;if(!attRecords[e.id][name])attRecords[e.id][name]={};attRecords[e.id][name].status=status;if(status!=='지각')attRecords[e.id][name].paid=false;renderStandalone(e)});
   body.querySelectorAll('[data-att-v135-paid]').forEach(btn=>btn.onclick=()=>{const row=btn.closest('[data-att-v135-name]');const name=row?.dataset.attV135Name;if(!name||attRecords[e.id]?.[name]?.status!=='지각')return;attRecords[e.id][name].paid=attRecords[e.id][name].paid!==true;renderStandalone(e)});
   body.querySelector('#attStandaloneSaveV135 button').onclick=()=>{if(typeof window.saveAttendanceBatchV105==='function')return window.saveAttendanceBatchV105(e.id);if(typeof window.saveAttendanceEvent==='function')return window.saveAttendanceEvent(e.id);if(typeof toast==='function')toast('출석 저장 기능을 불러오지 못했습니다.')};
 }
 async function loadSaved(e,token){
   try{const {data,error}=await dbClient.from('attendance').select('display_name,member_id,status,late_fee_paid,checked_at').eq('activity_id',e.id);if(error)throw error;if(window.__ATT_V135_TOKEN__!==token)return;const map={present:'출석',late:'지각',absent:'불참'};(data||[]).forEach(r=>{const name=r.display_name||members.find(m=>m.id===r.member_id)?.name||'';if(name)attRecords[e.id][name]={...(attRecords[e.id][name]||{}),status:map[r.status]||r.status,paid:r.status==='late'&&r.late_fee_paid===true,persisted:true}});renderStandalone(e)}catch(err){console.warn('attendance v135 background load',err)}
 }
 window.openAttendanceStandaloneV135=function(id){
   const e=eventById(id);if(!e){if(typeof toast==='function')toast('출석 일정을 찾을 수 없습니다.');return}
   const page=activateDetail();if(!page){if(typeof toast==='function')toast('출석 체크 화면을 찾을 수 없습니다.');return}
   if(!attRecords[e.id])attRecords[e.id]={};
   const token=String(Date.now())+Math.random();window.__ATT_V135_TOKEN__=token;
   renderStandalone(e);window.scrollTo(0,0);requestAnimationFrame(()=>window.scrollTo(0,0));void loadSaved(e,token);
 };
 document.addEventListener('click',ev=>{const btn=ev.target.closest?.('.att-detail-v134,[data-att-detail-v133]');if(!btn)return;const card=btn.closest('.statusCard');let id=btn.dataset.attDetailV133||'';if(!id&&card){const title=card.querySelector('h3')?.textContent?.trim(),date=(card.querySelector('p')?.textContent||'').split('·')[0].trim();const e=(typeof attEvents==='function'?attEvents():[]).find(x=>x.title===title&&String(x.date)===date);id=e?.id||''}if(!id)return;ev.preventDefault();ev.stopImmediatePropagation();window.openAttendanceStandaloneV135(id)},true);
 const oldRender=window.renderAttendanceAdmin;
 if(typeof oldRender==='function'){window.renderAttendanceAdmin=function(){const out=oldRender.apply(this,arguments);document.querySelectorAll('#attAdminList .att-detail-v134').forEach(btn=>{const card=btn.closest('.statusCard');const title=card?.querySelector('h3')?.textContent?.trim(),date=(card?.querySelector('p')?.textContent||'').split('·')[0].trim();const e=(typeof attEvents==='function'?attEvents():[]).find(x=>x.title===title&&String(x.date)===date);if(e)btn.dataset.attDetailV133=e.id});return out};try{renderAttendanceAdmin=window.renderAttendanceAdmin}catch(_){}}
})();