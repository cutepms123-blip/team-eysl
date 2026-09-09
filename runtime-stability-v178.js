/* TEAM EYSL v178 — centralized startup stability guard */
(()=>{
  if(window.__EYSL_RUNTIME_STABILITY_V178__)return;
  window.__EYSL_RUNTIME_STABILITY_V178__=true;

  let contentSettled=false;
  let contentFlight=null;
  let chatFlight=null;

  function installSingleFlight(name,kind){
    const original=window[name];
    if(typeof original!=='function')return;

    const wrapped=function(...args){
      const active=kind==='content'?contentFlight:chatFlight;
      if(active)return active;

      const run=Promise.resolve().then(()=>original.apply(this,args));
      let tracked;
      tracked=run.finally(()=>{
        if(kind==='content'){
          contentSettled=true;
          if(contentFlight===tracked)contentFlight=null;
        }else if(chatFlight===tracked){
          chatFlight=null;
        }
      });

      if(kind==='content')contentFlight=tracked;
      else chatFlight=tracked;
      return tracked;
    };

    window[name]=wrapped;
  }

  // Prevent the same network load from running twice when auth/session/update helpers
  // fire at nearly the same time.
  installSingleFlight('loadPersistentContent','content');
  installSingleFlight('loadPersistentChat','chat');

  const gatedRenders=[
    'renderHome','renderNotices','renderGroup','renderDmList','renderCalendar',
    'renderTrainingList','renderRaceList','renderActivity','initAttendanceOptions',
    'renderAttendance','renderMembers','renderMemberDirectory','renderAttendanceAdmin',
    'renderFolders','renderResourceFiles'
  ];

  // The original boot path restores a local snapshot and immediately renders it,
  // then loads server data and renders the same screens again. Gate only that first
  // render pass. Once the first content load settles (success or failure), normal
  // rendering is permanently restored for the rest of the session.
  gatedRenders.forEach(name=>{
    const original=window[name];
    if(typeof original!=='function')return;
    window[name]=function(...args){
      if(!contentSettled)return undefined;
      return original.apply(this,args);
    };
  });

  window.__eyslContentBootSettled=()=>contentSettled;
})();
