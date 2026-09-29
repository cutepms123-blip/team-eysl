/* TEAM EYSL v202 — master dual profile mode */
(function(){
 if(window.__EYSL_PROFILE_MODE_V202__)return;
 window.__EYSL_PROFILE_MODE_V202__=true;

 const KEY='eysl_master_profile_mode_v1';
 let mode=localStorage.getItem(KEY)==='member'?'member':'admin';

 function actualMaster(){
  try{return !!currentUser&&currentUser.actualRole==='master_admin'}catch(_){return false}
 }
 function memberMode(){return actualMaster()&&mode==='member'}
 function currentModeLabel(){return memberMode()?'일반모임원용':'총관리자용'}

 const baseIsAdmin=typeof window.isAdminUser==='function'?window.isAdminUser:null;
 const baseIsMaster=typeof window.isMasterAdmin==='function'?window.isMasterAdmin:null;

 window.isAdminUser=function(){
  if(memberMode())return false;
  if(baseIsAdmin)return baseIsAdmin();
  try{return ['admin','sub_admin','master_admin'].includes(currentUser.actualRole)}catch(_){return false}
 };
 window.isMasterAdmin=function(){
  if(memberMode())return false;
  if(baseIsMaster)return baseIsMaster();
  return actualMaster();
 };
 try{isAdminUser=window.isAdminUser}catch(_){}
 try{isMasterAdmin=window.isMasterAdmin}catch(_){}

 function inject(){
  if(document.getElementById('eyslProfileSwitcher'))return;

  const style=document.createElement('style');
  style.textContent=
   '#avatar.eyslProfileSwitchAvatar{cursor:pointer;position:relative}'+
   '#avatar.eyslProfileSwitchAvatar:after{content:"";position:absolute;right:-2px;bottom:-2px;width:10px;height:10px;border-radius:50%;background:#111;border:2px solid #fff}'+
   '.eyslProfileOverlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:10050;display:none;align-items:flex-end;justify-content:center}'+
   '.eyslProfileSheet{width:min(430px,100%);background:#f7f7f8;border-radius:24px 24px 0 0;padding:20px 16px calc(24px + env(safe-area-inset-bottom));box-shadow:0 -14px 35px rgba(0,0,0,.18)}'+
   '.eyslProfileSheetHead{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}.eyslProfileSheetHead h2{margin:0;font-size:18px}.eyslProfileSheetHead button{border:0;background:transparent;font-size:22px;padding:6px}'+
   '.eyslProfileCard{width:100%;border:1px solid #e2e4e8;background:#fff;border-radius:18px;padding:15px;display:flex;align-items:center;gap:12px;text-align:left;margin-top:9px}'+
   '.eyslProfileCard.active{border:2px solid #111}.eyslProfileIcon{width:44px;height:44px;border-radius:14px;background:#111;color:#fff;display:grid;place-items:center;font-size:20px;flex:0 0 auto}'+
   '.eyslProfileCard.member .eyslProfileIcon{background:#eef0f3;color:#111}.eyslProfileCard b{display:block;font-size:14px}.eyslProfileCard span{display:block;font-size:10px;color:#777;margin-top:4px;line-height:1.45}.eyslProfileCheck{margin-left:auto;font-size:18px;font-weight:900}'+
   '#eyslProfileModeButton{white-space:nowrap}.eyslMemberModeNote{font-size:9px!important;color:#9aa0a6!important;margin-top:4px!important}';
  document.head.appendChild(style);

  const overlay=document.createElement('div');
  overlay.id='eyslProfileSwitcher';
  overlay.className='eyslProfileOverlay';
  overlay.innerHTML=
   '<div class="eyslProfileSheet" onclick="event.stopPropagation()">'+
    '<div class="eyslProfileSheetHead"><h2>프로필 선택</h2><button type="button" onclick="closeEyslProfileSwitcher()">×</button></div>'+
    '<button id="eyslAdminProfileCard" class="eyslProfileCard" type="button" onclick="setEyslProfileMode(\\'admin\\')">'+
     '<div class="eyslProfileIcon">👑</div><div><b>총관리자용</b><span>훈련 등록 · 회원 관리 · 출석 관리 · 정산 · 운영 기록</span></div><div class="eyslProfileCheck"></div>'+
    '</button>'+
    '<button id="eyslMemberProfileCard" class="eyslProfileCard member" type="button" onclick="setEyslProfileMode(\\'member\\')">'+
     '<div class="eyslProfileIcon">🏊</div><div><b>일반모임원용</b><span>일반 모임원과 같은 화면 · 내 신청/출석/기록은 그대로 사용</span></div><div class="eyslProfileCheck"></div>'+
    '</button>'+
   '</div>';
  overlay.onclick=window.closeEyslProfileSwitcher;
  document.body.appendChild(overlay);
 }

 function ensureMyPageButton(){
  const actions=document.querySelector('#mypage .profileActions');
  if(!actions)return;
  let btn=document.getElementById('eyslProfileModeButton');
  if(!actualMaster()){
   if(btn)btn.remove();
   return;
  }
  if(!btn){
   btn=document.createElement('button');
   btn.id='eyslProfileModeButton';
   btn.type='button';
   btn.className='btn outline';
   btn.onclick=window.openEyslProfileSwitcher;
   actions.insertBefore(btn,actions.firstChild);
  }
  btn.textContent='프로필 전환 · '+currentModeLabel();
 }

 function sync(){
  inject();
  const master=actualMaster();
  const member=memberMode();

  const avatar=document.getElementById('avatar');
  if(avatar){
   avatar.classList.toggle('eyslProfileSwitchAvatar',master);
   avatar.onclick=master?window.openEyslProfileSwitcher:null;
   avatar.setAttribute('aria-label',master?'프로필 전환':'프로필');
   avatar.title=master?'프로필 전환':'';
  }

  const badge=document.getElementById('roleBadge');
  if(badge&&master){
   badge.textContent=member?'일반모임원':'총관리자';
   badge.classList.toggle('roleTagMaster',!member);
   badge.classList.toggle('roleTagSub',false);
  }

  const adminMenu=document.getElementById('adminMenu');
  if(adminMenu)adminMenu.style.display=window.isAdminUser()?'block':'none';

  const noticeFab=document.getElementById('noticeFab');
  if(noticeFab)noticeFab.style.display=window.isAdminUser()?'block':'none';

  const approval=document.getElementById('drawerMemberApproval');
  if(approval)approval.style.display=window.isMasterAdmin()?'block':'none';

  const roleWrap=document.getElementById('roleManagementWrap');
  if(roleWrap)roleWrap.style.display=window.isMasterAdmin()?'block':'none';

  const pushTest=document.getElementById('masterPushTestRow');
  if(pushTest)pushTest.style.display=window.isMasterAdmin()?'flex':'none';

  if(member){
   const plus=document.getElementById('trainingSignupAddBtn');
   if(plus)plus.remove();
  }

  ensureMyPageButton();

  const a=document.getElementById('eyslAdminProfileCard');
  const m=document.getElementById('eyslMemberProfileCard');
  if(a&&m){
   a.classList.toggle('active',!member);
   m.classList.toggle('active',member);
   const ac=a.querySelector('.eyslProfileCheck');
   const mc=m.querySelector('.eyslProfileCheck');
   if(ac)ac.textContent=!member?'✓':'';
   if(mc)mc.textContent=member?'✓':'';
  }
 }

 window.openEyslProfileSwitcher=function(){
  if(!actualMaster())return;
  inject();sync();
  const el=document.getElementById('eyslProfileSwitcher');
  if(el)el.style.display='flex';
 };
 window.closeEyslProfileSwitcher=function(){
  const el=document.getElementById('eyslProfileSwitcher');
  if(el)el.style.display='none';
 };

 window.setEyslProfileMode=function(next){
  if(!actualMaster())return;
  mode=next==='member'?'member':'admin';
  localStorage.setItem(KEY,mode);
  window.closeEyslProfileSwitcher();
  try{applyRole()}catch(_){sync()}
  sync();
  try{
   if(typeof closeDrawer==='function')closeDrawer();
   if(typeof showPage==='function')showPage('home');
   if(typeof renderHome==='function')renderHome();
  }catch(_){}
  if(typeof toast==='function')toast(mode==='member'?'일반모임원용 프로필로 전환했습니다.':'총관리자용 프로필로 전환했습니다.');
 };

 window.getEyslProfileMode=function(){return memberMode()?'member':'admin'};

 const baseApplyRole=typeof window.applyRole==='function'?window.applyRole:null;
 if(baseApplyRole){
  window.applyRole=function(){
   const r=baseApplyRole.apply(this,arguments);
   setTimeout(sync,0);
   return r;
  };
  try{applyRole=window.applyRole}catch(_){}
 }

 const adminOnlyPages=new Set([
  'memberApproval','memberAdmin','attendanceAdmin','attendanceAdminDetail',
  'noticeWrite','trainingOpsLog','trainingSignupCreate'
 ]);
 const baseShowPage=typeof window.showPage==='function'?window.showPage:null;
 if(baseShowPage){
  window.showPage=function(id){
   if(memberMode()&&adminOnlyPages.has(id)){
    if(typeof toast==='function')toast('일반모임원용 프로필에서는 관리자 메뉴가 보이지 않습니다.');
    id='home';
   }
   const r=baseShowPage.apply(this,[id].concat([].slice.call(arguments,1)));
   setTimeout(sync,0);
   return r;
  };
  try{showPage=window.showPage}catch(_){}
 }

 inject();
 sync();
 window.addEventListener('load',function(){setTimeout(sync,150);setTimeout(sync,900)});
 window.addEventListener('pageshow',function(){setTimeout(sync,100)});
 document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')setTimeout(sync,50)});
})();