/* TEAM EYSL auth session recovery v126 */
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
    if(lastError)console.warn('auth session v126:',lastError);
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
    if(lastError)console.warn('auth member v126:',lastError);
    return null;
  }

  window.memberFromSession=robustMemberFromSession;
  try{memberFromSession=robustMemberFromSession}catch(_){ }

  // If Supabase finishes refreshing just after app load, recover the UI instead of
  // leaving the login sheet open until the user manually signs in again.
  let recovering=false;
  dbClient.auth.onAuthStateChange(async(event,session)=>{
    if(recovering||!session||!['SIGNED_IN','TOKEN_REFRESHED','INITIAL_SESSION'].includes(event))return;
    if(currentUser?.memberId)return;
    recovering=true;
    try{
      const member=await robustMemberFromSession();
      if(member?.status==='approved'){
        await setCurrentUserFromMember(member);
        document.getElementById('auth')?.classList.remove('open');
        applyRole();
        try{restoreCoreSnapshot();restoreChatCache()}catch(_){ }
        try{await loadPersistentContent()}catch(_){ }
      }
    }catch(err){console.warn('auth ui recovery v126:',err)}
    finally{recovering=false}
  });
})();
