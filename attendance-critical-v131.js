/* TEAM EYSL v131 — critical attendance detail navigation */
(()=>{
  if(window.__ATTENDANCE_CRITICAL_V131__)return;
  window.__ATTENDANCE_CRITICAL_V131__=true;
  let activeId=null, loadSeq=0;
  const dbToUi=s=>({present:'출석',late:'지각',absent:'불참'})[s]||s;
  const eventById=id=>{try{return (typeof attEvents==='function'?attEvents():[]).find(x=>String(x.id)===String(id))||null}catch(_){return null}};
  const safe=v=>typeof escHtml==='function'?escHtml(String(v??'')):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const attr=v=>typeof escAttr==='function'?escAttr(String(v??'')):safe(v);

  function detailHtml(e){
    if(!e)return '<div class="card meta">출석 일정을 찾을 수 없습니다.</div>';
    if(!attRecords[e.id])attRecords[e.id]={};
    const rec=attRecords[e.id]||{};
    const names=[...new Set([...(e.people||[]),...Object.keys(rec)])];
    names.sort((a,b)=>{const aa=/^일일체험/.test(String(a)),bb=/^일일체험/.test(String(b));return aa===bb?0:aa?1:-1});
    const c=typeof attCounts==='function'?attCounts(e):{present:0,late:0,absent:0};
    const late=names.filter(n=>rec[n]?.status==='지각');
    const paid=late.filter(n=>rec[n]?.paid===true).length;
    const rows=names.map(n=>{const r=rec[n]||{};const id=attr(JSON.stringify(String(e.id))),nm=attr(JSON.stringify(String(n)));return `<div data-att-person="${attr(n)}" style="padding:11px 0;border-bottom:1px solid #edf0f2"><b style="font-size:12px">${safe(n)}</b><div class="actions"><button class="attChoice ${r.status==='출석'?'on':''}" onclick='setAtt(${id},${nm},"출석")'>출석</button><button class="attChoice ${r.status==='지각'?'on':''}" onclick='setAtt(${id},${nm},"지각")'>지각</button><button class="attChoice ${r.status==='불참'?'on':''}" onclick='setAtt(${id},${nm},"불참")'>불참</button>${r.status==='지각'?`<button class="attChoice ${r.paid?'on':''}" onclick='togglePaid(${id},${nm})'>지각비 납부 완료</button>`:''}</div></div>`}).join('');
    return `<div class="detail"><div class="detailrow"><b>일정</b><span>${safe(e.title)}</span></div><div class="detailrow"><b>명단 인원</b><span>${(e.people||[]).length}명</span></div><div class="detailrow"><b>출석 집계</b><span>최종 출석 ${c.present}명 · 지각 ${c.late}명 · 불참 ${c.absent}명</span></div><div class="detailrow"><b>지각비</b><span>발생 ${late.length}건 · 납부 ${paid}건 · 미납 ${late.length-paid}건</span></div></div><div class="section"><h2>참석자 현황</h2></div><div class="card">${rows||'<div class="meta">체크할 인원이 없습니다.</div>'}</div><div class="actions" style="margin-top:14px"><button id="attendanceSaveBtn" class="btn primary" style="width:100%" onclick="saveAttendanceEvent('${attr(e.id)}')">출석 저장</button></div>`;
  }

  window.renderAttDetail=function(e){
    const body=document.getElementById('attAdminDetailBody');if(!body)return;
    body.innerHTML=detailHtml(e);
  };
  try{renderAttDetail=window.renderAttDetail}catch(_){ }

  window.openAttEvent=function(id){
    const e=eventById(id);
    if(!e){if(typeof toast==='function')toast('출석 일정을 찾을 수 없습니다.');return}
    activeId=String(id);const seq=++loadSeq;
    if(!attRecords[id])attRecords[id]={};
    try{showPage('attendanceAdminDetail')}catch(err){console.error('attendance v131 showPage:',err);document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));document.getElementById('attendanceAdminDetail')?.classList.add('active')}
    window.scrollTo({top:0,left:0,behavior:'auto'});
    window.renderAttDetail(e);
    requestAnimationFrame(()=>window.scrollTo(0,0));

    void (async()=>{
      try{
        const {data,error}=await dbClient.from('attendance').select('display_name,member_id,status,late_fee_paid,checked_at').eq('activity_id',id);
        if(error)throw error;if(seq!==loadSeq||activeId!==String(id))return;
        const merged={...(attRecords[id]||{})};
        (data||[]).forEach(row=>{const name=row.display_name||members.find(m=>m.id===row.member_id)?.name||'';if(name)merged[name]={...(merged[name]||{}),status:dbToUi(row.status),paid:row.status==='late'&&row.late_fee_paid===true,persisted:true,checkedAt:row.checked_at||null}});
        attRecords[id]=merged;
        if(document.getElementById('attendanceAdminDetail')?.classList.contains('active'))window.renderAttDetail(eventById(id)||e);
      }catch(err){console.warn('attendance v131 background load:',err)}
    })();
  };
  try{openAttEvent=window.openAttEvent}catch(_){ }
})();