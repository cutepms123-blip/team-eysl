from pathlib import Path
import re

path = Path('index.html')
text = path.read_text(encoding='utf-8')

if 'V114_DIRECT_INDEX' in text:
    print('v114 already applied')
    raise SystemExit(0)

# 1) Direct CSS: old service-worker-injected save bar can no longer cover roster,
# and member directory gets a native scroll-to-top button.
marker_css = r'''
<!-- V114_DIRECT_INDEX -->
<style id="V114_DIRECT_INDEX">
#attendanceSaveBoxV105{
  position:relative!important;
  bottom:auto!important;
  z-index:auto!important;
  margin-top:18px!important;
  box-shadow:none!important;
  left:auto!important;
  right:auto!important;
  transform:none!important;
}
#attendanceAdminDetail.active #attAdminDetailBody{padding-bottom:120px!important}
#memberDirectoryScrollTop{
  position:fixed;
  right:max(calc((100vw - 430px)/2 + 18px),18px);
  bottom:96px;
  width:46px;
  height:46px;
  border:0;
  border-radius:50%;
  background:#111;
  color:#fff;
  font-size:22px;
  font-weight:900;
  display:none;
  align-items:center;
  justify-content:center;
  z-index:95;
  box-shadow:0 6px 18px rgba(0,0,0,.18)
}
</style>
'''
if '</head>' not in text:
    raise SystemExit('head anchor not found')
text = text.replace('</head>', marker_css + '</head>', 1)

# 2) Remove activity aggregation page and admin menu entry from the real app shell.
text, n = re.subn(r'\n?<section id="applicationAdmin" class="page">.*?</section>', '', text, count=1, flags=re.S)
if n != 1:
    raise SystemExit(f'applicationAdmin section removal count={n}')

menu = '<div class="ditem" onclick="drawerGo(\'applicationAdmin\');renderApplicationAdmin(\'all\')">활동 취합본</div>'
if menu not in text:
    raise SystemExit('aggregation drawer item anchor not found')
text = text.replace(menu, '', 1)

text = text.replace(" if(id==='applicationAdmin')renderApplicationAdmin('all');\n", '', 1)
text = text.replace(",()=>renderApplicationAdmin('training')", '', 1)

text, n = re.subn(
    r"\nfunction renderApplicationAdmin\(kind='all',btn=null\)\{.*?\n\}\nfunction setAttType",
    '\nfunction setAttType',
    text,
    count=1,
    flags=re.S,
)
if n != 1:
    raise SystemExit(f'renderApplicationAdmin removal count={n}')

# 3) Member directory: master/admin first, then all remaining members 가나다 order.
old_rows = " const rows=[...rosterRows,...appOnly];"
new_rows = r''' const memberDirectoryRoleRank=r=>{
   const role=r?._member?.role||'';
   if(role==='master_admin')return 0;
   if(role==='admin'||role==='sub_admin')return 1;
   return 2;
 };
 const rows=[...rosterRows,...appOnly].sort((a,b)=>{
   const ar=memberDirectoryRoleRank(a),br=memberDirectoryRoleRank(b);
   if(ar!==br)return ar-br;
   return String(a.nickname||'').localeCompare(String(b.nickname||''),'ko',{numeric:true,sensitivity:'base'});
 });'''
if old_rows not in text:
    raise SystemExit('member directory rows anchor not found')
text = text.replace(old_rows, new_rows, 1)

scroll_helpers = r'''function updateMemberDirectoryScrollTop(){
 const btn=document.getElementById('memberDirectoryScrollTop');if(!btn)return;
 const active=document.getElementById('memberDirectory')?.classList.contains('active');
 btn.style.display=active&&window.scrollY>280?'flex':'none';
}
function scrollMemberDirectoryTop(){window.scrollTo({top:0,behavior:'smooth'})}
window.addEventListener('scroll',updateMemberDirectoryScrollTop,{passive:true});
window.addEventListener('resize',updateMemberDirectoryScrollTop,{passive:true});

'''
anchor = 'async function renderMemberDirectory(){'
if anchor not in text:
    raise SystemExit('renderMemberDirectory anchor not found')
text = text.replace(anchor, scroll_helpers + anchor, 1)

member_section = '<section id="memberDirectory" class="page"><div class="pagehead"><button class="back" onclick="showPage(\'home\')">←</button><h1>회원리스트</h1><span></span></div><div id="memberDirectoryList" class="list"></div></section>'
if member_section not in text:
    raise SystemExit('memberDirectory section anchor not found')
text = text.replace(
    member_section,
    member_section + '\n<button id="memberDirectoryScrollTop" type="button" aria-label="회원리스트 맨 위로" onclick="scrollMemberDirectoryTop()">↑</button>',
    1,
)
text = text.replace(
    " if(id==='memberDirectory')renderMemberDirectory();",
    " if(id==='memberDirectory'){renderMemberDirectory();setTimeout(updateMemberDirectoryScrollTop,0);}",
    1,
)

