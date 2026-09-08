/* TEAM EYSL v155 compact race status badge */
(()=>{
 if(window.__EYSL_COMPACT_STATUS_V155__)return;window.__EYSL_COMPACT_STATUS_V155__=true;
 const css=document.createElement('style');
 css.textContent=`
#raceCards .tag,
#raceCards .statusCard .tag{
  width:auto!important;
  height:auto!important;
  min-width:0!important;
  min-height:0!important;
  aspect-ratio:auto!important;
  display:inline-flex!important;
  align-items:center!important;
  justify-content:center!important;
  flex:0 0 auto!important;
  padding:5px 9px!important;
  border-radius:999px!important;
  line-height:1.15!important;
  white-space:nowrap!important;
  font-size:10px!important;
  margin:0!important;
}
#raceCards .statusCard{align-items:flex-start!important;}
`;
 document.head.appendChild(css);
})();