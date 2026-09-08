/* TEAM EYSL v159 training/race horizontal status pills */
(()=>{
 if(window.__EYSL_STATUS_V159__)return; window.__EYSL_STATUS_V159__=true;
 const labels=new Set(['신청완료','신청 완료','신청 가능','신청 마감','종료']);
 const styleEl=document.createElement('style');
 styleEl.textContent=`
.statusTop{align-items:flex-start!important}
.statusTop>.tag,.statusTop>span.tag,.statusTop>div.tag,
.statusCard .tag.ok,.statusCard .tag.done,.statusCard .tag.wait{
 width:auto!important;min-width:0!important;max-width:none!important;
 height:28px!important;min-height:28px!important;max-height:28px!important;
 aspect-ratio:auto!important;border-radius:999px!important;
 padding:0 10px!important;margin:0!important;
 display:inline-flex!important;align-items:center!important;justify-content:center!important;
 flex:0 0 auto!important;align-self:flex-start!important;
 line-height:1!important;white-space:nowrap!important;font-size:10px!important;
}
`;
 document.head.appendChild(styleEl);
 function apply(){
  document.querySelectorAll('.statusTop > *, .statusCard .tag').forEach(el=>{
   const t=(el.textContent||'').trim(); if(!labels.has(t))return;
   Object.assign(el.style,{width:'auto',minWidth:'0',maxWidth:'none',height:'28px',minHeight:'28px',maxHeight:'28px',aspectRatio:'auto',borderRadius:'999px',padding:'0 10px',display:'inline-flex',alignItems:'center',justifyContent:'center',flex:'0 0 auto',alignSelf:'flex-start',lineHeight:'1',whiteSpace:'nowrap',fontSize:'10px'});
  });
 }
 const obs=new MutationObserver(()=>requestAnimationFrame(apply));
 const start=()=>{apply();obs.observe(document.body,{childList:true,subtree:true});};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();