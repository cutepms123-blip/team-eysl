/* TEAM EYSL v200 — training application automation */
(function(){
 if(window.__EYSL_TRAINING_AUTOMATION_V200__)return;
 window.__EYSL_TRAINING_AUTOMATION_V200__=true;

 var signupWindows=[];
 var financeCache={};
 var createSeq=0;
 var noticeBusy=false;

 function e(v){return typeof window.escHtml==='function'?window.escHtml(String(v==null?'':v)):String(v==null?'':v).replace(/[&<>"']/g,function(s){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]})}
 function admin(){try{return typeof isAdminUser==='function'&&isAdminUser()}catch(_){return false}}
 function fmtDay(v){
  if(!v)return '-';
  var d=new Date(String(v)+'T00:00:00');
  if(Number.isNaN(d.getTime()))return String(v);
  return d.toLocaleDateString('ko-KR',{month:'numeric',day:'numeric',weekday:'short'});
 }
 function fmtDateTime(v){
  if(!v)return '-';
  var d=new Date(v);if(Number.isNaN(d.getTime()))return String(v);
  return d.toLocaleString('ko-KR',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false});
 }
 function money(v){return Number(v||0).toLocaleString('ko-KR')+'원'}
 function optionLabel(o){
  var s=fmtDay(o.date);
  if(o.start)s+=' · '+o.start+(o.end?'–'+o.end:'');
  if(o.place)s+=' · '+o.place;
  return s;
 }
 function activePage(){var x=document.querySelector('.page.active');return x?x.id:''}

 function syncTrainingAdminUI(){
  var list=document.getElementById('trainingList');if(!list)return;
  var head=list.querySelector('.pagehead span');if(!head)return;
  var existing=document.getElementById('trainingSignupAddBtn');
  if(admin()){
   if(!existing){
    head.innerHTML='<button id="trainingSignupAddBtn" class="circleMiniBtn" type="button" onclick="openTrainingSignupCreate()" aria-label="훈련 신청 등록">＋</button>';
   }
  }else if(existing){
   existing.remove();
  }
 }

 function inject(){
  var nav=document.querySelector('nav.nav');if(!nav)return;
  syncTrainingAdminUI();
  if(document.getElementById('trainingSignupCreate'))return;

  var style=document.createElement('style');
  style.textContent=
   '#trainingSignupWindows{margin-bottom:16px}.taHead{display:flex;justify-content:space-between;gap:10px;align-items:center;margin:4px 0 10px}.taHead h2{margin:0;font-size:15px}'+
   '.taWindow{border:1px solid #e7e8ec;border-radius:18px;background:#fff;padding:14px;margin-bottom:11px}.taWindowTop{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.taWindowTop h3{margin:0;font-size:15px}.taWindowTop p{margin:5px 0 0;font-size:10px;color:#777;line-height:1.5}'+
   '.taPill{display:inline-flex;padding:4px 8px;border-radius:999px;background:#eef8f0;font-size:10px;font-weight:800;white-space:nowrap}.taOption{display:block;border:1px solid #ececf0;border-radius:14px;padding:12px;margin-top:9px;cursor:pointer}.taOption.me{border-width:2px}.taOptionRow{display:flex;gap:9px;align-items:flex-start}.taOptionMain{flex:1;min-width:0}.taOptionMain b{font-size:12px}.taOptionMain p{font-size:10px;color:#777;margin:4px 0 0;line-height:1.5}.taCount{font-weight:900;font-size:16px;white-space:nowrap}.taOptionActions{display:flex;gap:7px;align-items:center;margin-top:10px}.taOptionActions .btn{flex:1}.taNames{font-size:10px;color:#666;line-height:1.65;padding-top:8px;margin-top:8px;border-top:1px solid #eee}'+
   '.taEditor{border:1px solid #e8e9ed;border-radius:16px;padding:12px;margin-bottom:10px;background:#fff}.taEditorTop{display:flex;justify-content:space-between;align-items:center}.taEditorTop button{border:0;background:transparent;font-size:18px}.taInline{display:flex;gap:7px;flex-wrap:wrap}.taInline>*{flex:1;min-width:110px}'+
   '.taFinance{margin-top:14px}.taFinance .detail{margin-bottom:10px}.taPayRow,.taRefundRow{display:flex;justify-content:space-between;gap:8px;align-items:center;padding:10px 0;border-bottom:1px solid #eef0f2}.taPayRow:last-child,.taRefundRow:last-child{border-bottom:0}.taPayRow b,.taRefundRow b{font-size:11px}.taPayRow p,.taRefundRow p{margin:3px 0 0;font-size:9px;color:#777}.taStatus{font-size:9px;font-weight:800;padding:4px 7px;border-radius:999px;background:#f1f2f4;white-space:nowrap}'+
   '.taNoticeOverlay{position:fixed;inset:0;background:rgba(0,0,0,.42);z-index:9999;display:none;align-items:flex-end;justify-content:center}.taNoticeBox{width:min(430px,100%);background:#fff;border-radius:22px 22px 0 0;padding:22px 18px calc(22px + env(safe-area-inset-bottom));box-shadow:0 -12px 30px rgba(0,0,0,.15)}.taNoticeBox h3{margin:0 0 8px;font-size:17px}.taNoticeBox p{white-space:pre-line;margin:0;color:#555;font-size:12px;line-height:1.6}.taNoticeActions{display:flex;gap:8px;margin-top:16px}.taNoticeActions .btn{flex:1}'+
   '.taOpsItem{padding:12px 0;border-bottom:1px solid #eceef1}.taOpsItem:last-child{border-bottom:0}.taOpsItem b{font-size:11px}.taOpsItem p{margin:4px 0 0;font-size:10px;color:#777;line-height:1.55}.taAdminRoster{margin-top:12px;padding:12px;border:1px dashed #dadde2;border-radius:14px}.taAdminRoster h3{font-size:12px;margin:0 0 8px}';
  document.head.appendChild(style);

  var list=document.getElementById('trainingList');
  if(list){
   var cards=document.getElementById('trainingCards');
   if(cards&&!document.getElementById('trainingSignupWindows')){
    var wrap=document.createElement('div');wrap.id='trainingSignupWindows';
    cards.parentNode.insertBefore(wrap,cards);
   }
   syncTrainingAdminUI();
  }

  nav.insertAdjacentHTML('beforebegin',
   '<section id="trainingSignupCreate" class="page">'+
    '<div class="pagehead"><button class="back" onclick="showPage(\'trainingList\')">←</button><h1>훈련 신청 등록</h1><span></span></div>'+
    '<div class="formrow"><label>제목</label><input id="taTitle" placeholder="예: 10월 TEAM EYSL 훈련"></div>'+
    '<div class="formrow"><label>투표 마감</label><input id="taDeadline" type="datetime-local"></div>'+
    '<div class="formrow"><label>안내 <span class="meta">(선택)</span></label><textarea id="taNotes" placeholder="훈련 관련 참고사항"></textarea></div>'+
    '<div class="section"><h2>훈련 일정</h2><button class="link" type="button" onclick="addTrainingSignupOption()">＋ 일정 추가</button></div>'+
    '<div id="taEditors"></div>'+
    '<button id="taSaveCreate" class="btn primary" style="width:100%" onclick="saveTrainingSignupWindow()">훈련 신청 열기</button>'+
   '</section>'+
   '<section id="trainingSignupDetail" class="page">'+
    '<div class="pagehead"><button class="back" onclick="showPage(\'trainingList\')">←</button><h1>훈련 상세</h1><span></span></div>'+
    '<div id="trainingSignupDetailBody"></div>'+
   '</section>'+
   '<section id="trainingOpsLog" class="page">'+
    '<div class="pagehead"><button class="back" onclick="showPage(\'home\')">←</button><h1>훈련 운영 기록</h1><span></span></div>'+
    '<div id="trainingOpsLogBody" class="card"><div class="meta">기록 불러오는 중...</div></div>'+
   '</section>'+
   '<div id="trainingNoticeOverlay" class="taNoticeOverlay"><div class="taNoticeBox"><h3 id="taNoticeTitle"></h3><p id="taNoticeBody"></p><div id="taNoticeActions" class="taNoticeActions"></div></div></div>'
  );

  var adminSub=document.getElementById('adminSub');
  if(adminSub&&!document.getElementById('taOpsMenu')){
   var item=document.createElement('div');item.id='taOpsMenu';item.className='ditem';item.textContent='훈련 운영 기록';
   item.onclick=function(){if(typeof closeDrawer==='function')closeDrawer();openTrainingOpsLog()};
   adminSub.appendChild(item);
  }
 }

 async function loadSignupWindows(){
  if(!currentUser||!currentUser.memberId)return;
  try{
   var r=await dbClient.rpc('get_training_demand_polls_v1');
   if(r.error)throw r.error;
   signupWindows=Array.isArray(r.data)?r.data:[];
   renderSignupWindows();
  }catch(err){console.error('training signup load',err)}
 }

 function renderSignupWindows(){
  var box=document.getElementById('trainingSignupWindows');if(!box)return;
  var rows=signupWindows.filter(function(p){return p.status==='open'&&p.is_open});
  if(!rows.length){box.innerHTML='';return}
  var body='<div class="taHead"><h2>신청 접수 중</h2><span class="meta">투표 마감 후 자동 확정</span></div>';
  rows.forEach(function(p){
   var opts=Array.isArray(p.options)?p.options:[];
   body+='<div class="taWindow"><div class="taWindowTop"><div><h3>'+e(p.title)+'</h3><p>투표 마감 '+e(fmtDateTime(p.deadline))+'</p></div><span class="taPill">신청 가능</span></div>';
   if(p.details&&p.details.notes)body+='<p class="meta" style="margin:9px 0 0">'+e(p.details.notes)+'</p>';
   opts.forEach(function(o){
    var count=Number(o.count||0),cap=Number(o.capacity||p.capacity||0),min=Number(o.minimum_people||p.minimum_people||0);
    var selected=!!o.selected,ord=Number(o.selected_order||0);
    var mine=selected?(ord<=cap?'참석 예정':'대기 예상 '+Math.max(1,ord-cap)+'번'):'';
    var progress=count>=min?'최소 인원 충족':'최소 인원까지 '+Math.max(0,min-count)+'명';
    var names='';
    if(admin()&&Array.isArray(o.voters)&&o.voters.length){
     names='<div class="taNames">'+o.voters.map(function(v){
      return e(v.nickname)+' <b>'+e(v.status==='participant'?'참석 예정':'대기 '+v.wait_order+'번')+'</b>';
     }).join(' · ')+'</div>';
    }
    body+='<div class="taOption '+(selected?'me':'')+'" onclick="openTrainingSignupOption(\''+e(p.id)+'\',\''+e(o.id)+'\')">'+
      '<div class="taOptionRow"><div class="taOptionMain"><b>'+e(optionLabel(o))+'</b>'+
      '<p>최소 '+min+'명 · 최대 '+cap+'명 · '+e(progress)+(mine?' · 내 상태: '+e(mine):'')+'</p></div>'+
      '<div class="taCount">'+count+'명</div></div>'+names+
      '<div class="taOptionActions"><button class="btn '+(selected?'amber':'primary')+'" onclick="event.stopPropagation();toggleTrainingSignup(\''+e(p.id)+'\',\''+e(o.id)+'\','+(selected?'true':'false')+')">'+(selected?'훈련 취소':'훈련 신청')+'</button>'+
      '<button class="btn outline" onclick="event.stopPropagation();openTrainingSignupOption(\''+e(p.id)+'\',\''+e(o.id)+'\')">상세 보기</button></div>'+
      '</div>';
   });
   if(admin())body+='<button class="btn amber" style="width:100%;margin-top:10px" onclick="cancelTrainingSignupWindow(\''+p.id+'\')">신청 모집 취소</button>';
   body+='</div>';
  });
  box.innerHTML=body;
 }

 window.toggleTrainingSignup=async function(pollId,optionId,isSelected){
  var p=signupWindows.find(function(x){return String(x.id)===String(pollId)});
  if(!p)return toast('훈련 정보를 찾을 수 없습니다.');
  var ids=(p.options||[]).filter(function(x){return x.selected}).map(function(x){return x.id});
  if(isSelected)ids=ids.filter(function(id){return String(id)!==String(optionId)});
  else if(!ids.some(function(id){return String(id)===String(optionId)}))ids.push(optionId);
  try{
   var r=await dbClient.rpc('set_training_demand_votes_v1',{p_poll_id:pollId,p_option_ids:ids});
   if(r.error)throw r.error;
   toast(isSelected?'훈련 신청을 취소했습니다.':'훈련 신청이 완료됐습니다.');
   await loadSignupWindows();
   if(activePage()==='trainingSignupDetail')openTrainingSignupOption(pollId,optionId);
  }catch(err){
   console.error(err);
   toast(String(err.message||'').includes('poll closed')?'투표가 이미 마감됐습니다.':'훈련 신청 처리에 실패했습니다.');
  }
 };

 window.openTrainingSignupOption=function(pollId,optionId){
  var p=signupWindows.find(function(x){return String(x.id)===String(pollId)});
  var o=p&&(p.options||[]).find(function(x){return String(x.id)===String(optionId)});
  if(!p||!o)return toast('훈련 정보를 찾을 수 없습니다.');
  var count=Number(o.count||0),cap=Number(o.capacity||p.capacity||0),min=Number(o.minimum_people||p.minimum_people||0);
  var selected=!!o.selected,ord=Number(o.selected_order||0);
  var mine=selected?(ord<=cap?'참석 예정':'대기 예상 '+Math.max(1,ord-cap)+'번'):'미신청';
  var voters='';
  if(admin()&&Array.isArray(o.voters)){
   voters='<div class="section"><h2>신청 현황</h2><span class="meta">'+count+'명</span></div><div class="card">'+
    (o.voters.length?o.voters.map(function(v){
      return '<div class="taPayRow"><div><b>'+e(v.nickname)+'</b><p>'+e(v.status==='participant'?'참석 예정':'대기 '+v.wait_order+'번')+'</p></div><span class="taStatus">'+e(v.order)+'번째 신청</span></div>';
    }).join(''):'<div class="meta">아직 신청자가 없습니다.</div>')+'</div>';
  }
  showPage('trainingSignupDetail');
  var body=document.getElementById('trainingSignupDetailBody');if(!body)return;
  body.innerHTML='<div class="detail">'+
    '<div class="detailrow"><b>훈련</b><span>'+e(p.title)+'</span></div>'+
    '<div class="detailrow"><b>일정</b><span>'+e(fmtDay(o.date))+(o.start?' · '+e(o.start)+(o.end?'–'+e(o.end):''):'')+'</span></div>'+
    '<div class="detailrow"><b>장소</b><span>'+e(o.place||'-')+'</span></div>'+
    '<div class="detailrow"><b>최소 인원</b><span>'+min+'명</span></div>'+
    '<div class="detailrow"><b>최대 인원</b><span>'+cap+'명</span></div>'+
    '<div class="detailrow"><b>현재 신청</b><span>'+count+'명</span></div>'+
    '<div class="detailrow"><b>투표 마감</b><span>'+e(fmtDateTime(p.deadline))+'</span></div>'+
    '<div class="detailrow"><b>내 상태</b><span>'+e(mine)+'</span></div>'+
   '</div>'+
   ((p.details&&p.details.notes)?'<div class="section"><h2>안내</h2></div><div class="card"><p style="margin:0;white-space:pre-line">'+e(p.details.notes)+'</p></div>':'')+
   '<div class="actions" style="margin-top:14px"><button class="btn '+(selected?'amber':'primary')+'" style="width:100%" onclick="toggleTrainingSignup(\''+e(p.id)+'\',\''+e(o.id)+'\','+(selected?'true':'false')+')">'+(selected?'훈련 취소':'훈련 신청')+'</button></div>'+
   voters;
 };


 window.openTrainingSignupCreate=function(){
  if(!admin())return toast('관리자만 등록할 수 있습니다.');
  inject();showPage('trainingSignupCreate');
  document.getElementById('taTitle').value='';
  document.getElementById('taDeadline').value='';
  document.getElementById('taNotes').value='';
  document.getElementById('taEditors').innerHTML='';
  createSeq=0;addTrainingSignupOption();addTrainingSignupOption();
 };

 window.addTrainingSignupOption=function(){
  var box=document.getElementById('taEditors');if(!box)return;
  createSeq++;
  var d=document.createElement('div');d.className='taEditor';
  d.innerHTML='<div class="taEditorTop"><b>일정 '+createSeq+'</b><button type="button" onclick="this.closest(\'.taEditor\').remove()">×</button></div>'+
   '<div class="formrow"><label>날짜</label><input class="taDate" type="date"></div>'+
   '<div class="taInline"><div class="formrow"><label>시작</label><input class="taStart" type="time"></div><div class="formrow"><label>종료</label><input class="taEnd" type="time"></div></div>'+
   '<div class="formrow"><label>장소 <span class="meta">(선택)</span></label><input class="taPlace" placeholder="예: 남부터미널"></div>'+
   '<div class="taInline"><div class="formrow"><label>최소 인원</label><input class="taMin" type="number" min="1" inputmode="numeric" placeholder="예: 8"></div><div class="formrow"><label>최대 인원</label><input class="taCap" type="number" min="1" inputmode="numeric" placeholder="예: 15"></div></div>';
  box.appendChild(d);
 };

 window.saveTrainingSignupWindow=async function(){
  if(!admin())return;
  var title=(document.getElementById('taTitle').value||'').trim();
  var deadline=document.getElementById('taDeadline').value;
  var notes=(document.getElementById('taNotes').value||'').trim();
  var options=[].slice.call(document.querySelectorAll('#taEditors .taEditor')).map(function(row){
   return {
    date:row.querySelector('.taDate').value,
    start:row.querySelector('.taStart').value,
    end:row.querySelector('.taEnd').value,
    place:(row.querySelector('.taPlace').value||'').trim(),
    minimum_people:Number(row.querySelector('.taMin').value||0),
    capacity:Number(row.querySelector('.taCap').value||0)
   };
  }).filter(function(x){return x.date});
  if(!title)return toast('제목을 입력해주세요.');
  if(!deadline||new Date(deadline).getTime()<=Date.now())return toast('투표 마감 시간을 확인해주세요.');
  if(!options.length)return toast('훈련 일정을 1개 이상 입력해주세요.');
  for(var i=0;i<options.length;i++){
   var x=options[i];
   if(x.start&&x.end&&x.end<=x.start)return toast('종료 시간을 확인해주세요.');
   if(!x.minimum_people||x.minimum_people<1)return toast((i+1)+'번째 훈련의 최소 인원을 입력해주세요.');
   if(!x.capacity||x.capacity<x.minimum_people)return toast((i+1)+'번째 훈련의 최대 인원을 확인해주세요.');
  }
  var minimum=Math.min.apply(null,options.map(function(x){return x.minimum_people}));
  var capacity=Math.max.apply(null,options.map(function(x){return x.capacity}));
  var btn=document.getElementById('taSaveCreate');btn.disabled=true;btn.textContent='등록 중...';
  try{
   var r=await dbClient.rpc('create_training_demand_poll_v1',{
    p_title:title,p_deadline:new Date(deadline).toISOString(),p_minimum_people:minimum,p_capacity:capacity,p_options:options,
    p_details:{notes:notes,training_title:title,registration_mode:'auto_signup'}
   });
   if(r.error)throw r.error;
   try{await sendPush('all','TEAM EYSL 훈련 신청',title+' 투표가 열렸어요. 참석할 훈련을 신청해주세요.',{tag:'training-signup-'+r.data,url_path:'/?open=training'})}catch(_){}
   toast('훈련 투표를 열었습니다.');
   await loadSignupWindows();showPage('trainingList');
  }catch(err){console.error(err);toast('훈련 투표 등록에 실패했습니다.')}
  finally{btn.disabled=false;btn.textContent='훈련 신청 열기'}
 };



 window.cancelTrainingSignupWindow=async function(id){
  if(!admin())return;
  if(!confirm('이 훈련 신청 모집을 취소할까요?'))return;
  try{
   var r=await dbClient.rpc('cancel_training_demand_poll_v1',{p_poll_id:id});if(r.error)throw r.error;
   toast('훈련 신청 모집을 취소했습니다.');await loadSignupWindows();
  }catch(err){console.error(err);toast('취소 처리에 실패했습니다.')}
 };

 async function loadFinance(id){
  try{
   var r=await dbClient.rpc('get_training_finance_v1',{p_activity_id:id});
   if(r.error)throw r.error;financeCache[id]=r.data||{};return financeCache[id];
  }catch(err){console.error('training finance',err);return null}
 }
 function payStatus(v){
  return {unpaid:'미입금',paid:'입금완료',refund_waiting:'환불대기',replacement_due:'기존 참가자에게 입금 필요',refunded:'환불완료'}[v]||v||'-';
 }
 function refundStatus(v){
  return {waiting_replacement:'대체 참가자 대기',matched:'입금대기',replacement_paid:'입금확인 대기',refunded:'정산완료'}[v]||v||'-';
 }

 async function renderFinance(id){
  var host=document.getElementById('trainingDetailBody');if(!host)return;
  var old=document.getElementById('taFinancePanel');if(old)old.remove();
  var data=await loadFinance(id);if(!data||activePage()!=='trainingDetail'||String(selectedTrainingId)!==String(id))return;
  var fee=data.fee;
  var div=document.createElement('div');div.id='taFinancePanel';div.className='taFinance';

  if(admin()){
   if(!fee){
    div.innerHTML='<div class="section"><h2>참가비 안내</h2><span class="meta">한 번 확정하면 변경하지 않아요</span></div>'+
     '<div class="card"><div class="formrow"><label>참가비</label><input id="taFeeAmount" type="number" min="1" inputmode="numeric" placeholder="예: 20000"></div>'+
     '<div class="formrow"><label>입금 기한</label><input id="taFeeDeadline" type="datetime-local"></div>'+
     '<div class="formrow"><label>은행</label><input id="taFeeBank" placeholder="예: 카카오뱅크"></div>'+
     '<div class="formrow"><label>계좌번호</label><input id="taFeeAccount" inputmode="numeric"></div>'+
     '<div class="formrow"><label>예금주</label><input id="taFeeHolder"></div>'+
     '<button class="btn primary" style="width:100%" onclick="announceTrainingFee(\''+id+'\')">참가비 안내 발송</button></div>';
   }else{
    var pays=Array.isArray(data.payments)?data.payments:[];
    var refs=Array.isArray(data.refunds)?data.refunds:[];
    var payRows=pays.map(function(p){
     var can=p.status==='unpaid'||p.status==='paid';
     return '<div class="taPayRow"><div><b>'+e(p.nickname||'-')+'</b><p>'+money(p.amount_due)+' · '+e(payStatus(p.status))+'</p></div>'+
      (can?'<button class="btn '+(p.status==='paid'?'outline':'primary')+'" onclick="setTrainingPayment(\''+id+'\',\''+p.member_id+'\','+(p.status==='paid'?'false':'true')+')">'+(p.status==='paid'?'미입금으로':'입금완료')+'</button>':'<span class="taStatus">'+e(payStatus(p.status))+'</span>')+'</div>';
    }).join('');
    var refRows=refs.map(function(r){
     var names=e(r.cancelled_nickname||'-')+(r.replacement_nickname?' ← '+e(r.replacement_nickname):'');
     return '<div class="taRefundRow"><div><b>'+names+'</b><p>'+money(r.amount)+' · '+e(refundStatus(r.status))+'</p></div><span class="taStatus">'+e(refundStatus(r.status))+'</span></div>';
    }).join('');
    div.innerHTML='<div class="section"><h2>참가비 · 정산</h2><span class="meta">고정 금액</span></div>'+
     '<div class="detail"><div class="detailrow"><b>참가비</b><span>'+money(fee.amount)+'</span></div><div class="detailrow"><b>입금기한</b><span>'+e(fmtDateTime(fee.payment_deadline))+'</span></div><div class="detailrow"><b>입금계좌</b><span>'+e(fee.bank_name)+' '+e(fee.account_number)+' · '+e(fee.account_holder)+'</span></div></div>'+
     '<div class="section"><h2>입금 현황</h2></div><div class="card">'+(payRows||'<div class="meta">입금 대상이 없습니다.</div>')+'</div>'+
     '<div class="section"><h2>환불 진행상황</h2></div><div class="card">'+(refRows||'<div class="meta">진행 중인 환불이 없습니다.</div>')+'</div>';
   }
  }else{
   var myPay=(Array.isArray(data.payments)?data.payments:[])[0]||null;
   var myRefs=Array.isArray(data.refunds)?data.refunds:[];
   if(fee||myPay||myRefs.length){
    var feeHtml=fee?'<div class="detail"><div class="detailrow"><b>참가비</b><span>'+money(fee.amount)+'</span></div><div class="detailrow"><b>입금기한</b><span>'+e(fmtDateTime(fee.payment_deadline))+'</span></div><div class="detailrow"><b>입금계좌</b><span>'+e(fee.bank_name)+' '+e(fee.account_number)+' · '+e(fee.account_holder)+'</span></div></div>':'';
    var payHtml=myPay?'<div class="card" style="margin-top:10px"><b>내 정산 상태</b><p class="meta" style="margin-top:5px">'+e(payStatus(myPay.status))+' · '+money(myPay.amount_due)+'</p></div>':'';
    var refHtml=myRefs.map(function(r){
     var action='';
     if(r.replacement_member_id===currentUser.memberId&&r.status==='matched'){
      action='<button class="btn primary" style="width:100%;margin-top:9px" onclick="markRefundSent(\''+r.id+'\',\''+id+'\')">입금 완료</button>';
     }else if(r.cancelled_member_id===currentUser.memberId&&r.status==='replacement_paid'){
      action='<button class="btn primary" style="width:100%;margin-top:9px" onclick="confirmRefundReceived(\''+r.id+'\',\''+id+'\')">입금 확인</button>';
     }
     var acct=(r.replacement_member_id===currentUser.memberId&&r.refund_account_number)?'<p class="meta">'+e(r.refund_bank_name)+' '+e(r.refund_account_number)+' · '+e(r.refund_account_holder)+'</p>':'';
     return '<div class="card" style="margin-top:10px"><b>환불 연결 · '+e(refundStatus(r.status))+'</b><p class="meta" style="margin-top:5px">'+money(r.amount)+'</p>'+acct+action+'</div>';
    }).join('');
    div.innerHTML='<div class="section"><h2>참가비 · 정산</h2></div>'+feeHtml+payHtml+refHtml;
   }
  }
  if(div.innerHTML)host.appendChild(div);
 }

 window.announceTrainingFee=async function(id){
  var amount=Number(document.getElementById('taFeeAmount').value||0);
  var deadline=document.getElementById('taFeeDeadline').value;
  var bank=(document.getElementById('taFeeBank').value||'').trim();
  var account=(document.getElementById('taFeeAccount').value||'').trim();
  var holder=(document.getElementById('taFeeHolder').value||'').trim();
  if(!amount||!deadline||!bank||!account||!holder)return toast('금액, 기한, 입금계좌를 모두 입력해주세요.');
  if(!confirm(money(amount)+'으로 참가비를 확정하고 참석자에게 안내할까요? 확정 후 금액은 변경하지 않습니다.'))return;
  try{
   var r=await dbClient.rpc('announce_training_fee_v1',{p_activity_id:id,p_amount:amount,p_payment_deadline:new Date(deadline).toISOString(),p_bank_name:bank,p_account_number:account,p_account_holder:holder});
   if(r.error)throw r.error;
   try{
    var pp=await dbClient.from('activity_applications').select('member_id').eq('activity_id',id).eq('application_type','participant').not('member_id','is',null);
    await Promise.all((pp.data||[]).map(function(x){return sendPush('member','TEAM EYSL 훈련 참가비 안내',money(amount)+' · '+fmtDateTime(new Date(deadline).toISOString())+'까지 · '+bank+' '+account+' · '+holder,{target_member_id:x.member_id,tag:'training-fee-'+id,url_path:'/?open=training&activity='+id})}));
   }catch(_){}
   toast('참가비 안내를 발송했습니다.');renderFinance(id);
  }catch(err){console.error(err);toast(String(err.message||'').includes('fee_already_announced')?'이미 참가비가 확정된 훈련입니다.':'참가비 안내에 실패했습니다.')}
 };

 window.setTrainingPayment=async function(id,memberId,paid){
  try{
   var r=await dbClient.rpc('admin_mark_training_payment_v1',{p_activity_id:id,p_member_id:memberId,p_paid:!!paid});if(r.error)throw r.error;
   toast(paid?'입금완료로 변경했습니다.':'미입금으로 변경했습니다.');renderFinance(id);
  }catch(err){console.error(err);toast('입금 상태 변경에 실패했습니다.')}
 };

 async function refundAccount(){
  var bank=prompt('환불받을 은행명을 입력해주세요.');if(bank===null)return null;
  var account=prompt('환불받을 계좌번호를 입력해주세요.');if(account===null)return null;
  var holder=prompt('예금주를 입력해주세요.');if(holder===null)return null;
  if(!bank.trim()||!account.trim()||!holder.trim()){toast('환불 계좌 정보를 모두 입력해주세요.');return null}
  return {bank:bank.trim(),account:account.trim(),holder:holder.trim()};
 }

 window.applyTraining=async function(id){
  var t=trainings[id];if(!t)return toast('훈련 정보를 찾을 수 없습니다.');
  if(activityHasStarted(t))return toast('종료된 훈련은 신청할 수 없습니다.');
  try{
   var r=await dbClient.rpc('apply_training_v3',{p_activity_id:id,p_details:{}});if(r.error)throw r.error;
   if(Number(r.data&&r.data.offered_count||0)>0)try{await sendPush('waitlist_offer','','',{activity_id:id})}catch(_){}
   if(r.data&&r.data.refund_id){
    try{
     var fdata=await loadFinance(id);
     var ref=(fdata&&fdata.refunds||[]).find(function(x){return x.id===r.data.refund_id});
     if(ref&&ref.cancelled_member_id)await sendPush('member','TEAM EYSL 환불 연결','새 참가자가 빈자리에 연결됐어요. 입금 완료 안내를 기다려주세요.',{target_member_id:ref.cancelled_member_id,tag:'refund-match-'+ref.id,url_path:'/?open=training&activity='+id});
     await sendPush('operators','TEAM EYSL 운영 알림',currentUser.nickname+'님이 빈자리에 추가 참가했고 기존 환불대기자와 자동 연결됐습니다.',{tag:'refund-match-admin-'+id,url_path:'/?open=training&activity='+id});
    }catch(_){}
   }else if(r.data&&r.data.status==='waitlist'&&Number(r.data.wait_order||0)===1){
    try{await sendPush('operators','TEAM EYSL 운영 알림',t.title+' 정원이 찼습니다. '+currentUser.nickname+'님이 대기 1번으로 등록됐습니다.',{tag:'training-full-'+id,url_path:'/?open=training&activity='+id})}catch(_){}
   }
   await reloadApplicationsUI();openTraining(id);setTimeout(surfaceNotice,120);
   if(r.data&&r.data.status==='participant')toast('훈련 신청완료');
   else toast('대기 신청완료'+(r.data&&r.data.wait_order?' · '+r.data.wait_order+'번':''));
  }catch(err){console.error(err);toast(String(err.message||'').includes('activity_started')?'종료된 훈련은 신청할 수 없습니다.':'신청 저장에 실패했습니다.')}
 };

 window.cancelTraining=async function(id){
  var t=trainings[id];if(!t)return toast('훈련 정보를 찾을 수 없습니다.');
  if(activityHasStarted(t))return toast('종료된 훈련은 신청 상태를 변경할 수 없습니다.');
  if(!confirm('훈련 참석을 취소할까요? 참가비를 이미 낸 경우 대체 참가자가 생기면 환불이 연결됩니다.'))return;
  async function run(a){
   return dbClient.rpc('cancel_training_v4',{
    p_activity_id:id,
    p_refund_bank_name:a?a.bank:null,
    p_refund_account_number:a?a.account:null,
    p_refund_account_holder:a?a.holder:null
   });
  }
  try{
   var res=await run(null);
   if(res.error&&String(res.error.message||'').includes('refund_account_required')){
    var acct=await refundAccount();if(!acct)return;
    res=await run(acct);
   }
   if(res.error)throw res.error;
   if(!res.data||!res.data.ok)return toast('취소할 신청 내역이 없습니다.');
   if(Number(res.data.offered_count||0)>0)try{await sendPush('waitlist_offer','','',{activity_id:id})}catch(_){}
   try{await sendPush('operators','TEAM EYSL 운영 알림',currentUser.nickname+'님이 '+t.title+' 참석을 취소했습니다.'+(res.data.refund_waiting?' 환불대기로 등록됐습니다.':''),{tag:'training-cancel-'+id,url_path:'/?open=training&activity='+id})}catch(_){}
   await reloadApplicationsUI();
   toast(res.data.refund_waiting?'참석을 취소했습니다. 대체 참가자가 생기면 환불 안내가 연결됩니다.':'훈련 참석을 취소했습니다.');
   if(activePage()==='trainingDetail')openTraining(id);else renderTrainingList();
  }catch(err){
   console.error(err);
   if(String(err.message||'').includes('refund_transfer_pending'))return toast('이미 대체 참가자가 입금 완료로 표시한 환불건이 있어 관리자 확인이 필요합니다.');
   toast('훈련 참석 취소에 실패했습니다.');
  }
 };

 window.respondWaitlistOffer=async function(activityId,action){
  var t=trainings[activityId];
  if(t&&activityHasStarted(t))return toast('종료된 훈련은 대기 응답을 변경할 수 없습니다.');
  if(action==='decline'&&!confirm('이번 기회를 넘기고 다음 대기자에게 전달할까요?'))return;
  try{
   var r=await dbClient.rpc('respond_waitlist_offer_v3',{p_activity_id:activityId,p_action:action});if(r.error)throw r.error;
   if(Number(r.data&&r.data.offered_count||0)>0)try{await sendPush('waitlist_offer','','',{activity_id:activityId})}catch(_){}
   if(action==='accept'&&r.data&&r.data.refund_id){
    try{
     var f=await loadFinance(activityId);
     var ref=(f&&f.refunds||[]).find(function(x){return x.id===r.data.refund_id});
     if(ref&&ref.cancelled_member_id)await sendPush('member','TEAM EYSL 환불 연결','대체 참가자가 확정됐어요. 입금 완료 안내를 기다려주세요.',{target_member_id:ref.cancelled_member_id,tag:'refund-match-'+ref.id,url_path:'/?open=training&activity='+activityId});
    }catch(_){}
   }
   try{await sendPush('operators','TEAM EYSL 운영 알림',currentUser.nickname+'님이 '+(action==='accept'?'대기 승급을 수락했습니다.':'대기 승급을 거절했습니다.'),{tag:'wait-response-'+activityId,url_path:'/?open=training&activity='+activityId})}catch(_){}
   await reloadApplicationsUI();
   if(!r.data.ok&&r.data.status==='expired'){showPage('trainingList');return toast('응답 시간이 지나 다음 대기자에게 넘어갔습니다.')}
   if(action==='accept'){openTraining(activityId);setTimeout(surfaceNotice,120);toast('참석이 확정됐습니다.')}
   else{showPage('trainingList');toast(Number(r.data.offered_count||0)>0?'다음 대기자에게 기회를 넘겼습니다.':'다음 대기자가 없어 빈자리로 전환됐습니다.')}
  }catch(err){console.error(err);toast('대기 응답 처리에 실패했습니다.')}
 };

 window.markRefundSent=async function(refundId,activityId){
  if(!confirm('실제로 입금한 뒤 눌러주세요. 입금 완료로 표시할까요?'))return;
  try{
   var before=await loadFinance(activityId);
   var ref=(before.refunds||[]).find(function(x){return x.id===refundId});
   var r=await dbClient.rpc('mark_training_refund_payment_sent_v1',{p_refund_id:refundId});if(r.error)throw r.error;
   if(ref&&ref.cancelled_member_id)try{await sendPush('member','TEAM EYSL 환불 입금 확인','대체 참가자가 참가비 입금 완료로 표시했습니다. 실제 입금을 확인해주세요.',{target_member_id:ref.cancelled_member_id,tag:'refund-check-'+refundId,url_path:'/?open=training&activity='+activityId})}catch(_){}
   try{await sendPush('operators','TEAM EYSL 운영 알림',currentUser.nickname+'님이 환불 연결 참가비를 입금 완료로 표시했습니다.',{tag:'refund-sent-'+refundId,url_path:'/?open=training&activity='+activityId})}catch(_){}
   toast('입금 완료로 표시했습니다. 기존 참가자의 확인을 기다립니다.');renderFinance(activityId);
  }catch(err){console.error(err);toast('입금 완료 처리에 실패했습니다.')}
 };

 window.confirmRefundReceived=async function(refundId,activityId){
  if(!confirm('실제 입금을 확인하셨나요? 확인 완료로 처리할까요?'))return;
  try{
   var before=await loadFinance(activityId);
   var ref=(before.refunds||[]).find(function(x){return x.id===refundId});
   var r=await dbClient.rpc('confirm_training_refund_received_v1',{p_refund_id:refundId});if(r.error)throw r.error;
   if(ref&&ref.replacement_member_id)try{await sendPush('member','TEAM EYSL 참가비 정산 완료','기존 참가자가 입금을 확인했습니다. 참가비 정산이 완료됐어요.',{target_member_id:ref.replacement_member_id,tag:'refund-done-'+refundId,url_path:'/?open=training&activity='+activityId})}catch(_){}
   try{await sendPush('operators','TEAM EYSL 운영 알림',currentUser.nickname+'님이 환불 입금을 확인했습니다. 정산이 완료됐습니다.',{tag:'refund-done-admin-'+refundId,url_path:'/?open=training&activity='+activityId})}catch(_){}
   toast('환불 확인이 완료됐습니다.');renderFinance(activityId);
  }catch(err){console.error(err);toast('환불 확인 처리에 실패했습니다.')}
 };

 window.adminAddTrainingParticipant=async function(id){
  var name=prompt('추가할 참가자의 닉네임을 입력해주세요.');if(!name||!name.trim())return;
  try{
   var r=await dbClient.rpc('admin_add_training_participant_v1',{p_activity_id:id,p_nickname:name.trim()});if(r.error)throw r.error;
   try{await sendPush('operators','TEAM EYSL 운영 알림','관리자가 '+r.data.nickname+'님을 참가 명단에 추가했습니다.',{tag:'admin-add-'+id,url_path:'/?open=training&activity='+id})}catch(_){}
   await loadPersistentContent();toast(r.data.nickname+'님을 명단에 추가했습니다.');openAttEvent(id);
  }catch(err){console.error(err);toast(String(err.message||'').includes('member_or_roster_not_found')?'회원/팀원 목록에서 닉네임을 찾지 못했습니다.':'참가자 추가에 실패했습니다.')}
 };

 window.adminRemoveTrainingParticipant=async function(id){
  var name=prompt('명단에서 제외할 참가자의 닉네임을 입력해주세요.');if(!name||!name.trim())return;
  async function run(a){return dbClient.rpc('admin_remove_training_participant_v1',{p_activity_id:id,p_nickname:name.trim(),p_refund_bank_name:a?a.bank:null,p_refund_account_number:a?a.account:null,p_refund_account_holder:a?a.holder:null})}
  try{
   var r=await run(null);
   if(r.error&&String(r.error.message||'').includes('refund_account_required')){
    var acct=await refundAccount();if(!acct)return;r=await run(acct);
   }
   if(r.error)throw r.error;
   if(Number(r.data.offered_count||0)>0)try{await sendPush('waitlist_offer','','',{activity_id:id})}catch(_){}
   await loadPersistentContent();toast(r.data.nickname+'님을 명단에서 제외했습니다.');openAttEvent(id);
  }catch(err){console.error(err);toast('명단 제외에 실패했습니다.')}
 };

 async function surfaceNotice(){
  if(noticeBusy||!currentUser||!currentUser.memberId)return;
  noticeBusy=true;
  try{
   var r=await dbClient.from('member_notifications').select('id,type,title,body,payload,created_at').eq('member_id',currentUser.memberId).is('read_at',null).order('created_at',{ascending:true}).limit(1);
   if(r.error)throw r.error;
   var n=(r.data||[])[0];if(!n)return;
   var ov=document.getElementById('trainingNoticeOverlay');if(!ov)return;
   document.getElementById('taNoticeTitle').textContent=n.title||'TEAM EYSL';
   document.getElementById('taNoticeBody').textContent=n.body||'';
   var acts=document.getElementById('taNoticeActions');
   var action='';
   if(n.type==='training_refund_payment_due'&&n.payload&&n.payload.refund_id){
    action='<button class="btn primary" onclick="notificationRefundSent(\''+n.id+'\',\''+n.payload.refund_id+'\',\''+(n.payload.activity_id||'')+'\')">입금 완료</button>';
   }else if(n.type==='training_refund_confirm_required'&&n.payload&&n.payload.refund_id){
    action='<button class="btn primary" onclick="notificationRefundReceived(\''+n.id+'\',\''+n.payload.refund_id+'\',\''+(n.payload.activity_id||'')+'\')">입금 확인</button>';
   }
   acts.innerHTML=action+'<button class="btn outline" onclick="closeTrainingNotification(\''+n.id+'\')">확인</button>';
   ov.style.display='flex';
  }catch(err){console.error('member notification',err)}
  finally{noticeBusy=false}
 }

 async function markNoticeRead(id){
  try{await dbClient.from('member_notifications').update({read_at:new Date().toISOString()}).eq('id',id).eq('member_id',currentUser.memberId)}catch(_){}
 }
 window.closeTrainingNotification=async function(id){
  await markNoticeRead(id);
  var ov=document.getElementById('trainingNoticeOverlay');if(ov)ov.style.display='none';
  setTimeout(surfaceNotice,150);
 };
 window.notificationRefundSent=async function(nid,rid,aid){
  await markRefundSent(rid,aid);await markNoticeRead(nid);
  var ov=document.getElementById('trainingNoticeOverlay');if(ov)ov.style.display='none';setTimeout(surfaceNotice,150);
 };
 window.notificationRefundReceived=async function(nid,rid,aid){
  await confirmRefundReceived(rid,aid);await markNoticeRead(nid);
  var ov=document.getElementById('trainingNoticeOverlay');if(ov)ov.style.display='none';setTimeout(surfaceNotice,150);
 };

 window.openTrainingOpsLog=async function(){
  if(!admin())return toast('관리자만 확인할 수 있습니다.');
  showPage('trainingOpsLog');
  var box=document.getElementById('trainingOpsLogBody');box.innerHTML='<div class="meta">기록 불러오는 중...</div>';
  try{
   var r=await dbClient.from('admin_notifications').select('id,type,member_id,payload,is_read,created_at').like('type','training_%').order('created_at',{ascending:false}).limit(200);
   if(r.error)throw r.error;
   var rows=r.data||[];
   box.innerHTML=rows.length?rows.map(function(x){
    return '<div class="taOpsItem"><b>'+e(x.payload&&x.payload.message||x.type)+'</b><p>'+e(fmtDateTime(x.created_at))+' · '+e(x.type)+'</p></div>';
   }).join(''):'<div class="meta">아직 훈련 운영 기록이 없습니다.</div>';
  }catch(err){console.error(err);box.innerHTML='<div class="meta">기록을 불러오지 못했습니다.</div>'}
 };

 function wrapCore(){
  if(typeof window.applyRole==='function'&&!window.applyRole.__ta200){
   var oldApplyRole=window.applyRole;
   window.applyRole=function(){
    var r=oldApplyRole.apply(this,arguments);
    setTimeout(function(){
     syncTrainingAdminUI();
     if(currentUser&&currentUser.memberId&&admin())loadSignupWindows();
    },0);
    return r;
   };
   window.applyRole.__ta200=true;
  }
  if(typeof window.showPage==='function'&&!window.showPage.__ta200){
   var oldShow=window.showPage;
   window.showPage=function(id){
    var r=oldShow.apply(this,arguments);
    if(id==='trainingList')setTimeout(function(){syncTrainingAdminUI();loadSignupWindows()},0);
    return r;
   };window.showPage.__ta200=true;
  }
  if(typeof window.openTraining==='function'&&!window.openTraining.__ta200){
   var oldOpen=window.openTraining;
   window.openTraining=function(id){
    var r=oldOpen.apply(this,arguments);
    setTimeout(function(){renderFinance(id)},0);
    return r;
   };window.openTraining.__ta200=true;
  }
  if(typeof window.renderAttDetail==='function'&&!window.renderAttDetail.__ta200){
   var oldAtt=window.renderAttDetail;
   window.renderAttDetail=function(ev){
    var r=oldAtt.apply(this,arguments);
    if(ev&&ev.type==='training'&&admin()){
     var body=document.getElementById('attAdminDetailBody');
     if(body&&!document.getElementById('taAdminRoster')){
      var d=document.createElement('div');d.id='taAdminRoster';d.className='taAdminRoster';
      d.innerHTML='<h3>참가 명단 수동 수정</h3><div class="actions"><button class="btn outline" onclick="adminAddTrainingParticipant(\''+ev.id+'\')">＋ 참가자 추가</button><button class="btn amber" onclick="adminRemoveTrainingParticipant(\''+ev.id+'\')">명단에서 제외</button></div>';
      body.appendChild(d);
     }
    }
    return r;
   };window.renderAttDetail.__ta200=true;
  }
 }

 function deepLink(){
  try{
   var q=new URLSearchParams(location.search);if(q.get('open')!=='training')return;
   var aid=q.get('activity');
   var tries=0,t=setInterval(function(){
    tries++;
    if(currentUser&&currentUser.memberId){
     clearInterval(t);
     if(aid&&trainings&&trainings[aid])openTraining(aid);else showPage('trainingList');
     history.replaceState({},'',location.pathname);
    }else if(tries>30)clearInterval(t);
   },250);
  }catch(_){}
 }

 inject();wrapCore();
 window.addEventListener('load',function(){
  setTimeout(function(){inject();wrapCore();syncTrainingAdminUI();if(currentUser&&currentUser.memberId){loadSignupWindows();surfaceNotice();deepLink()}},550);
 });
 window.addEventListener('focus',function(){
  if(currentUser&&currentUser.memberId){if(activePage()==='trainingList')loadSignupWindows();surfaceNotice()}
 });
 document.addEventListener('visibilitychange',function(){
  if(document.visibilityState==='visible'&&currentUser&&currentUser.memberId){if(activePage()==='trainingList')loadSignupWindows();surfaceNotice()}
 });
 setInterval(function(){if(currentUser&&currentUser.memberId){if(activePage()==='trainingList')loadSignupWindows();surfaceNotice()}},30000);
})();