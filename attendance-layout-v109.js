/* TEAM EYSL v110 — keep attendance save box below roster */
(function(){
  const style=document.createElement('style');
  style.id='attendance-layout-v110';
  style.textContent=`
    #attendanceAdminDetail.active #attAdminDetailBody{
      padding-bottom:120px!important;
    }
    #attendanceSaveBoxV105{
      position:relative!important;
      bottom:auto!important;
      z-index:auto!important;
      margin-top:18px!important;
      box-shadow:none!important;
    }
  `;
  document.head.appendChild(style);
})();
