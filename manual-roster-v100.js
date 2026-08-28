/* TEAM EYSL v100 — connect manual/unregistered roster to live training UI */
(function(){
  const comparePeople=window.eyslApplicationCompare||((a,b)=>String(a?.name||a||'').localeCompare(String(b?.name||b||''),'ko-KR'));
  const sortPeople=list=>Array.isArray(list)?[...list].sort(comparePeople):[];
  const uniqueByName=list=>{
    const seen=new Set();
    return (list||[]).filter(x=>{
      const name=typeof x==='string'?x:String(x?.name||'');
      if(!name||seen.has(name))return false;
      seen.add(name);return true;
    });
  };

  async function hydrateManualTrainingParticipants(){
    try{
      const ids=Object.keys(trainings||{});
      if(!ids.length)return;
      const {data,error}=await dbClient.from('activities').select('id,details').in('id',ids);
      if(error)throw error;
      (data||[]).forEach(row=>{
        const t=trainings?.[row.id];if(!t)return;
        const d=row.details||{};
        const manual=Array.isArray(d.manual_unregistered_participants)?d.manual_unregistered_participants:[];
        t.manualUnregisteredParticipants=sortPeople(manual);
        if(manual.length){
          t.participants=sortPeople([...new Set([...(t.participants||[]),...manual])]);
        }
      });
    }catch(e){console.error('manual-roster-v100 hydrate:',e)}
  }

  if(typeof loadPersistentContent==='function'){
    const originalLoadPersistentContent=loadPersistentContent;
    loadPersistentContent=async function(){
      const result=await originalLoadPersistentContent.apply(this,arguments);
      await hydrateManualTrainingParticipants();
      return result;
    };
  }

  if(typeof renderApplyStatus==='function'){
    renderApplyStatus=async function(){
      const box=document.getElementById('applyStatusBody'),t=trainings[selectedTrainingId];if(!box)return;
      if(!t){box.innerHTML='<div class="card meta">훈련 정보를 찾을 수 없습니다.</div>';return}
      try{
        const all=await fetchApplicationPeople(selectedTrainingId);
        const liveParticipants=all.filter(x=>x.type==='participant');
        const waitlist=all.filter(x=>x.type==='waitlist').sort((a,b)=>(a.order||999)-(b.order||999));
        const done=activityHasStarted(t);
        let participants=[];

        if(done&&Array.isArray(t.historicalParticipants)&&t.historicalParticipants.length){
          const liveByName=new Map(liveParticipants.map(p=>[p.name,p]));
          participants=t.historicalParticipants.map(name=>({
            ...(liveByName.get(name)||{}),name,type:'participant',historical:true,
            avatarUrl:liveByName.get(name)?.avatarUrl||'',attendanceStatus:t.historicalAttendance?.[name]||'출석'
          }));
        }else{
          const liveByName=new Map(liveParticipants.map(p=>[p.name,p]));
          const manual=(t.manualUnregisteredParticipants||[]).map(name=>({
            name,type:'participant',manual:true,avatarUrl:'',details:{}
          }));
          participants=uniqueByName([...liveParticipants,...manual]);
        }

        participants=sortPeople(participants);
        const people=participants.length?participants.map(p=>{
          const status=done?(t.historicalAttendance?.[p.name]||p.details?.attendance_status||p.attendanceStatus||'출석'):'신청완료';
          return `<div class="applyPerson">${applicationAvatar(p)}<div class="grow"><b>${escHtml(p.name)}</b><p class="meta">${escHtml(status)}${p.historical?' · 과거 출석부':''}</p></div></div>`;
        }).join(''):'<div class="meta">참석자가 없습니다.</div>';
        const waits=waitlist.length?waitlist.map(p=>{const offered=p.offerStatus==='offered'&&p.offerExpiresAt&&new Date(p.offerExpiresAt).getTime()>Date.now();return `<div class="applyPerson">${applicationAvatar(p)}<div class="grow"><b>${p.order||'-'}. ${escHtml(p.name)}</b><p class="meta">${offered?`응답 대기 · ${remaining(new Date(p.offerExpiresAt).getTime())} 남음`:'대기중'}</p></div>${offered?'<span class="offerBadge">응답중</span>':''}</div>`}).join(''):'<div class="meta">대기자가 없습니다.</div>';
        box.innerHTML=`<div class="detail"><div class="detailrow"><b>훈련</b><span>${escHtml(t.title)}</span></div><div class="detailrow"><b>${done?'참석':'신청'}</b><span>${participants.length}/${t.capacity}</span></div>${done?'':`<div class="detailrow"><b>대기</b><span>${waitlist.length}명</span></div>`}</div><div class="section"><h2>${done?'실제 참석':'신청완료'} ${participants.length}명</h2></div><div class="card">${people}</div>${done?'':`<div class="section"><h2>대기 ${waitlist.length}명</h2></div><div class="card">${waits}</div>`}`;
      }catch(e){console.error('manual-roster-v100 status:',e);box.innerHTML='<div class="card meta">신청현황을 불러오지 못했습니다. 다시 시도해주세요.</div>'}
    };
  }

  window.addEventListener('load',()=>setTimeout(async()=>{
    await hydrateManualTrainingParticipants();
    try{renderTrainingList();renderHome();}catch(_){ }
  },700));
})();
