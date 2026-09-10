from pathlib import Path

p=Path('index.html')
s=p.read_text()

def replace_between(start,end,replacement):
    global s
    a=s.find(start)
    if a<0: raise SystemExit(f'missing start: {start}')
    b=s.find(end,a)
    if b<0: raise SystemExit(f'missing end after {start}: {end}')
    s=s[:a]+replacement+s[b:]

# Avatar hydration must refresh every visible surface that can show profile images.
replace_between(
"async function hydrateMemberAvatarsInBackground(){",
"async function hydrateNoticeAttachmentsInBackground(){",
'''async function hydrateMemberAvatarsInBackground(){
 const rows=members.filter(m=>m.avatarPath&&!m.avatarUrl);
 if(rows.length)await Promise.all(rows.map(async m=>{try{m.avatarUrl=await signedProfileImage(m.avatarPath)}catch(_){}}));
 if(document.getElementById('memberAdmin')?.classList.contains('active'))renderMembersFromCurrentData();
 if(document.getElementById('memberDirectory')?.classList.contains('active'))void renderMemberDirectory();
 if(document.getElementById('applyStatus')?.classList.contains('active'))void renderApplyStatus();
 if(document.getElementById('chat')?.classList.contains('active')){try{renderGroup();renderDmList()}catch(_){}}
 if(document.getElementById('dmChat')?.classList.contains('active')){try{renderDm()}catch(_){}}
}
''')

replace_between(
"function renderTrainingList(){",
"async function saveActivityApplication",
'''function renderTrainingList(){
 const list=Object.values(trainings).sort((a,b)=>String(b.date+b.start).localeCompare(String(a.date+a.start)));
 trainingCards.innerHTML=list.map(t=>{
   const ended=activityHasStarted(t),inP=t.participants.includes(currentUser.nickname),w=t.waitlist.find(x=>x.name===currentUser.nickname);
   const isMyOffer=!ended&&!!(w&&w.offerStatus==='offered'&&w.offerExpiresAt&&new Date(w.offerExpiresAt).getTime()>Date.now());
   const state=ended?'종료':inP?'신청완료':isMyOffer?'내 차례 · 응답 필요':w?`대기 ${w.order}번`:'신청 전';
   const badgeClass=ended?'done':inP?'':w?'wait':'idle';
   const hasActiveQueue=t.waitlist.some(x=>x.offerStatus==='none'||(x.offerStatus==='offered'&&x.offerExpiresAt&&new Date(x.offerExpiresAt).getTime()>Date.now()));
   const seatBlocked=t.participants.length>=t.capacity||hasActiveQueue;
   let action='';
   if(!ended){
     if(inP)action=`<button class="btn amber" onclick="cancelTraining('${t.id}')">참석 취소</button>`;
     else if(isMyOffer)action=`<button class="btn primary" onclick="openTraining('${t.id}')">참석 여부 선택</button>`;
     else if(w)action=`<button class="btn amber" onclick="cancelTraining('${t.id}')">대기 취소</button>`;
     else action=`<button class="btn ${seatBlocked?'amber':'primary'}" onclick="applyTraining('${t.id}')">${seatBlocked?'대기 신청':'참석 신청'}</button>`;
   }
   const when=[t.date,t.start?`${t.start}${t.end?`–${t.end}`:''}`:''].filter(Boolean).join(' · ');
   return `<div class="statusCard"><div class="statusTop"><div><h3>${t.title}</h3><p>${when}<br>${t.place||'장소 미등록'}<br>${t.participants.length}/${t.capacity||'-'} · ${state}</p></div><span class="statusPill ${badgeClass}">${state}</span></div><div class="actions">${action}<button class="btn outline" onclick="openTraining('${t.id}')">훈련 상세</button><button class="btn outline" onclick="openApplyStatus('${t.id}')">신청현황</button></div></div>`;
 }).join('');
}

''')

