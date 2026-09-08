/* TEAM EYSL v157 horizontal status pills: race + training */
(()=>{
 if(window.__EYSL_COMPACT_STATUS_V157__)return;window.__EYSL_COMPACT_STATUS_V157__=true;
 const css=document.createElement('style');
 css.textContent=`
#raceCards .tag,#raceCards .statusCard .tag,
#trainingCards .tag,#trainingCards .statusCard .tag,
#trainingList .tag,#trainingList .statusCard .tag{
  width:max-content!important;height:24px!important;min-width:max-content!important;min-height:24px!important;max-height:24px!important;aspect-ratio:auto!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;flex:0 0 auto!important;padding:0 11px!important;border-radius:999px!important;line-height:24px!important;white-space:nowrap!important;font-size:10px!important;margin:0!important;
}
#raceCards .statusCard,#trainingCards .statusCard,#trainingList .statusCard{align-items:flex-start!important;}
`;
 document.head.appendChild(css);
})();