from pathlib import Path

p = Path('index.html')
s = p.read_text()

old_css = "#recordMinor{margin-bottom:14px!important}"
new_css = """#recordMinor{margin-bottom:14px!important}
#recordMinor button{color:#111317!important;-webkit-text-fill-color:#111317!important;opacity:1!important}
#recordMinor button.active{color:#fff!important;-webkit-text-fill-color:#fff!important}"""
assert s.count(old_css) == 1, f'recordMinor css count={s.count(old_css)}'
s = s.replace(old_css, new_css, 1)

old_fn = """function recordEventTitle(r){
 const stroke=String(r?.stroke||'').trim();
 const dist=Number(r?.metadata?.distance||0);
 if(stroke&&dist)return `${stroke} ${dist}m`;
 return stroke||r?.event_name||'기록';
}
function normalizeResultForStorage(v){"""
new_fn = """function recordEventTitle(r){
 const stroke=String(r?.stroke||'').trim();
 const dist=Number(r?.metadata?.distance||0);
 if(stroke&&dist)return `${stroke} ${dist}m`;
 return stroke||r?.event_name||'기록';
}
function recordDisplayDate(r){
 const start=String(r?.metadata?.event_start_date||'').trim();
 const end=String(r?.metadata?.event_end_date||'').trim();
 if(start&&end&&start!==end)return `${start} ~ ${end}`;
 return String(r?.event_date||'');
}
function normalizeResultForStorage(v){"""
assert s.count(old_fn) == 1, f'recordEventTitle marker count={s.count(old_fn)}'
s = s.replace(old_fn, new_fn, 1)

old_personal = """<p><strong class=\"historyMeet\">${escHtml(r.event_name||'대회명 미등록')}</strong>${r.event_date?` · ${escHtml(r.event_date)}`:''}</p>"""
new_personal = """<p><strong class=\"historyMeet\">${escHtml(r.event_name||'대회명 미등록')}</strong>${recordDisplayDate(r)?` · ${escHtml(recordDisplayDate(r))}`:''}</p>"""
assert s.count(old_personal) == 1, f'personal date block count={s.count(old_personal)}'
s = s.replace(old_personal, new_personal, 1)

old_relay = """<p>${[r.event_name,r.event_date].filter(Boolean).map(escHtml).join(' · ')}</p>"""
new_relay = """<p>${[r.event_name,recordDisplayDate(r)].filter(Boolean).map(escHtml).join(' · ')}</p>"""
relay_count = s.count(old_relay)
assert relay_count >= 2, f'relay/my page date block count={relay_count}'
s = s.replace(old_relay, new_relay)

old_admin = "const meta=[r.event_name,r.event_date].filter(Boolean).join(' · ');"
new_admin = "const meta=[r.event_name,recordDisplayDate(r)].filter(Boolean).join(' · ');"
assert s.count(old_admin) == 1, f'admin date block count={s.count(old_admin)}'
s = s.replace(old_admin, new_admin, 1)

old_menu = '<div class="menuCard" onclick="showPage(\'teamEvents\')"><b>이벤트</b><span>출석왕 · 단축왕 · PB · 대회 · 영법별 랭킹</span></div>'
new_menu = '<div class="menuCard" onclick="showPage(\'teamEvents\')"><b>이벤트</b><span>출석왕 · 단축왕 · PB · 대회 · 메달 · 영법별 랭킹</span></div>'
assert s.count(old_menu) == 1, f'event menu text count={s.count(old_menu)}'
s = s.replace(old_menu, new_menu, 1)

old_ver = '<section id="teamEvents" class="page"><div class="pagehead"><button class="back" onclick="showPage(\'home\')">←</button><h1>이벤트</h1><span class="meta">v93</span></div>'
new_ver = '<section id="teamEvents" class="page"><div class="pagehead"><button class="back" onclick="showPage(\'home\')">←</button><h1>이벤트</h1><span class="meta">v94</span></div>'
assert s.count(old_ver) == 1, f'event version count={s.count(old_ver)}'
s = s.replace(old_ver, new_ver, 1)

p.write_text(s)

assert "openFunEventPage('medal')" in s
assert "function recordDisplayDate(r)" in s
assert "event_start_date" in s
assert "v94" in s
print('v184 record and medal UI checks passed')
