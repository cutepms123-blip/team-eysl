/* TEAM EYSL v107 — attendance save + late-fee persistence */
(function(){
  let dirty=false;
  let activeEventId=null;
  let originalByEvent={};
  let saving=false;

  const oldOpenAttEvent=typeof openAttEvent==='function'?openAttEvent:null;
  const oldRenderAttDetail=typeof renderAttDetail==='function'?renderAttDetail:null;
  const oldShowPage=typeof showPage==='function'?showPage:null;

  function eventById(id){
    try{return (typeof attEvents==='function'?attEvents():[]).find(x=>x.id===id)||null}catch(_){return null}
  }
  function eventType(e){return String(e?.type||e?.kind||'')}
  function cloneStatuses(id){
    const out={};
    const rec=(attRecords&&attRecords[id])||{};
    Object.keys(rec).forEach(name=>{
      const row=rec[name];
      if(row&&['출석','지각','불참'].includes(row.status)){
        out[name]={status:row.status,paid:row.status==='지각'&&row.paid===true};
      }
    });
    return out;
  }
  function isChanged(id){
    return JSON.stringify(cloneStatuses(id))!==JSON.stringify(originalByEvent[id]||{});
  }
  function fmtSaved(ts){
    if(!ts)return '아직 저장되지 않음';
    try{return new Date(ts).toLocaleString('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false})}catch(_){return ts}
  }
  function savedKey(id){return `eysl-attendance-last-saved:${id}`}
  function dbToUi(status){return ({present:'출석',late:'지각',absent:'불참'})[status]||status}

  async function loadDbStatuses(id){
    const e=eventById(id);if(!e)return;
    try{
      const base={...((attRecords&&attRecords[id])||{})};
      const {data,error}=await dbClient.from('attendance')
        .select('display_name,member_id,roster_id,status,late_fee_paid,checked_at')
        .eq('activity_id',id);
      if(error)throw error;
      (data||[]).forEach(row=>{
        const name=row.display_name||members.find(m=>m.id===row.member_id)?.name||'';
        if(!name)return;
        base[name]={
          ...(base[name]||{}),
          status:dbToUi(row.status),
          paid:row.status==='late'&&row.late_fee_paid===true,
          persisted:true,
          checkedAt:row.checked_at||null
        };
      });
      attRecords[id]=base;
      originalByEvent[id]=cloneStatuses(id);
      dirty=false;
    }catch(err){
      console.error('attendance v107 load:',err);
    }
  }

  function normalizeLateFeeButtons(){
    const root=document.getElementById('attAdminDetailBody');if(!root)return;
    root.querySelectorAll('.attChoice').forEach(btn=>{
      const label=(btn.textContent||'').trim();
      if(label.startsWith('지각비')){
        btn.textContent='지각비 납부 완료';
        btn.setAttribute('title',btn.classList.contains('on')?'납부 완료로 체크됨':'체크하지 않으면 미납으로 저장');
      }
    });
  }

  function addSaveUi(e){
    const root=document.getElementById('attAdminDetailBody');
    if(!root||!e)return;
    let box=document.getElementById('attendanceSaveBoxV105');
    if(!box){
      box=document.createElement('div');
      box.id='attendanceSaveBoxV105';
      box.style.cssText='position:sticky;bottom:92px;z-index:25;margin-top:14px;background:#fff;border:1px solid #dfe3e8;border-radius:18px;padding:13px;box-shadow:0 8px 30px rgba(0,0,0,.14)';
      root.appendChild(box);
    }
    const last=localStorage.getItem(savedKey(e.id));
    const kindLabel=eventType(e)==='training'?'훈련':eventType(e)==='race'?'대회':'기타';
    box.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><div style="min-width:0"><b style="font-size:12px">${dirty?'저장 전 변경사항 있음':'저장된 상태'}</b><div style="font-size:9px;color:#8a9098;margin-top:4px">${kindLabel} · 마지막 저장: ${fmtSaved(last)}</div><div style="font-size:9px;color:#8a9098;margin-top:3px">지각비는 ‘지각비 납부 완료’를 체크하지 않으면 미납으로 저장됩니다.</div></div><button id="attendanceSaveBtnV105" class="btn primary" style="min-width:100px;flex:none" ${saving?'disabled':''}>${saving?'저장 중...':'출석 저장'}</button></div>`;
    const btn=document.getElementById('attendanceSaveBtnV105');
    if(btn)btn.onclick=()=>saveAttendanceBatch(e.id);
  }

  function decorate(e){
    normalizeLateFeeButtons();
    addSaveUi(e);
  }

  async function saveAttendanceBatch(id){
    const e=eventById(id);if(!e||saving)return;
    const rec=(attRecords&&attRecords[id])||{};
    const rows={};
    Object.entries(rec).forEach(([name,v])=>{
      if(v&&['출석','지각','불참'].includes(v.status)){
        rows[name]={status:v.status,late_fee_paid:v.status==='지각'&&v.paid===true};
      }
    });
    if(!Object.keys(rows).length){if(typeof toast==='function')toast('저장할 출석 상태가 없습니다.');return;}

    saving=true;addSaveUi(e);
    try{
      const {data,error}=await dbClient.rpc('save_team_attendance_batch_v2',{p_activity_id:id,p_rows:rows});
      if(error)throw error;
      if(data?.ok===false)throw new Error(data?.error||'attendance save failed');

      const {data:verifiedRows,error:verifyError}=await dbClient.from('attendance')
        .select('display_name,status,late_fee_paid')
        .eq('activity_id',id);
      if(verifyError)throw verifyError;
      const verified=new Map((verifiedRows||[]).map(r=>[r.display_name,{status:dbToUi(r.status),paid:r.status==='late'&&r.late_fee_paid===true}]));
      const mismatches=Object.entries(rows).filter(([name,row])=>{
        const saved=verified.get(name);
        return !saved||saved.status!==row.status||saved.paid!==(row.status==='지각'&&row.late_fee_paid===true);
      });
      if(mismatches.length)throw new Error(`저장 검증 실패: ${mismatches.map(x=>x[0]).join(', ')}`);

      dirty=false;
      const savedAt=new Date().toISOString();
      localStorage.setItem(savedKey(id),savedAt);
      try{teamEventRankingCache=null}catch(_){ }
      if(typeof loadPersistentContent==='function')await loadPersistentContent();
      await loadDbStatuses(id);
      if(typeof renderAttendanceAdmin==='function')renderAttendanceAdmin();
      if(typeof renderAttDetail==='function')renderAttDetail(eventById(id));
      if(typeof renderMyAchievements==='function')void renderMyAchievements();
      if(typeof toast==='function')toast('출석 저장 완료 · 실제 데이터에 반영됐습니다.');
    }catch(err){
      console.error('attendance v107 save:',err);
      if(typeof toast==='function')toast('출석 저장에 실패했습니다. 다시 시도해주세요.');
    }finally{
      saving=false;
      addSaveUi(eventById(id));
    }
  }
  window.saveAttendanceBatchV105=saveAttendanceBatch;

  if(typeof setAtt==='function'){
    setAtt=function(id,name,status){
      if(!attRecords[id])attRecords[id]={};
      const prev=attRecords[id][name]||{};
      attRecords[id][name]={...prev,status,paid:status==='지각'?prev.paid===true:false};
      activeEventId=id;
      dirty=isChanged(id);
      const e=eventById(id);
      if(oldRenderAttDetail)oldRenderAttDetail(e);
      decorate(e);
    };
  }

  if(typeof togglePaid==='function'){
    togglePaid=function(id,name){
      if(!attRecords[id]?.[name]||attRecords[id][name].status!=='지각')return;
      attRecords[id][name].paid=attRecords[id][name].paid!==true;
      activeEventId=id;
      dirty=isChanged(id);
      const e=eventById(id);
      if(oldRenderAttDetail)oldRenderAttDetail(e);
      decorate(e);
    };
  }

  if(oldRenderAttDetail){
    renderAttDetail=function(e){
      oldRenderAttDetail(e);
      if(e)activeEventId=e.id||activeEventId;
      decorate(e);
    };
  }

  if(oldOpenAttEvent){
    openAttEvent=async function(id){
      activeEventId=id;
      if(!attRecords[id])attRecords[id]={};
      await loadDbStatuses(id);
      showPage('attendanceAdminDetail');
      renderAttDetail(eventById(id));
      setTimeout(()=>decorate(eventById(id)),0);
    };
  }

  if(oldShowPage){
    showPage=function(id){
      if(activeEventId&&dirty&&id!=='attendanceAdminDetail'){
        const ok=confirm('변경사항이 저장되지 않았습니다. 저장하지 않고 나갈까요?');
        if(!ok)return;
        if(originalByEvent[activeEventId]){
          const existing=attRecords[activeEventId]||{};
          const restored={...existing};
          Object.keys(restored).forEach(name=>{
            if(['출석','지각','불참'].includes(restored[name]?.status)&&!originalByEvent[activeEventId][name])delete restored[name];
          });
          Object.entries(originalByEvent[activeEventId]).forEach(([name,row])=>restored[name]={...(restored[name]||{}),...row});
          attRecords[activeEventId]=restored;
        }
        dirty=false;activeEventId=null;
      }
      return oldShowPage(id);
    };
  }

  const observer=new MutationObserver(()=>{
    const page=document.getElementById('attendanceAdminDetail');
    if(page?.classList.contains('active')&&activeEventId)decorate(eventById(activeEventId));
  });
  if(document.body)observer.observe(document.body,{childList:true,subtree:true});

  window.addEventListener('beforeunload',function(e){if(!dirty)return;e.preventDefault();e.returnValue='';});
})();
