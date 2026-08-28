/* TEAM EYSL v103 — preserve historical attendance, live-sync seeded/current trainings */
(function(){
  const ADMIN_ORDER=['민선','창두','도의','태훈','창호','태진','민석','준혁'];

  function rawName(value){return typeof value==='string'?value:String(value?.name||value?.nickname||'');}
  function shortName(value){return rawName(value).split('/')[0].trim();}
  function isTrial(value){return /^일일체험\d*/.test(shortName(value));}
  function comparePeople(a,b){
    const ta=isTrial(a),tb=isTrial(b);
    if(ta!==tb)return ta?1:-1;
    if(ta&&tb)return shortName(a).localeCompare(shortName(b),'ko-KR',{numeric:true});
    const sa=shortName(a),sb=shortName(b),ia=ADMIN_ORDER.indexOf(sa),ib=ADMIN_ORDER.indexOf(sb);
    if(ia>=0||ib>=0){if(ia<0)return 1;if(ib<0)return -1;if(ia!==ib)return ia-ib;}
    return rawName(a).localeCompare(rawName(b),'ko-KR');
  }
  function sortPeople(list){return Array.isArray(list)?[...list].sort(comparePeople):[];}
  function uniqueByName(list){
    const seen=new Set();
    return (list||[]).filter(x=>{const n=rawName(x);if(!n||seen.has(n))return false;seen.add(n);return true;});
  }

  async function hydrateManualTrainingParticipants(){
    try{
      const ids=Object.keys(trainings||{});if(!ids.length)return;
      const [{data:acts,error:actErr},{data:apps,error:appErr}]=await Promise.all([
        dbClient.from('activities').select('id,details').in('id',ids),
        dbClient.from('activity_applications').select('activity_id,application_type,members(nickname)').in('activity_id',ids)
      ]);
      if(actErr)throw actErr;if(appErr)throw appErr;

      const liveMap={};
      (apps||[]).forEach(a=>{
        if(a.application_type!=='participant')return;
        const n=a.members?.nickname;if(!n)return;
        (liveMap[a.activity_id]||(liveMap[a.activity_id]=[])).push(n);
      });

      (acts||[]).forEach(row=>{
        const t=trainings?.[row.id];if(!t)return;
        const d=row.details||{};
        const isManualRoster=d.manual_roster===true;
        t.manualRoster=isManualRoster;

        // 과거 일반 훈련은 기존 loadPersistentContent가 만든 실제 출석부 배열을 그대로 보존한다.
        if(!isManualRoster){
          if(Array.isArray(t.historicalParticipants)&&t.historicalParticipants.length&&activityHasStarted(t)){
            t.participants=sortPeople(t.historicalParticipants);
          }else if(Array.isArray(t.participants)){
            t.participants=sortPeople(t.participants);
          }
          return;
        }

        // 8/29~9월 수기 세팅 일정: 수기 미가입자 + 현재 앱 신청자가 최종 명단.
        const manual=Array.isArray(d.manual_unregistered_participants)?d.manual_unregistered_participants:[];
        t.manualUnregisteredParticipants=sortPeople(manual);
        t.participants=sortPeople(uniqueByName([...(liveMap[row.id]||[]),...manual]));
      });
    }catch(e){console.error('manual-roster-v103 hydrate:',e)}
  }

  if(typeof loadPersistentContent==='function'){
    const originalLoadPersistentContent=loadPersistentContent;
    loadPersistentContent=async function(){const r=await originalLoadPersistentContent.apply(this,arguments);await hydrateManualTrainingParticipants();return r;};
  }

  if(typeof renderTrainingList==='function'){
    renderTrainingList=function(){
      const list=Object.values(trainings).sort((a,b)=>String(b.date+b.start).localeCompare(String(a.date+a.start)));
      const box=document.getElementById('trainingCards');if(!box)return;
      box.innerHTML=list.map(t=>{
        const ended=activityHasStarted(t),inP=(t.participants||[]).includes(currentUser.nickname),w=(t.waitlist||[]).find(x=>x.name===currentUser.nickname);
        const count=(t.participants||[]).length;
        const state=ended?'종료':inP?'신청완료':w?`대기 ${w.order}번`:'신청 전';
        const badgeClass=ended?'done':inP?'':w?'wait':'idle';
        const seatBlocked=count>=t.capacity||(t.waitlist||[]).length>0||!!t.offer;
        let action='';
        if(!ended){
          if(inP)action=`<button class="btn amber" onclick="cancelTraining('${t.id}')">참석 취소</button>`;
          else if(w)action=`<button class="btn amber" onclick="cancelTraining('${t.id}')">대기 취소</button>`;
          else action=`<button class="btn ${seatBlocked?'amber':'primary'}" onclick="applyTraining('${t.id}')">${seatBlocked?'대기 신청':'참석 신청'}</button>`;
        }
        const when=[t.date,t.start?`${t.start}${t.end?`–${t.end}`:''}`:''].filter(Boolean).join(' · ');
        return `<div class="statusCard"><div class="statusTop"><div><h3>${t.title}</h3><p>${when}<br>${t.place||'장소 미등록'}<br>${count}/${t.capacity||'-'} · ${state}</p></div><span class="statusPill ${badgeClass}">${state}</span></div><div class="actions">${action}<button class="btn outline" onclick="openTraining('${t.id}')">훈련 상세</button><button class="btn outline" onclick="openApplyStatus('${t.id}')">신청현황</button></div></div>`;
      }).join('');
    };
  }

  if(typeof renderApplyStatus==='function'){
    renderApplyStatus=async function(){
      const box=document.getElementById('applyStatusBody'),t=trainings[selectedTrainingId];if(!box)return;
      if(!t){box.innerHTML='<div class="card meta">훈련 정보를 찾을 수 없습니다.</div>';return}
      try{
        const all=await fetchApplicationPeople(selectedTrainingId);
        const waitlist=all.filter(x=>x.type==='waitlist').sort((a,b)=>(a.order||999)-(b.order||999));
        const done=activityHasStarted(t);
        let participants=[];

        // 종료된 과거 일반 훈련은 실제 출석부가 정답.
        if(done&&!t.manualRoster&&Array.isArray(t.historicalParticipants)&&t.historicalParticipants.length){
          const liveByName=new Map(all.filter(x=>x.type==='participant').map(p=>[p.name,p]));
          participants=t.historicalParticipants.map(name=>({
            ...(liveByName.get(name)||{}),name,type:'participant',historical:true,
            avatarUrl:liveByName.get(name)?.avatarUrl||'',attendanceStatus:t.historicalAttendance?.[name]||'출석'
          }));
        }else{
          // 수기 세팅 일정 및 앞으로의 일정은 RPC의 현재 신청 상태가 정답.
          participants=all.filter(x=>x.type==='participant');
        }

        participants=sortPeople(uniqueByName(participants));
        const people=participants.length?participants.map(p=>{
          const status=done?(t.historicalAttendance?.[p.name]||p.details?.attendance_status||p.attendanceStatus||'출석'):'신청완료';
          return `<div class="applyPerson">${applicationAvatar(p)}<div class="grow"><b>${escHtml(p.name)}</b><p class="meta">${escHtml(status)}</p></div></div>`;
        }).join(''):'<div class="meta">참석자가 없습니다.</div>';
        const waits=waitlist.length?waitlist.map(p=>{const offered=p.offerStatus==='offered'&&p.offerExpiresAt&&new Date(p.offerExpiresAt).getTime()>Date.now();return `<div class="applyPerson">${applicationAvatar(p)}<div class="grow"><b>${p.order||'-'}. ${escHtml(p.name)}</b><p class="meta">${offered?`응답 대기 · ${remaining(new Date(p.offerExpiresAt).getTime())} 남음`:'대기중'}</p></div>${offered?'<span class="offerBadge">응답중</span>':''}</div>`}).join(''):'<div class="meta">대기자가 없습니다.</div>';
        box.innerHTML=`<div class="detail"><div class="detailrow"><b>훈련</b><span>${escHtml(t.title)}</span></div><div class="detailrow"><b>${done?'참석':'신청'}</b><span>${participants.length}/${t.capacity}</span></div>${done?'':`<div class="detailrow"><b>대기</b><span>${waitlist.length}명</span></div>`}</div><div class="section"><h2>${done?'실제 참석':'신청완료'} ${participants.length}명</h2></div><div class="card">${people}</div>${done?'':`<div class="section"><h2>대기 ${waitlist.length}명</h2></div><div class="card">${waits}</div>`}`;
      }catch(e){console.error('manual-roster-v103 status:',e);box.innerHTML='<div class="card meta">신청현황을 불러오지 못했습니다. 다시 시도해주세요.</div>'}
    };
  }

  async function refreshAllTrainingViews(){
    await hydrateManualTrainingParticipants();
    try{renderTrainingList();renderHome();}catch(_){ }
    try{if(document.getElementById('applyStatus')?.classList.contains('active'))await renderApplyStatus();}catch(_){ }
  }

  if(typeof cancelTraining==='function'){
    const originalCancelTraining=cancelTraining;
    cancelTraining=async function(){const r=await originalCancelTraining.apply(this,arguments);await refreshAllTrainingViews();return r;};
  }
  if(typeof applyTraining==='function'){
    const originalApplyTraining=applyTraining;
    applyTraining=async function(){const r=await originalApplyTraining.apply(this,arguments);await refreshAllTrainingViews();return r;};
  }

  window.eyslApplicationCompare=comparePeople;
  window.addEventListener('load',()=>setTimeout(refreshAllTrainingViews,500));
})();
