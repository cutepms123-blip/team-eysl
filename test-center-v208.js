/* TEAM EYSL v208 — canonical TEST CENTER */
(function(){
 if(window.__EYSL_TEST_CENTER_V208__)return;
 window.__EYSL_TEST_CENTER_V208__=true;

 const KEY="eysl_test_center_v208";
 const blank=()=>({
  active:false,scenario:null,centerCategory:"all",capacity:2,fee:20000,
  participants:[],waitlist:[],refunds:[],notification:null,
  pushEnabled:false,logs:[]
 });
 let state=read();

 function read(){
  try{
   const v=JSON.parse(localStorage.getItem(KEY)||"null");
   return v&&typeof v==="object"?Object.assign(blank(),v):blank();
  }catch(_){return blank()}
 }
 function write(){localStorage.setItem(KEY,JSON.stringify(state));sync()}
 function actualMaster(){try{return !!currentUser&&currentUser.actualRole==="master_admin"}catch(_){return false}}
 function memberView(){try{return actualMaster()&&typeof getEyslProfileMode==="function"&&getEyslProfileMode()==="member"}catch(_){return false}}
 function me(){try{return currentUser&&currentUser.nickname?currentUser.nickname:"민선"}catch(_){return "민선"}}
 function esc(v){return typeof escHtml==="function"?escHtml(String(v??"")):String(v??"")}
 function money(v){return Number(v||0).toLocaleString("ko-KR")+"원"}
 function time(){return new Date().toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit"})}
 function addLog(msg){state.logs.unshift({at:time(),message:msg});state.logs=state.logs.slice(0,40)}
 function normalize(){state.waitlist.forEach((x,i)=>x.order=i+1)}
 function person(name,paid){return {name,paid:!!paid}}
 function waiter(name){return {name,order:0,offerStatus:"none"}}
 function label(){
  return ({
   promote:"대기 승급 · 수락",
   decline:"거절 후 다음 대기자",
   no_wait:"대기자 없음",
   expiry:"24시간 응답 만료",
   refund_wait:"유료 참가자 취소 · 환불대기",
   refund_match:"나중에 참가 · 환불 자동매칭"
  })[state.scenario]||"대기 테스트";
 }

 async function pushSelf(title,body){
  if(!state.pushEnabled||!actualMaster()||typeof sendPush!=="function")return;
  try{
   const r=await sendPush("self_test","[TEST] "+title,body,{
    tag:"eysl-waitlist-test-"+Date.now(),url_path:"/?open=home"
   });
   addLog(r&&r.ok?"[TEST] 실제 푸시 전송 요청 완료":"[TEST] 실제 푸시 전송 실패");
   write();
  }catch(_){}
 }
 function notice(type,title,body){
  state.notification={type,title,body,createdAt:Date.now()};
  write();
  void pushSelf(title,body);
 }
 function clearNotice(){state.notification=null;write()}

 function start(type){
  if(!actualMaster())return;
  const push=state.pushEnabled;
  const cat=(type==="refund_wait"||type==="refund_match")?"finance":"training";
  state=blank();state.active=true;state.scenario=type;state.pushEnabled=push;state.centerCategory=cat;
  const n=me();

  if(type==="promote"||type==="decline"||type==="expiry"){
   state.participants=[person("테스트회원 A",true),person("테스트회원 B",true)];
   state.waitlist=[waiter(n),waiter("테스트회원 C")];normalize();
   addLog("정원 2명 · "+n+" 대기 1번 · 테스트회원 C 대기 2번으로 시작");
  }else if(type==="no_wait"){
   state.participants=[person("테스트회원 A",true),person("테스트회원 B",true)];
   addLog("정원 2명 · 대기자 없는 상태로 시작");
  }else if(type==="refund_wait"){
   state.participants=[person("테스트회원 A",true),person("테스트회원 B",true)];
   addLog("테스트회원 A/B 참가비 납부 완료 상태로 시작");
  }else if(type==="refund_match"){
   state.participants=[person("테스트회원 B",true)];
   state.refunds=[{from:"테스트회원 A",amount:state.fee,status:"waiting_replacement",replacement:null}];
   addLog("테스트회원 A 환불대기 · 빈자리 1개 상태로 시작");
   notice("open_seat","훈련 빈자리","빈자리가 있습니다. 일반모임원용 프로필에서 훈련 신청을 눌러보세요.");
   return;
  }
  write();openTest();
 }

 function offerNext(){
  const next=state.waitlist.find(x=>x.offerStatus==="none");
  if(!next)return false;
  next.offerStatus="offered";
  addLog(next.name+"에게 자리 제안");
  if(next.name===me()){
   notice("waitlist_offer","자리 발생","자리가 발생했습니다. 참석하시겠습니까?");
  }else write();
  return true;
 }

 function cancelA(){
  const i=state.participants.findIndex(x=>x.name==="테스트회원 A");
  if(i<0)return toast&&toast("취소할 테스트회원 A가 없습니다.");
  const a=state.participants.splice(i,1)[0];
  addLog("테스트회원 A 참가 취소");
  if(a.paid&&state.scenario==="refund_wait"){
   state.refunds.push({from:"테스트회원 A",amount:state.fee,status:"waiting_replacement",replacement:null});
   addLog("테스트회원 A → 환불대기");
  }
  write();
  if(!offerNext()){
   addLog("대기자 없음 → 자리 1개 오픈");
   write();
  }
  render();
 }

 function acceptMine(){
  const i=state.waitlist.findIndex(x=>x.name===me()&&x.offerStatus==="offered");
  if(i<0)return;
  state.waitlist.splice(i,1);
  state.participants.push(person(me(),false));
  normalize();state.notification=null;
  addLog(me()+" 자리 제안 수락 → 참석자 이동");
  write();render();
 }
 function declineMine(){
  const i=state.waitlist.findIndex(x=>x.name===me()&&x.offerStatus==="offered");
  if(i<0)return;
  state.waitlist.splice(i,1);normalize();state.notification=null;
  addLog(me()+" 자리 제안 거절 → 대기 명단 제외");
  write();offerNext();render();
 }
 function expireMine(){
  const i=state.waitlist.findIndex(x=>x.name===me()&&x.offerStatus==="offered");
  if(i<0)return toast&&toast("민선에게 진행 중인 자리 제안이 없습니다.");
  state.waitlist.splice(i,1);normalize();state.notification=null;
  addLog(me()+" 응답 24시간 만료 → 다음 대기자로 이동");
  write();offerNext();render();
 }
 function cAccept(){
  const i=state.waitlist.findIndex(x=>x.name==="테스트회원 C"&&x.offerStatus==="offered");
  if(i<0)return toast&&toast("테스트회원 C에게 진행 중인 제안이 없습니다.");
  state.waitlist.splice(i,1);normalize();
  state.participants.push(person("테스트회원 C",false));
  addLog("테스트회원 C 자리 제안 수락 → 참석자 이동");
  write();render();
 }
 function newC(){
  if(state.participants.length>=state.capacity)return toast&&toast("현재 빈자리가 없습니다.");
  state.participants.push(person("테스트회원 C",false));
  addLog("테스트회원 C 신규 신청 → 빈자리 참석");
  write();render();
 }

 function joinRefund(){
  if(state.participants.some(x=>x.name===me()))return;
  if(state.participants.length>=state.capacity)return toast&&toast("현재 빈자리가 없습니다.");
  state.participants.push(person(me(),false));
  const r=state.refunds.find(x=>x.status==="waiting_replacement");
  if(r){
   r.status="matched";r.replacement=me();
   addLog(me()+" 신규 참가 → "+r.from+" 환불대기와 자동 매칭");
   notice("refund_due","참가비 입금 안내",r.from+"님에게 "+money(r.amount)+"을 입금해주세요.");
  }else{
   addLog(me()+" 신규 참가");write();
  }
  render();
 }
 function paidRefund(){
  const r=state.refunds.find(x=>x.replacement===me()&&x.status==="matched");
  if(!r)return;
  r.status="replacement_paid";
  addLog(me()+" → 입금 완료 클릭");
  notice("refund_confirm","입금 확인 대기",r.from+"님의 입금 확인을 기다리는 중입니다.");
  render();
 }
 function confirmRefund(){
  const r=state.refunds.find(x=>x.status==="replacement_paid");
  if(!r)return toast&&toast("입금 확인 대기 중인 환불이 없습니다.");
  r.status="refunded";
  const p=state.participants.find(x=>x.name===r.replacement);if(p)p.paid=true;
  state.notification=null;
  addLog(r.from+" 입금 확인 → 환불완료 / "+r.replacement+" 참가비 납부완료");
  write();render();
 }

 function reset(){
  const push=state.pushEnabled;
  const cat=state.centerCategory||"training";
  state=blank();state.pushEnabled=push;state.centerCategory=cat;write();
  if(typeof toast==="function")toast("테스트 시나리오를 종료했습니다.");
  try{showPage("waitlistTest")}catch(_){}
  render();
 }
 function togglePush(){
  state.pushEnabled=!state.pushEnabled;
  addLog("실제 푸시 테스트 "+(state.pushEnabled?"ON":"OFF"));
  write();render();
 }

 function noticeHtml(){
  if(!state.notification)return "";
  const n=state.notification;
  let actions="";
  if(memberView()&&n.type==="waitlist_offer"){
   actions="<div class='wltActions'><button class='btn primary' data-wlt-action='accept'>참석</button><button class='btn amber' data-wlt-action='decline'>거절</button></div>";
  }else if(memberView()&&n.type==="open_seat"){
   actions="<div class='wltActions'><button class='btn primary' data-wlt-action='join_refund'>훈련 신청</button></div>";
  }else if(memberView()&&n.type==="refund_due"){
   actions="<div class='wltActions'><button class='btn primary' data-wlt-action='paid'>입금 완료</button></div>";
  }else if(n.type==="generic_test"){
   actions="<div class='wltActions'><button class='btn outline' data-tc-action='dismiss_popup'>닫기</button></div>";
  }
  return "<div class='wltNotice'><span class='wltTag'>TEST</span><h3>[TEST] "+esc(n.title)+"</h3><p>"+esc(n.body)+"</p>"+actions+"</div>";
 }
 function rosterHtml(){
  const ps=state.participants.length?state.participants.map((p,i)=>
   "<div class='wltPerson'><span>"+(i+1)+". "+esc(p.name)+"</span><b>"+(p.paid?"입금완료":"미입금")+"</b></div>"
  ).join(""):"<div class='meta'>참석자 없음</div>";
  const ws=state.waitlist.length?state.waitlist.map(w=>
   "<div class='wltPerson'><span>대기 "+w.order+" · "+esc(w.name)+"</span><b>"+esc({none:"대기",offered:"응답 대기"}[w.offerStatus]||w.offerStatus)+"</b></div>"
  ).join(""):"<div class='meta'>대기자 없음</div>";
  return "<div class='wltGrid'><div class='card'><h3>참석 "+state.participants.length+"/"+state.capacity+"</h3>"+ps+"</div><div class='card'><h3>대기</h3>"+ws+"</div></div>";
 }
 function refundHtml(){
  if(!state.refunds.length)return "";
  const labels={waiting_replacement:"환불대기",matched:"대체 참가자 매칭",replacement_paid:"입금 확인 대기",refunded:"정산완료"};
  return "<div class='section'><h2>환불 진행상황</h2></div><div class='card'>"+
   state.refunds.map(r=>"<div class='wltRefund'><div><b>"+esc(r.from)+(r.replacement?" ← "+esc(r.replacement):"")+"</b><p>"+money(r.amount)+"</p></div><span>"+esc(labels[r.status]||r.status)+"</span></div>").join("")+
   "</div>";
 }
 function adminControls(){
  if(memberView())return "";
  let x="";
  if(["promote","decline","expiry","no_wait","refund_wait"].includes(state.scenario)&&state.participants.some(p=>p.name==="테스트회원 A")){
   x+="<button class='btn amber' data-wlt-action='cancel_a'>A 취소시키기</button>";
  }
  if(state.scenario==="expiry"&&state.waitlist.some(w=>w.name===me()&&w.offerStatus==="offered")){
   x+="<button class='btn outline' data-wlt-action='expire'>대기 제안 24시간 만료시키기</button>";
  }
  if(state.waitlist.some(w=>w.name==="테스트회원 C"&&w.offerStatus==="offered")){
   x+="<button class='btn outline' data-wlt-action='c_accept'>C 참석 처리</button>";
  }
  if(state.scenario==="no_wait"&&state.participants.length<state.capacity){
   x+="<button class='btn primary' data-wlt-action='new_c'>새 테스트회원 C 참가시키기</button>";
  }
  if(state.refunds.some(r=>r.status==="replacement_paid")){
   x+="<button class='btn primary' data-wlt-action='confirm_refund'>A 입금 확인 처리</button>";
  }
  return x?"<div class='section'><h2>관리자 테스트 조작</h2></div><div class='wltActions stack'>"+x+"</div>":"";
 }
 function scenarioRows(category){
  const all={
   training:[
    ["promote","① 대기 승급 · 수락","A 취소 → 민선 자리 제안 → 참석"],
    ["decline","② 거절 후 다음 대기자","민선 거절 → C에게 자동 이동"],
    ["no_wait","③ 대기자 없음","A 취소 → 빈자리 오픈 → 신규 참가"],
    ["expiry","④ 24시간 응답 만료","민선 제안 만료 → C에게 자동 이동"]
   ],
   finance:[
    ["refund_wait","① 유료 참가자 취소","A 취소 → 환불대기 · 빈자리 유지"],
    ["refund_match","② 환불 자동매칭","A 환불대기 → 민선 참가 → 직접 입금/확인"]
   ]
  };
  return all[category]||[];
 }

 function scenarios(category){
  const rows=scenarioRows(category);
  if(!rows.length)return "";
  return "<div class='section'><h2>테스트 시나리오</h2><span class='meta'>실데이터와 완전히 분리</span></div><div class='wltScenarios'>"+
   rows.map(r=>"<button data-wlt-scenario='"+r[0]+"'><b>"+r[1]+"</b><span>"+r[2]+"</span></button>").join("")+
   "</div>";
 }

 function centerCategories(){
  const cats=[
   ["training","🏊","훈련 · 대기","신청·취소 · 정원 · 대기 승급 · 만료"],
   ["finance","₩","참가비 · 환불","입금 · 환불대기 · 대체 참가자 매칭"],
   ["attendance","✓","출석","출석 · 지각 · 불참 · 명단 예외처리"],
   ["race","🏁","대회","개인전 · 단체전 · 신청 · 마감"],
   ["notice","🔔","공지 · 알림","팝업 · 푸시 · 공지 상호작용"],
   ["member","👥","회원","가입 · 승인 · 내보내기 · 재가입"],
   ["profile","👑","권한 · 프로필","총관리자용 ↔ 일반모임원용 화면"]
  ];
  return "<div class='tcGrid'>"+cats.map(x=>
   "<button class='tcCard "+(state.centerCategory===x[0]?"active":"")+"' data-tc-category='"+x[0]+"'>"+
   "<i>"+x[1]+"</i><div><b>"+x[2]+"</b><span>"+x[3]+"</span></div><em>›</em></button>"
  ).join("")+"</div>";
 }

 function categoryBody(){
  const cat=state.centerCategory||"training";
  const title={
   training:"훈련 · 대기",finance:"참가비 · 환불",attendance:"출석",race:"대회",
   notice:"공지 · 알림",member:"회원",profile:"권한 · 프로필"
  }[cat]||"TEST CENTER";
  let html="<div class='tcCategoryHead'><button data-tc-action='all'>← 전체</button><div><b>"+esc(title)+"</b><span>테스트 항목</span></div></div>";

  if(cat==="training"||cat==="finance")return html+scenarios(cat);

  if(cat==="profile"){
   const mode=(typeof getEyslProfileMode==="function"?getEyslProfileMode():"admin");
   return html+
    "<div class='card tcInfo'><b>현재 프로필</b><p>"+(mode==="member"?"일반모임원용":"총관리자용")+"</p></div>"+
    "<div class='wltActions stack'>"+
     "<button class='btn primary' data-tc-action='profile_admin'>총관리자용으로 전환</button>"+
     "<button class='btn outline' data-tc-action='profile_member'>일반모임원용으로 전환</button>"+
    "</div>";
  }

  if(cat==="notice"){
   return html+
    "<div class='card tcInfo'><b>알림 테스트</b><p>실제 푸시는 상단 스위치를 ON으로 켠 경우에만 민선 본인 기기로 [TEST] 표시와 함께 전송됩니다.</p></div>"+
    "<div class='wltActions stack'><button class='btn outline' data-tc-action='test_popup'>테스트 팝업 만들기</button></div>"+
    "<div class='tcSoon'>공지 작성·댓글·마감 알림 시나리오는 이후 기능 테스트와 함께 이곳에 추가됩니다.</div>";
  }

  const desc={
   attendance:"출석·지각·불참 및 관리자 명단 추가/제외 테스트를 이 영역에 추가합니다.",
   race:"개인전·단체전 신청, 취소, 마감 상태 테스트를 이 영역에 추가합니다.",
   member:"가입신청·승인·거절·내보내기·재가입 테스트를 이 영역에 추가합니다."
  }[cat]||"";
  return html+"<div class='tcSoon'><b>테스트 슬롯 준비 완료</b><span>"+esc(desc)+"</span></div>";
 }


 function render(){
  const body=document.getElementById("waitlistTestBody");if(!body)return;
  if(!actualMaster()){body.innerHTML="<div class='card meta'>총관리자 계정에서만 사용할 수 있습니다.</div>";return}
  let html="<div class='wltHero'><div><span class='wltTag'>TEST CENTER</span><h2>TEAM EYSL 테스트 센터</h2><p>새 기능 테스트는 앞으로 모두 이곳에서 진행합니다. 실제 운영 데이터와 분리됩니다.</p></div>";
  if(!memberView())html+="<button class='wltPush "+(state.pushEnabled?"on":"")+"' data-wlt-action='toggle_push'>실제 푸시 "+(state.pushEnabled?"ON":"OFF")+"</button>";
  html+="</div>";

  if(!state.active){
   if(!state.centerCategory||state.centerCategory==="all"){
    body.innerHTML=html+"<div class='section'><h2>테스트 카테고리</h2><span class='meta'>기능별 시나리오</span></div>"+centerCategories();
   }else{
    body.innerHTML=html+categoryBody();
   }
   return;
  }

  html+="<div class='wltScenarioHead'><div><b>"+esc(label())+"</b><span>정원 "+state.capacity+"명 · 참가비 "+money(state.fee)+"</span></div><button data-wlt-action='reset'>시나리오 종료</button></div>";
  html+=noticeHtml()+rosterHtml()+refundHtml()+adminControls();
  html+="<div class='section'><h2>테스트 기록</h2></div><div class='card wltLogs'>"+
   (state.logs.length?state.logs.map(x=>"<div><span>"+esc(x.at)+"</span>"+esc(x.message)+"</div>").join(""):"<div class='meta'>아직 기록이 없습니다.</div>")+
   "</div><button class='btn outline' style='width:100%;margin-top:12px' data-wlt-action='reset'>시나리오 종료 · 테스트 센터로</button>";
  body.innerHTML=html;
 }


 function inject(){
  if(!document.getElementById("waitlistTestStyles")){
   const st=document.createElement("style");st.id="waitlistTestStyles";
   st.textContent=".wltHero{background:#16191e;color:#fff;border-radius:20px;padding:16px;display:flex;justify-content:space-between;gap:12px;align-items:center}.wltHero h2{margin:7px 0 4px;font-size:18px}.wltHero p{margin:0;color:#b9bdc3;font-size:10px}.wltTag{display:inline-flex;background:#ffecb5;color:#7a5200;border-radius:999px;padding:4px 7px;font-size:8px;font-weight:900;letter-spacing:.08em}.wltPush{border:1px solid #555;background:#252a31;color:#fff;border-radius:12px;padding:9px 10px;font-size:9px;white-space:nowrap}.wltPush.on{background:#fff;color:#111}.wltScenarios{display:grid;gap:9px}.wltScenarios button{border:1px solid var(--line);background:#fff;border-radius:16px;padding:13px;text-align:left}.wltScenarios b{display:block;font-size:12px}.wltScenarios span{display:block;color:#777;font-size:9px;margin-top:5px}.wltScenarioHead{display:flex;align-items:center;justify-content:space-between;margin:14px 0 10px}.wltScenarioHead b{display:block;font-size:13px}.wltScenarioHead span{display:block;font-size:9px;color:#777;margin-top:3px}.wltScenarioHead button{border:0;background:transparent;color:#777}.wltNotice{border:2px solid #111;background:#fff;border-radius:18px;padding:15px;margin:12px 0}.wltNotice h3{margin:8px 0 5px;font-size:15px}.wltNotice p{margin:0;color:#666;font-size:11px;line-height:1.55}.wltGrid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.wltGrid .card{margin:0}.wltGrid h3{margin:0 0 9px;font-size:12px}.wltPerson,.wltRefund{display:flex;align-items:center;justify-content:space-between;gap:8px;border-top:1px solid #eee;padding:8px 0;font-size:9px}.wltPerson:first-of-type,.wltRefund:first-child{border-top:0}.wltPerson b,.wltRefund span{font-size:8px;color:#666}.wltRefund b{font-size:10px}.wltRefund p{margin:3px 0 0;font-size:9px;color:#777}.wltActions{display:flex;gap:8px;margin-top:10px}.wltActions .btn{flex:1}.wltActions.stack{display:grid}.wltLogs>div{display:flex;gap:8px;padding:7px 0;border-bottom:1px solid #eee;font-size:9px}.wltLogs>div:last-child{border-bottom:0}.wltLogs span{color:#999;white-space:nowrap}#waitlistTestBanner{display:none;align-items:center;justify-content:space-between;gap:8px;background:#fff3cd;border:1px solid #ffe08a;padding:7px 12px;font-size:9px;position:sticky;top:0;z-index:75}#waitlistTestBanner b{font-size:8px}#waitlistTestBanner button{border:0;background:transparent;font-weight:900;font-size:9px}.tcGrid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.tcCard{border:1px solid var(--line);background:#fff;border-radius:17px;padding:14px 12px;display:flex;align-items:center;gap:10px;text-align:left}.tcCard.active{border:2px solid #111}.tcCard i{font-style:normal;font-size:18px;width:28px}.tcCard div{min-width:0;flex:1}.tcCard b{display:block;font-size:11px}.tcCard span{display:block;font-size:8px;color:#777;line-height:1.45;margin-top:4px}.tcCard em{font-style:normal;color:#aaa}.tcCategoryHead{display:flex;align-items:center;gap:10px;margin:14px 0 8px}.tcCategoryHead button{border:0;background:transparent;padding:6px 4px;font-size:18px}.tcCategoryHead b{display:block;font-size:14px}.tcCategoryHead span{display:block;font-size:9px;color:#888;margin-top:2px}.tcSoon{border:1px dashed #cfd3d8;border-radius:16px;padding:18px;text-align:center;color:#777;font-size:10px;line-height:1.6}.tcSoon b{display:block;color:#333;font-size:12px;margin-bottom:5px}.tcInfo{margin-top:8px}.tcInfo b{font-size:11px}.tcInfo p{font-size:9px;color:#777;line-height:1.6;margin:5px 0 0}@media(max-width:370px){.wltGrid,.tcGrid{grid-template-columns:1fr}}";
   document.head.appendChild(st);
  }
  if(!document.getElementById("waitlistTest")){
   const nav=document.querySelector("nav.nav");
   if(nav)nav.insertAdjacentHTML("beforebegin","<section id='waitlistTest' class='page'><div class='pagehead'><button class='back' data-wlt-action='home'>←</button><h1>TEST CENTER</h1><span></span></div><div id='waitlistTestBody'></div></section>");
  }
  if(!document.getElementById("waitlistTestBanner")){
   const app=document.querySelector(".app"),header=app&&app.querySelector("header.top");
   if(app&&header){
    const b=document.createElement("div");b.id="waitlistTestBanner";
    b.addEventListener("click",openTest);header.insertAdjacentElement("afterend",b);
   }
  }
 }

 function sync(){
  inject();
  const menu=document.getElementById("testCenterMenu");
  if(menu)menu.style.display=actualMaster()&&!memberView()?"block":"none";
  const banner=document.getElementById("waitlistTestBanner");
  if(banner){
   banner.style.display=actualMaster()&&state.active?"flex":"none";
   banner.innerHTML="<span><b>TEST MODE</b> · "+esc(label())+"</span><button type='button'>열기 ›</button>";
  }
  if(document.getElementById("waitlistTest")?.classList.contains("active"))render();
 }
 function openTest(){
  inject();
  if(!state.active&&(!localStorage.getItem(KEY)||state.centerCategory==="training"))state.centerCategory="all";
  try{showPage("waitlistTest")}catch(_){}
  render();
 }

 window.openTestCenter=openTest;
 window.openWaitlistTest=openTest;
 window.startWltTest=start;
 window.resetWltTest=reset;

 document.addEventListener("click",e=>{
  const cat=e.target.closest("[data-tc-category]");
  if(cat){
   state.centerCategory=cat.dataset.tcCategory||"training";write();render();return;
  }
  const tc=e.target.closest("[data-tc-action]");
  if(tc){
   const a=tc.dataset.tcAction;
   if(a==="all"){state.centerCategory="all";write();render();return}
   if(a==="profile_admin"&&typeof setEyslProfileMode==="function"){setEyslProfileMode("admin");setTimeout(render,0);return}
   if(a==="profile_member"&&typeof setEyslProfileMode==="function"){setEyslProfileMode("member");setTimeout(render,0);return}
   if(a==="test_popup"){
    state.notification={type:"generic_test",title:"TEST CENTER 팝업",body:"이 팝업은 실제 운영 데이터와 무관한 테스트 알림입니다.",createdAt:Date.now()};
    addLog("TEST CENTER 테스트 팝업 생성");write();void pushSelf("TEST CENTER","테스트 팝업이 생성됐습니다.");render();return;
   }
   if(a==="dismiss_popup"){state.notification=null;write();render();return}
  }
  const sc=e.target.closest("[data-wlt-scenario]");
  if(sc){start(sc.dataset.wltScenario);return}
  const b=e.target.closest("[data-wlt-action]");if(!b)return;
  const a=b.dataset.wltAction;
  if(a==="home"){showPage("home");return}
  if(a==="cancel_a")cancelA();
  else if(a==="accept")acceptMine();
  else if(a==="decline")declineMine();
  else if(a==="expire")expireMine();
  else if(a==="c_accept")cAccept();
  else if(a==="new_c")newC();
  else if(a==="join_refund")joinRefund();
  else if(a==="paid")paidRefund();
  else if(a==="confirm_refund")confirmRefund();
  else if(a==="toggle_push")togglePush();
  else if(a==="reset")reset();
 });

 inject();sync();

 const oldMode=window.setEyslProfileMode;
 if(typeof oldMode==="function"&&!oldMode.__wlt203){
  window.setEyslProfileMode=function(){
   const r=oldMode.apply(this,arguments);setTimeout(sync,0);return r;
  };
  window.setEyslProfileMode.__wlt203=true;
 }
 const oldShow=window.showPage;
 if(typeof oldShow==="function"&&!oldShow.__wlt203){
  window.showPage=function(){
   const r=oldShow.apply(this,arguments);
   if(arguments[0]==="waitlistTest")setTimeout(render,0);
   setTimeout(sync,0);return r;
  };
  window.showPage.__wlt203=true;
  try{showPage=window.showPage}catch(_){}
 }

 window.addEventListener("load",()=>setTimeout(sync,700));
 window.addEventListener("pageshow",()=>setTimeout(sync,100));
 document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")sync()});
})();