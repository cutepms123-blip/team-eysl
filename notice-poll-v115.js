/* TEAM EYSL notice poll v115 */
(()=>{
  if(window.__NOTICE_POLL_V115__)return;
  window.__NOTICE_POLL_V115__=true;

  const uid=()=>{try{return crypto.randomUUID()}catch(_){return 'opt-'+Date.now()+'-'+Math.random().toString(36).slice(2)}};
  const esc=s=>typeof escHtml==='function'?escHtml(String(s??'')):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const defaultState=()=>({enabled:false,optionType:'text',title:'',options:[{id:uid(),label:''},{id:uid(),label:''},{id:uid(),label:''}],allowMultiple:false,anonymous:false,allowOptionAdd:false,closesAt:''});
  let composer=defaultState();
  let pendingDraft=null;
  let pendingPollError=null;
  const voteDrafts=new Map();

  const style=document.createElement('style');
  style.id='NOTICE_POLL_V115_STYLE';
  style.textContent=`
  #noticePollComposerMount{margin:14px 0 16px}
  .pollAddButton{width:100%;border:1px solid #dfe2e6;background:#fff;border-radius:16px;padding:16px;font-size:14px;font-weight:800;color:#555}
  .pollComposerCard,.pollDeadlineCard,.noticePollCard{background:#f8f8f8;border:1px solid #dedede;border-radius:16px;padding:14px;margin-top:12px}
  .pollComposerTop{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:13px}
  .pollTypeTabs{display:flex;gap:7px}.pollTypeTabs button{border:1px solid #d8d8d8;background:#fff;border-radius:999px;padding:8px 14px;font-size:12px;font-weight:800}.pollTypeTabs button.active{background:#111;color:#fff;border-color:#111}
  .pollRemoveBtn{border:0;background:none;color:#999;font-size:11px;padding:6px}
  .pollInput{width:100%;border:0!important;background:#fff!important;border-radius:12px!important;padding:13px 14px!important;margin:0 0 8px!important;font-size:13px!important;outline:none}
  .pollOptionRow{display:flex;gap:7px;align-items:center}.pollOptionRow .pollInput{margin-bottom:8px}.pollOptionDelete{width:34px;height:34px;border:0;background:#eee;border-radius:50%;font-size:16px;color:#777;flex:0 0 auto}
  .pollOptionAdd{width:100%;border:0;background:#fff;border-radius:12px;padding:13px;font-size:12px;color:#777;margin:1px 0 13px}
  .pollChecks{display:flex;flex-direction:column;gap:12px;padding:4px 2px}.pollCheck{display:flex;align-items:center;gap:10px;font-size:12px;font-weight:700;color:#333}.pollCheck input{appearance:none;width:23px;height:23px;border:2px solid #999;border-radius:50%;margin:0;display:grid;place-items:center}.pollCheck input:checked{border-color:#111;background:#111;box-shadow:inset 0 0 0 5px #fff}
  .pollDeadlineCard label{display:block;font-size:11px;font-weight:800;margin-bottom:9px}.pollDeadlineCard input{width:100%;border:0;background:#fff;border-radius:12px;padding:13px;font-size:12px}
  .noticePollCard{background:#fff;margin:18px 0 2px;padding:16px}.noticePollHead{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.noticePollHead h3{margin:0;font-size:17px}.noticePollMeta{font-size:10px;color:#8b8f94;margin-top:5px}.pollClosed{font-size:10px;background:#eceff2;color:#777;padding:5px 8px;border-radius:999px;white-space:nowrap}
  .pollVoteList{display:flex;flex-direction:column;gap:8px;margin-top:14px}.pollVoteOption{width:100%;border:1px solid #e1e4e8;background:#fafafa;border-radius:13px;padding:11px 12px;text-align:left;display:grid;grid-template-columns:23px minmax(0,1fr) auto;gap:9px;align-items:center}.pollVoteOption.selected{border-color:#111;background:#f3f3f3}.pollVoteMark{width:20px;height:20px;border:2px solid #aaa;border-radius:50%;display:block}.pollVoteOption.selected .pollVoteMark{border-color:#111;background:#111;box-shadow:inset 0 0 0 4px #fff}.pollVoteLabel{font-size:12px;font-weight:800;overflow-wrap:anywhere}.pollVoteCount{font-size:11px;color:#777}.pollVoters{grid-column:2/4;font-size:9px;color:#999;line-height:1.5}
  .pollVoteActions{display:flex;gap:7px;margin-top:12px}.pollVoteActions button{flex:1;border:0;border-radius:12px;padding:11px;font-size:11px;font-weight:850}.pollVotePrimary{background:#111;color:#fff}.pollVoteGhost{background:#eef0f2;color:#555}
  .pollAddOptionInline{display:flex;gap:7px;margin-top:12px}.pollAddOptionInline input{flex:1;min-width:0;border:1px solid #e1e4e8;border-radius:11px;padding:10px;font-size:11px}.pollAddOptionInline button{border:0;border-radius:11px;background:#111;color:#fff;padding:0 12px;font-size:11px}
  .pollLoading{font-size:11px;color:#999;padding:12px 0}
  `;
  document.head.appendChild(style);

  function ensureComposerMount(){
    const save=document.getElementById('noticeSaveBtn');
    if(!save||document.getElementById('noticePollComposerMount'))return;
    const mount=document.createElement('div');mount.id='noticePollComposerMount';
    save.parentNode.insertBefore(mount,save);
    renderComposer();
  }

  function setType(type){composer.optionType=type==='date'?'date':'text';renderComposer()}
  function syncComposerFromDom(){
    const mount=document.getElementById('noticePollComposerMount');if(!mount||!composer.enabled)return;
    const title=mount.querySelector('#pollV115Title');if(title)composer.title=title.value;
    mount.querySelectorAll('[data-poll-option-id]').forEach(inp=>{const o=composer.options.find(x=>x.id===inp.dataset.pollOptionId);if(o)o.label=inp.value});
    composer.allowMultiple=!!mount.querySelector('#pollV115Multiple')?.checked;
    composer.anonymous=!!mount.querySelector('#pollV115Anonymous')?.checked;
    composer.allowOptionAdd=!!mount.querySelector('#pollV115AllowAdd')?.checked;
    composer.closesAt=mount.querySelector('#pollV115Closes')?.value||'';
  }
  function enableComposer(){composer=defaultState();composer.enabled=true;renderComposer()}
  function removeComposer(){composer=defaultState();renderComposer()}
  function addComposerOption(){syncComposerFromDom();composer.options.push({id:uid(),label:''});renderComposer()}
  function deleteComposerOption(id){syncComposerFromDom();if(composer.options.length<=2)return toast('투표 항목은 최소 2개가 필요해요.');composer.options=composer.options.filter(x=>x.id!==id);renderComposer()}

  function renderComposer(){
    const mount=document.getElementById('noticePollComposerMount');if(!mount)return;
    if(!composer.enabled){mount.innerHTML='<button type="button" class="pollAddButton" onclick="pollV115Enable()">＋ 투표 추가하기</button>';return}
    const inputType=composer.optionType==='date'?'date':'text';
    const options=composer.options.map((o,i)=>`<div class="pollOptionRow"><input class="pollInput" type="${inputType}" data-poll-option-id="${esc(o.id)}" value="${esc(o.label)}" placeholder="항목 입력"><button type="button" class="pollOptionDelete" onclick="pollV115DeleteOption('${esc(o.id)}')">×</button></div>`).join('');
    mount.innerHTML=`
      <div class="pollComposerCard">
        <div class="pollComposerTop"><div class="pollTypeTabs"><button type="button" class="${composer.optionType==='text'?'active':''}" onclick="pollV115SetType('text')">텍스트</button><button type="button" class="${composer.optionType==='date'?'active':''}" onclick="pollV115SetType('date')">날짜</button></div><button type="button" class="pollRemoveBtn" onclick="pollV115Remove()">투표 삭제</button></div>
        <input id="pollV115Title" class="pollInput" value="${esc(composer.title)}" placeholder="투표 제목">
        <div id="pollV115Options">${options}</div>
        <button type="button" class="pollOptionAdd" onclick="pollV115AddOption()">＋ 항목 추가</button>
        <div class="pollChecks">
          <label class="pollCheck"><input id="pollV115Multiple" type="checkbox" ${composer.allowMultiple?'checked':''}>복수선택</label>
          <label class="pollCheck"><input id="pollV115Anonymous" type="checkbox" ${composer.anonymous?'checked':''}>익명투표</label>
          <label class="pollCheck"><input id="pollV115AllowAdd" type="checkbox" ${composer.allowOptionAdd?'checked':''}>선택항목 추가 허용</label>
        </div>
      </div>
      <div class="pollDeadlineCard"><label>투표 종료시간 설정</label><input id="pollV115Closes" type="datetime-local" value="${esc(composer.closesAt)}"></div>`;
  }

  function collectDraft(){
    ensureComposerMount();syncComposerFromDom();
    if(!composer.enabled)return null;
    const title=String(composer.title||'').trim();
    const options=composer.options.map(o=>({id:o.id,label:String(o.label||'').trim()})).filter(o=>o.label);
    if(!title){toast('투표 제목을 입력해주세요.');return false}
    if(options.length<2){toast('투표 항목을 2개 이상 입력해주세요.');return false}
    let closesAt=null;
    if(composer.closesAt){const d=new Date(composer.closesAt);if(Number.isNaN(d.getTime())){toast('투표 종료시간을 확인해주세요.');return false}closesAt=d.toISOString()}
    return {title,optionType:composer.optionType,options,allowMultiple:composer.allowMultiple,anonymous:composer.anonymous,allowOptionAdd:composer.allowOptionAdd,closesAt};
  }

  async function savePoll(noticeId,draft){
    if(!draft){const {error}=await dbClient.rpc('delete_notice_poll_v1',{p_notice_id:noticeId});if(error)throw error;return null}
    const {data,error}=await dbClient.rpc('save_notice_poll_v1',{
      p_notice_id:noticeId,p_title:draft.title,p_option_type:draft.optionType,p_options:draft.options,
      p_allow_multiple:draft.allowMultiple,p_anonymous:draft.anonymous,p_allow_option_add:draft.allowOptionAdd,p_closes_at:draft.closesAt
    });
    if(error)throw error;return data;
  }

  function toLocalInput(iso){
    if(!iso)return '';
    const d=new Date(iso);if(Number.isNaN(d.getTime()))return '';
    const pad=n=>String(n).padStart(2,'0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  async function loadComposer(noticeId){
    ensureComposerMount();
    const {data,error}=await dbClient.rpc('get_notice_poll_v1',{p_notice_id:noticeId});
    if(error){console.error('poll load editor',error);return}
    if(!data){composer=defaultState();renderComposer();return}
    composer={enabled:true,optionType:data.option_type||'text',title:data.title||'',options:(data.options||[]).map(o=>({id:o.id,label:o.label||''})),allowMultiple:!!data.allow_multiple,anonymous:!!data.anonymous,allowOptionAdd:!!data.allow_option_add,closesAt:toLocalInput(data.closes_at)};
    while(composer.options.length<2)composer.options.push({id:uid(),label:''});
    renderComposer();
  }

  function displayLabel(label,type){
    if(type!=='date')return label;
    const m=String(label||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?`${Number(m[1])}. ${Number(m[2])}. ${Number(m[3])}.`:label;
  }
  function deadlineText(iso){
    if(!iso)return '종료시간 없음';
    const d=new Date(iso);if(Number.isNaN(d.getTime()))return '';
    return `마감 ${d.toLocaleString('ko-KR',{month:'numeric',day:'numeric',hour:'numeric',minute:'2-digit'})}`;
  }

  async function renderNoticePoll(noticeId){
    let mount=document.getElementById('noticePollMountV115');
    if(!mount){
      const article=document.querySelector('#noticeArticle .article');if(!article)return;
      mount=document.createElement('div');mount.id='noticePollMountV115';
      const admin=article.querySelector('.noticeAdminActions');if(admin)article.insertBefore(mount,admin);else article.appendChild(mount);
    }
    mount.innerHTML='<div class="pollLoading">투표 불러오는 중...</div>';
    const {data,error}=await dbClient.rpc('get_notice_poll_v1',{p_notice_id:noticeId});
    if(error){console.error('poll detail',error);mount.innerHTML='';return}
    if(!data){mount.innerHTML='';return}
    renderPollData(data,mount);
  }

  function renderPollData(p,mount){
    if(!mount)return;
    const saved=new Set((p.my_option_ids||[]).map(String));
    if(!voteDrafts.has(p.id))voteDrafts.set(p.id,new Set(saved));
    const selected=voteDrafts.get(p.id);
    const opts=(p.options||[]).map(o=>{
      const on=selected.has(String(o.id));
      const voters=!p.anonymous&&Array.isArray(o.voters)&&o.voters.length?`<div class="pollVoters">${o.voters.map(esc).join(' · ')}</div>`:'';
      return `<button type="button" class="pollVoteOption ${on?'selected':''}" ${p.is_closed?'disabled':''} onclick="pollV115ToggleVote('${esc(p.id)}','${esc(o.id)}',${p.allow_multiple?'true':'false'})"><span class="pollVoteMark"></span><span class="pollVoteLabel">${esc(displayLabel(o.label,p.option_type))}</span><span class="pollVoteCount">${Number(o.count||0)}명</span>${voters}</button>`;
    }).join('');
    const actions=p.is_closed?'':`<div class="pollVoteActions"><button type="button" class="pollVotePrimary" onclick="pollV115SubmitVote('${esc(p.id)}','${esc(p.notice_id)}')">${saved.size?'투표 수정':'투표하기'}</button>${saved.size?`<button type="button" class="pollVoteGhost" onclick="pollV115CancelVote('${esc(p.id)}','${esc(p.notice_id)}')">투표 취소</button>`:''}</div>`;
    const add=p.allow_option_add&&!p.is_closed?`<div class="pollAddOptionInline"><input id="pollAddOption-${esc(p.id)}" type="${p.option_type==='date'?'date':'text'}" placeholder="선택항목 추가"><button type="button" onclick="pollV115AddLiveOption('${esc(p.id)}','${esc(p.notice_id)}')">추가</button></div>`:'';
    mount.innerHTML=`<div class="noticePollCard"><div class="noticePollHead"><div><h3>${esc(p.title)}</h3><div class="noticePollMeta">${p.allow_multiple?'복수선택 · ':''}${p.anonymous?'익명 · ':''}${Number(p.total_voters||0)}명 참여 · ${esc(deadlineText(p.closes_at))}</div></div>${p.is_closed?'<span class="pollClosed">투표 종료</span>':''}</div><div class="pollVoteList">${opts}</div>${actions}${add}</div>`;
  }

  async function reloadPollByNotice(noticeId){
    const {data,error}=await dbClient.rpc('get_notice_poll_v1',{p_notice_id:noticeId});if(error){console.error(error);toast('투표를 불러오지 못했어요.');return}
    if(data){voteDrafts.set(data.id,new Set((data.my_option_ids||[]).map(String)));renderPollData(data,document.getElementById('noticePollMountV115'))}
  }

  window.pollV115Enable=enableComposer;
  window.pollV115Remove=removeComposer;
  window.pollV115SetType=t=>{syncComposerFromDom();setType(t)};
  window.pollV115AddOption=addComposerOption;
  window.pollV115DeleteOption=deleteComposerOption;
  window.pollV115ToggleVote=(pollId,optionId,multiple)=>{
    const s=voteDrafts.get(pollId)||new Set();
    if(multiple){s.has(optionId)?s.delete(optionId):s.add(optionId)}else{s.clear();s.add(optionId)}
    voteDrafts.set(pollId,s);
    const root=document.getElementById('noticePollMountV115');if(root)root.querySelectorAll('.pollVoteOption').forEach(btn=>{const mark=btn.getAttribute('onclick')||'';const m=mark.match(/pollV115ToggleVote\('[^']+','([^']+)'/);btn.classList.toggle('selected',!!m&&s.has(m[1]))});
  };
  window.pollV115SubmitVote=async(pollId,noticeId)=>{
    const ids=[...(voteDrafts.get(pollId)||new Set())];if(!ids.length)return toast('투표할 항목을 선택해주세요.');
    const {data,error}=await dbClient.rpc('cast_notice_poll_vote_v1',{p_poll_id:pollId,p_option_ids:ids});if(error){console.error(error);return toast('투표 저장에 실패했어요.')}
    voteDrafts.set(pollId,new Set((data.my_option_ids||[]).map(String)));renderPollData(data,document.getElementById('noticePollMountV115'));toast('투표했어요.');
  };
  window.pollV115CancelVote=async(pollId,noticeId)=>{
    const {data,error}=await dbClient.rpc('cast_notice_poll_vote_v1',{p_poll_id:pollId,p_option_ids:[]});if(error){console.error(error);return toast('투표 취소에 실패했어요.')}
    voteDrafts.set(pollId,new Set());renderPollData(data,document.getElementById('noticePollMountV115'));toast('투표를 취소했어요.');
  };
  window.pollV115AddLiveOption=async(pollId,noticeId)=>{
    const input=document.getElementById(`pollAddOption-${pollId}`);const label=input?.value?.trim();if(!label)return;
    const {data,error}=await dbClient.rpc('add_notice_poll_option_v1',{p_poll_id:pollId,p_label:label});if(error){console.error(error);return toast('항목 추가에 실패했어요.')}
    voteDrafts.set(pollId,new Set((data.my_option_ids||[]).map(String)));renderPollData(data,document.getElementById('noticePollMountV115'));toast('항목을 추가했어요.');
  };

  const baseEdit=window.editNotice;
  if(typeof baseEdit==='function')window.editNotice=async function(id){baseEdit(id);await loadComposer(id)};
  const baseCancel=window.cancelNoticeEdit;
  if(typeof baseCancel==='function')window.cancelNoticeEdit=function(){composer=defaultState();renderComposer();return baseCancel()};
  const baseCreate=window.createNoticeOnServer;
  if(typeof baseCreate==='function')window.createNoticeOnServer=async function(title,body,attachments){
    const result=await baseCreate(title,body,attachments);
    if(pendingDraft){try{await savePoll(result.notice.id,pendingDraft)}catch(e){console.error('poll save after create',e);pendingPollError=e}}
    return result;
  };
  const baseSave=window.saveNotice;
  if(typeof baseSave==='function')window.saveNotice=async function(){
    const draft=collectDraft();if(draft===false)return;
    const editId=(typeof currentEditingNoticeId!=='undefined'&&currentEditingNoticeId)?currentEditingNoticeId:null;
    pendingDraft=draft;pendingPollError=null;
    await baseSave();
    const editSucceeded=editId&&(typeof currentEditingNoticeId==='undefined'||currentEditingNoticeId!==editId);
    if(editSucceeded){try{await savePoll(editId,draft)}catch(e){console.error('poll save after edit',e);pendingPollError=e}}
    if(pendingPollError)toast('공지는 저장됐지만 투표 저장에 실패했어요. 다시 수정해주세요.');
    else if((!editId||editSucceeded)){composer=defaultState();renderComposer()}
    pendingDraft=null;
  };
  const baseDetail=window.renderNoticeDetail;
  if(typeof baseDetail==='function')window.renderNoticeDetail=function(){const r=baseDetail();try{const n=notices.find(x=>x.id===currentNoticeId);if(n)void renderNoticePoll(n.id)}catch(e){console.error('poll render hook',e)}return r};

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureComposerMount);else ensureComposerMount();
})();
