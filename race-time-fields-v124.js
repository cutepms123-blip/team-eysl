/* TEAM EYSL race time field fix v124 */
(()=>{
  if(window.__RACE_TIME_FIELDS_V124__)return;
  window.__RACE_TIME_FIELDS_V124__=true;

  function enforceRaceTimeFields(){
    const type=document.getElementById('aType');
    const wrap=document.getElementById('scheduleTimeFields');
    if(!type||!wrap)return;
    const isRace=type.value==='race';
    if(isRace){
      wrap.style.setProperty('display','none','important');
      const start=document.getElementById('aStart');
      const end=document.getElementById('aEnd');
      if(start)start.value='';
      if(end)end.value='';
    }else{
      wrap.style.removeProperty('display');
      wrap.style.display='grid';
    }
  }

  const baseRender=window.renderAdminFields;
  if(typeof baseRender==='function'){
    window.renderAdminFields=function(){
      const result=baseRender.apply(this,arguments);
      enforceRaceTimeFields();
      return result;
    };
  }

  const baseEdit=window.editActivity;
  if(typeof baseEdit==='function'){
    window.editActivity=function(id){
      const result=baseEdit.apply(this,arguments);
      enforceRaceTimeFields();
      requestAnimationFrame(enforceRaceTimeFields);
      setTimeout(enforceRaceTimeFields,30);
      return result;
    };
  }

  const baseShowPage=window.showPage;
  if(typeof baseShowPage==='function'){
    window.showPage=function(id){
      const result=baseShowPage.apply(this,arguments);
      if(id==='adminSchedule'){
        requestAnimationFrame(enforceRaceTimeFields);
        setTimeout(enforceRaceTimeFields,30);
      }
      return result;
    };
  }

  document.addEventListener('change',event=>{
    if(event.target?.id==='aType')enforceRaceTimeFields();
  });

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enforceRaceTimeFields);
  else enforceRaceTimeFields();
})();
