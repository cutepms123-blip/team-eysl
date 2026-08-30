/* TEAM EYSL v109 — reserve scroll space above sticky attendance save bar */
(function(){
  const style=document.createElement('style');
  style.id='attendance-layout-v109';
  style.textContent=`
    #attendanceAdminDetail.active #attAdminDetailBody{
      padding-bottom:260px!important;
    }
    #attendanceSaveBoxV105{
      bottom:94px!important;
    }
    @media (max-width:430px){
      #attendanceAdminDetail.active #attAdminDetailBody{
        padding-bottom:280px!important;
      }
    }
  `;
  document.head.appendChild(style);
})();
