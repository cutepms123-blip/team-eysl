/* TEAM EYSL notice engagement v117 */
(()=>{
  if(window.__NOTICE_ENGAGEMENT_V117__)return;
  window.__NOTICE_ENGAGEMENT_V117__=true;

  const esc=s=>typeof escHtml==='function'?escHtml(String(s??'')):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  const style=document.createElement('style');
  style.id='NOTICE_ENGAGEMENT_V117_STYLE';
  style.textContent=`
    .pollVoteCount{
      display:inline-flex!important;align-items:center;justify-content:center;gap:2px;
      min-width:48px;padding:6px 8px;border-radius:999px;background:#eceef1;
      color:#555!important;font-size:10px!important;font-weight:850!important;
      cursor:pointer;user-select:none;-webkit-user-select:none;touch-action:manipulation;
    }
    .pollVoteCount::after{content:'▾';font-size:9px;color:#8c9198;margin-left:2px}
    .pollVoteCount.v117-open::after{content:'▴'}
    .pollVoters{display:none!important;grid-column:2/4!important;margin-top:2px;padding:9px 10px;border-radius:10px;background:#f0f1f3;color:#646a72!important;font-size:10px!important;line-height:1.65!important}
    .pollVoters.v117-open{display:block!important}
    .noticeReadAdminV117{margin:14px 0 2px;border-top:1px solid #eceef1;padding-top:12px}
    .noticeReadToggleV117{width:100%;border:0;background:#f6f7f8;border-radius:12px;padding:11px 12px;display:flex;align-items:center;justify-content:space-between;gap:10px;text-align:left;color:#333}
    .noticeReadToggleV117 span{font-size:11px;font-weight:850}.noticeReadToggleV117 small{font-size:9px;color:#92979e;font-weight:600;margin-left:5px}.noticeReadToggleV117 b{font-size:16px;color:#969ba2;font-weight:500}
    .noticeReaderListV117{display:none;padding:10px 2px 0;gap:6px;flex-wrap:wrap}
    .noticeReaderListV117.open{display:flex}
    .noticeReaderChipV117{display:inline-flex;align-items:center;min-height:28px;padding:6px 9px;border-radius:999px;background:#f0f1f3;color:#555;font-size:10px;font-weight:750}
    .noticeReaderEmptyV117{font-size:10px;color:#999;padding:6px 2px}
  `;
  document.head.appendChild(style);

  function postProcessPollCounts(){
    const mount=document.getElementById('noticePollMountV115');
    if(!mount)return;
    mount.querySelectorAll('.pollVoteCount').forEach(el=>{
      if(el.dataset.v117Ready==='1')return;
      el.dataset.v117Ready='1';
      el.setAttribute('role','button');
      el.setAttribute('tabindex','0');
      el.setAttribute('aria-label',`${el.textContent.trim()} 투표자 보기`);
    });
  }

  function toggleVotersFromCount(countEl){
    const option=countEl.closest('.pollVoteOption');
    if(!option)return;
    const voters=option.querySelector('.pollVoters');
    if(!voters){
      const count=parseInt(String(countEl.textContent||'0').replace(/\D/g,''),10)||0;
      if(count>0)toast('익명 투표는 투표자가 공개되지 않아요.');
      else toast('아직 이 항목에 투표한 사람이 없어요.');
      return;
    }
    const open=!voters.classList.contains('v117-open');
    voters.classList.toggle('v117-open',open);
    countEl.classList.toggle('v117-open',open);
    countEl.setAttribute('aria-expanded',open?'true':'false');
  }

  document.addEventListener('click',event=>{
    const count=event.target?.closest?.('.pollVoteCount');
    if(!count)return;
    event.preventDefault();
    event.stopPropagation();
    if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
    toggleVotersFromCount(count);
  },true);

  document.addEventListener('keydown',event=>{
    const count=event.target?.closest?.('.pollVoteCount');
    if(!count||!['Enter',' '].includes(event.key))return;
    event.preventDefault();
    event.stopPropagation();
    toggleVotersFromCount(count);
  },true);

  let pollObserver=null;
  function watchCurrentPoll(){
    if(pollObserver){try{pollObserver.disconnect()}catch(_){}}
    const mount=document.getElementById('noticePollMountV115');
    if(!mount)return;
    postProcessPollCounts();
    pollObserver=new MutationObserver(()=>postProcessPollCounts());
    pollObserver.observe(mount,{childList:true,subtree:true});
  }

  async function markNoticeReadV117(noticeId){
    if(!noticeId)return;
    try{
      const {error}=await dbClient.rpc('mark_notice_read_v1',{p_notice_id:noticeId});
      if(error)throw error;
    }catch(err){
      console.error('notice read mark v117:',err);
    }
  }

  function ensureReaderMount(){
    if(typeof isAdminUser!=='function'||!isAdminUser())return null;
    const article=document.querySelector('#noticeArticle .article');
    if(!article)return null;
    let mount=document.getElementById('noticeReadAdminV117');
    if(mount)return mount;
    mount=document.createElement('div');
    mount.id='noticeReadAdminV117';
    mount.className='noticeReadAdminV117';
    const actions=article.querySelector('.noticeAdminActions');
    if(actions)article.insertBefore(mount,actions);else article.appendChild(mount);
    return mount;
  }

  async function renderNoticeReadersV117(noticeId){
    if(typeof isAdminUser!=='function'||!isAdminUser())return;
    const mount=ensureReaderMount();if(!mount)return;
    mount.innerHTML='<div class="noticeReaderEmptyV117">읽음 현황 불러오는 중...</div>';
    try{
      const {data,error}=await dbClient.rpc('get_notice_readers_v1',{p_notice_id:noticeId});
      if(error)throw error;
      const readers=Array.isArray(data?.readers)?data.readers:[];
      const chips=readers.length
        ?readers.map(r=>`<span class="noticeReaderChipV117">${esc(r.nickname||'회원')}</span>`).join('')
        :'<div class="noticeReaderEmptyV117">아직 읽은 회원이 없습니다.</div>';
      mount.innerHTML=`<button type="button" class="noticeReadToggleV117" onclick="noticeV117ToggleReaders()"><span>읽음 ${Number(data?.read_count||0)}명 <small>운영진만 확인</small></span><b id="noticeReadArrowV117">›</b></button><div id="noticeReaderListV117" class="noticeReaderListV117">${chips}</div>`;
    }catch(err){
      console.error('notice readers v117:',err);
      mount.innerHTML='<div class="noticeReaderEmptyV117">읽음 현황을 불러오지 못했습니다.</div>';
    }
  }

  window.noticeV117ToggleReaders=()=>{
    const list=document.getElementById('noticeReaderListV117');if(!list)return;
    const open=!list.classList.contains('open');
    list.classList.toggle('open',open);
    const arrow=document.getElementById('noticeReadArrowV117');if(arrow)arrow.textContent=open?'⌄':'›';
  };

  async function trackAndRender(noticeId){
    await markNoticeReadV117(noticeId);
    if(typeof isAdminUser==='function'&&isAdminUser())await renderNoticeReadersV117(noticeId);
  }

  const baseDetail=window.renderNoticeDetail;
  if(typeof baseDetail==='function'){
    window.renderNoticeDetail=function(){
      const result=baseDetail.apply(this,arguments);
      let noticeId=null;
      try{noticeId=currentNoticeId}catch(_){}
      setTimeout(()=>{
        watchCurrentPoll();
        if(noticeId)void trackAndRender(noticeId);
      },0);
      return result;
    };
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{watchCurrentPoll()});
  else watchCurrentPoll();
})();
