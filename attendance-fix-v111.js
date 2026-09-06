/* TEAM EYSL v128 — attendance roster/count/layout correction, performance-safe */
(function(){
  if(window.__ATTENDANCE_FIX_V128__)return;
  window.__ATTENDANCE_FIX_V128__=true;

  function normalizeKnownAliases(e){
    if(!e||!attRecords||!attRecords[e.id])return;
    const rec=attRecords[e.id];
    const oldName='규리/01/여/-';
    const newName='규리/01/여/경기';
    if(rec[oldName]&&(e.people||[]).includes(newName)){
      if(!rec[newName])rec[newName]={...rec[oldName]};
      delete rec[oldName];
    }
  }

  function normalizeSaveBox(){
    const box=document.getElementById('attendanceSaveBoxV105');
    if(!box)return;
    const css={position:'relative',bottom:'auto','z-index':'auto','margin-top':'18px','box-shadow':'none',left:'auto',right:'auto',transform:'none'};
    Object.entries(css).forEach(([k,v])=>{
      if(box.style.getPropertyValue(k)!==v)box.style.setProperty(k,v,'important');
    });
  }

  function fixDetailSummary(e){
    if(!e)return;
    normalizeKnownAliases(e);
    normalizeSaveBox();
    const root=document.getElementById('attAdminDetailBody');
    if(!root)return;
    const rows=root.querySelectorAll('.detail .detailrow');
    const c=typeof attCounts==='function'?attCounts(e):{present:0,late:0,absent:0};
    if(rows[1]){
      const b=rows[1].querySelector('b');
      const s=rows[1].querySelector('span');
      if(b)b.textContent='명단 인원';
      if(s)s.textContent=`${(e.people||[]).length}명`;
    }
    if(rows[2]){
      const b=rows[2].querySelector('b');
      const s=rows[2].querySelector('span');
      if(b)b.textContent='출석 집계';
      if(s)s.textContent=`최종 출석 ${c.present}명 · 지각 ${c.late}명 · 불참 ${c.absent}명`;
    }
  }

  if(typeof renderAttDetail==='function'){
    const prevRenderAttDetail=renderAttDetail;
    renderAttDetail=function(e){
      normalizeKnownAliases(e);
      const out=prevRenderAttDetail(e);
      fixDetailSummary(e);
      return out;
    };
  }

  if(typeof renderAttendanceAdmin==='function'){
    renderAttendanceAdmin=function(){
      const root=document.getElementById('attAdminList');
      if(!root)return;
      const rows=attEvents()
        .filter(e=>(attendanceType==='all'||e.type===attendanceType)&&(attendanceState==='all'||e.state===attendanceState))
        .sort((a,b)=>String(b.date).localeCompare(String(a.date)));
      root.innerHTML=rows.map(e=>{
        normalizeKnownAliases(e);
        const c=attCounts(e);
        return `<div class="statusCard" onclick="openAttEvent('${e.id}')"><div class="statusTop"><div><h3>${e.title}</h3><p>${e.date} · ${e.label}</p></div><span class="tag ${e.state==='done'?'done':''}">${e.state==='done'?'종료':'예정'}</span></div><div class="attGrid"><div><b>${(e.people||[]).length}</b><span>${e.state==='done'?'명단':'신청'}</span></div><div><b>${c.present}</b><span>출석</span></div><div><b>${c.late}</b><span>지각</span></div><div><b>${c.absent}</b><span>불참</span></div></div></div>`;
      }).join('')||'<div class="card meta">조건에 맞는 일정이 없습니다.</div>';
    };
  }

  const style=document.createElement('style');
  style.id='attendance-performance-v128';
  style.textContent=`
    #attAdminList .statusCard{content-visibility:auto;contain-intrinsic-size:210px;}
    #attendanceAdmin.active,#attendanceAdminDetail.active{overscroll-behavior-y:contain;}
  `;
  document.head.appendChild(style);

  // Important: no document-wide MutationObserver here. It caused repeated work on iOS.
  setTimeout(normalizeSaveBox,0);
})();