replace_between(
"async function reloadApplicationsUI(){",
"async function applyTraining(id){",
'''let applicationRealtimeChannel=null,applicationRealtimeRefreshTimer=null;
let memberRealtimeChannel=null,memberRealtimeRefreshTimer=null;
let lastSurfacedWaitlistOffer='';

async function reloadTrainingApplicationsOnly(){
 const ids=Object.keys(trainings);
 if(!ids.length)return;
 const {data,error}=await dbClient.from('activity_applications')
  .select('activity_id,member_id,application_type,wait_order,offer_status,offer_expires_at,updated_at')
  .in('activity_id',ids);
 if(error)throw error;
 const byMemberId=id=>members.find(m=>m.id===id)?.name||null;
 Object.values(trainings).forEach(t=>{t.participants=[];t.waitlist=[];t.offer=null});
 (data||[]).forEach(a=>{
  const t=trainings[a.activity_id];if(!t)return;
  const name=byMemberId(a.member_id);if(!name)return;
  if(a.application_type==='participant')t.participants.push(name);
  else if(a.application_type==='waitlist')t.waitlist.push({name,memberId:a.member_id,order:Number(a.wait_order||9999),offerStatus:a.offer_status||'none',offerExpiresAt:a.offer_expires_at||null});
 });
 Object.values(trainings).forEach(t=>{
  normalizeWait(t);
  if(activityHasStarted(t)&&Array.isArray(t.historicalParticipants)&&t.historicalParticipants.length){
   t.participants=[...new Set([...(t.participants||[]),...t.historicalParticipants])];
  }
  const offered=t.waitlist.find(w=>w.offerStatus==='offered'&&w.offerExpiresAt&&new Date(w.offerExpiresAt).getTime()>Date.now());
  t.offer=offered?{name:offered.name,memberId:offered.memberId,expiresAt:new Date(offered.offerExpiresAt).getTime()}:null;
 });
 snapshotPlainData();
 renderHome();renderTrainingList();renderCalendar();renderActivity();
 const active=document.querySelector('.page.active')?.id;
 if(active==='trainingDetail'&&selectedTrainingId)openTraining(selectedTrainingId);
 else if(active==='applyStatus'&&selectedTrainingId)void renderApplyStatus();
 else if(active==='myStatus')renderMyStatusList();
}

async function reloadApplicationsUI(){
 try{await reloadTrainingApplicationsOnly()}
 catch(err){console.error('training application refresh:',err);await loadPersistentContent();renderHome();renderTrainingList();renderRaceList();renderActivity()}
}

function myPendingWaitlistOffer(){
 return Object.values(trainings)
  .filter(t=>!activityHasStarted(t))
  .map(t=>({t,w:t.waitlist.find(x=>x.name===currentUser.nickname&&x.offerStatus==='offered'&&x.offerExpiresAt&&new Date(x.offerExpiresAt).getTime()>Date.now())}))
  .filter(x=>x.w)
  .sort((a,b)=>String(a.t.date+a.t.start).localeCompare(String(b.t.date+b.t.start)))[0]||null;
}
function surfacePendingWaitlistOffer(force=false){
 const found=myPendingWaitlistOffer();if(!found)return false;
 const key=`${found.t.id}:${found.w.offerExpiresAt}`;
 if(!force&&lastSurfacedWaitlistOffer===key)return false;
 lastSurfacedWaitlistOffer=key;
 openTraining(found.t.id);
 toast('대기 순번이 왔어요. 참석 여부를 선택해주세요.');
 return true;
}
function ensureApplicationRealtime(){
 if(applicationRealtimeChannel||!dbClient?.channel||!currentUser.memberId)return;
 try{
  applicationRealtimeChannel=dbClient.channel(`eysl-applications-${currentUser.memberId}`)
   .on('postgres_changes',{event:'*',schema:'public',table:'activity_applications'},()=>{
    clearTimeout(applicationRealtimeRefreshTimer);
    applicationRealtimeRefreshTimer=setTimeout(async()=>{
      try{await reloadTrainingApplicationsOnly();surfacePendingWaitlistOffer(false)}catch(e){console.error('application realtime:',e)}
    },180);
   }).subscribe();
 }catch(e){console.error('application realtime setup:',e)}
}
function ensureMemberRealtime(){
 if(memberRealtimeChannel||!dbClient?.channel||!currentUser.memberId)return;
 try{
  memberRealtimeChannel=dbClient.channel(`eysl-members-${currentUser.memberId}`)
   .on('postgres_changes',{event:'*',schema:'public',table:'members'},()=>{
    clearTimeout(memberRealtimeRefreshTimer);
    memberRealtimeRefreshTimer=setTimeout(async()=>{
      try{
       await refreshMemberDirectoryFromDb();
       const me=members.find(m=>m.id===currentUser.memberId);
       if(me){currentUser.avatarPath=me.avatarPath||null;currentUser.avatarUrl=me.avatarPath?(await signedProfileImage(me.avatarPath))||'':'';applyRole();renderMyProfile()}
       await hydrateMemberAvatarsInBackground();
      }catch(e){console.error('member realtime:',e)}
    },220);
   }).subscribe();
 }catch(e){console.error('member realtime setup:',e)}
}

''')

