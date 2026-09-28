/* TEAM EYSL v198 — training demand survey and confirmation flow */
(function(){
 if(window.__EYSL_TRAINING_DEMAND_V198__)return;
 window.__EYSL_TRAINING_DEMAND_V198__=true;

 var polls=[];
 var currentPollId=null;
 var refreshBusy=false;
 var optionSeq=0;

 function e(v){return typeof window.escHtml==='function'?window.escHtml(String(v==null?'':v)):String(v==null?'':v).replace(/[&<>"']/g,function(s){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]})}
 function isAdmin(){try{return typeof window.isAdminUser==='function'&&window.isAdminUser()}catch(_){return false}}
 function fmtDay(v){
  if(!v)return '-';
  var d=new Date(String(v)+'T00:00:00');
  if(Number.isNaN(d.getTime()))return String(v);
  return d.toLocaleDateString('ko-KR',{month:'numeric',day:'numeric',weekday:'short'});
 }
 function fmtDeadline(v){
  if(!v)return '-';
  var d=new Date(v);
  if(Number.isNaN(d.getTime()))return String(v);
  return d.toLocaleString('ko-KR',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false});
 }
 function statusText(p){
  if(p.status==='confirmed')return '훈련 확정';
  if(p.status==='cancelled')return '취소';
  if(p.is_open)return '수요조사 중';
  return '수요조사 마감';
 }
 function optionText(o){
  var t=fmtDay(o.date);
  if(o.start)t+=' · '+o.start+(o.end?'–'+o.end:'');
  if(o.place)t+=' · '+o.place;
  return t;
 }
 function activePage(){
  var el=document.querySelector('.page.active');
  return el?el.id:'';
 }

 function injectUI(){
  if(document.getElementById('trainingDemand'))return;
  var nav=document.querySelector('nav.nav');
  if(!nav)return;

  var style=document.createElement('style');
  style.textContent=
   '.dpHero{padding:16px;border:1px solid #ececf1;border-radius:18px;background:#fff;margin-bottom:12px}'+
   '.dpHero h3{margin:0 0 5px;font-size:17px}.dpHero p{margin:0;color:#757575;font-size:11px;line-height:1.55}'+
   '.dpOption{display:block;border:1px solid #e9eaee;border-radius:15px;padding:13px;margin-top:9px;background:#fff}'+
   '.dpOption.selected{border-width:2px}.dpOptionTop{display:flex;gap:10px;align-items:flex-start}.dpOptionTop input{margin-top:3px;width:18px;height:18px}'+
   '.dpOptionMain{flex:1;min-width:0}.dpOptionMain b{font-size:13px}.dpOptionMeta{font-size:10px;color:#777;margin-top:5px;line-height:1.5}'+
   '.dpCount{font-size:17px;font-weight:900;white-space:nowrap}.dpNeed{font-size:10px;margin-top:5px;font-weight:800}.dpVoters{font-size:10px;line-height:1.65;color:#666;margin-top:8px;padding-top:8px;border-top:1px solid #eee}'+
   '.dpAdminBar{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}.dpAdminBar .btn{flex:1;min-width:100px}'+
   '.dpOptionEditor{border:1px solid #e8e9ed;border-radius:16px;padding:12px;margin-bottom:10px;background:#fff}'+
   '.dpOptionEditorHead{display:flex;justify-content:space-between;align-items:center;margin-bottom:7px}.dpOptionEditorHead b{font-size:12px}'+
   '.dpMiniRemove{border:0;background:transparent;font-size:18px;padding:2px 7px}'+
   '.dpStatus{display:inline-flex;align-items:center;padding:4px 8px;border-radius:999px;background:#f2f3f5;font-size:10px;font-weight:800}'+
   '.dpStatus.open{background:#eef8f0}.dpStatus.confirmed{background:#eef3ff}.dpStatus.cancelled{background:#f3f3f3;color:#999}'+
   '.dpPollCard{cursor:pointer}.dpPollOptions{margin-top:10px;display:grid;gap:6px}.dpPollOptionSummary{display:flex;justify-content:space-between;gap:8px;font-size:11px;padding:8px 0;border-top:1px solid #f0f0f2}'+
   '.dpEmpty{padding:22px 14px;text-align:center;color:#888;font-size:12px}';
  document.head.appendChild(style);

  nav.insertAdjacentHTML('beforebegin',
   '<section id="trainingDemand" class="page">'+
    '<div class="pagehead"><button class="back" onclick="showPage(\'schedule\')">←</button><h1>훈련 수요조사</h1><button id="dpCreateTop" class="circleMiniBtn" type="button" style="display:none" onclick="openTrainingDemandCreate()" aria-label="수요조사 만들기">＋</button></div>'+
    '<div class="dpHero"><h3>가능한 날짜만 체크하면 돼요 🏊</h3><p>수요조사는 실제 참석 신청이 아니에요. 훈련이 확정되면 그때 다시 참석 신청을 받습니다.</p></div>'+
    '<div id="trainingDemandList" class="list"></div>'+
   '</section>'+
   '<section id="trainingDemandDetail" class="page">'+
    '<div class="pagehead"><button class="back" onclick="openTrainingDemand()">←</button><h1>수요조사</h1><span></span></div>'+
    '<div id="trainingDemandDetailBody"></div>'+
   '</section>'+
   '<section id="trainingDemandCreate" class="page">'+
    '<div class="pagehead"><button class="back" onclick="openTrainingDemand()">←</button><h1>수요조사 만들기</h1><span></span></div>'+
    '<div class="formrow"><label>제목</label><input id="dpTitle" placeholder="예: 11월 훈련 수요조사"></div>'+
    '<div class="grid2"><div class="formrow"><label>최소 진행 인원</label><input id="dpMinimum" type="number" min="1" inputmode="numeric" placeholder="예: 10"></div><div class="formrow"><label>확정 후 신청 정원</label><input id="dpCapacity" type="number" min="1" inputmode="numeric" value="20"></div></div>'+
    '<div class="formrow"><label>수요조사 마감</label><input id="dpDeadline" type="datetime-local"></div>'+
    '<div class="formrow"><label>안내 <span class="meta">(선택)</span></label><textarea id="dpNotes" placeholder="훈련 관련 참고사항"></textarea></div>'+
    '<div class="section"><h2>후보 일정</h2><button class="link" type="button" onclick="addTrainingDemandOption()">＋ 날짜 추가</button></div>'+
    '<div id="dpOptionEditors"></div>'+
    '<button id="dpCreateBtn" class="btn primary" style="width:100%" onclick="saveTrainingDemandPoll()">수요조사 열기</button>'+
   '</section>'
  );

  var sched=document.getElementById('schedSub');
  if(sched&&!document.getElementById('drawerTrainingDemand')){
   var item=document.createElement('div');
   item.id='drawerTrainingDemand';item.className='ditem';item.textContent='훈련 수요조사';
   item.onclick=function(){if(typeof window.closeDrawer==='function')window.closeDrawer();window.openTrainingDemand()};
   var training=[].slice.call(sched.children).find(function(x){return (x.textContent||'').trim()==='훈련'});
   if(training&&training.nextSibling)sched.insertBefore(item,training.nextSibling);else sched.appendChild(item);
  }

  var adminSub=document.getElementById('adminSub');
  if(adminSub&&!document.getElementById('drawerTrainingDemandAdmin')){
   var ai=document.createElement('div');
   ai.id='drawerTrainingDemandAdmin';ai.className='ditem';ai.textContent='훈련 수요조사 관리';
   ai.onclick=function(){if(typeof window.closeDrawer==='function')window.closeDrawer();window.openTrainingDemand()};
   adminSub.insertBefore(ai,adminSub.firstChild);
  }

  var trainingHead=document.querySelector('#trainingList .pagehead span');
  if(trainingHead){
   trainingHead.innerHTML='<button class="link" type="button" onclick="openTrainingDemand()">수요조사</button>';
  }
 }

 async function loadPolls(){
  if(refreshBusy)return;
  refreshBusy=true;
  try{
   var res=await dbClient.rpc('get_training_demand_polls_v1');
   if(res.error)throw res.error;
   polls=Array.isArray(res.data)?res.data:[];
   renderPollList();
   if(currentPollId&&activePage()==='trainingDemandDetail')renderPollDetail(currentPollId);
  }catch(err){
   console.error('training demand load:',err);
   var box=document.getElementById('trainingDemandList');
   if(box)box.innerHTML='<div class="card meta">수요조사를 불러오지 못했습니다.</div>';
  }finally{refreshBusy=false}
 }

 function renderPollList(){
  var box=document.getElementById('trainingDemandList');
  if(!box)return;
  var rows=polls.filter(function(p){return isAdmin()||p.status!=='cancelled'});
  var create=document.getElementById('dpCreateTop');if(create)create.style.display=isAdmin()?'block':'none';
  if(!rows.length){box.innerHTML='<div class="card dpEmpty">열린 수요조사가 없습니다.</div>';return}
  box.innerHTML=rows.map(function(p){
   var opts=Array.isArray(p.options)?p.options:[];
   var optionSummary=opts.map(function(o){
    var met=Number(o.count||0)>=Number(p.minimum_people||0);
    return '<div class="dpPollOptionSummary"><span>'+e(optionText(o))+'</span><b>'+Number(o.count||0)+'명'+(met?' ✓':'')+'</b></div>';
   }).join('');
   var cls=p.status==='confirmed'?'confirmed':p.status==='cancelled'?'cancelled':p.is_open?'open':'';
   return '<div class="card statusCard dpPollCard" onclick="openTrainingDemandDetail(\''+p.id+'\')">'+
    '<div class="statusTop"><div><h3>'+e(p.title)+'</h3><p>마감 '+e(fmtDeadline(p.deadline))+' · 최소 '+Number(p.minimum_people||0)+'명</p></div><span class="dpStatus '+cls+'">'+e(statusText(p))+'</span></div>'+
    '<div class="dpPollOptions">'+optionSummary+'</div>'+
   '</div>';
  }).join('');
 }

 function findPoll(id){return polls.find(function(x){return x.id===id})||null}

 window.openTrainingDemand=async function(){
  injectUI();currentPollId=null;showPage('trainingDemand');
  var box=document.getElementById('trainingDemandList');if(box)box.innerHTML='<div class="card meta">수요조사 불러오는 중...</div>';
  await loadPolls();
 };

 window.openTrainingDemandDetail=async function(id){
  injectUI();currentPollId=id;showPage('trainingDemandDetail');
  var box=document.getElementById('trainingDemandDetailBody');if(box)box.innerHTML='<div class="card meta">수요조사 불러오는 중...</div>';
  await loadPolls();
  renderPollDetail(id);
 };

 function renderPollDetail(id){
  var p=findPoll(id),box=document.getElementById('trainingDemandDetailBody');
  if(!box)return;
  if(!p){box.innerHTML='<div class="card meta">수요조사를 찾을 수 없습니다.</div>';return}
  var opts=Array.isArray(p.options)?p.options:[];
  var admin=isAdmin();
  var options=opts.map(function(o){
   var count=Number(o.count||0),min=Number(p.minimum_people||0),met=count>=min;
   var voters=admin&&Array.isArray(o.voters)&&o.voters.length
    ?'<div class="dpVoters"><b>가능 응답</b><br>'+o.voters.map(function(v){return e(v.nickname)}).join(' · ')+'</div>':'';
   var check=p.is_open?'<input class="dpVoteCheck" type="checkbox" value="'+e(o.id)+'" '+(o.selected?'checked':'')+'>':'';
   var adminConfirm='';
   if(admin&&['open','closed'].includes(p.status)){
    adminConfirm='<button class="btn '+(met?'primary':'outline')+'" style="width:100%;margin-top:9px" onclick="event.preventDefault();event.stopPropagation();confirmTrainingDemandOption(\''+p.id+'\',\''+o.id+'\')">'+(met?'이 날짜로 훈련 확정':'최소 인원 미달 · 확정')+'</button>';
   }
   return '<label class="dpOption '+(o.selected?'selected':'')+'">'+
    '<div class="dpOptionTop">'+check+
     '<div class="dpOptionMain"><b>'+e(optionText(o))+'</b><div class="dpOptionMeta">'+(met?'최소 진행 인원 충족':'최소 인원까지 '+Math.max(0,min-count)+'명 남음')+'</div></div>'+
     '<div class="dpCount">'+count+'명</div>'+
    '</div>'+voters+adminConfirm+
   '</label>';
  }).join('');
  var save=p.is_open?'<button class="btn primary" style="width:100%;margin-top:12px" onclick="saveTrainingDemandVote(\''+p.id+'\')">가능한 날짜 저장</button>':'';
  var adminBar='';
  if(admin&&p.status==='open')adminBar='<div class="dpAdminBar"><button class="btn outline" onclick="closeTrainingDemandPoll(\''+p.id+'\')">수요조사 마감</button><button class="btn amber" onclick="cancelTrainingDemandPoll(\''+p.id+'\')">조사 취소</button></div>';
  else if(admin&&p.status==='closed')adminBar='<div class="dpAdminBar"><button class="btn amber" onclick="cancelTrainingDemandPoll(\''+p.id+'\')">조사 취소</button></div>';
  var confirmed='';
  if(p.status==='confirmed'&&p.confirmed_activity_id){
   var co=opts.find(function(o){return o.id===p.confirmed_option_id});
   confirmed='<div class="card" style="margin-top:12px"><b>훈련 확정 완료 🎉</b><p class="meta" style="margin-top:6px">'+e(co?optionText(co):'확정 일정')+'</p><button class="btn primary" style="width:100%;margin-top:10px" onclick="openConfirmedTraining(\''+p.confirmed_activity_id+'\')">실제 참석 신청 화면 보기</button></div>';
  }
  box.innerHTML=
   '<div class="detail"><div class="detailrow"><b>수요조사</b><span>'+e(p.title)+'</span></div><div class="detailrow"><b>마감</b><span>'+e(fmtDeadline(p.deadline))+'</span></div><div class="detailrow"><b>기준</b><span>최소 '+Number(p.minimum_people||0)+'명 · 확정 후 정원 '+Number(p.capacity||0)+'명</span></div><div class="detailrow"><b>상태</b><span>'+e(statusText(p))+'</span></div></div>'+
   (p.details&&p.details.notes?'<div class="card meta" style="margin-top:10px">'+e(p.details.notes)+'</div>':'')+
   '<div class="section"><h2>가능한 날짜 <span class="meta">복수 선택 가능</span></h2><button class="link" type="button" onclick="shareTrainingDemand(\''+p.id+'\')">카톡 공유</button></div>'+
   options+save+adminBar+confirmed;
 }

 window.saveTrainingDemandVote=async function(id){
  var p=findPoll(id);if(!p||!p.is_open)return toast('이미 마감된 수요조사입니다.');
  var ids=[].slice.call(document.querySelectorAll('#trainingDemandDetailBody .dpVoteCheck:checked')).map(function(x){return x.value});
  try{
   var r=await dbClient.rpc('set_training_demand_votes_v1',{p_poll_id:id,p_option_ids:ids});
   if(r.error)throw r.error;
   toast(ids.length?'수요조사 응답을 저장했습니다.':'선택을 모두 해제했습니다.');
   await loadPolls();
  }catch(err){
   console.error('training demand vote:',err);
   toast(String(err.message||'응답 저장에 실패했습니다.').includes('poll closed')?'수요조사가 이미 마감됐습니다.':'응답 저장에 실패했습니다.');
  }
 };

 window.shareTrainingDemand=async function(id){
  var p=findPoll(id);if(!p)return;
  var url=location.origin+'/?open=demand';
  var text='🏊 TEAM EYSL '+p.title+'\n가능한 훈련 날짜를 선택해주세요.\n마감: '+fmtDeadline(p.deadline)+'\n'+url;
  try{
   if(navigator.share){await navigator.share({title:p.title,text:text,url:url});return}
   await navigator.clipboard.writeText(text);toast('공유 문구를 복사했습니다.');
  }catch(err){if(err&&err.name!=='AbortError')toast('공유하지 못했습니다.')}
 };

 window.openTrainingDemandCreate=function(){
  if(!isAdmin())return toast('관리자만 수요조사를 만들 수 있습니다.');
  injectUI();showPage('trainingDemandCreate');
  document.getElementById('dpTitle').value='';
  document.getElementById('dpMinimum').value='';
  document.getElementById('dpCapacity').value='20';
  document.getElementById('dpDeadline').value='';
  document.getElementById('dpNotes').value='';
  document.getElementById('dpOptionEditors').innerHTML='';
  optionSeq=0;
  addTrainingDemandOption();addTrainingDemandOption();addTrainingDemandOption();
 };

 window.addTrainingDemandOption=function(prefill){
  var box=document.getElementById('dpOptionEditors');if(!box)return;
  optionSeq+=1;prefill=prefill||{};
  var div=document.createElement('div');div.className='dpOptionEditor';div.dataset.seq=String(optionSeq);
  div.innerHTML=
   '<div class="dpOptionEditorHead"><b>후보 '+optionSeq+'</b><button class="dpMiniRemove" type="button" onclick="this.closest(\'.dpOptionEditor\').remove()">×</button></div>'+
   '<div class="formrow"><label>날짜</label><input class="dpDate" type="date" value="'+e(prefill.date||'')+'"></div>'+
   '<div class="grid2"><div class="formrow"><label>시작</label><input class="dpStart" type="time" value="'+e(prefill.start||'')+'"></div><div class="formrow"><label>종료</label><input class="dpEnd" type="time" value="'+e(prefill.end||'')+'"></div></div>'+
   '<div class="formrow"><label>장소 <span class="meta">(선택)</span></label><input class="dpPlace" value="'+e(prefill.place||'')+'" placeholder="예: 평화스포웰빙"></div>';
  box.appendChild(div);
 };

 window.saveTrainingDemandPoll=async function(){
  if(!isAdmin())return toast('관리자만 수요조사를 만들 수 있습니다.');
  var title=(document.getElementById('dpTitle').value||'').trim();
  var minimum=Number(document.getElementById('dpMinimum').value||0);
  var capacity=Number(document.getElementById('dpCapacity').value||0);
  var deadline=document.getElementById('dpDeadline').value;
  var notes=(document.getElementById('dpNotes').value||'').trim();
  var options=[].slice.call(document.querySelectorAll('#dpOptionEditors .dpOptionEditor')).map(function(row){
   return {date:row.querySelector('.dpDate').value,start:row.querySelector('.dpStart').value,end:row.querySelector('.dpEnd').value,place:(row.querySelector('.dpPlace').value||'').trim()};
  }).filter(function(x){return x.date});
  if(!title)return toast('수요조사 제목을 입력해주세요.');
  if(!minimum||minimum<1)return toast('최소 진행 인원을 입력해주세요.');
  if(!capacity||capacity<1)return toast('확정 후 신청 정원을 입력해주세요.');
  if(!deadline)return toast('수요조사 마감 시간을 입력해주세요.');
  if(new Date(deadline).getTime()<=Date.now())return toast('마감 시간은 현재 이후로 설정해주세요.');
  if(!options.length)return toast('후보 날짜를 1개 이상 입력해주세요.');
  for(var i=0;i<options.length;i++){
   if(options[i].start&&options[i].end&&options[i].end<=options[i].start)return toast('후보 '+(i+1)+'의 종료 시간을 확인해주세요.');
  }
  var btn=document.getElementById('dpCreateBtn');if(btn){btn.disabled=true;btn.textContent='등록 중...'}
  try{
   var r=await dbClient.rpc('create_training_demand_poll_v1',{
    p_title:title,p_deadline:new Date(deadline).toISOString(),p_minimum_people:minimum,p_capacity:capacity,p_options:options,
    p_details:{notes:notes,training_title:'팀아이슬 훈련'}
   });
   if(r.error)throw r.error;
   var id=r.data;
   try{await sendPush('all','TEAM EYSL 훈련 수요조사',title+' 수요조사가 열렸어요. 가능한 날짜를 선택해주세요.',{tag:'training-demand-'+id,url_path:'/?open=demand'})}catch(_){}
   toast('수요조사를 열었습니다.');
   await window.openTrainingDemandDetail(id);
  }catch(err){
   console.error('create training demand:',err);toast('수요조사 등록에 실패했습니다.');
  }finally{if(btn){btn.disabled=false;btn.textContent='수요조사 열기'}}
 };

 window.closeTrainingDemandPoll=async function(id){
  if(!isAdmin())return;
  if(!confirm('지금 수요조사를 마감할까요? 더 이상 응답할 수 없습니다.'))return;
  try{
   var r=await dbClient.rpc('close_training_demand_poll_v1',{p_poll_id:id});if(r.error)throw r.error;
   toast('수요조사를 마감했습니다.');await loadPolls();
  }catch(err){console.error(err);toast('수요조사 마감에 실패했습니다.')}
 };

 window.cancelTrainingDemandPoll=async function(id){
  if(!isAdmin())return;
  if(!confirm('이 수요조사를 취소할까요? 기존 응답은 보관되지만 회원 화면에서는 숨겨집니다.'))return;
  try{
   var r=await dbClient.rpc('cancel_training_demand_poll_v1',{p_poll_id:id});if(r.error)throw r.error;
   toast('수요조사를 취소했습니다.');await window.openTrainingDemand();
  }catch(err){console.error(err);toast('수요조사 취소에 실패했습니다.')}
 };

 window.confirmTrainingDemandOption=async function(pollId,optionId){
  if(!isAdmin())return;
  var p=findPoll(pollId),o=p&&p.options.find(function(x){return x.id===optionId});if(!p||!o)return;
  var below=Number(o.count||0)<Number(p.minimum_people||0);
  var msg=below
   ?'최소 진행 인원 '+p.minimum_people+'명에 못 미친 '+o.count+'명입니다. 그래도 이 날짜로 훈련을 확정할까요?'
   :'이 날짜로 훈련을 확정할까요? 확정 후 실제 참석 신청은 새로 받습니다.';
  if(!confirm(msg))return;
  try{
   var r=await dbClient.rpc('confirm_training_demand_option_v1',{p_poll_id:pollId,p_option_id:optionId,p_force:below});
   if(r.error)throw r.error;
   var d=r.data||{};
   try{
    var voterIds=[];
    (p.options||[]).forEach(function(opt){(opt.voters||[]).forEach(function(v){if(v&&v.member_id&&v.member_id!==currentUser.memberId&&voterIds.indexOf(v.member_id)<0)voterIds.push(v.member_id)})});
    await Promise.all(voterIds.map(function(memberId){
     return sendPush('member','TEAM EYSL 훈련 확정',fmtDay(d.date)+' 훈련이 확정됐어요. 앱에서 실제 참석 신청을 해주세요.',{target_member_id:memberId,tag:'training-confirmed-'+d.activity_id,url_path:'/?open=training&activity='+d.activity_id});
    }));
   }catch(_){}
   try{await loadPersistentContent()}catch(_){}
   toast('훈련을 확정하고 실제 신청을 열었습니다.');
   await loadPolls();
  }catch(err){
   console.error('confirm demand:',err);
   toast(String(err.message||'').includes('minimum_not_met')?'최소 진행 인원이 아직 부족합니다.':'훈련 확정에 실패했습니다.');
  }
 };

 window.openConfirmedTraining=async function(id){
  try{await loadPersistentContent()}catch(_){}
  if(window.trainings&&window.trainings[id]){window.selectedTrainingId=id;openTraining(id)}
  else{showPage('trainingList');toast('훈련 목록에서 확정 일정을 확인해주세요.')}
 };

 function handleDemandDeepLink(){
  try{
   var p=new URLSearchParams(location.search);
   if(p.get('open')!=='demand')return;
   var tries=0;
   var timer=setInterval(function(){
    tries+=1;
    if(window.currentUser&&currentUser.memberId){
     clearInterval(timer);window.openTrainingDemand();history.replaceState({},'',location.pathname);
    }else if(tries>20)clearInterval(timer);
   },250);
  }catch(_){}
 }

 injectUI();
 window.addEventListener('load',function(){setTimeout(function(){var c=document.getElementById('dpCreateTop');if(c)c.style.display=isAdmin()?'block':'none';handleDemandDeepLink()},450)});
 window.addEventListener('focus',function(){if(activePage()==='trainingDemand'||activePage()==='trainingDemandDetail')void loadPolls()});
 setInterval(function(){if((activePage()==='trainingDemand'||activePage()==='trainingDemandDetail')&&window.currentUser&&currentUser.memberId)void loadPolls()},15000);
})();