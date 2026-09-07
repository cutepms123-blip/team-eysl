/* TEAM EYSL v140 — remove activity aggregation once, no global mutation scan */
(function(){
  if(window.__REMOVE_AGGREGATION_V140__)return;window.__REMOVE_AGGREGATION_V140__=true;
  function removeAggregationUi(){
    document.querySelectorAll('[onclick*="applicationAdmin"],[onclick*="renderApplicationAdmin"]').forEach(el=>{
      const handler=el.getAttribute('onclick')||'',label=(el.textContent||'').trim();
      if(label.includes('활동 취합본')||handler.includes("drawerGo('applicationAdmin')"))el.remove();
    });
    document.getElementById('applicationAdmin')?.remove();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',removeAggregationUi,{once:true});else removeAggregationUi();
})();