replace_between(
"async function applyTraining(id){",
"function openTraining(id){",
'''async function applyTraining(id){
 const t=trainings[id];if(!t)return toast('훈련 정보를 찾을 수 없습니다.');
 if(activityHasStarted(t))return toast('종료된 훈련은 신청할 수 없습니다.');
 const {data,error}=await dbClient.rpc('apply_training_v3',{p_activity_id:id,p_details:{}});
 if(error){console.error(error);return toast(error.message?.includes('activity_started')?'종료된 훈련은 신청할 수 없습니다.':'신청 저장에 실패했습니다.');}
 if(Number(data?.offered_count||0)>0)void sendPush('waitlist_offer','','',{activity_id:id});
 await reloadApplicationsUI();openTraining(id);
 if(data?.status==='participant')toast('훈련 신청완료');
 else toast(`대기 신청완료${data?.wait_order?` · ${data.wait_order}번`:''}`);
}
''')

# The old manual state editor could bypass queue priority. Keep the screen harmless.
replace_between(
"async function saveTrainingEdit(id){",
"async function cancelTraining(id){",
'''async function saveTrainingEdit(id){
 toast('신청 상태 변경은 참석 취소/대기 취소 후 다시 신청해주세요. 대기 순번은 자동으로 보호됩니다.');
 openTraining(id);
}
''')

replace_between(
"async function cancelTraining(id){",
"function normalizeWait(t){",
'''async function cancelTraining(id){
 const before=trainings[id];
 if(before&&activityHasStarted(before))return toast('종료된 훈련은 신청 상태를 변경할 수 없습니다.');
 const {data,error}=await dbClient.rpc('cancel_training_v3',{p_activity_id:id});
 if(error){console.error(error);return toast(error.message?.includes('activity_started')?'종료된 훈련은 신청 상태를 변경할 수 없습니다.':'신청 취소에 실패했습니다.');}
 if(!data?.ok)return toast('취소할 신청 내역이 없습니다.');
 if(Number(data?.offered_count||0)>0)void sendPush('waitlist_offer','','',{activity_id:id});
 await reloadApplicationsUI();
 const active=document.querySelector('.page.active')?.id;
 if(active==='trainingDetail')openTraining(id);
 else if(active==='applyStatus')openApplyStatus(id);
 else if(active==='myStatus')renderMyStatusList();
 toast(data?.cancelled_type==='participant'?'훈련 참석을 취소했습니다.':'대기 신청을 취소했습니다.');
}
''')

replace_between(
"async function respondWaitlistOffer(activityId,action){",
"async function acceptOffer(){",
'''async function respondWaitlistOffer(activityId,action){
 const t=trainings[activityId];
 if(t&&activityHasStarted(t))return toast('종료된 훈련은 대기 응답을 변경할 수 없습니다.');
 if(action==='decline'&&!confirm('이번 기회를 넘기고 다음 대기자에게 전달할까요?'))return;
 const {data,error}=await dbClient.rpc('respond_waitlist_offer_v3',{p_activity_id:activityId,p_action:action});
 if(error){console.error(error);return toast('대기 응답 처리에 실패했습니다.');}
 if(Number(data?.offered_count||0)>0)void sendPush('waitlist_offer','','',{activity_id:activityId});
 await reloadApplicationsUI();
 if(!data?.ok&&data?.status==='expired'){
   showPage('trainingList');
   return toast('24시간 응답 시간이 지나 다음 대기자에게 넘어갔습니다.');
 }
 if(action==='accept'){
   openTraining(activityId);toast('참석이 확정됐습니다.');
 }else{
   showPage('trainingList');toast(Number(data?.offered_count||0)>0?'다음 대기자에게 기회를 넘겼습니다.':'다음 대기자가 없어 빈자리로 전환됐습니다.');
 }
}
''')

old_handle="function handleOpenQuery(){try{const p=new URLSearchParams(location.search),open=p.get('open');if(!open)return;const map={home:'home',chat:'chat',schedule:'schedule',media:'media',resources:'files'};if(map[open])setTimeout(()=>{showPage(map[open]);if(open==='chat')switchChat('group')},250);history.replaceState({},'',location.pathname)}catch(_){}}"
new_handle="""function handleOpenQuery(){
 try{
  const p=new URLSearchParams(location.search),open=p.get('open');if(!open)return false;
  if(open==='training'){
   const id=p.get('activity');
   if(id&&trainings[id])setTimeout(()=>openTraining(id),120);else setTimeout(()=>showPage('trainingList'),120);
   history.replaceState({},'',location.pathname);return true;
  }
  const map={home:'home',chat:'chat',schedule:'schedule',media:'media',resources:'files'};
  if(map[open]){setTimeout(()=>{showPage(map[open]);if(open==='chat')switchChat('group')},120);history.replaceState({},'',location.pathname);return true;}
  return false;
 }catch(_){return false}
}"""
if s.count(old_handle)!=1: raise SystemExit(f'handleOpenQuery count={s.count(old_handle)}')
s=s.replace(old_handle,new_handle,1)

# Fresh login: wire realtime and surface/deep-link pending offers after current data is loaded.
old_login="""  showPage('home');handleOpenQuery();
  toast('로그인됐습니다.');"""
