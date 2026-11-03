/* TEAM EYSL v218: neutral record styling. No runtime button recoloring. */
(()=>{
 if(window.__EYSL_RECORDS_V164__)return;
 window.__EYSL_RECORDS_V164__=true;
 const css=document.createElement('style');
 css.id='eysl-records-clean-v218';
 css.textContent=`
 #records .recordTabs button,#records .recordDetailTabs button,
 #records .recordDistanceTabs button,#myRecords .recordTabs button{
  background:#23252A!important;color:#F5F5F5!important;
  -webkit-text-fill-color:#F5F5F5!important;border:1px solid #555961!important;
  box-shadow:none!important;
 }
 #records .recordTabs button.active,#records .recordDetailTabs button.active,
 #records .recordDistanceTabs button.active,#myRecords .recordTabs button.active{
  background:#241C1D!important;color:#FF8B76!important;
  -webkit-text-fill-color:#FF8B76!important;border-color:#F24B35!important;
 }
 #records .screenshotPb,#records .pbCard.screenshotPb{
  background:#FAFBFC!important;background-image:none!important;
  color:#15171A!important;border-color:#D6D9DD!important;box-shadow:none!important;
 }
 #records .screenshotPb:before,#records .screenshotPb:after{
  content:none!important;display:none!important;
 }
 #records .screenshotPb span{color:#656B73!important;-webkit-text-fill-color:#656B73!important}
 #records .screenshotPb b{color:#15171A!important;-webkit-text-fill-color:#15171A!important}
 `;
 document.head.appendChild(css);
})();