/* TEAM EYSL v178 — robust auth session lookup without duplicate UI boot */
(()=>{
  if(window.__AUTH_SESSION_V126__)return;
  window.__AUTH_SESSION_V126__=true;

  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const CACHE_KEY='eysl-auth-member-v126';

  function saveCachedMember(member){
    try{
      if(!member?.id)return;
      localStorage.setItem(CACHE_KEY,JSON.stringify({
        id:member.id,
        nickname:member.nickname||'',
        role:member.role||'member',
        status:member.status||'',
        birth_year:member.birth_year||null,
        gender:member.gender||'',
        real_name:member.real_name||'',
        avatar_path:member.avatar_path||null,
        created_at:member.created_at||null,
        saved_at:Date.now()
      }));
    }catch(_){ }
  }

  function readCachedMember(){
    try{
      const v=JSON.parse(localStorage.getItem(CACHE_KEY)||'null');
      if(!v?.id||v.status!=='approved')return null;
      if(Date.now()-Number(v.saved_at||0)>1000*60*60*24*14)return null;
      return v;
    }catch(_){return null}
  }

  async function getUsableSession(){
    let lastError=null;
    for(let attempt=0;attempt<3;attempt++){
      try{
        const got=await dbClient.auth.getSession();
        lastError=got.error||null;
        let session=got.data?.session||null;
        if(session){
          const expMs=Number(session.expires_at||0)*1000;
          if(!expMs||expMs<=Date.now()+120000){
            const refreshed=await dbClient.auth.refreshSession();
            if(refreshed.data?.session)session=refreshed.data.session;
            else if(refreshed.error)lastError=refreshed.error;
          }
          if(session)return session;
        }
      }catch(err){lastError=err}
      if(attempt<2)await sleep(attempt===0?120:300);
    }
    if(lastError)console.warn('auth session v178:',lastError);
    return null;
  }

  async function robustMemberFromSession(){
    let session=await getUsableSession();
    if(!session)return null;

    let lastError=null;
    for(let attempt=0;attempt<3;attempt++){
      try{
        const {data,error}=await dbClient.rpc('get_my_member');
        const member=Array.isArray(data)?data[0]:data;
        if(!error&&member){
          saveCachedMember(member);
          return member;
        }
        lastError=error||new Error('member not found');
      }catch(err){lastError=err}

      if(attempt===0){
        try{
          const refreshed=await dbClient.auth.refreshSession();
          if(refreshed.data?.session)session=refreshed.data.session;
        }catch(err){lastError=err}
      }
      if(attempt<2)await sleep(attempt===0?120:300);
    }

    const cached=readCachedMember();
    if(cached){
      console.warn('auth member rpc temporary failure; using cached approved member',lastError);
      return cached;
    }
    if(lastError)console.warn('auth member v178:',lastError);
    return null;
  }

  // Keep only the resilient session/member lookup. The old auth-state listener also
  // called loadPersistentContent(), which could race the normal startup path and load
  // the same data twice. Startup rendering/loading is owned by the main boot flow.
  window.memberFromSession=robustMemberFromSession;
  try{memberFromSession=robustMemberFromSession}catch(_){ }
})();
