from pathlib import Path

p = Path('index.html')
s = p.read_text()

old = """<button class=\"eventHubBtn\" onclick=\"openFunEventPage('competition')\"><span>대회왕</span><b>›</b></button>\n<button class=\"eventHubBtn\" onclick=\"openFunEventPage('stroke')\"><span>영법별 랭킹</span><b>›</b></button>"""
new = """<button class=\"eventHubBtn\" onclick=\"openFunEventPage('competition')\"><span>대회왕</span><b>›</b></button>\n<button class=\"eventHubBtn\" onclick=\"openFunEventPage('medal')\"><span>메달왕</span><b>›</b></button>\n<button class=\"eventHubBtn\" onclick=\"openFunEventPage('stroke')\"><span>영법별 랭킹</span><b>›</b></button>"""
assert s.count(old) == 1, f'event buttons block count={s.count(old)}'
s = s.replace(old, new, 1)

old_titles = "const titles={pbcollector:'PB 수집왕',competition:'대회왕',stroke:'영법별 랭킹',firstattendance:'첫 출석'};"
new_titles = "const titles={pbcollector:'PB 수집왕',competition:'대회왕',medal:'메달왕',stroke:'영법별 랭킹',firstattendance:'첫 출석'};"
assert s.count(old_titles) == 1, f'titles block count={s.count(old_titles)}'
s = s.replace(old_titles, new_titles, 1)

marker = "  if(type==='stroke'){"
medal = """  if(type==='medal'){
   const rows=data.medals||[],allRows=data.medals_all_time||[];
   const medalValue=r=>`총 ${Number(r.total||0)}개 · 🥇 ${Number(r.gold||0)}  🥈 ${Number(r.silver||0)}  🥉 ${Number(r.bronze||0)}`;
   box.innerHTML=`<div class=\"eventDetailStack\"><div class=\"eventRankMini\"><h3>${data.year} 메달왕</h3>${funRankRows(rows,medalValue)}</div><div class=\"eventRankMini\"><h3>역대 메달 누적</h3>${funRankRows(allRows,medalValue)}</div><div class=\"card meta\">개인전과 단체전 메달을 모두 포함해요. 단체전은 해당 출전 선수에게 각각 1개로 집계하고, 동률은 총 메달 수 → 금 → 은 → 동 순으로 정해요. 확인되지 않은 2026 수원 연맹회장배 은메달 1건은 현재 집계에서 제외했어요.</div></div>`;
   return;
  }

  if(type==='stroke'){"""
assert s.count(marker) == 1, f'stroke marker count={s.count(marker)}'
s = s.replace(marker, medal, 1)

old_ver = '<section id="teamEvents" class="page"><div class="pagehead"><button class="back" onclick="showPage(\'home\')">←</button><h1>이벤트</h1><span class="meta">v92</span></div>'
new_ver = '<section id="teamEvents" class="page"><div class="pagehead"><button class="back" onclick="showPage(\'home\')">←</button><h1>이벤트</h1><span class="meta">v93</span></div>'
assert s.count(old_ver) == 1, f'event version block count={s.count(old_ver)}'
s = s.replace(old_ver, new_ver, 1)

p.write_text(s)