new_login="""  ensureApplicationRealtime();ensureMemberRealtime();
  showPage('home');if(!handleOpenQuery())surfacePendingWaitlistOffer(true);
  toast('로그인됐습니다.');"""
if s.count(old_login)!=1: raise SystemExit(f'login hook count={s.count(old_login)}')
s=s.replace(old_login,new_login,1)

# Existing session on app launch: same realtime/pending-offer path.
old_boot=""" const boot=[renderHome,renderNotices,renderGroup,renderDmList,renderCalendar,renderTrainingList,renderRaceList,renderActivity,initAttendanceOptions,renderAttendance,renderAttendanceAdmin,renderFolders];
 boot.forEach(fn=>{try{fn()}catch(err){console.error('TEAM EYSL init:',err)}});
});"""
new_boot=""" const boot=[renderHome,renderNotices,renderGroup,renderDmList,renderCalendar,renderTrainingList,renderRaceList,renderActivity,initAttendanceOptions,renderAttendance,renderAttendanceAdmin,renderFolders];
 boot.forEach(fn=>{try{fn()}catch(err){console.error('TEAM EYSL init:',err)}});
 if(loggedIn){ensureApplicationRealtime();ensureMemberRealtime();if(!handleOpenQuery())surfacePendingWaitlistOffer(true);}
});"""
if s.count(old_boot)!=1: raise SystemExit(f'boot hook count={s.count(old_boot)}')
s=s.replace(old_boot,new_boot,1)

# Better profile upload verification: only report success after DB points to the uploaded object.
replace_between(
"async function uploadMyProfilePhoto(input){",
"async function deleteMyProfilePhoto(){",
'''async function uploadMyProfilePhoto(input){
 const f=input.files?.[0];input.value='';if(!f)return;
 if(!f.type.startsWith('image/'))return toast('이미지 파일만 등록할 수 있습니다.');
 if(f.size>5*1024*1024)return toast('프로필 사진은 5MB 이하로 올려주세요.');
 if(!currentUser.memberId)return toast('회원 정보를 확인할 수 없습니다.');
 const ext=(f.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg';
 const path=`${currentUser.memberId}/avatar-${Date.now()}.${ext}`,old=currentUser.avatarPath;
 let dbSaved=false;
 try{
  const {error:upErr}=await dbClient.storage.from('profile-images').upload(path,f,{upsert:false,contentType:f.type});if(upErr)throw upErr;
  const {error:rpcErr}=await dbClient.rpc('set_my_avatar_path',{p_avatar_path:path});
  if(rpcErr){await dbClient.storage.from('profile-images').remove([path]);throw rpcErr}
  dbSaved=true;
  let verified=false;
  for(let i=0;i<2;i++){
   const {data,error}=await dbClient.rpc('get_my_member');
   const saved=Array.isArray(data)?data[0]:data;
   if(!error&&saved?.avatar_path===path){verified=true;break}
   if(i===0)await new Promise(r=>setTimeout(r,180));
  }
  if(!verified)throw new Error('프로필 사진 서버 저장 확인 실패');
  if(old&&old!==path)await dbClient.storage.from('profile-images').remove([old]);
  currentUser.avatarPath=path;currentUser.avatarUrl=await signedProfileImage(path);
  const me=members.find(m=>m.id===currentUser.memberId);if(me){me.avatarPath=path;me.avatarUrl=currentUser.avatarUrl}
  applyRole();renderMyProfile();await hydrateMemberAvatarsInBackground();
  toast('프로필 사진이 변경됐습니다.');
 }catch(e){
  console.error('profile upload:',e);
  if(!dbSaved)try{await dbClient.storage.from('profile-images').remove([path])}catch(_){}
  toast(dbSaved?'사진은 저장됐지만 서버 확인에 실패했습니다. 앱을 다시 열어 확인해주세요.':'프로필 사진 업로드에 실패했습니다.');
 }
}
''')

# Bump SW query so installed PWAs pick up this release without a forced reload.
s=s.replace('/sw.js?v=final179-centralized-startup','/sw.js?v=final181-waitlist-sync')

# Safety checks.
checks=[
 "apply_training_v3",
 "cancel_training_v3",
 "respond_waitlist_offer_v3",
 "ensureApplicationRealtime",
 "surfacePendingWaitlistOffer",
 "open==='training'",
 "final181-waitlist-sync"
]
for x in checks:
    if x not in s: raise SystemExit(f'missing expected code: {x}')
if "const type=t.participants.length<t.capacity?'participant':'waitlist';" in s:
    raise SystemExit('legacy client-side training apply decision still present')
if "if(wasParticipant)await sendPush('waitlist_offer'" in s:
    raise SystemExit('legacy cancellation push ordering still present')

p.write_text(s)
print('waitlist sync v181 refactor assertions passed')
