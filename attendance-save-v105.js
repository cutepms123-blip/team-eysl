/* TEAM EYSL v105 — admin attendance: edit first, save once, sync all downstream stats */
(function(){
  let dirty=false;
  let activeEventId=null;
  let originalByEvent={};
  let saving=false;

  const oldSetAtt=typeof setAtt==='function'?setAtt:null;
  const oldOpenAttEvent=typeof openAttEvent==='function'?openAttEvent:null;
  const oldRenderAttDetail=typeof renderAttDetail==='function'?renderAttDetail:null;
  const oldShowPage=typeof showPage==='function'?showPage:null;

  function eventById(id){
    try{return (typeof attEvents==='function'?attEvents():[]).find(x=>x.id===id)||null}catch(_){return null}
  }
  function cloneStatuses(id){
    const out={};
    const rec=(attRecords&&attRecords[id])||{};
    Object.keys(rec).forEach(n=>{if(rec[n]&&rec[n].status)out[n]={status:rec[n].status,paid:rec[n].paid??null};});
    return out;
  }
  function isChanged(id){
    const a=cloneStatuses(id), b=originalByEvent[id]||{};
    return JSON.stringify(a)!==JSON.stringify(b);
  }
  function fmtSaved(ts){
    if(!ts)return '아직 저장되지 않음';
    try{return new Date(ts).toLocaleString('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false})}catch(_){return ts}
  }
  function savedKey(id){return `eysl-attendance-last-saved:${id}`}

  async function loadDbStatuses(id){
    const e=eventById(id); if(!e||e.kind!=='training')return;
    try{
      const {data,error}=await dbClient.rpc('team_attendance_canonical_v1');
      if(error)throw error;
      const rows=(data||[]).filter(r=>String(r.activity_date||r.d)===String(e.date));
      if(!attRecords[id])attRecords[id]={};
      rows.forEach(r=>{attRecords[id][r.nickname]={status:r.status,paid:attRecords[id][r.nickname]?.paid??null};});
      originalByEvent[id]=cloneStatuses(id);
      dirty=false;
    }catch(err){console.error('attendance-save-v105 load:',err);}
  }

  function addSaveUi(e){
    const root=document.getElementById('attAdminDetailBody');
    if(!root||!e||e.kind!=='training')return;
    let box=document.getElementById('attendanceSaveBoxV105');
    if(!box){
      box=document.createElement('div');
      box.id='attendanceSaveBoxV105';
      box.style.cssText='position:sticky;bottom:82px;z-index:15;margin-top:14px;background:#fff;border:1px solid #dfe3e8;border-radius:18px;padding:12px;box-shadow:0 8px 30px rgba(0,0,0,.10)';
      root.appendChild(box);
    }
    const last=localStorage.getItem(savedKey(e.id));
    box.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><div><b style="font-size:12px">${dirty?'저장 전 변경사항 있음':'저장된 상태'}</b><div style="font-size:9px;color:#8a9098;margin-top:4px">마지막 저장: ${fmtSaved(last)}</div></div><button id="attendanceSaveBtnV105" class="btn primary" style="min-width:96px" ${saving?'disabled':''}>${saving?'저장 중...':'출석 저장'}</button></div>`;
    const btn=document.getElementById('attendanceSaveBtnV105');
    if(btn)btn.onclick=()=>saveAttendanceBatch(e.id);
  }

  async function saveAttendanceBatch(id){
    const e=eventById(id); if(!e||e.kind!=='training'||saving)return;
    const rec=(attRecords&&attRecords[id])||{};
    const statuses={};
    Object.entries(rec).forEach(([name,v])=>{if(v&&['출석','지각','불참'].includes(v.status))statuses[name]=v.status;});
    if(!Object.keys(statuses).length){if(typeof toast==='function')toast('저장할 출석 상태가 없습니다.');return;}
    saving=true; addSaveUi(e);
    try{
      const {error}=await dbClient.rpc('save_team_attendance_batch_v1',{p_activity_id:id,p_statuses:statuses});
      if(error)throw error;
      originalByEvent[id]=cloneStatuses(id);
      dirty=false;
      const now=new Date().toISOString(); localStorage.setItem(savedKey(id),now);
      try{teamEventRankingCache=null;}catch(_){ }
      if(typeof loadPersistentContent==='function')await loadPersistentContent();
      if(typeof toast==='function')toast('출석이 저장되었습니다.');
      if(typeof renderAttDetail==='function')renderAttDetail(eventById(id));
    }catch(err){
      console.error('attendance-save-v105 save:',err);
      if(typeof toast==='function')toast('출석 저장에 실패했습니다.');
    }finally{saving=false;addSaveUi(eventById(id));}
  }
  window.saveAttendanceBatchV105=saveAttendanceBatch;

  if(oldSetAtt){
    setAtt=function(id,name,status){
      if(!attRecords[id])attRecords[id]={};
      attRecords[id][name]={status,paid:status==='지각'?(attRecords[id][name]?.paid||false):null};
      activeEventId=id;
      dirty=isChanged(id);
      oldRenderAttDetail(eventById(id));
      addSaveUi(eventById(id));
    };
  }

  if(oldRenderAttDetail){
    renderAttDetail=function(e){oldRenderAttDetail(e);if(e&&e.id===activeEventId)addSaveUi(e);};
  }

  if(oldOpenAttEvent){
    openAttEvent=async function(id){
      activeEventId=id;
      if(!attRecords[id])attRecords[id]={};
      await loadDbStatuses(id);
      showPage('attendanceAdminDetail');
      renderAttDetail(eventById(id));
    };
  }

  if(oldShowPage){
    showPage=function(id){
      if(activeEventId&&dirty&&id!=='attendanceAdminDetail'){
        const ok=confirm('변경사항이 저장되지 않았습니다. 저장하지 않고 나갈까요?');
        if(!ok)return;
        if(originalByEvent[activeEventId])attRecords[activeEventId]=JSON.parse(JSON.stringify(originalByEvent[activeEventId]));
        dirty=false; activeEventId=null;
      }
      return oldShowPage(id);
    };
  }

  window.addEventListener('beforeunload',function(e){if(!dirty)return;e.preventDefault();e.returnValue='';});
})();
