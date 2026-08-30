/* TEAM EYSL v112 — list ordering + member directory scroll-to-top */
(function(){
  const koCompare=(a,b)=>String(a||'').localeCompare(String(b||''),'ko',{sensitivity:'base',numeric:true});

  function rowName(row){
    return (row?.querySelector('.grow b')?.textContent||row?.querySelector('b')?.textContent||'').trim();
  }

  function sortAttendanceGuestLast(){
    const root=document.getElementById('attAdminDetailBody');
    if(!root)return;
    root.querySelectorAll('.card').forEach(card=>{
      const rows=[...card.children].filter(el=>{
        const name=rowName(el);
        return name && el.querySelector('.attChoice');
      });
      if(rows.length<2)return;
      rows.sort((a,b)=>{
        const an=rowName(a),bn=rowName(b);
        const ag=/^일일체험/.test(an),bg=/^일일체험/.test(bn);
        if(ag!==bg)return ag?1:-1;
        return 0;
      });
      rows.forEach(row=>card.appendChild(row));
    });
  }

  function memberRoleRank(name,row){
    try{
      const m=(members||[]).find(x=>x.name===name);
      if(m?.role==='master_admin')return 0;
      if(m?.role==='admin')return 1;
    }catch(_){ }
    const text=(row?.textContent||'');
    if(text.includes('총관리자'))return 0;
    if(text.includes('부관리자')||text.includes('관리자'))return 1;
    return 2;
  }

  function sortMemberDirectoryRows(){
    const box=document.getElementById('memberDirectoryList');
    if(!box)return;
    const rows=[...box.querySelectorAll(':scope > .memberrow')];
    if(rows.length<2)return;
    rows.sort((a,b)=>{
      const an=rowName(a),bn=rowName(b);
      const ar=memberRoleRank(an,a),br=memberRoleRank(bn,b);
      if(ar!==br)return ar-br;
      return koCompare(an,bn);
    });
    rows.forEach(row=>box.appendChild(row));
  }

  if(typeof renderAttDetail==='function'){
    const prevRenderAttDetail=renderAttDetail;
    renderAttDetail=function(e){
      const out=prevRenderAttDetail(e);
      sortAttendanceGuestLast();
      return out;
    };
  }

  if(typeof renderMemberDirectory==='function'){
    const prevRenderMemberDirectory=renderMemberDirectory;
    renderMemberDirectory=async function(){
      const out=await prevRenderMemberDirectory.apply(this,arguments);
      sortMemberDirectoryRows();
      updateScrollTopButton();
      return out;
    };
  }

  function ensureScrollTopButton(){
    let btn=document.getElementById('memberDirectoryScrollTop');
    if(btn)return btn;
    btn=document.createElement('button');
    btn.id='memberDirectoryScrollTop';
    btn.type='button';
    btn.setAttribute('aria-label','회원리스트 맨 위로');
    btn.textContent='↑';
    btn.style.cssText='position:fixed;right:max(calc((100vw - 430px)/2 + 18px),18px);bottom:94px;width:46px;height:46px;border:0;border-radius:50%;background:#111;color:#fff;font-size:22px;font-weight:900;display:none;align-items:center;justify-content:center;z-index:35;box-shadow:0 6px 18px rgba(0,0,0,.18);';
    btn.onclick=()=>window.scrollTo({top:0,behavior:'smooth'});
    document.body.appendChild(btn);
    return btn;
  }

  function updateScrollTopButton(){
    const btn=ensureScrollTopButton();
    const active=document.getElementById('memberDirectory')?.classList.contains('active');
    btn.style.display=active&&window.scrollY>280?'flex':'none';
  }

  window.addEventListener('scroll',updateScrollTopButton,{passive:true});
  window.addEventListener('resize',updateScrollTopButton,{passive:true});

  if(typeof showPage==='function'){
    const prevShowPage=showPage;
    showPage=function(id){
      const out=prevShowPage.apply(this,arguments);
      setTimeout(()=>{
        if(id==='attendanceAdminDetail')sortAttendanceGuestLast();
        if(id==='memberDirectory')sortMemberDirectoryRows();
        updateScrollTopButton();
      },0);
      return out;
    };
  }

  const observer=new MutationObserver(()=>{
    if(document.getElementById('attendanceAdminDetail')?.classList.contains('active'))sortAttendanceGuestLast();
    if(document.getElementById('memberDirectory')?.classList.contains('active'))sortMemberDirectoryRows();
    updateScrollTopButton();
  });
  if(document.body)observer.observe(document.body,{childList:true,subtree:true});
})();
