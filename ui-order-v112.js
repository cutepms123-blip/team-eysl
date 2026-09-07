/* TEAM EYSL v140 — list ordering without global DOM observer */
(function(){
  if(window.__UI_ORDER_V140__)return;window.__UI_ORDER_V140__=true;
  const koCompare=(a,b)=>String(a||'').localeCompare(String(b||''),'ko',{sensitivity:'base',numeric:true});
  function rowName(row){return (row?.querySelector('.grow b')?.textContent||row?.querySelector('b')?.textContent||'').trim()}
  function sortAttendanceGuestLast(){
    const root=document.getElementById('attAdminDetailBody');if(!root)return;
    root.querySelectorAll('.card').forEach(card=>{
      const rows=[...card.children].filter(el=>rowName(el)&&el.querySelector('.attChoice'));if(rows.length<2)return;
      rows.sort((a,b)=>{const ag=/^일일체험/.test(rowName(a)),bg=/^일일체험/.test(rowName(b));return ag===bg?0:(ag?1:-1)});rows.forEach(row=>card.appendChild(row));
    });
  }
  function memberRoleRank(name,row){try{const m=(members||[]).find(x=>x.name===name);if(m?.role==='master_admin')return 0;if(m?.role==='admin')return 1}catch(_){}const text=row?.textContent||'';return text.includes('총관리자')?0:(text.includes('부관리자')||text.includes('관리자')?1:2)}
  function sortMemberDirectoryRows(){const box=document.getElementById('memberDirectoryList');if(!box)return;const rows=[...box.querySelectorAll(':scope > .memberrow')];if(rows.length<2)return;rows.sort((a,b)=>{const an=rowName(a),bn=rowName(b),ar=memberRoleRank(an,a),br=memberRoleRank(bn,b);return ar!==br?ar-br:koCompare(an,bn)});rows.forEach(row=>box.appendChild(row))}
  if(typeof renderAttDetail==='function'){const prev=renderAttDetail;renderAttDetail=function(e){const out=prev(e);sortAttendanceGuestLast();return out}}
  if(typeof renderMemberDirectory==='function'){const prev=renderMemberDirectory;renderMemberDirectory=async function(){const out=await prev.apply(this,arguments);sortMemberDirectoryRows();updateScrollTopButton();return out}}
  function ensureScrollTopButton(){let btn=document.getElementById('memberDirectoryScrollTop');if(btn)return btn;btn=document.createElement('button');btn.id='memberDirectoryScrollTop';btn.type='button';btn.setAttribute('aria-label','회원리스트 맨 위로');btn.textContent='↑';btn.style.cssText='position:fixed;right:max(calc((100vw - 430px)/2 + 18px),18px);bottom:94px;width:46px;height:46px;border:0;border-radius:50%;background:#111;color:#fff;font-size:22px;font-weight:900;display:none;align-items:center;justify-content:center;z-index:35;box-shadow:0 6px 18px rgba(0,0,0,.18);';btn.onclick=()=>window.scrollTo({top:0,behavior:'smooth'});document.body.appendChild(btn);return btn}
  function updateScrollTopButton(){const btn=ensureScrollTopButton(),active=document.getElementById('memberDirectory')?.classList.contains('active');btn.style.display=active&&window.scrollY>280?'flex':'none'}
  window.addEventListener('scroll',updateScrollTopButton,{passive:true});window.addEventListener('resize',updateScrollTopButton,{passive:true});
  if(typeof showPage==='function'){const prev=showPage;showPage=function(id){const out=prev.apply(this,arguments);if(id==='attendanceAdminDetail')requestAnimationFrame(sortAttendanceGuestLast);if(id==='memberDirectory')requestAnimationFrame(()=>{sortMemberDirectoryRows();updateScrollTopButton()});return out}}
})();