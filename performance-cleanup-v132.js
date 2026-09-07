/* TEAM EYSL v132 — lightweight feature loading */
(()=>{
 if(window.__PERFORMANCE_CLEANUP_V132__)return;window.__PERFORMANCE_CLEANUP_V132__=true;
 let datePickerPromise=null;
 function loadDatePicker(){
  if(window.__NOTICE_DATE_PICKER_V120__)return Promise.resolve();
  if(datePickerPromise)return datePickerPromise;
  datePickerPromise=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='/notice-date-picker-v119.js?v=final132-lazy';s.async=true;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)}).catch(err=>{datePickerPromise=null;console.warn('date picker lazy load:',err)});
  return datePickerPromise;
 }
 const baseShow=window.showPage;
 if(typeof baseShow==='function'){
  window.showPage=function(id){const out=baseShow.apply(this,arguments);if(id==='noticeWrite')void loadDatePicker();return out};
  try{showPage=window.showPage}catch(_){ }
 }
})();