/* TEAM EYSL v158 horizontal status pills everywhere */
(()=>{
 if(window.__EYSL_COMPACT_STATUS_V158__)return;window.__EYSL_COMPACT_STATUS_V158__=true;
 const STATUS=new Set(['신청완료','신청 완료','신청 가능','신청 마감','종료']);
 const apply=()=>{
  document.querySelectorAll('.tag').forEach(el=>{
   if(!STATUS.has((el.textContent||'').trim()))return;
   Object.assign(el.style,{width:'max-content',height:'24px',minWidth:'max-content',minHeight:'24px',maxHeight:'24px',aspectRatio:'auto',display:'inline-flex',alignItems:'center',justifyContent:'center',flex:'0 0 auto',padding:'0 11px',borderRadius:'999px',lineHeight:'24px',whiteSpace:'nowrap',fontSize:'10px',margin:'0'});
  });
 };
 const css=document.createElement('style');css.textContent=`.statusCard .tag{width:max-content!important;height:24px!important;min-width:max-content!important;min-height:24px!important;max-height:24px!important;aspect-ratio:auto!important;padding:0 11px!important;border-radius:999px!important;line-height:24px!important;white-space:nowrap!important}.statusCard{align-items:flex-start!important}`;document.head.appendChild(css);
 const wrap=n=>{const f=window[n];if(typeof f!=='function'||f.__v158)return;const w=function(){const r=f.apply(this,arguments);requestAnimationFrame(apply);return r};w.__v158=true;window[n]=w};
 ['renderTrainingList','renderRaceList','renderScheduleList','showPage'].forEach(wrap);
 document.addEventListener('DOMContentLoaded',apply,{once:true});setTimeout(apply,400);
})();