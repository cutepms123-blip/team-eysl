/* TEAM EYSL v157 — canonical member ordering */
(function(){
 if(window.__UI_ORDER_V157__)return;window.__UI_ORDER_V157__=true;
 const ko=(a,b)=>String(a||'').localeCompare(String(b||''),'ko',{sensitivity:'base',numeric:true});
 const EXEC=['민선','창두','도의','태훈'];
 const short=n=>String(n||'').trim().split('/')[0].trim();
 function rowName(row){return (row?.querySelector('.grow b')?.textContent||row?.querySelector('b')?.textContent||'').trim()}
 function rank(name){const s=short(name),i=EXEC.indexOf(s);if(i>=0)return[0,i,s];if(/^일일체험/.test(s))return[2,0,s];return[1,0,s]}
 function cmp(a,b){const ar=rank(a),br=rank(b);return ar[0]-br[0]||ar[1]-br[1]||ko(ar[2],br[2])}
 function sortRows(root,selector){if(!root)return;const rows=[...root.querySelectorAll(selector)].filter(x=>rowName(x));rows.sort((a,b)=>cmp(rowName(a),rowName(b)));rows.forEach(r=>r.parentElement?.appendChild(r))}
 function sortAttendance(){const root=document.getElementById('attAdminDetailBody');if(!root)return;root.querySelectorAll('.card').forEach(card=>{const rows=[...card.children].filter(el=>rowName(el)&&el.querySelector('.attChoice'));rows.sort((a,b)=>cmp(rowName(a),rowName(b)));rows.forEach(r=>card.appendChild(r))})}
 function sortDirectory(){sortRows(document.getElementById('memberDirectoryList'),':scope > .memberrow')}
 if(typeof renderAttDetail==='function'){const p=renderAttDetail;renderAttDetail=function(){const o=p.apply(this,arguments);sortAttendance();return o}}
 if(typeof renderMemberDirectory==='function'){const p=renderMemberDirectory;renderMemberDirectory=async function(){const o=await p.apply(this,arguments);sortDirectory();return o}}
 if(typeof showPage==='function'){const p=showPage;showPage=function(id){const o=p.apply(this,arguments);if(id==='attendanceAdminDetail')requestAnimationFrame(sortAttendance);if(id==='memberDirectory')requestAnimationFrame(sortDirectory);return o}}
 window.EYSL_MEMBER_ORDER_COMPARE=cmp;
})();