/* TEAM EYSL v98 — application comments + push alerts */
(()=>{
  const esc=v=>typeof escHtml==='function'?escHtml(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const fmt=v=>{if(!v)return '';const d=new Date(v);return Number.isNaN(d.getTime())?String(v):d.toLocaleString('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false});};
  const isMaster=()=>currentUser?.actualRole==='master_admin';
  let currentActivityCommentId=null;

  async function memberNames(ids){
    const uniq=[...new Set(ids.filter(Boolean))];if(!uniq.length)return new Map();
    const {data,error}=await dbClient.from('members').select('id,nickname,real_name').in('id',uniq);
    if(error){console.error('activity comment member names:',error);return new Map();}
    return new Map((data||[]).map(m=>[m.id,m.nickname||m.real_name||'회원']));
  }
  async function loadComments(activityId){
    const {data,error}=await dbClient.from('activity_comments').select('id,activity_id,author_id,body,created_at,updated_at').eq('activity_id',activityId).order('created_at',{ascending:true});
    if(error)throw error;
    const names=await memberNames((data||[]).map(x=>x.author_id));
    return (data||[]).map(x=>({...x,author_name:names.get(x.author_id)||'회원'}));
  }
  function boxFor(activityId){return document.querySelector(`.activityCommentBox[data-activity-id="${activityId}"]`);}
  async function renderComments(activityId){
    const root=boxFor(activityId);if(!root)return;
    const list=root.querySelector('.activityCommentList');
    try{
      const rows=await loadComments(activityId);
      list.innerHTML=rows.length?rows.map(c=>{
        const can=c.author_id===currentUser?.memberId||isMaster();
        return `<div class="comment"><b>${esc(c.author_name)}</b><span>${esc(fmt(c.created_at))}</span><p>${esc(c.body)}</p>${can?`<div class="actions"><button class="btn outline" onclick="editActivityComment('${c.id}','${activityId}')">수정</button><button class="btn amber" onclick="deleteActivityComment('${c.id}','${activityId}')">삭제</button></div>`:''}</div>`;
      }).join(''):'<div class="card meta">아직 댓글이 없습니다.</div>';
    }catch(e){console.error(e);list.innerHTML='<div class="card meta">댓글을 불러오지 못했습니다.</div>';}
  }
  async function pushComment(activityId,text){
    try{
      const {data:{session}}=await dbClient.auth.getSession();if(!session)return;
      await fetch(`${SUPABASE_URL}/functions/v1/push-notify`,{method:'POST',headers:{'Content-Type':'application/json','apikey':SUPABASE_PUBLISHABLE_KEY,'Authorization':`Bearer ${session.access_token}`},body:JSON.stringify({mode:'activity_comment',activity_id:activityId,comment_body:text})});
    }catch(e){console.error('activity comment push:',e)}
  }
  window.addActivityComment=async function(activityId){
    const root=boxFor(activityId),inp=root?.querySelector('.activityCommentInput');const text=inp?.value.trim()||'';
    if(!text)return toast('댓글을 입력해주세요.');
    if(!currentUser?.memberId)return toast('로그인이 필요합니다.');
    const {error}=await dbClient.from('activity_comments').insert({activity_id:activityId,author_id:currentUser.memberId,body:text});
    if(error){console.error(error);return toast('댓글 등록에 실패했습니다.');}
    inp.value='';await renderComments(activityId);void pushComment(activityId,text);toast('댓글이 등록됐습니다.');
  };
  window.editActivityComment=async function(id,activityId){
    const {data,error}=await dbClient.from('activity_comments').select('id,author_id,body').eq('id',id).maybeSingle();
    if(error||!data)return toast('댓글을 찾을 수 없습니다.');
    if(data.author_id!==currentUser?.memberId&&!isMaster())return toast('작성자만 수정할 수 있습니다.');
    const text=prompt('댓글 수정',data.body||'');if(text===null||!text.trim())return;
    const r=await dbClient.from('activity_comments').update({body:text.trim(),updated_at:new Date().toISOString()}).eq('id',id).select('id');
    if(r.error||!r.data?.length)return toast('댓글 수정에 실패했습니다.');
    await renderComments(activityId);toast('댓글이 수정됐습니다.');
  };
  window.deleteActivityComment=async function(id,activityId){
    const {data,error}=await dbClient.from('activity_comments').select('id,author_id').eq('id',id).maybeSingle();
    if(error||!data)return toast('댓글을 찾을 수 없습니다.');
    if(data.author_id!==currentUser?.memberId&&!isMaster())return toast('작성자만 삭제할 수 있습니다.');
    if(!confirm('이 댓글을 삭제할까요?'))return;
    const r=await dbClient.from('activity_comments').delete().eq('id',id).select('id');
    if(r.error||!r.data?.length)return toast('댓글 삭제에 실패했습니다.');
    await renderComments(activityId);toast('댓글이 삭제됐습니다.');
  };
  function appendComments(container,activityId){
    if(!container||!activityId)return;
    container.querySelectorAll('.activityCommentBox').forEach(x=>x.remove());
    container.insertAdjacentHTML('beforeend',`<div class="section activityCommentBox" data-activity-id="${activityId}" style="display:block;margin-top:24px"><h2 style="margin-bottom:10px">댓글</h2><div class="comments activityCommentList"><div class="card meta">댓글 불러오는 중...</div></div><div class="commentForm"><input class="activityCommentInput" maxlength="500" placeholder="댓글을 입력해주세요"><button type="button" onclick="addActivityComment('${activityId}')">등록</button></div><div class="meta" style="margin-top:7px">댓글 등록 시 해당 일정 신청자·대기자에게 알림이 전송됩니다.</div></div>`);
    void renderComments(activityId);
  }

  const oldTraining=window.openApplyStatus;
  window.openApplyStatus=async function(id){const r=await oldTraining.apply(this,arguments);appendComments(document.getElementById('applyStatusBody'),id);return r;};
  const oldGeneric=window.openGenericApplyStatus;
  window.openGenericApplyStatus=async function(kind,id){const r=await oldGeneric.apply(this,arguments);if(kind!=='training')appendComments(document.getElementById('applyStatusBody'),id);return r;};

  console.log('TEAM EYSL activity comments v98 loaded');
})();
