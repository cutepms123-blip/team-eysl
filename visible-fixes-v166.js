/* TEAM EYSL v169 — visible UI + canonical attendance */
(()=>{if(window.__EYSL_VISIBLE_V169__)return;window.__EYSL_VISIBLE_V169__=true;
const css=document.createElement('style');css.textContent=`
/* PB */
.screenshotPbGrid .screenshotPb{position:relative!important;overflow:hidden!important;border:1.5px solid #d9cdef!important;background:linear-gradient(145deg,#fff 0%,#f3eefb 100%)!important;box-shadow:0 8px 22px rgba(91,69,132,.10)!important;padding:17px 16px!important}
.screenshotPbGrid .screenshotPb:after{content:'PB';position:absolute;right:14px;top:13px;padding:4px 8px;border-radius:999px;background:#e9e0f8;color:#65548f;font-size:9px;font-weight:900;letter-spacing:.08em}
.screenshotPbGrid .screenshotPb span{color:#65548f!important;font-weight:750!important}.screenshotPbGrid .screenshotPb b{color:#17181b!important}
/* filters: unselected black, selected white */
.recordTabs button,.filters button{color:#17181b!important;background:#fff!important;border-color:#dfe2e7!important}.recordTabs button.active,.filters button.active{background:#705aa0!important;border-color:#705aa0!important;color:#fff!important}
/* action buttons */
.btn.eysl-outline-black{background:#fff!important;color:#111318!important;border:1px solid #dfe2e7!important}
.btn.eysl-danger-blue{background:#2389e8!important;color:#fff!important;border-color:#2389e8!important}
.btn.eysl-filled-white{color:#fff!important}
/* status semantics */
.eysl-status-closed{background:#fff2c9!important;color:#7a5b00!important;border-color:#f5e3aa!important}
.eysl-status-applied{background:#eee6ff!important;color:#6d55a0!important;border-color:#eee6ff!important}
.eysl-status-open{background:#eaf3ff!important;color:#3178c6!important;border-color:#eaf3ff!important}
`;document.head.appendChild(css);

async function unified(){
 let memberId=window.currentUser?.memberId||null;
 if(!memberId){try{const s=await dbClient.auth.getSession();memberId=s?.data?.session?.user?.id||null}catch(_){}}
 if(!memberId)return null;
 const {data,error}=await dbClient.rpc('get_unified_member_attendance_v1',{p_member_id:memberId});
 if(error){console.error('v169 unified attendance',error);return null}
 return (data||[]).map(x=>({date:String(x.activity_date||''),title:x.title||'팀아이슬 훈련',status:x.status}));
}
function drawAttendance(rows){
 if(!Array.isArray(rows))return;
 const y=String(document.getElementById('attYear')?.value||new Date().getFullYear()),m=String(document.getElementById('attMonth')?.value||String(new Date().getMonth()+1).padStart(2,'0')).padStart(2,'0');
 const filtered=rows.filter(x=>x.date.startsWith(y)&&x.date.slice(5,7)===m).sort((a,b)=>b.date.localeCompare(a.date));
 const isAtt=x=>x.status==='출석'||x.status==='지각';
 const vals=[rows.filter(isAtt).length,rows.filter(x=>x.date.startsWith(y)&&isAtt(x)).length,filtered.filter(isAtt).length,rows.filter(x=>x.status==='지각').length,rows.filter(x=>x.date.startsWith(y)&&x.status==='지각').length,filtered.filter(x=>x.status==='지각').length];
 const six=document.getElementById('attSix'),list=document.getElementById('attList');
 if(six)six.innerHTML=['누적 출석','연간 출석','이번 달 출석','누적 지각','연간 지각','이번 달 지각'].map((label,i)=>`<div class="attMini"><strong>${vals[i]}</strong><span>${label}</span></div>`).join('');
 if(list)list.innerHTML=filtered.map(x=>`<div class="row"><div class="grow"><b>${x.date} ${x.title}</b></div><span class="tag ok">${x.status}</span></div>`).join('')||'<div class="card meta">해당 기간 출석 내역이 없습니다.</div>';
}
let attRun=0;
window.renderAttendance=async function(){
 const run=++attRun,six=document.getElementById('attSix');
 if(six&&!six.children.length)six.innerHTML='<div class="card meta" style="grid-column:1/-1">출석 기록 불러오는 중...</div>';
 const rows=await unified();if(run!==attRun)return;
 if(rows===null){setTimeout(()=>{if(document.getElementById('attendance')?.classList.contains('active'))window.renderAttendance()},250);return}
 window.attendanceHistory=rows;drawAttendance(rows);
};

function celebratePB(){const h=[...document.querySelectorAll('h1,h2,h3')].find(x=>/^MY PB\s*·/.test((x.textContent||'').trim()));if(h&&!h.dataset.party){h.dataset.party='1';h.append(document.createTextNode(' 🎉'))}}
function styleButtonsAndStatuses(){
 document.querySelectorAll('button,.btn').forEach(b=>{
   const t=(b.textContent||'').trim();
   b.classList.remove('eysl-danger-blue','eysl-outline-black','eysl-filled-white');
   if(/(취소|삭제)$/.test(t)){b.classList.add('eysl-danger-blue');return}
   const bg=getComputedStyle(b).backgroundColor;
   if(b.classList.contains('outline')||bg==='rgb(255, 255, 255)'||bg==='rgba(0, 0, 0, 0)')b.classList.add('eysl-outline-black');
   else b.classList.add('eysl-filled-white');
 });
 document.querySelectorAll('.statusPill,.tag,.statusCard span').forEach(el=>{
   const t=(el.textContent||'').trim();
   el.classList.remove('eysl-status-closed','eysl-status-applied','eysl-status-open');
   if(t==='신청 마감')el.classList.add('eysl-status-closed');
   else if(t==='신청완료'||t==='신청 완료')el.classList.add('eysl-status-applied');
   else if(t==='신청 가능')el.classList.add('eysl-status-open');
 });
}
function fixRaceStatus(){document.querySelectorAll('#raceCards .statusCard').forEach(card=>{if(!/신청완료/.test(card.textContent||''))return;card.querySelectorAll('.tag,.statusPill').forEach(el=>{if(el.textContent.trim()==='신청 마감'){el.textContent='신청완료';el.classList.add('eysl-status-applied')}})})}
function bindAllSchedule(){const el=[...document.querySelectorAll('#home .link')].find(x=>x.textContent.trim()==='전체보기');if(!el||el.dataset.v169)return;el.dataset.v169='1';el.onclick=null;el.addEventListener('click',e=>{e.preventDefault();window.showPage?.('schedule')})}
function apply(){bindAllSchedule();fixRaceStatus();styleButtonsAndStatuses();celebratePB();if(document.getElementById('attendance')?.classList.contains('active'))window.renderAttendance()}
['renderTrainingList','openTraining','openEventDetail','renderRaceList','openRaceDetail','renderMyProfile','setRecordMajor','setRecordSub','setRecordStroke','setRecordDistance'].forEach(name=>{const old=window[name];if(typeof old!=='function'||old.__v169)return;const wrapped=function(){const r=old.apply(this,arguments);requestAnimationFrame(()=>{styleButtonsAndStatuses();celebratePB();fixRaceStatus()});return r};wrapped.__v169=true;window[name]=wrapped});
const oldShow=window.showPage;if(typeof oldShow==='function'){window.showPage=function(id){const r=oldShow.apply(this,arguments);requestAnimationFrame(()=>{styleButtonsAndStatuses();celebratePB();if(id==='attendance')window.renderAttendance()});return r}}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',apply,{once:true}):apply();
})();