/* TEAM EYSL v133 — explicit attendance detail button */
(()=>{
  if(window.__ATT_DETAIL_BUTTON_V133__)return;
  window.__ATT_DETAIL_BUTTON_V133__=true;

  const esc=v=>typeof escHtml==='function'?escHtml(String(v??'')):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const attr=v=>String(v??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  function getEvents(){
    try{return typeof attEvents==='function'?(attEvents()||[]):[]}catch(_){return []}
  }
  function isAdmin(){return !!(currentUser&&(currentUser.role==='admin'||currentUser.role==='master'||currentUser.isAdmin))}

  window.openAttendanceManageV133=function(id){
    const sid=String(id||'');
    if(!sid)return;
    try{
      if(typeof openAttEvent==='function')return openAttEvent(sid);
    }catch(err){console.error('attendance detail v133:',err)}
    if(typeof toast==='function')toast('출석 상세 페이지를 불러오지 못했습니다.');
  };

  function card(e){
    const rec=(typeof attRecords!=='undefined'&&attRecords[e.id])||{};
    const people=Array.isArray(e.people)?e.people:[];
    let present=0,late=0,absent=0;
    Object.values(rec).forEach(r=>{if(r?.status==='출석')present++;else if(r?.status==='지각')late++;else if(r?.status==='불참')absent++});
    const date=esc(e.date||'');
    return `<div class="card" style="margin-bottom:12px;padding:16px">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start">
        <div><h3 style="margin:0 0 6px;font-size:16px">${esc(e.title||'팀아이슬 훈련')}</h3><div class="meta">${date} · 훈련</div></div>
        <span class="tag done">${String(e.date||'')<new Date().toLocaleDateString('sv-SE')?'종료':'예정'}</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-top:14px;text-align:center">
        <div style="background:#f6f7f8;border-radius:12px;padding:11px 3px"><b>${people.length}</b><div class="meta" style="margin-top:5px">명단</div></div>
        <div style="background:#f6f7f8;border-radius:12px;padding:11px 3px"><b>${present}</b><div class="meta" style="margin-top:5px">출석</div></div>
        <div style="background:#f6f7f8;border-radius:12px;padding:11px 3px"><b>${late}</b><div class="meta" style="margin-top:5px">지각</div></div>
        <div style="background:#f6f7f8;border-radius:12px;padding:11px 3px"><b>${absent}</b><div class="meta" style="margin-top:5px">불참</div></div>
      </div>
      <button type="button" class="btn primary" style="width:100%;margin-top:12px;min-height:44px" data-att-detail-v133="${attr(e.id)}">상세보기</button>
    </div>`;
  }

  function replaceList(){
    if(!isAdmin())return;
    const page=document.getElementById('attendanceAdmin')||document.getElementById('attendance');
    if(!page||!page.classList.contains('active'))return;
    const candidates=[...page.querySelectorAll('[id*="att" i],[class*="att" i]')];
    let host=candidates.find(el=>el!==page&&el.querySelector&&el.querySelector('.card')&&getComputedStyle(el).display!=='none');
    if(!host)return;
    const events=getEvents().slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
    if(!events.length)return;
    if(host.dataset.attV133==='1')return;
    host.dataset.attV133='1';
    host.innerHTML=events.map(card).join('');
  }

  document.addEventListener('click',ev=>{
    const btn=ev.target.closest?.('[data-att-detail-v133]');
    if(!btn)return;
    ev.preventDefault();ev.stopPropagation();
    window.openAttendanceManageV133(btn.dataset.attDetailV133);
  },true);

  const baseShow=window.showPage;
  if(typeof baseShow==='function'){
    window.showPage=function(id){const r=baseShow.apply(this,arguments);if(id==='attendance'||id==='attendanceAdmin')requestAnimationFrame(replaceList);return r};
    try{showPage=window.showPage}catch(_){ }
  }
  setTimeout(replaceList,300);
})();