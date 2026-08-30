/* TEAM EYSL v111 — attendance roster/count/layout correction */
(function(){
  function getEventById(id){
    try{return (typeof attEvents==='function'?attEvents():[]).find(x=>x.id===id)||null}catch(_){return null}
  }

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
    box.style.setProperty('position','relative','important');
    box.style.setProperty('bottom','auto','important');
    box.style.setProperty('z-index','auto','important');
    box.style.setProperty('margin-top','18px','important');
    box.style.setProperty('box-shadow','none','important');
    box.style.setProperty('left','auto','important');
    box.style.setProperty('right','auto','important');
    box.style.setProperty('transform','none','important');
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
    const prevRenderAttendanceAdmin=renderAttendanceAdmin;
    renderAttendanceAdmin=function(){
      try{
        (typeof attEvents==='function'?attEvents():[]).forEach(normalizeKnownAliases);
      }catch(_){ }
      const out=prevRenderAttendanceAdmin();
      try{
        const rows=attEvents()
          .filter(e=>(attendanceType==='all'||e.type===attendanceType)&&(attendanceState==='all'||e.state===attendanceState))
          .sort((a,b)=>String(b.date).localeCompare(String(a.date)));
        const cards=document.querySelectorAll('#attAdminList .statusCard');
        cards.forEach((card,i)=>{
          const e=rows[i];if(!e)return;
          const c=attCounts(e);
          const cells=card.querySelectorAll('.attGrid > div');
          if(cells[0]){
            const b=cells[0].querySelector('b');const s=cells[0].querySelector('span');
            if(b)b.textContent=String((e.people||[]).length);
            if(s)s.textContent=e.state==='done'?'명단':'신청';
          }
          if(cells[1]){
            const b=cells[1].querySelector('b');const s=cells[1].querySelector('span');
            if(b)b.textContent=String(c.present);
            if(s)s.textContent='출석';
          }
        });
      }catch(err){console.error('attendance v111 summary:',err)}
      return out;
    };
  }

  const observer=new MutationObserver(()=>normalizeSaveBox());
  if(document.body)observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['style']});
  setTimeout(normalizeSaveBox,0);
})();
