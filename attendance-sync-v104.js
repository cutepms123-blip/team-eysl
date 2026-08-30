/* TEAM EYSL v104 — persist admin attendance and sync badges/rankings */
(function(){
  function trainingEvent(id){
    try{return (typeof attEvents==='function'?attEvents():[]).find(x=>x.id===id)||null}catch(_){return null}
  }

  async function persistAttendance(id,name,status){
    const e=trainingEvent(id);
    if(!e || e.kind!=='training') return;
    const {error}=await dbClient.rpc('set_team_attendance_status_v1',{p_activity_id:id,p_nickname:name,p_status:status});
    if(error) throw error;
  }

  if(typeof setAtt==='function'){
    setAtt=async function(id,name,status){
      if(!attRecords[id])attRecords[id]={};
      const prev=attRecords[id][name]?{...attRecords[id][name]}:null;
      attRecords[id][name]={status,paid:status==='지각'?(attRecords[id][name]?.paid||false):null};
      renderAttDetail(trainingEvent(id));
      try{
        await persistAttendance(id,name,status);
        if(typeof toast==='function')toast(`${name.split('/')[0]} · ${status} 반영완료`);
        // DB-backed badge/ranking pages read team_attendance_canonical_v1, so next render is fresh.
        try{teamEventRankingCache=null;}catch(_){ }
      }catch(err){
        console.error('attendance-sync-v104:',err);
        if(prev)attRecords[id][name]=prev; else delete attRecords[id][name];
        renderAttDetail(trainingEvent(id));
        if(typeof toast==='function')toast('출석 저장에 실패했습니다.');
      }
    };
  }
})();
