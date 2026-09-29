/* TEAM EYSL legacy test-center compatibility shim */
(function(){
 if(window.__EYSL_TEST_CENTER_LEGACY_SHIM__)return;
 window.__EYSL_TEST_CENTER_LEGACY_SHIM__=true;
 function bridge(){
  if(typeof window.openTestCenter==='function'){
   window.openWaitlistTest=window.openTestCenter;
   return true;
  }
  return false;
 }
 if(bridge())return;
 var existing=document.querySelector('script[data-eysl-test-center-v208]');
 if(existing){
  existing.addEventListener('load',bridge,{once:true});
  return;
 }
 var s=document.createElement('script');
 s.src='/test-center-v208.js?v=compat208';
 s.dataset.eyslTestCenterV208='1';
 s.onload=bridge;
 document.body.appendChild(s);
})();