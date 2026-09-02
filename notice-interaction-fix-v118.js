/* TEAM EYSL notice interaction fix v118 */
(()=>{
  if(window.__NOTICE_INTERACTION_FIX_V118__)return;
  window.__NOTICE_INTERACTION_FIX_V118__=true;

  const esc=s=>typeof escHtml==='function'?escHtml(String(s??'')):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const uid=()=>{try{return crypto.randomUUID()}catch(_){return 'c-'+Date.now()+'-'+Math.random().toString(36).slice(2)}};

  const style=document.createElement('style');
  style.id='NOTICE_INTERACTION_FIX_V118_STYLE';
  style.textContent=`
    .pollVoteOption.v118-closed{opacity:1!important;cursor:default!important}
    .pollVoteOption.v118-closed .pollVoteCount{cursor:pointer!important;pointer-events:auto!important}
    .commentHeadV118{display:flex;align-items:center;justify-content:space-between;gap:10px}
    .commentMetaV118{min-width:0;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
    .commentActionsV118{display:flex;align-items:center;gap:8px;flex:0 0 auto}
    .commentActionV118{border:0;background:transparent;padding:2px 0;font-size:9px;color:#8d9299;text-decoration:underline}
    .commentActionV118.delete{color:#b87862}
  `;
  document.head.appendChild(style);

  function currentNotice(){
    try{return notices.find(x=>x.id===currentNoticeId)||null}catch(_){return null}
  }

  function isMyComment(c){
    try{
      if(c?.memberId&&currentUser?.memberId)return String(c.memberId)===String(currentUser.memberId);
      return !!c?.name&&!!currentUser?.nickname&&String(c.name)===String(currentUser.nickname);
    }catch(_){return false}
  }

  function renderCommentsV118(){
    const box=document.getElementById('comments');
    const n=currentNotice();
    if(!box||!n)return;
    const comments=Array.isArray(n.comments)?n.comments:[];
    box.innerHTML=comments.length?comments.map((c,i)=>{
      const mine=isMyComment(c);
      return `<div class="comment"><div class="commentHeadV118"><div class="commentMetaV118"><b>${esc(c.name||'회원')}</b><span>${esc(c.time||'')}</span></div>${mine?`<div class="commentActionsV118"><button type="button" class="commentActionV118" onclick="noticeV118EditComment(${i})">수정</button><button type="button" class="commentActionV118 delete" onclick="noticeV118DeleteComment(${i})">삭제</button></div>`:''}</div><p>${esc(c.text||'')}</p></div>`;
    }).join(''):'<div class="card meta">아직 댓글이 없습니다.</div>';
  }

  async function persistCommentsV118(next){
    const n=currentNotice();
    if(!n)return false;
    const {error}=await dbClient.from('notices').update({comments:next,updated_at:new Date().toISOString()}).eq('id',n.id);
    if(error){console.error('comment v118 save:',error);toast('댓글 저장에 실패했습니다.');return false}
    n.comments=next;
    renderCommentsV118();
    return true;
  }

  window.addComment=async function(){
    const input=document.getElementById('commentInput');
    const text=(input?.value||'').trim();
    if(!text)return;
    const n=currentNotice();if(!n)return;
    const comments=[...(Array.isArray(n.comments)?n.comments:[])];
    comments.push({
      id:uid(),
      memberId:currentUser?.memberId||null,
      name:currentUser?.nickname||'회원',
      time:typeof now==='function'?now():new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit',hour12:false}),
      text,
      createdAt:new Date().toISOString()
    });
    if(await persistCommentsV118(comments))input.value='';
  };

  window.noticeV118EditComment=async function(index){
    const n=currentNotice();if(!n)return;
    const comments=[...(Array.isArray(n.comments)?n.comments:[])];
    const c=comments[index];
    if(!c||!isMyComment(c))return toast('내 댓글만 수정할 수 있습니다.');
    const next=prompt('댓글을 수정해주세요.',String(c.text||''));
    if(next===null)return;
    const text=next.trim();
    if(!text)return toast('댓글 내용을 입력해주세요.');
    comments[index]={...c,text,editedAt:new Date().toISOString()};
    if(await persistCommentsV118(comments))toast('댓글이 수정됐습니다.');
  };

  window.noticeV118DeleteComment=async function(index){
    const n=currentNotice();if(!n)return;
    const comments=[...(Array.isArray(n.comments)?n.comments:[])];
    const c=comments[index];
    if(!c||!isMyComment(c))return toast('내 댓글만 삭제할 수 있습니다.');
    if(!confirm('이 댓글을 삭제할까요?'))return;
    comments.splice(index,1);
    if(await persistCommentsV118(comments))toast('댓글이 삭제됐습니다.');
  };

  function fixClosedPollButtonsV118(){
    const mount=document.getElementById('noticePollMountV115');
    if(!mount)return;
    const closed=!!mount.querySelector('.pollClosed');
    mount.querySelectorAll('.pollVoteCount').forEach(count=>{
      count.setAttribute('role','button');
      count.setAttribute('tabindex','0');
      count.style.pointerEvents='auto';
    });
    if(!closed)return;
    mount.querySelectorAll('.pollVoteOption').forEach(option=>{
      if(option.disabled)option.disabled=false;
      option.classList.add('v118-closed');
      option.setAttribute('aria-disabled','true');
    });
  }

  // 종료된 투표는 선택 변경은 막고, 인원 수 탭만 허용한다.
  document.addEventListener('click',event=>{
    const option=event.target?.closest?.('.pollVoteOption.v118-closed');
    if(!option)return;
    if(event.target?.closest?.('.pollVoteCount'))return;
    event.preventDefault();
    event.stopPropagation();
    if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
  },true);

  document.addEventListener('keydown',event=>{
    const option=event.target?.closest?.('.pollVoteOption.v118-closed');
    if(!option)return;
    if(event.target?.closest?.('.pollVoteCount'))return;
    if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();}
  },true);

  const baseDetail=window.renderNoticeDetail;
  if(typeof baseDetail==='function'){
    window.renderNoticeDetail=function(){
      const result=baseDetail.apply(this,arguments);
      setTimeout(()=>{renderCommentsV118();fixClosedPollButtonsV118();},0);
      setTimeout(()=>fixClosedPollButtonsV118(),120);
      return result;
    };
  }

  const article=document.getElementById('noticeArticle');
  if(article){
    const observer=new MutationObserver(()=>{renderCommentsV118();fixClosedPollButtonsV118();});
    observer.observe(article,{childList:true,subtree:true});
  }
  const comments=document.getElementById('comments');
  if(comments){
    const observer=new MutationObserver(()=>{});
    observer.observe(comments,{childList:true,subtree:true});
  }

  setTimeout(()=>{renderCommentsV118();fixClosedPollButtonsV118();},0);
})();
