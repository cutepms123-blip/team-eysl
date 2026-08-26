/* TEAM EYSL v93 — creator ownership + timestamps + comment ownership */
(()=>{
'use strict';

const original={};
const save=(name)=>{if(typeof window[name]==='function')original[name]=window[name];};
['mapActivityRow','loadPersistentContent','renderNotices','renderNoticeDetail','addComment','editNotice','deleteNotice','saveNotice','renderBoardDetail','editBoardPost','saveBoardPost','deleteBoardPost','canEditActivityItem','openTraining','openRaceDetail','openEventDetail','canManageMediaOwner'].forEach(save);

function master(){return typeof window.isMasterAdmin==='function'&&window.isMasterAdmin();}
function memberLabel(id){
  if(!id)return 'TEAM EYSL 원본';
  const m=(window.members||[]).find(x=>x.id===id);
  if(m)return m.name||m.nickname||'회원';
  if(window.currentUser?.memberId===id)return window.currentUser.nickname||'회원';
  return '회원';
}
function dt(v){
  if(!v)return '-';
  const d=new Date(v);if(Number.isNaN(d.getTime()))return String(v);
  return d.toLocaleString('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false});
}
function esc(s){return typeof window.escHtml==='function'?window.escHtml(String(s??'')):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function attr(s){return typeof window.escAttr==='function'?window.escAttr(String(s??'')):esc(s);}
function canOwn(owner){return !!owner&&(owner===window.currentUser?.memberId||master());}

if(original.mapActivityRow){
  window.mapActivityRow=function(row){const x=original.mapActivityRow(row);x.createdAt=row.created_at||null;x.updatedAt=row.updated_at||null;return x;};
}

async function hydrateNoticeOwnership(){
  if(!window.dbClient)return;
  const [nr,cr]=await Promise.all([
    window.dbClient.from('notices').select('id,created_by,created_at,updated_at'),
    window.dbClient.from('notice_comments').select('id,notice_id,author_id,body,created_at,updated_at').order('created_at',{ascending:true})
  ]);
  if(nr.error)console.error('notice meta:',nr.error);
  if(cr.error)console.error('notice comments:',cr.error);
  const meta=new Map((nr.data||[]).map(x=>[x.id,x]));
  const grouped=new Map();
  for(const c of (cr.data||[])){
    if(!grouped.has(c.notice_id))grouped.set(c.notice_id,[]);
    grouped.get(c.notice_id).push({id:c.id,noticeId:c.notice_id,authorId:c.author_id,name:memberLabel(c.author_id),text:c.body,createdAt:c.created_at,updatedAt:c.updated_at});
  }
  for(const n of (window.notices||[])){
    const m=meta.get(n.id);if(m){n.createdBy=m.created_by;n.createdAt=m.created_at;n.updatedAt=m.updated_at;}
    n.comments=grouped.get(n.id)||[];
  }
}

if(original.loadPersistentContent){
  window.loadPersistentContent=async function(){
    const r=await original.loadPersistentContent.apply(this,arguments);
    try{await hydrateNoticeOwnership();}catch(e){console.error('v93 hydrate:',e)}
    try{window.renderNotices();if(document.getElementById('noticeDetail')?.classList.contains('active'))window.renderNoticeDetail();}catch(_){ }
    return r;
  };
}

window.renderNotices=function(){
  const el=document.getElementById('noticeList');if(!el)return;
  const sorted=[...(window.notices||[])].sort((a,b)=>String(b.createdAt||b.date||'').localeCompare(String(a.createdAt||a.date||'')));
  el.innerHTML=sorted.length?sorted.map(n=>{
    const img=(n.attachments||[]).find(a=>String(a.type||'').startsWith('image'));
    const thumb=img?(img.url?`<img class="noticeThumb" src="${attr(img.url)}" alt="공지 이미지 미리보기" onclick="event.stopPropagation();openAttachment('${attr(img.url)}','${attr(img.type)}')">`:`<div class="noticeThumb noticeImageLoading">사진 불러오는 중...</div>`):'';
    const meta=`${esc(memberLabel(n.createdBy))} · ${esc(dt(n.createdAt||n.date))}${window.unreadNoticeIds?.has(n.id)?' · NEW':''}`;
    return `<div class="notice" onclick='openNotice(${JSON.stringify(n.id)})'><div class="date">${meta}</div><h3>${esc(n.title)}</h3><p>${esc(String(n.body||'').split('\n')[0])}</p>${thumb}</div>`;
  }).join(''):'<div class="card meta">등록된 공지가 없습니다.</div>';
};

window.renderNoticeDetail=function(){
  const n=(window.notices||[]).find(x=>x.id===window.currentNoticeId);if(!n){window.showPage('notice');return}
  const attach=(n.attachments||[]).map(a=>{
    const isImg=String(a.type||'').startsWith('image'),isVid=String(a.type||'').startsWith('video');
    if(!a.url)return `<div class="fileRow"><div class="icon">📎</div><div class="grow"><b>${esc(a.name||'첨부파일')}</b><p>불러오는 중...</p></div></div>`;
    if(isImg)return `<img class="noticePreview" src="${attr(a.url)}" alt="${attr(a.name||'')}" onclick="openAttachment('${attr(a.url)}','${attr(a.type)}')">`;
    if(isVid)return `<video class="noticePreview" src="${attr(a.url)}" controls></video>`;
    return `<div class="fileRow" onclick="openAttachment('${attr(a.url)}','${attr(a.type)}')"><div class="icon">📎</div><div class="grow"><b>${esc(a.name||'첨부파일')}</b></div></div>`;
  }).join('');
  const manage=canOwn(n.createdBy);
  const article=document.getElementById('noticeArticle');
  if(article)article.innerHTML=`<div class="article"><div class="meta">${esc(memberLabel(n.createdBy))} · ${esc(dt(n.createdAt||n.date))}</div><h2>${esc(n.title)}</h2><p>${esc(n.body)}</p>${attach?`<div class="section"><h2>첨부</h2></div>${attach}`:''}${manage?`<div class="noticeAdminActions"><button class="btn outline" onclick="editNotice('${n.id}')">수정</button><button class="btn amber" onclick="deleteNotice('${n.id}')">삭제</button></div>`:''}</div>`;
  const comments=document.getElementById('comments');
  if(comments)comments.innerHTML=(n.comments||[]).map(c=>`<div class="comment"><b>${esc(c.name||memberLabel(c.authorId))}</b><span>${esc(dt(c.createdAt))}</span><p>${esc(c.text)}</p>${canOwn(c.authorId)?`<div class="actions"><button class="btn outline" onclick="editNoticeComment('${c.id}')">수정</button><button class="btn amber" onclick="deleteNoticeComment('${c.id}')">삭제</button></div>`:''}</div>`).join('')||'<div class="card meta">아직 댓글이 없습니다.</div>';
};

window.addComment=async function(){
  const i=document.getElementById('commentInput'),text=i?.value.trim();if(!text)return;
  const n=(window.notices||[]).find(x=>x.id===window.currentNoticeId);if(!n||!window.currentUser?.memberId)return;
  const {data,error}=await window.dbClient.from('notice_comments').insert({notice_id:n.id,author_id:window.currentUser.memberId,body:text}).select('id,notice_id,author_id,body,created_at,updated_at').single();
  if(error){console.error(error);return window.toast('댓글 저장에 실패했습니다.')}
  n.comments=[...(n.comments||[]),{id:data.id,noticeId:data.notice_id,authorId:data.author_id,name:memberLabel(data.author_id),text:data.body,createdAt:data.created_at,updatedAt:data.updated_at}];i.value='';window.renderNoticeDetail();
};
window.editNoticeComment=async function(id){
  const n=(window.notices||[]).find(x=>x.id===window.currentNoticeId),c=n?.comments?.find(x=>x.id===id);if(!c)return;
  if(!canOwn(c.authorId))return window.toast('작성자만 수정할 수 있습니다.');
  const body=prompt('댓글 수정',c.text||'');if(body===null||!body.trim())return;
  const {data,error}=await window.dbClient.from('notice_comments').update({body:body.trim(),updated_at:new Date().toISOString()}).eq('id',id).select('id,body,updated_at').single();
  if(error){console.error(error);return window.toast('댓글 수정에 실패했습니다.')}
  c.text=data.body;c.updatedAt=data.updated_at;window.renderNoticeDetail();
};
window.deleteNoticeComment=async function(id){
  const n=(window.notices||[]).find(x=>x.id===window.currentNoticeId),c=n?.comments?.find(x=>x.id===id);if(!c)return;
  if(!canOwn(c.authorId))return window.toast('작성자만 삭제할 수 있습니다.');if(!confirm('이 댓글을 삭제할까요?'))return;
  const {error}=await window.dbClient.from('notice_comments').delete().eq('id',id);if(error){console.error(error);return window.toast('댓글 삭제에 실패했습니다.')}
  n.comments=n.comments.filter(x=>x.id!==id);window.renderNoticeDetail();
};

if(original.editNotice)window.editNotice=function(id){const n=(window.notices||[]).find(x=>x.id===id);if(!n||!canOwn(n.createdBy))return window.toast('작성자만 수정할 수 있습니다.');return original.editNotice(id);};
if(original.deleteNotice)window.deleteNotice=async function(id){const n=(window.notices||[]).find(x=>x.id===id);if(!n||!canOwn(n.createdBy))return window.toast('작성자만 삭제할 수 있습니다.');return original.deleteNotice(id);};
if(original.saveNotice)window.saveNotice=async function(){const r=await original.saveNotice.apply(this,arguments);setTimeout(async()=>{try{await hydrateNoticeOwnership();window.renderNotices();}catch(_){ }},150);return r;};

if(original.canEditActivityItem)window.canEditActivityItem=function(item){return !!item&&canOwn(item.createdBy);};
window.activityAuthorMeta=function(item){return `${memberLabel(item?.createdBy)} · ${dt(item?.createdAt)}`;};
function appendActivityMeta(body,item){
  if(!body||!item)return;
  const detail=body.querySelector('.detail');if(!detail||detail.querySelector('.creatorMetaRow'))return;
  detail.insertAdjacentHTML('beforeend',`<div class="detailrow creatorMetaRow"><b>등록자</b><span>${esc(memberLabel(item.createdBy))}</span></div><div class="detailrow creatorMetaRow"><b>등록시간</b><span>${esc(dt(item.createdAt))}</span></div>`);
}
if(original.openTraining)window.openTraining=function(id){const r=original.openTraining.apply(this,arguments);const item=window.trainings?.[id];appendActivityMeta(document.getElementById('trainingDetailBody'),item);return r;};
if(original.openRaceDetail)window.openRaceDetail=function(){const r=original.openRaceDetail.apply(this,arguments);appendActivityMeta(document.getElementById('raceDetailBody'),window.race);return r;};
if(original.openEventDetail)window.openEventDetail=function(id){const r=original.openEventDetail.apply(this,arguments);const item=(window.events||[]).find(x=>x.id===id);appendActivityMeta(document.getElementById('eventDetailBody'),item);return r;};

if(original.renderBoardDetail){
  window.renderBoardDetail=function(){
    original.renderBoardDetail.apply(this,arguments);
    const p=(window.boardPosts||[]).find(x=>x.id===window.currentBoardPostId);if(!p)return;
    const box=document.getElementById('boardDetailBody');if(!box)return;
    const actions=box.querySelector('.actions');if(actions&&canOwn(p.author_id))actions.innerHTML=`<button class="btn outline" onclick="editBoardPost('${p.id}')">수정</button><button class="btn amber" onclick="deleteBoardPost('${p.id}')">삭제</button>`;
  };
}
window.editBoardPost=function(id){
  const p=(window.boardPosts||[]).find(x=>x.id===id);if(!p||!canOwn(p.author_id))return window.toast('작성자만 수정할 수 있습니다.');
  window.currentEditingBoardPostId=id;document.getElementById('boardWriteTitle').textContent='글 수정';document.getElementById('boardPostTitle').value=p.title||'';document.getElementById('boardPostBody').value=p.body||'';window.showPage('boardWrite');
};
window.saveBoardPost=async function(){
  const title=document.getElementById('boardPostTitle')?.value.trim()||'',body=document.getElementById('boardPostBody')?.value.trim()||'';if(!title)return window.toast('제목을 입력해주세요.');if(!body)return window.toast('내용을 입력해주세요.');
  try{
    if(window.currentEditingBoardPostId){const p=(window.boardPosts||[]).find(x=>x.id===window.currentEditingBoardPostId);if(!p||!canOwn(p.author_id))return window.toast('작성자만 수정할 수 있습니다.');const {data,error}=await window.dbClient.from('board_posts').update({title,body,updated_at:new Date().toISOString()}).eq('id',p.id).select('id');if(error||!data?.length)throw(error||new Error('update denied'));const id=p.id;await window.loadBoardPosts();window.currentEditingBoardPostId=null;window.currentBoardPostId=id;window.showPage('boardDetail');window.renderBoardDetail();window.toast('게시글이 수정됐습니다.');}
    else{const {data,error}=await window.dbClient.from('board_posts').insert({author_id:window.currentUser.memberId,title,body}).select('id').single();if(error)throw error;await window.loadBoardPosts();window.currentBoardPostId=data.id;window.showPage('boardDetail');window.renderBoardDetail();window.toast('게시글이 등록됐습니다.');}
  }catch(e){console.error('board save v93:',e);window.toast('게시글 저장에 실패했습니다.')}
};
window.deleteBoardPost=async function(id){const p=(window.boardPosts||[]).find(x=>x.id===id);if(!p)return;if(!canOwn(p.author_id))return window.toast('작성자만 삭제할 수 있습니다.');if(!confirm('이 게시글을 삭제할까요?'))return;const {data,error}=await window.dbClient.from('board_posts').delete().eq('id',id).select('id');if(error||!data?.length){console.error(error);return window.toast('게시글 삭제에 실패했습니다.')}window.currentBoardPostId=null;await window.loadBoardPosts();window.showPage('freeBoard');window.renderBoard();window.toast('게시글이 삭제됐습니다.');};

if(original.canManageMediaOwner)window.canManageMediaOwner=function(ownerId){return canOwn(ownerId);};

window.addEventListener('load',()=>setTimeout(async()=>{try{await hydrateNoticeOwnership();window.renderNotices();}catch(e){console.error(e)}},400));
console.log('TEAM EYSL enhancements v93 loaded');
})();
