/* TEAM EYSL v130 — responsive navigation / background work */
(()=>{
  if(window.__PERFORMANCE_V130__)return;
  window.__PERFORMANCE_V130__=true;

  const dbToUi=s=>({present:'출석',late:'지각',absent:'불참'})[s]||s;
  let openingAttendanceId=null;

  // Never block page navigation on a network read. Render cached/local roster first,
  // then merge persisted attendance in the background and repaint only if still open.
  window.openAttEvent=function(id){
    const e=typeof attEvents==='function'?attEvents().find(x=>x.id===id):null;
    if(!e){if(typeof toast==='function')toast('출석 일정을 찾을 수 없습니다.');return;}
    openingAttendanceId=id;
    if(!attRecords[id])attRecords[id]={};
    showPage('attendanceAdminDetail');
    renderAttDetail(e);

    void (async()=>{
      try{
        const {data,error}=await dbClient.from('attendance')
          .select('display_name,member_id,roster_id,status,late_fee_paid,checked_at')
          .eq('activity_id',id);
        if(error)throw error;
        const base={...(attRecords[id]||{})};
        (data||[]).forEach(row=>{
          const name=row.display_name||members.find(m=>m.id===row.member_id)?.name||'';
          if(!name)return;
          base[name]={...(base[name]||{}),status:dbToUi(row.status),paid:row.status==='late'&&row.late_fee_paid===true,persisted:true,checkedAt:row.checked_at||null};
        });
        attRecords[id]=base;
        if(openingAttendanceId===id&&document.getElementById('attendanceAdminDetail')?.classList.contains('active')){
          renderAttDetail(typeof attEvents==='function'?attEvents().find(x=>x.id===id):e);
        }
      }catch(err){console.warn('attendance v130 background load:',err)}
    })();
  };
  try{openAttEvent=window.openAttEvent}catch(_){ }

  // Push status was being requested from several navigation/focus hooks. Coalesce
  // those calls so returning to the app does not start duplicate network work.
  if(typeof window.refreshPushStatus==='function'){
    const basePush=window.refreshPushStatus;
    let pushRunning=null,lastPushAt=0;
    window.refreshPushStatus=function(force=false){
      const now=Date.now();
      if(!force&&now-lastPushAt<30000)return pushRunning||Promise.resolve();
      if(pushRunning)return pushRunning;
      lastPushAt=now;
      pushRunning=Promise.resolve(basePush.apply(this,arguments)).finally(()=>{pushRunning=null});
      return pushRunning;
    };
    try{refreshPushStatus=window.refreshPushStatus}catch(_){ }
  }
})();
