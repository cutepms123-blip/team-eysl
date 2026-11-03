/* TEAM EYSL v218 - navigation completeness and final contrast overrides.
   All added controls reuse existing showPage navigation. No data mutation. */
(()=>{
 if(window.__EYSL_UI_INTEGRITY_V218__)return;
 window.__EYSL_UI_INTEGRITY_V218__=true;
 const roots=new Set(['home','notice','schedule','teamEvents','mypage']);
 const preferredParent={
  records:'mypage',attendance:'mypage',activity:'mypage',myStatus:'mypage',
  noticeDetail:'notice',noticeWrite:'notice',recordUploadManager:'mypage',
  trainingList:'schedule',raceList:'schedule',otherList:'schedule',
  trainingDetail:'trainingList',raceDetail:'raceList',raceApply:'raceDetail',
  eventDetail:'otherList',eventRankingDetail:'teamEvents',media:'home',files:'home',
  memberDirectory:'home',memberAdmin:'home',memberApproval:'home',
  adminSchedule:'home',adminScheduleDetail:'adminSchedule',
  attendanceAdmin:'home',attendanceAdminDetail:'attendanceAdmin',
  freeBoard:'notice',boardDetail:'freeBoard',boardWrite:'freeBoard',
  dmChat:'chat',applyStatus:'trainingDetail'
 };
 let stack=['home'];
 let isGoingBack=false;
 const style=document.createElement('style');
 style.id='eysl-ui-integrity-v218';
 style.textContent=`
 /* Header action icons, including back button, must be visible on charcoal. */
 #drawer{background:#17191D!important;color:#F5F5F5!important;border-right:1px solid #43464C!important}
 #drawer .ditem,#drawer .dparent,#drawer .dsub .ditem,#drawer .drawerHead b{color:#F5F5F5!important;-webkit-text-fill-color:#F5F5F5!important}
 #drawer .dsec,#drawer .drawerHead .meta{color:#B5B9C1!important;-webkit-text-fill-color:#B5B9C1!important}
 #drawer .drawerHead button{background:#292C31!important;color:#F5F5F5!important;-webkit-text-fill-color:#F5F5F5!important}
 .app .hamb,.app .pagehead button.back,.app .page button.eyslBackAdded,
 .pagehead button.back,.page button.eyslBackAdded{
  color:#F8F9FB!important;-webkit-text-fill-color:#F8F9FB!important;
  background:#292C31!important;border:1px solid #53565D!important;
  border-radius:12px!important;display:inline-flex!important;align-items:center!important;
  justify-content:center!important;opacity:1!important;
  visibility:visible!important;min-width:38px!important;height:38px!important;
  font-size:24px!important;font-weight:600!important;line-height:1!important;
  box-shadow:none!important;text-decoration:none!important;
 }
 .pagehead button.back svg,.pagehead button.back path,
 .pagehead button.back line,.pagehead button.back polyline{
  stroke:#F8F9FB!important;
 }
 .page .eyslBackAdded{margin:1px 0 8px!important;padding:0!important;cursor:pointer}
 .page .eyslBackRow{height:39px;display:flex;align-items:center;justify-content:flex-start;margin-bottom:8px}
 /* Legacy records script previously applied purple and inline styles. */
 #records .recordTabs button,#records .recordDetailTabs button,#records .recordDistanceTabs button,
 #records #recordMajor button,#records #recordMinor button,
 #records #recordDetailTabs button,#records #recordDistanceTabs button{
  background:#23252A!important;border:1px solid #555961!important;
  color:#F5F5F5!important;-webkit-text-fill-color:#F5F5F5!important;
  opacity:1!important;box-shadow:none!important;
 }
 #records .recordTabs button.active,#records .recordDetailTabs button.active,
 #records .recordDistanceTabs button.active,#records #recordMajor button.active,
 #records #recordMinor button.active,#records #recordDetailTabs button.active,
 #records #recordDistanceTabs button.active{
  background:#241C1D!important;border-color:#F24B35!important;
  color:#FF8B76!important;-webkit-text-fill-color:#FF8B76!important;
 }
 #records .screenshotPb,#records .pbCard.screenshotPb{
  background:#FAFBFC!important;background-image:none!important;border:1px solid #D6D9DD!important;
  box-shadow:none!important;color:#15171A!important;
 }
 #records .screenshotPb:before,#records .screenshotPb:after,
 #records .eysl-pb-card:after{content:none!important;display:none!important}
 #records .screenshotPb span{color:#656B73!important;-webkit-text-fill-color:#656B73!important}
 #records .screenshotPb b{color:#15171A!important;-webkit-text-fill-color:#15171A!important}
 #eventRankingDetail .pagehead h1,.app #eventRankingDetail .pagehead h1{color:#F5F5F5!important;-webkit-text-fill-color:#F5F5F5!important}
 /* Restore original white event tiles but remove every lavender edge/icon fill. */
 #teamEvents .eventHubBtn,#teamEvents .eventHub .eventHubBtn{
  background:#FAFBFC!important;color:#16181B!important;border:1px solid #D8DADF!important;
  border-left:1px solid #D8DADF!important;box-shadow:none!important;
 }
 #teamEvents .eventHubBtn span{color:#16181B!important;-webkit-text-fill-color:#16181B!important}
 #teamEvents .eventHubBtn .eyslV162Icon{background:#111317!important;color:#fff!important;border:none!important}
 /* Keep performance feedback intuitive without changing the record cards. */
 #records .historyCard>span.improve{color:#218453!important;-webkit-text-fill-color:#218453!important}
 #records .historyCard>span.slower{color:#F24B35!important;-webkit-text-fill-color:#F24B35!important}
 `;
 document.head.appendChild(style);
 function activePage(){return document.querySelector('.page.active')}
 function ensureBack(){
  const page=activePage();
  if(!page||roots.has(page.id))return;
  const head=page.querySelector(':scope > .pagehead');
  if(head){
   const existing=head.querySelector('button.back');
   if(existing){existing.setAttribute('aria-label','뒤로가기');return;}
   const button=document.createElement('button');
   button.className='back eyslBackAdded';
   button.type='button';button.textContent='←';
   button.setAttribute('aria-label','뒤로가기');
   button.addEventListener('click',goBack);
   head.prepend(button);
   return;
  }
  if(page.querySelector(':scope > .eyslBackRow'))return;
  const row=document.createElement('div');row.className='eyslBackRow';
  const button=document.createElement('button');button.className='eyslBackAdded';
  button.type='button';button.textContent='←';button.setAttribute('aria-label','뒤로가기');
  button.addEventListener('click',goBack);
  row.appendChild(button);
  page.prepend(row);
 }
 function goBack(){
  const current=activePage()?.id;
  if(!current)return;
  if(stack[stack.length-1]===current)stack.pop();
  const target=stack[stack.length-1]||preferredParent[current]||'home';
  isGoingBack=true;
  try{if(typeof window.showPage==='function')window.showPage(target)}
  finally{isGoingBack=false}
 }
 function wrapPageNavigation(){
  const old=window.showPage;
  if(typeof old!=='function'||old.__eyslUi218)return;
  const wrapped=function(id){
   const before=activePage()?.id;
   const result=old.apply(this,arguments);
   const after=activePage()?.id;
   if(after===id&&before!==after){
    if(roots.has(id)){stack=[id]}
    else if(isGoingBack){
     if(stack[stack.length-1]!==id)stack.push(id);
    }else{
     if(stack[stack.length-1]!==before&&before)stack.push(before);
     if(stack[stack.length-1]!==id)stack.push(id);
     if(stack.length>24)stack=stack.slice(-24);
    }
   }
   ensureBack();
   return result;
  };
  wrapped.__eyslUi218=true;
  window.showPage=wrapped;
 }
 function start(){
  stack=[activePage()?.id||'home'];
  wrapPageNavigation();
  ensureBack();
  /* Some external page renderers replace children after navigation. */
  const observer=new MutationObserver(()=>{
   const p=activePage();
   if(!p||roots.has(p.id))return;
   if(p.querySelector(':scope > .pagehead button.back,:scope > .pagehead button.eyslBackAdded,:scope > .eyslBackRow'))return;
   ensureBack();
  });
  observer.observe(document.body,{childList:true,subtree:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
 else start();
})();