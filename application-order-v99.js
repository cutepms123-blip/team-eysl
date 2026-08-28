(function(){
  const ADMIN_ORDER=['민선','창두','도의','태훈','창호','태진','민석','준혁'];

  function shortName(value){
    const raw=typeof value==='string'?value:(value?.name||value?.nickname||'');
    return String(raw||'').split('/')[0].trim();
  }
  function fullName(value){
    return typeof value==='string'?value:String(value?.name||value?.nickname||'');
  }
  function comparePeople(a,b){
    const sa=shortName(a),sb=shortName(b);
    const ia=ADMIN_ORDER.indexOf(sa),ib=ADMIN_ORDER.indexOf(sb);
    if(ia>=0||ib>=0){
      if(ia<0)return 1;
      if(ib<0)return -1;
      if(ia!==ib)return ia-ib;
    }
    return fullName(a).localeCompare(fullName(b),'ko-KR');
  }
  function sortNames(list){
    return Array.isArray(list)?[...list].sort(comparePeople):[];
  }

  // 신청현황의 실시간 신청자도 같은 순서로 표시한다.
  if(typeof fetchApplicationPeople==='function'){
    const originalFetchApplicationPeople=fetchApplicationPeople;
    fetchApplicationPeople=async function(activityId){
      const rows=await originalFetchApplicationPeople(activityId);
      return Array.isArray(rows)?[...rows].sort(comparePeople):rows;
    };
  }

  // 과거 종료 훈련은 '앱 신청자'가 아니라 실제 출석부 명단이 정답이다.
  // 미래/진행 전 일정은 현재 앱 신청자를 그대로 사용한다.
  if(typeof loadPersistentContent==='function'){
    const originalLoadPersistentContent=loadPersistentContent;
    loadPersistentContent=async function(){
      const result=await originalLoadPersistentContent.apply(this,arguments);
      try{
        Object.values(trainings||{}).forEach(t=>{
          if(Array.isArray(t.historicalParticipants)){
            t.historicalParticipants=sortNames(t.historicalParticipants);
          }
          if(activityHasStarted(t)&&t.historicalParticipants?.length){
            t.participants=[...t.historicalParticipants];
          }else if(Array.isArray(t.participants)){
            t.participants=sortNames(t.participants);
          }
        });
        (races||[]).forEach(item=>{
          if(Array.isArray(item.historicalParticipants))item.historicalParticipants=sortNames(item.historicalParticipants);
          if(Array.isArray(item.participants))item.participants=sortNames(item.participants);
        });
        (events||[]).forEach(item=>{
          if(Array.isArray(item.historicalParticipants))item.historicalParticipants=sortNames(item.historicalParticipants);
          if(Array.isArray(item.participants))item.participants=sortNames(item.participants);
        });
      }catch(e){console.error('application-order-v99:',e)}
      return result;
    };
  }

  window.eyslApplicationCompare=comparePeople;
})();
