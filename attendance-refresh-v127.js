/* TEAM EYSL attendance/date refresh v132 */
(()=>{
 if(window.__ATTENDANCE_REFRESH_V132__)return;window.__ATTENDANCE_REFRESH_V132__=true;
 const localDateKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
 const isPastDate=date=>String(date||'')<localDateKey();
 function myTrainingAttendance(date){const rows=Array.isArray(attendanceHistory)?attendanceHistory:[];return rows.find(x=>String(x.date||'')===String(date||'')&&(!x.name||x.name===currentUser.nickname))?.status||''}
 window.renderMyStatusList=function(){
  let rows=[];
  if(currentStatusKind==='training')rows=Object.values(trainings).filter(t=>(t.participants||[]).includes(currentUser.nickname)||(t.waitlist||[]).some(w=>w.name===currentUser.nickname)).map(t=>{const done=isPastDate(t.date),waiting=(t.waitlist||[]).find(w=>w.name===currentUser.nickname);return {id:t.id,title:t.title,date:t.date,time:`${t.start}–${t.end}`,place:t.place,state:done?'done':'upcoming',status:done?'종료':(t.participants||[]).includes(currentUser.nickname)?'신청완료':`대기 ${waiting?.order||''}번`,attendance:done?myTrainingAttendance(t.date):''}});
  if(currentStatusKind==='race'){const current=races.filter(r=>r.application).map(r=>({id:r.id,title:r.title,date:r.date,state:isPastDate(r.date)?'done':'upcoming',status:isPastDate(r.date)?'종료':'신청완료',source:'application'})),hist=myRaceHistory.map(h=>({id:null,title:h.title,date:h.date,state:isPastDate(h.date)?'done':'upcoming',status:isPastDate(h.date)?'종료':(h.status||'참가'),source:h.source||'history'})),seen=new Set();rows=[...current,...hist].filter(r=>{const k=`${r.title}|${r.date}`;if(seen.has(k))return false;seen.add(k);return true})}
  if(currentStatusKind==='event')rows=events.filter(x=>(x.participants||[]).includes(currentUser.nickname)).map(x=>({id:x.id,title:x.title,date:x.date,time:`${x.start}–${x.end}`,place:x.place,state:isPastDate(x.date)?'done':'upcoming',status:isPastDate(x.date)?'종료':'신청완료'}));
  rows=rows.filter(r=>currentStatusFilter==='all'||r.state===currentStatusFilter).sort((a,b)=>b.date.localeCompare(a.date));
  myStatusList.innerHTML=rows.map(r=>{const line=currentStatusKind==='training'&&r.state==='done'&&r.attendance?`<br><span style="font-size:11px;color:#777">출석 결과 · ${escHtml(r.attendance)}</span>`:'';return `<div class="statusCard"><div class="statusTop"><div><h3>${r.title}</h3><p>${r.date}${r.time?` · ${r.time}`:''}${r.place?`<br>${r.place}`:''}${line}</p></div><span class="tag ${r.state==='done'?'done':r.status.startsWith('대기')?'wait':'ok'}">${r.status}</span></div><div class="actions"><button class="btn ghost" onclick="${currentStatusKind==='training'?`openTraining('${r.id}')`:currentStatusKind==='race'?(r.id?`setActiveRace('${r.id}');openRaceDetail()`:`showPage('records');setRecordMajor('meet',document.querySelector('#recordMajor button'))`):`openEventDetail('${r.id}')`}">상세보기</button></div></div>`}).join('')||'<div class="card meta">해당 신청 내역이 없습니다.</div>';
 };
 try{renderMyStatusList=window.renderMyStatusList}catch(_){ }
 let lastDay=localDateKey(),lastAttendanceRefresh=0,refreshing=null,lastUiRefresh=0;
 async function refreshAttendanceSnapshot(force=false){
  if(!currentUser?.memberId)return;if(refreshing)return refreshing;const now=Date.now();if(!force&&now-lastAttendanceRefresh<60000)return;
  refreshing=(async()=>{try{const {data,error}=await dbClient.rpc('member_history_v4',{p_member_id:currentUser.memberId});if(!error){attendanceHistory=(data||[]).map(x=>({date:String(x.activity_date),title:'팀아이슬 훈련',status:x.status,name:currentUser.nickname}));lastAttendanceRefresh=Date.now()}if(document.getElementById('attendance')?.classList.contains('active'))renderAttendance();if(document.getElementById('myStatus')?.classList.contains('active')&&currentStatusKind==='training')renderMyStatusList();if(document.getElementById('mypage')?.classList.contains('active'))void renderMyAchievements()}catch(err){console.warn('attendance refresh v132:',err)}finally{refreshing=null}})();return refreshing;
 }
 function refreshDateSensitiveUI(){
  const now=Date.now();if(now-lastUiRefresh<1500)return;lastUiRefresh=now;const day=localDateKey(),changed=day!==lastDay;lastDay=day;
  if(document.getElementById('myStatus')?.classList.contains('active'))renderMyStatusList();
  if(document.getElementById('trainingList')?.classList.contains('active'))renderTrainingList();
  if(document.getElementById('raceList')?.classList.contains('active'))renderRaceList();
  if(document.getElementById('otherList')?.classList.contains('active'))renderOtherList();
  if(document.getElementById('home')?.classList.contains('active'))renderHome();
  if(document.getElementById('schedule')?.classList.contains('active'))renderCalendar();
  if(changed||document.getElementById('attendance')?.classList.contains('active')||document.getElementById('mypage')?.classList.contains('active'))void refreshAttendanceSnapshot(changed);
 }
 const baseShowPage=window.showPage;if(typeof baseShowPage==='function'){window.showPage=function(id){const result=baseShowPage.apply(this,arguments);if(id==='myStatus')renderMyStatusList();if(id==='attendance'||id==='mypage')void refreshAttendanceSnapshot(false);return result};try{showPage=window.showPage}catch(_){ }}
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshDateSensitiveUI()});
 setInterval(()=>{if(!document.hidden)refreshDateSensitiveUI()},60000);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refreshDateSensitiveUI,{once:true});else refreshDateSensitiveUI();
})();