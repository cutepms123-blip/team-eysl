/* TEAM EYSL v113 — remove activity aggregation menu/page */
(function(){
  function removeAggregationUi(){
    document.querySelectorAll('[onclick]').forEach(el=>{
      const handler=el.getAttribute('onclick')||'';
      if(handler.includes("applicationAdmin")||handler.includes("renderApplicationAdmin")){
        const label=(el.textContent||'').trim();
        if(label.includes('활동 취합본')||handler.includes("drawerGo('applicationAdmin')"))el.remove();
      }
    });
    const page=document.getElementById('applicationAdmin');
    if(page)page.remove();
  }

  removeAggregationUi();
  const observer=new MutationObserver(removeAggregationUi);
  if(document.body)observer.observe(document.body,{childList:true,subtree:true});
})();
