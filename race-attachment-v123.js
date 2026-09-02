/* TEAM EYSL race attachment v123 */
(()=>{
  if(window.__RACE_ATTACHMENT_V123__)return;
  window.__RACE_ATTACHMENT_V123__=true;

  const baseRegisterSchedule=registerSchedule;
  const baseEditActivity=editActivity;

  const style=document.createElement('style');
  style.id='RACE_ATTACHMENT_V123_STYLE';
  style.textContent=`
    .raceAttachmentStack{display:flex;flex-direction:column;gap:9px}
    .raceAttachmentImage{width:100%;max-height:340px;object-fit:contain;display:block;border:1px solid var(--line);border-radius:15px;background:#f4f5f7}
    .raceAttachmentVideo{width:100%;max-height:340px;display:block;border:1px solid var(--line);border-radius:15px;background:#000}
    .raceAttachmentFile{width:100%;border:1px solid var(--line);border-radius:14px;background:#fff;padding:12px 13px;display:flex;align-items:center;gap:10px;text-decoration:none;color:#111;box-sizing:border-box}
    .raceAttachmentFile .raceFileIcon{width:38px;height:38px;border-radius:11px;background:#f1f3f5;display:grid;place-items:center;flex:0 0 auto}
    .raceAttachmentFile b{font-size:11px;overflow-wrap:anywhere}.raceAttachmentFile span{font-size:9px;color:#999;display:block;margin-top:3px}
    .raceExternalLink{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;border:1px solid var(--line);border-radius:14px;background:#fff;padding:12px 13px;text-decoration:none;color:#2687ef;font-size:11px;box-sizing:border-box;overflow-wrap:anywhere}
  `;
  document.head.appendChild(style);

  function cleanStoredAttachments(value){
    return (Array.isArray(value)?value:[]).filter(a=>a&&a.storagePath).map(a=>({
      name:String(a.name||'첨부파일'),
      type:String(a.type||'application/octet-stream'),
      storagePath:String(a.storagePath)
    }));
  }

  async function uploadRaceAttachments(files){
    const out=[];
    for(const file of files){
      const storagePath=await uploadBlobToTeamFiles(file,'activities');
      out.push({name:file.name,type:file.type||'application/octet-stream',storagePath});
    }
    return out;
  }

  registerSchedule=async function(){
    const type=document.getElementById('aType')?.value;
    if(type!=='race')return baseRegisterSchedule.apply(this,arguments);

    const title=document.getElementById('aTitle')?.value.trim()||'';
    const date=document.getElementById('aDate')?.value||'';
    const place=document.getElementById('aPlace')?.value.trim()||'';
    if(!title||!date||!place)return toast('필수 항목을 입력해주세요');
    if(!canCreateActivityType('race'))return toast('이 일정 종류의 작성 권한이 없습니다.');

    const wasEdit=!!currentEditingActivityId;
    if(wasEdit){
      const existing=getActivityById(currentEditingActivityId),existingKind=getActivityKind(currentEditingActivityId);
      if(!canEditActivityItem(existing,existingKind))return toast('수정 권한이 없습니다.');
    }

    const saveBtn=document.getElementById('scheduleSaveBtn');
    const fileInput=document.getElementById('aAttach');
    const selectedFiles=[...(fileInput?.files||[])];
    if(selectedFiles.length>8)return toast('첨부파일은 한 번에 최대 8개까지 등록해주세요.');

    if(saveBtn){saveBtn.disabled=true;saveBtn.textContent=selectedFiles.length?'파일 업로드 중...':(wasEdit?'수정 저장 중...':'등록 중...');}

    try{
      let existingDetails={};
      if(wasEdit){
        const {data,error}=await dbClient.from('activities').select('details').eq('id',currentEditingActivityId).single();
        if(error)throw error;
        existingDetails=(data?.details&&typeof data.details==='object')?data.details:{};
      }

      const oldAttachments=cleanStoredAttachments(existingDetails.attachments);
      const newAttachments=selectedFiles.length?await uploadRaceAttachments(selectedFiles):[];
      const details={
        ...existingDetails,
        info:document.getElementById('aDetail')?.value.trim()||'',
        link:document.getElementById('aLink')?.value.trim()||'',
        planBy:currentUser.nickname,
        planDate:date,
        relays:Array.isArray(existingDetails.relays)?existingDetails.relays:(getActivityById(currentEditingActivityId)?.relays||[]),
        participants:Array.isArray(existingDetails.participants)?existingDetails.participants:[],
        waitlist:Array.isArray(existingDetails.waitlist)?existingDetails.waitlist:[],
        attachments:[...oldAttachments,...newAttachments]
      };

      const payload={
        kind:'race',title,activity_date:date,start_time:null,end_time:null,place,capacity:null,details,
        updated_at:new Date().toISOString()
      };
      let error=null;
      if(wasEdit){
        ({error}=await dbClient.from('activities').update(payload).eq('id',currentEditingActivityId));
      }else{
        payload.created_by=currentUser.memberId;
        ({error}=await dbClient.from('activities').insert(payload));
      }
      if(error)throw error;

      if(fileInput)fileInput.value='';
      await loadPersistentContent();
      resetScheduleForm();
      renderHome();renderCalendar();renderTrainingList();renderRaceList();
      if(!wasEdit)await sendPush('all','TEAM EYSL 새 대회',`${date} · ${title}`,{tag:'new-race',url_path:'/?open=schedule'});
      showPage('schedule');
      toast(wasEdit?'대회 일정이 수정됐습니다.':'대회 일정이 등록됐습니다.');
    }catch(err){
      console.error('race attachment save v123:',err);
      toast(`대회 일정 저장에 실패했습니다${err?.message?' · '+err.message:''}`);
    }finally{
      if(saveBtn){saveBtn.disabled=false;saveBtn.textContent=wasEdit?'수정 저장':'일정 등록';}
    }
  };

  editActivity=function(id){
    const result=baseEditActivity.apply(this,arguments);
    const input=document.getElementById('aAttach');if(input)input.value='';
    return result;
  };

  function attachmentHtml(a,url){
    const name=escHtml(a.name||'첨부파일');
    const attrUrl=escAttr(url||'');
    const type=String(a.type||'');
    if(type.startsWith('image/'))return `<img class="raceAttachmentImage" src="${attrUrl}" alt="${escAttr(a.name||'대회 첨부 이미지')}" onclick="openAttachment('${attrUrl}','${escAttr(type)}')">`;
    if(type.startsWith('video/'))return `<video class="raceAttachmentVideo" src="${attrUrl}" controls playsinline></video>`;
    return `<a class="raceAttachmentFile" href="${attrUrl}" target="_blank" rel="noopener"><span class="raceFileIcon">📎</span><span class="grow"><b>${name}</b><span>파일 열기</span></span><strong>›</strong></a>`;
  }

  openRaceDetail=async function(){
    if(!race?.id)return toast('대회 정보를 찾을 수 없습니다.');
    showPage('raceDetail');
    const body=document.getElementById('raceDetailBody');if(!body)return;
    body.innerHTML='<div class="card meta">대회 상세 정보를 불러오는 중...</div>';

    try{
      const {data,error}=await dbClient.from('activities').select('details').eq('id',race.id).single();
      if(error)throw error;
      const details=(data?.details&&typeof data.details==='object')?data.details:{};
      const attachments=cleanStoredAttachments(details.attachments);
      const renderedAttachments=await Promise.all(attachments.map(async a=>{
        try{const url=await signedTeamFile(a.storagePath);return url?attachmentHtml(a,url):''}catch(_){return ''}
      }));
      const attachmentBlock=renderedAttachments.filter(Boolean).join('');
      const link=String(details.link||'').trim();
      const linkBlock=link?`<a class="raceExternalLink" href="${escAttr(link)}" target="_blank" rel="noopener"><span>${escHtml(link)}</span><b>↗</b></a>`:'';
      const done=activityHasStarted(race),app=!!race.application;
      const relays=Array.isArray(race.relays)&&race.relays.length?race.relays:(Array.isArray(details.relays)?details.relays:[]);
      const relaysHtml=relays.length?relays.map(x=>`<span class="tag">${escHtml(x)}</span>`).join(''):'<span class="meta">등록된 단체전 정보가 없습니다.</span>';
      const detailText=String(details.info||details.detail||race.detail||'').trim();

      body.innerHTML=`<div class="detail">
        <div class="detailrow"><b>대회명</b><span>${escHtml(race.title||'-')}</span></div>
        <div class="detailrow"><b>일정</b><span>${escHtml(race.date||'-')}${race.endDate&&race.endDate!==race.date?` ~ ${escHtml(race.endDate)}`:''}</span></div>
        <div class="detailrow"><b>장소</b><span>${escHtml(race.place||'-')}</span></div>
        <div class="detailrow"><b>상태</b><span>${done?'종료':app?'신청완료':'신청 가능'}</span></div>
      </div>
      <div class="section"><h2>대회 상세 정보</h2></div>
      <div class="card"><p style="white-space:pre-wrap;line-height:1.7">${detailText?escHtml(detailText):'등록된 상세 정보가 없습니다.'}</p></div>
      ${(attachmentBlock||linkBlock)?`<div class="section"><h2>첨부</h2></div><div class="raceAttachmentStack">${attachmentBlock}${linkBlock}</div>`:''}
      <div class="section"><h2>단체전 옵션</h2></div>
      <div class="card"><div class="filters" style="margin:0">${relaysHtml}</div></div>
      <div class="actions">${done?'':`<button class="btn primary" onclick="openRaceApply()">${app?'신청 수정':'신청하기'}</button>`}<button class="btn outline" onclick="openGenericApplyStatus('race','${race.id}')">신청현황</button></div>
      ${adminActivityActions(race.id)}`;
    }catch(err){
      console.error('race detail v123:',err);
      body.innerHTML='<div class="card meta">대회 상세 정보를 불러오지 못했습니다.</div>';
    }
  };
})();
