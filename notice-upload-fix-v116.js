/* TEAM EYSL notice upload fix v116 */
(()=>{
  if(window.__NOTICE_UPLOAD_FIX_V116__)return;
  window.__NOTICE_UPLOAD_FIX_V116__=true;

  const MAX_NOTICE_FILE_BYTES=100*1024*1024;

  function noticeUploadMime(file){
    if(file?.type)return file.type;
    const ext=String(file?.name||'').split('.').pop()?.toLowerCase()||'';
    const map={jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',gif:'image/gif',webp:'image/webp',heic:'image/heic',heif:'image/heif',mov:'video/quicktime',mp4:'video/mp4'};
    return map[ext]||'application/octet-stream';
  }

  function noticeUploadSafeName(name){
    if(typeof safePathName==='function')return safePathName(name);
    return String(name||'file').replace(/[^\w.\-가-힣]+/g,'_');
  }

  async function noticeUploadSession(forceRefresh=false){
    let session=null;
    if(forceRefresh){
      const refreshed=await dbClient.auth.refreshSession();
      session=refreshed?.data?.session||null;
      if(refreshed?.error)throw refreshed.error;
    }else{
      const got=await dbClient.auth.getSession();
      if(got?.error)throw got.error;
      session=got?.data?.session||null;
      if(session?.expires_at && session.expires_at*1000-Date.now()<120000){
        const refreshed=await dbClient.auth.refreshSession();
        if(!refreshed?.error&&refreshed?.data?.session)session=refreshed.data.session;
      }
    }
    if(!session)throw new Error('로그인 세션이 없습니다. 앱을 다시 열어주세요.');
    return session;
  }

  async function noticeUploadMemberId(){
    const member=typeof memberFromSession==='function'?await memberFromSession():null;
    if(!member?.id)throw new Error('승인된 회원 정보를 확인하지 못했습니다. 다시 로그인해주세요.');
    if(member.status&&member.status!=='approved')throw new Error('승인된 회원만 사진을 올릴 수 있습니다.');
    try{
      if(typeof currentUser!=='undefined'&&currentUser)currentUser.memberId=member.id;
    }catch(_){}
    return member.id;
  }

  async function uploadNoticeFileOnce(file,memberId){
    const path=`${memberId}/notices/${Date.now()}_${Math.random().toString(36).slice(2,8)}_${noticeUploadSafeName(file.name)}`;
    const {data,error}=await dbClient.storage.from('team-files').upload(path,file,{
      upsert:false,
      contentType:noticeUploadMime(file),
      cacheControl:'3600'
    });
    if(error)throw error;
    return data?.path||path;
  }

  function retryableUploadError(error){
    const text=String(error?.message||error||'').toLowerCase();
    const status=Number(error?.statusCode||error?.status||0);
    return status===401||status===403||/jwt|token|session|row-level|rls|unauthor|forbidden/.test(text);
  }

  async function uploadNoticeFileV116(file){
    if(!file)throw new Error('파일을 선택하지 못했습니다.');
    if(file.size>MAX_NOTICE_FILE_BYTES)throw new Error('파일이 100MB를 넘습니다.');
    await noticeUploadSession(false);
    let memberId=await noticeUploadMemberId();
    try{
      return await uploadNoticeFileOnce(file,memberId);
    }catch(first){
      if(!retryableUploadError(first))throw first;
      await noticeUploadSession(true);
      memberId=await noticeUploadMemberId();
      return await uploadNoticeFileOnce(file,memberId);
    }
  }

  window.collectNoticeFiles=async function(inp){
    const files=[...(inp?.files||[])];
    if(inp)inp.value='';
    if(!files.length)return;

    for(const f of files){
      if(noticeAttachments.length>=4){toast('첨부는 최대 4개까지 가능합니다.');break}

      let localUrl='';
      try{localUrl=URL.createObjectURL(f)}catch(_){}
      const item={
        name:f.name||'사진',
        type:noticeUploadMime(f),
        storagePath:'',
        url:localUrl,
        localUrl,
        uploading:true,
        uploadError:false
      };
      noticeAttachments.push(item);
      renderNoticeFileChips();

      try{
        const storagePath=await uploadNoticeFileV116(f);
        const signedUrl=typeof signedTeamFile==='function'?await signedTeamFile(storagePath):'';
        item.storagePath=storagePath;
        item.uploading=false;
        item.uploadError=false;
        if(signedUrl){
          if(item.localUrl){try{URL.revokeObjectURL(item.localUrl)}catch(_){}}
          item.url=signedUrl;
          item.localUrl='';
        }
      }catch(err){
        console.error('notice upload v116:',err);
        item.uploading=false;
        item.uploadError=true;
        const message=String(err?.message||err||'알 수 없는 오류');
        toast(`사진 업로드 실패 · ${message}`);
      }
      renderNoticeFileChips();
    }
  };
})();