# 4) Attendance detail: guests go to the very bottom.
old_display = " const displayPeople=[...new Set([...(e.people||[]),...Object.keys(rec||{})])];"
new_display = old_display + r'''
 displayPeople.sort((a,b)=>{
  const ag=/^일일체험/.test(String(a)),bg=/^일일체험/.test(String(b));
  if(ag!==bg)return ag?1:-1;
  return 0;
 });'''
if old_display not in text:
    raise SystemExit('displayPeople anchor not found')
text = text.replace(old_display, new_display, 1)

# 5) Attendance list counts: roster size and actual attendance are separate.
old_admin = r'''function renderAttendanceAdmin(){
 const rows=attEvents().filter(e=>(attendanceType==='all'||e.type===attendanceType)&&(attendanceState==='all'||e.state===attendanceState)).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
 document.getElementById('attAdminList').innerHTML=rows.map(e=>{const c=attCounts(e);return `<div class="statusCard" onclick="openAttEvent('${e.id}')"><div class="statusTop"><div><h3>${e.title}</h3><p>${e.date} · ${e.label}</p></div><span class="tag ${e.state==='done'?'done':''}">${e.state==='done'?'종료':'예정'}</span></div><div class="attGrid"><div><b>${e.state==='done'?Math.max(e.people.length,Object.keys(attRecords[e.id]||{}).length):e.people.length}</b><span>${e.state==='done'?'참석':'신청'}</span></div><div><b>${c.present}</b><span>출석</span></div><div><b>${c.late}</b><span>지각</span></div><div><b>${c.absent}</b><span>불참</span></div></div></div>`}).join('')||'<div class="card meta">조건에 맞는 일정이 없습니다.</div>';
}'''
new_admin = r'''function renderAttendanceAdmin(){
 const rows=attEvents().filter(e=>(attendanceType==='all'||e.type===attendanceType)&&(attendanceState==='all'||e.state===attendanceState)).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
 document.getElementById('attAdminList').innerHTML=rows.map(e=>{const c=attCounts(e);return `<div class="statusCard" onclick="openAttEvent('${e.id}')"><div class="statusTop"><div><h3>${e.title}</h3><p>${e.date} · ${e.label}</p></div><span class="tag ${e.state==='done'?'done':''}">${e.state==='done'?'종료':'예정'}</span></div><div class="attGrid"><div><b>${e.people.length}</b><span>${e.state==='done'?'명단':'신청'}</span></div><div><b>${c.present}</b><span>출석</span></div><div><b>${c.late}</b><span>지각</span></div><div><b>${c.absent}</b><span>불참</span></div></div></div>`}).join('')||'<div class="card meta">조건에 맞는 일정이 없습니다.</div>';
}'''
if old_admin not in text:
    raise SystemExit('renderAttendanceAdmin exact anchor not found')
text = text.replace(old_admin, new_admin, 1)

# 6) Detail summary: for completed sessions show roster count + final actual attendance.
old_detail_piece = "<div class=\"detailrow\"><b>${done?'참석 인원':'신청 인원'}</b><span>${displayPeople.length}명</span></div><div class=\"detailrow\"><b>현재 집계</b><span>출석 ${c.present} · 지각 ${c.late} · 불참 ${c.absent}</span></div>"
new_detail_piece = "<div class=\"detailrow\"><b>${done?'명단 인원':'신청 인원'}</b><span>${done?(e.people||[]).length:displayPeople.length}명</span></div><div class=\"detailrow\"><b>${done?'출석 집계':'현재 집계'}</b><span>${done?`최종 출석 ${c.present}명 · 지각 ${c.late}명 · 불참 ${c.absent}명`:`출석 ${c.present} · 지각 ${c.late} · 불참 ${c.absent}`}</span></div>"
if old_detail_piece not in text:
    raise SystemExit('attendance detail summary anchor not found')
text = text.replace(old_detail_piece, new_detail_piece, 1)

# 7) Force the installed PWA to request the newest worker once it sees this shell.
text = text.replace('/sw.js?v=final92-unregistered-roster', '/sw.js?v=final114-direct-index')

# Validation before writing.
required = [
    'V114_DIRECT_INDEX',
    'memberDirectoryScrollTop',
    'memberDirectoryRoleRank',
    'final114-direct-index',
    "const ag=/^일일체험/",
    "최종 출석 ${c.present}명",
]
for token in required:
    if token not in text:
        raise SystemExit(f'missing required token: {token}')
if '활동 취합본' in text:
    raise SystemExit('activity aggregation label still present')
if 'applicationAdmin' in text:
    raise SystemExit('applicationAdmin references still present')

path.write_text(text, encoding='utf-8')
print('v114 direct index patch applied')
