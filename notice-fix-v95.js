/* TEAM EYSL v95 — restore notice rendering using app lexical state */
(()=>{
'use strict';

const noticeMeta=new Map();
const commentRows=new Map();

const esc=(s)=>typeof escHtml==='function'?escHtml(String(s??'')):String(s??'');
const attr=(s)=>typeof escAttr==='function'?escAttr(String(s??'')):esc(s);
const fmt=(v)=>{
  if(!v)return '-';
  const d=new Date(v);if(Number.isNaN(d.getTime()))return String(v);
  return d.toLocaleString('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false});
};
const master=()=>typeof isMasterAdmin==='function'&&isMasterAdmin();
const memberName=(id)=>{
  if(!id)return 'TEAM EYSL 원본';
  const m=(typeof members!=='undefined'?members:[]).find(x=>x.id===id);
  if(m)return m.name||m.nickname||'회원';
  if(typeof currentUser!=='undefined'&&currentUser.memberId===id)return currentUser.nickname||'회원';
  return '회원';
};
const canManage=(owner)=>!!owner&&((typeof currentUser!=='undefined'&&currentUser.memberId===owner)||master());

async function refreshNoticeMeta(){
  if(typeof dbClient==='undefined')return;
  const [nr,cr]=await Promise.all([
    dbClient.from('notices').select('id,created_by,created_at,updated_at'),
    dbClient.from('notice_comments').select('id,notice_id,author_id,body,created_at,updated_at').order('created_at',{ascending:true})
  ]);
  if(!nr.error){noticeMeta.clear();(nr.data||[]).forEach(x=>noticeMeta.set(x.id,x));}
  if(!cr.error){
    commentRows.clear();
    (cr.data||[]).forEach(c=>{if(!commentRows.has(c.notice_id))commentRows.set(c.notice_id,[]);commentRows.get(c.notice_id).push(c);});
  }
}

function metaFor(n){return noticeMeta.get(n.id)||{created_by:n.createdBy||n.created_by||null,created_at:n.createdAt||n.created_at||null};}

window.renderNotices=function(){
  const el=document.getElementById('noticeList');if(!el)return;
  const rows=typeof notices!=='undefined'?[...notices]:[];
  rows.sort((a,b)=>String((metaFor(b).created_at)||b.date||'').localeCompare(String((metaFor(a).created_at)||a.date||'')));
  el.innerHTML=rows.length?rows.map(n=>{
    const meta=metaFor(n);
    const img=(n.attachments||[]).find(a=>String(a.type||'').startsWith('image'));
    const thumb=img?(img.url?`<img class="noticeThumb" src="${attr(img.url)}" alt="공지 이미지 미리보기" onclick="event.stopPropagation();openAttachment('${attr(img.url)}','${attr(img.type)}')">`:`<div class="noticeThumb noticeImageLoading">사진 불러오는 중...</div>`):'';
    const unread=(typeof unreadNoticeIds!=='undefined'&&unreadNoticeIds.has(n.id))?' · NEW':'';
    return `<div class="notice" onclick='openNotice(${JSON.stringify(n.id)})'><div class="date">${esc(memberName(meta.created_by))} · ${esc(fmt(meta.created_at||n.date))}${unread}</div><h3>${esc(n.title)}</h3><p>${esc(String(n.body||'').split('\n')[0])}</p>${thumb}</div>`;
  }).join(''):'<div class="card meta">등록된 공지가 없습니다.</div>';
};

window.renderNoticeDetail=function(){
  const n=(typeof notices!=='undefined'?notices:[]).find(x=>x.id===currentNoticeId);if(!n){showPage('notice');return}
  const meta=metaFor(n),owner=meta.created_by;
  const attach=(n.attachments||[]).map(a=>{
    const isImg=String(a.type||'').startsWith('image'),isVid=String(a.type||'').startsWith('video');
    if(!a.url)return `<div class="fileRow"><div class="icon">📎</div><div class="grow"><b>${esc(a.name||'첨부파일')}</b><p>불러오는 중...</p></div></div>`;
    if(isImg)return `<img class="noticePreview" src="${attr(a.url)}" alt="${attr(a.name||'')}" onclick="openAttachment('${attr(a.url)}','${attr(a.type)}')">`;
    if(isVid)return `<video class="noticePreview" src="${attr(a.url)}" controls></video>`;
    return `<div class="fileRow" onclick="openAttachment('${attr(a.url)}','${attr(a.type)}')"><div class="icon">📎</div><div class="grow"><b>${esc(a.name||'첨부파일')}</b></div></div>`;
  }).join('');
  const article=document.getElementById('noticeArticle');
  if(article)article.innerHTML=`<div class="article"><div class="meta">${esc(memberName(owner))} · ${esc(fmt(meta.created_at||n.date))}</div><h2>${esc(n.title)}</h2><p>${esc(n.body)}</p>${attach?`<div class="section"><h2>첨부</h2></div>${attach}`:''}${canManage(owner)?`<div class="noticeAdminActions"><button class="btn outline" onclick="editNotice('${n.id}')">수정</button><button class="btn amber" onclick="deleteNotice('${n.id}')">삭제</button></div>`:''}</div>`;
  const list=commentRows.get(n.id)||[];
  const comments=document.getElementById('comments');
  if(comments)comments.innerHTML=list.length?list.map(c=>`<div class="comment"><b>${esc(memberName(c.author_id))}</b><span>${esc(fmt(c.created_at))}</span><p>${esc(c.body)}</p>${canManage(c.author_id)?`<div class="actions"><button class="btn outline" onclick="editNoticeCommentV95('${c.id}')">수정</button><button class="btn amber" onclick="deleteNoticeCommentV95('${c.id}')">삭제</button></div>`:''}</div>`).join(''):'<div class="card meta">아직 댓글이 없습니다.</div>';
};

window.addComment=async function(){
  const i=document.getElementById('commentInput'),text=i?.value.trim();if(!text)return;
  const n=(typeof notices!=='undefined'?notices:[]).find(x=>x.id===currentNoticeId);if(!n)return;
  const {error}=await dbClient.from('notice_comments').insert({notice_id:n.id,author_id:currentUser.memberId,body:text});
  if(error){console.error(error);return toast('댓글 저장에 실패했습니다.')}
  i.value='';await refreshNoticeMeta();renderNoticeDetail();
};
window.editNoticeCommentV95=async function(id){
  let target=null;for(const arr of commentRows.values()){target=arr.find(x=>x.id===id);if(target)break;}if(!target)return;
  if(!canManage(target.author_id))return toast('작성자만 수정할 수 있습니다.');
  const body=prompt('댓글 수정',target.body||'');if(body===null||!body.trim())return;
  const {error}=await dbClient.from('notice_comments').update({body:body.trim(),updated_at:new Date().toISOString()}).eq('id',id);if(error){console.error(error);return toast('댓글 수정에 실패했습니다.')}
  await refreshNoticeMeta();renderNoticeDetail();
};
window.deleteNoticeCommentV95=async function(id){
  let target=null;for(const arr of commentRows.values()){target=arr.find(x=>x.id===id);if(target)break;}if(!target)return;
  if(!canManage(target.author_id))return toast('작성자만 삭제할 수 있습니다.');if(!confirm('이 댓글을 삭제할까요?'))return;
  const {error}=await dbClient.from('notice_comments').delete().eq('id',id);if(error){console.error(error);return toast('댓글 삭제에 실패했습니다.')}
  await refreshNoticeMeta();renderNoticeDetail();
};

const priorLoad=typeof loadPersistentContent==='function'?loadPersistentContent:null;
if(priorLoad){
  window.loadPersistentContent=async function(){
    const r=await priorLoad.apply(this,arguments);
    await refreshNoticeMeta();
    renderNotices();
    if(document.getElementById('noticeDetail')?.classList.contains('active'))renderNoticeDetail();
    return r;
  };
}

window.addEventListener('load',()=>setTimeout(async()=>{await refreshNoticeMeta();renderNotices();if(document.getElementById('noticeDetail')?.classList.contains('active'))renderNoticeDetail();},250));
console.log('TEAM EYSL notice fix v95 loaded');
})();
